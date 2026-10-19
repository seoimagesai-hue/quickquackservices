import { NextResponse } from "next/server";
import { z } from "zod";
import { createHold, getBusinessBySlug } from "@/lib/booking/engine";
import { bookRateLimit } from "@/lib/api/book-rate-limit";

const bodySchema = z.object({
  serviceId: z.string().min(1),
  staffMemberId: z.string().min(1),
  startAt: z.string().min(1),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const limited = bookRateLimit(request.headers, slug, "hold");
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
    const hold = await createHold({
      businessId: String(business._id),
      ...parsed.data,
    });
    return NextResponse.json({ ok: true, ...hold });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not hold slot";
    const status = message.includes("taken") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
