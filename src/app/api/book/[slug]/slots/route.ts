import { NextResponse } from "next/server";
import { z } from "zod";
import { getBusinessBySlug, getAvailableSlots } from "@/lib/booking/engine";
import { bookRateLimit } from "@/lib/api/book-rate-limit";

const querySchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const limited = bookRateLimit(request.headers, slug, "slots");
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    serviceId: url.searchParams.get("serviceId"),
    staffId: url.searchParams.get("staffId") || undefined,
    date: url.searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid query" },
      { status: 400 }
    );
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const data = await getAvailableSlots({
      businessId: String(business._id),
      serviceId: parsed.data.serviceId,
      staffMemberId: parsed.data.staffId || "any",
      dateYmd: parsed.data.date,
    });
    return NextResponse.json({
      date: parsed.data.date,
      timezone: business.timezone,
      results: data.results,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load slots";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
