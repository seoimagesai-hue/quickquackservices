import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB, isDbReady } from "@/lib/db";
import { CookieConsent } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { getClientIp } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/password";

const schema = z.object({
  visitorId: z.string().min(8).max(64),
  necessary: z.boolean().default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
  policyVersion: z.string().default("1.0"),
});

/**
 * Cookie consent is always accepted in the browser (localStorage).
 * Mongo persistence is best-effort — never break the page if DB is down.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!isDbReady()) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      reason: "Database not configured",
    });
  }

  try {
    await connectDB();
    const user = await getSessionUser();
    const ip = getClientIp(request.headers);

    await CookieConsent.create({
      visitorId: parsed.data.visitorId,
      userId: user?.id || null,
      necessary: parsed.data.necessary,
      analytics: parsed.data.analytics,
      marketing: parsed.data.marketing,
      policyVersion: parsed.data.policyVersion,
      ipHash: hashIp(ip),
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    console.warn(
      "[cookies] Could not persist consent to MongoDB:",
      e instanceof Error ? e.message : e
    );
    return NextResponse.json({
      ok: true,
      persisted: false,
      reason: "Database temporarily unavailable",
    });
  }
}
