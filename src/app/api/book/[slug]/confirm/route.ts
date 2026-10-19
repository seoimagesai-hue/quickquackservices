import { NextResponse } from "next/server";
import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";
import { confirmBooking, getBusinessBySlug } from "@/lib/booking/engine";
import { sendBookingConfirmationEmail } from "@/lib/email/templates";
import { absoluteUrl } from "@/lib/utils";
import { bookRateLimit } from "@/lib/api/book-rate-limit";
import { connectDB } from "@/lib/db";
import { BookingForm, BookingFormSubmission } from "@/models";
import { validateFormAnswers } from "@/lib/booking/form-validation";

const bodySchema = z.object({
  holdToken: z.string().min(10),
  formId: z.string().optional(),
  formAnswers: z.record(z.string(), z.unknown()).optional(),
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
    notes: z.string().max(2000).optional(),
    serviceAddress: z
      .object({
        line1: z.string().max(200).optional(),
        line2: z.string().max(200).optional(),
        city: z.string().max(100).optional(),
        region: z.string().max(100).optional(),
        postalCode: z.string().max(30).optional(),
        country: z.string().max(100).optional(),
        formatted: z.string().max(500).optional(),
      })
      .optional(),
    problemDescription: z.string().max(4000).optional(),
    intakeAnswers: z.record(z.string(), z.string()).optional(),
  }),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const limited = bookRateLimit(request.headers, slug, "confirm");
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid body" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const businessId = String(business._id);

    let form = parsed.data.formId
      ? await BookingForm.findOne({
          _id: parsed.data.formId,
          businessId,
          isActive: true,
        }).lean()
      : null;

    if (!form) {
      form = await BookingForm.findOne({
        businessId,
        isDefault: true,
        isActive: true,
      }).lean();
    }

    let cleanedAnswers: Record<string, unknown> = {};
    if (form?.fields?.length) {
      const validated = validateFormAnswers(
        form.fields as Parameters<typeof validateFormAnswers>[0],
        parsed.data.formAnswers || {}
      );
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      cleanedAnswers = validated.cleaned;

      // Map structured form fields into legacy customer intake shape
      const addressField = form.fields.find((f) => f.type === "address");
      if (addressField && cleanedAnswers[addressField.id] && !parsed.data.customer.serviceAddress) {
        parsed.data.customer.serviceAddress = {
          formatted: String(cleanedAnswers[addressField.id]),
        };
      }
      const problemField = form.fields.find(
        (f) =>
          f.id === "problemDescription" ||
          f.label.toLowerCase().includes("problem")
      );
      if (
        problemField &&
        cleanedAnswers[problemField.id] &&
        !parsed.data.customer.problemDescription
      ) {
        parsed.data.customer.problemDescription = String(
          cleanedAnswers[problemField.id]
        );
      }
      const notesField = form.fields.find((f) => f.id === "notes");
      if (notesField && cleanedAnswers[notesField.id] && !parsed.data.customer.notes) {
        parsed.data.customer.notes = String(cleanedAnswers[notesField.id]);
      }

      // Flatten string answers into intakeAnswers for appointment storage
      const flat: Record<string, string> = {
        ...(parsed.data.customer.intakeAnswers || {}),
      };
      for (const [k, v] of Object.entries(cleanedAnswers)) {
        if (typeof v === "string") flat[k] = v;
        else if (typeof v === "number") flat[k] = String(v);
        else if (Array.isArray(v)) flat[k] = v.join(", ");
      }
      parsed.data.customer.intakeAnswers = flat;
    }

    // Reject required file fields when storage is not configured
    if (form?.fields?.some((f) => f.type === "file" && f.required)) {
      const hasFileAnswer = form.fields.some(
        (f) =>
          f.type === "file" &&
          f.required &&
          cleanedAnswers[f.id] &&
          typeof cleanedAnswers[f.id] === "object"
      );
      if (!hasFileAnswer) {
        return NextResponse.json(
          {
            error:
              "This booking form requires a file upload, but object storage is not configured. Contact the business.",
          },
          { status: 400 }
        );
      }
    }

    const result = await confirmBooking({
      businessId,
      holdToken: parsed.data.holdToken,
      customer: parsed.data.customer,
    });

    if (form) {
      await BookingFormSubmission.create({
        businessId,
        formId: form._id,
        appointmentId: result.appointmentId,
        answers: cleanedAnswers,
        files: {},
      });
    }

    const whenLabel = formatInTimeZone(
      new Date(result.startAt),
      result.timezone,
      "EEE, MMM d yyyy · h:mm a"
    );
    const manageUrl = absoluteUrl(
      `/book/${result.businessSlug}/manage/${result.appointmentId}?token=${result.manageToken}`
    );

    await sendBookingConfirmationEmail({
      to: result.customerEmail,
      customerName: result.customerName,
      businessName: result.businessName,
      serviceName: result.serviceName,
      whenLabel,
      timezone: result.timezone,
      manageUrl,
    });

    return NextResponse.json({
      ok: true,
      appointmentId: result.appointmentId,
      manageToken: result.manageToken,
      startAt: result.startAt,
      endAt: result.endAt,
      manageUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
