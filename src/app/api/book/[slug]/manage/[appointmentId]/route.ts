import { NextResponse } from "next/server";
import { z } from "zod";
import {
  cancelAppointmentByCustomer,
  getAppointmentForManageToken,
} from "@/lib/booking/manage";
import { sendBookingCancellationEmail } from "@/lib/email/templates";
import { formatInTimeZone } from "date-fns-tz";
import { bookRateLimit } from "@/lib/api/book-rate-limit";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string; appointmentId: string }> }
) {
  const { slug, appointmentId } = await ctx.params;
  const limited = bookRateLimit(request.headers, slug, "manage");
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = new URL(request.url).searchParams.get("token") || "";
  const data = await getAppointmentForManageToken({ appointmentId, token });
  if (!data?.business || data.business.slug !== slug.toLowerCase()) {
    return NextResponse.json({ error: "Invalid manage link" }, { status: 404 });
  }

  return NextResponse.json({
    appointment: {
      id: String(data.appointment._id),
      status: data.appointment.status,
      startAt: data.appointment.startAt,
      endAt: data.appointment.endAt,
      timezone: data.appointment.timezone,
    },
    business: {
      name: data.business.name,
      slug: data.business.slug,
    },
    service: data.service
      ? { name: data.service.name }
      : undefined,
    customer: data.customer
      ? { name: data.customer.name, email: data.customer.email }
      : undefined,
  });
}

const postSchema = z.object({
  token: z.string().min(10),
  action: z.enum(["cancel"]),
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string; appointmentId: string }> }
) {
  const { slug, appointmentId } = await ctx.params;
  const limited = bookRateLimit(request.headers, slug, "manage");
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const before = await getAppointmentForManageToken({
      appointmentId,
      token: parsed.data.token,
    });
    if (!before?.business || before.business.slug !== slug.toLowerCase()) {
      return NextResponse.json({ error: "Invalid manage link" }, { status: 404 });
    }

    const appointment = await cancelAppointmentByCustomer({
      appointmentId,
      token: parsed.data.token,
      reason: parsed.data.reason,
    });

    if (before.customer && before.service) {
      const whenLabel = formatInTimeZone(
        appointment.startAt,
        appointment.timezone,
        "EEE, MMM d yyyy · h:mm a"
      );
      await sendBookingCancellationEmail({
        to: before.customer.email,
        customerName: before.customer.name,
        businessName: before.business.name,
        serviceName: before.service.name,
        whenLabel,
      });
    }

    return NextResponse.json({ ok: true, status: appointment.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Cancel failed" },
      { status: 400 }
    );
  }
}
