import { NextResponse } from "next/server";
import {
  getBusinessBySlug,
  listBookableServices,
  listBookableStaff,
} from "@/lib/booking/engine";
import { bookRateLimit } from "@/lib/api/book-rate-limit";
import { getCategoryPreset } from "@/config/business-categories";
import { connectDB } from "@/lib/db";
import { BookingForm } from "@/models";
import { uploadConfigStatus } from "@/lib/storage/uploads";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const limited = bookRateLimit(request.headers, slug, "info");
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let business;
  try {
    business = await getBusinessBySlug(slug);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database unavailable";
    if (message.includes("MONGODB_URI")) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Set MONGODB_URI in .env.local and restart the dev server.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const businessId = String(business._id);
  const preset = getCategoryPreset(business.category);
  await connectDB();
  const [services, staff, forms] = await Promise.all([
    listBookableServices(businessId),
    listBookableStaff(businessId),
    BookingForm.find({ businessId, isActive: true }).lean(),
  ]);

  const defaultForm =
    forms.find((f) => f.isDefault) || forms[0] || null;
  const formsById = Object.fromEntries(
    forms.map((f) => [
      String(f._id),
      {
        id: String(f._id),
        name: f.name,
        fields: f.fields || [],
        isDefault: Boolean(f.isDefault),
      },
    ])
  );

  const categoryLabel =
    business.customCategory ||
    preset.label ||
    business.category ||
    "Services";

  return NextResponse.json({
    business: {
      id: businessId,
      name: business.name,
      slug: business.slug,
      description: business.description,
      timezone: business.timezone,
      country: business.country,
      brandColor: business.brandColor,
      logoUrl: business.logoUrl,
      category: business.category || preset.id,
      categoryLabel,
      serviceMode: business.serviceMode || preset.serviceMode,
      requireStaffSelection:
        business.requireStaffSelection ?? preset.requireStaffSelection,
      requireServiceAddress:
        business.requireServiceAddress ?? preset.requireServiceAddress,
      staffLabel: preset.staffLabel,
      staffLabelPlural: preset.staffLabelPlural,
      intakeFields:
        (business.intakeFields?.length
          ? business.intakeFields
          : preset.intakeFields) || [],
      serviceAreas: business.serviceAreas || [],
      bookingSettings: business.bookingSettings,
      bookingForm: defaultForm
        ? {
            id: String(defaultForm._id),
            name: defaultForm.name,
            fields: defaultForm.fields || [],
          }
        : null,
      formsById,
      uploads: uploadConfigStatus(),
    },
    services: services
      .filter((s) => s.onlineBookingEnabled !== false)
      .map((s) => ({
        id: String(s._id),
        name: s.name,
        description: s.description,
        durationMinutes: s.durationMinutes,
        priceCents: s.priceCents,
        currency: s.currency,
        depositRequired: s.depositRequired,
        depositCents: s.depositCents,
        locationType: s.locationType || "in_location",
        locationLabel: s.locationLabel || "",
        travelBufferMinutes: s.travelBufferMinutes || 0,
        bookingFormId: s.bookingFormId ? String(s.bookingFormId) : null,
      })),
    staff: staff.map((m) => {
      const user = m.userId as { name?: string; image?: string } | null;
      return {
        id: String(m._id),
        name: user?.name || m.title || "Staff",
        title: m.title,
        bio: m.bio,
        avatarUrl: m.avatarUrl || user?.image,
        serviceIds: (m.serviceIds || []).map(String),
      };
    }),
  });
}
