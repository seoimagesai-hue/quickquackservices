import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { SupportTicket } from "@/models";
import { getSessionUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/password";
import { sendSupportNotificationEmail } from "@/lib/email/templates";
import { brand } from "@/config/brand";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  category: z
    .enum(["general", "billing", "technical", "abuse", "other"])
    .default("general"),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  await connectDB();
  const user = await getSessionUser();

  const ticket = await SupportTicket.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    subject: parsed.data.subject,
    message: parsed.data.message,
    category: parsed.data.category,
    userId: user?.id || null,
    ipHash: hashIp(ip),
    userAgent: request.headers.get("user-agent") || "",
    honeypot: parsed.data.website || "",
  });

  if (brand.supportEmail) {
    await sendSupportNotificationEmail({
      to: brand.supportEmail,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
  }

  return NextResponse.json({ ok: true, id: String(ticket._id) });
}
