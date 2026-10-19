import { Resend } from "resend";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { brand } from "@/config/brand";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  configured: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  if (!env.isEmailConfigured()) {
    console.info(
      `[email:unconfigured] To=${input.to} Subject=${input.subject}`
    );
    return {
      ok: true,
      configured: false,
      skipped: true,
      error: "Email provider not configured. Message logged only.",
    };
  }

  try {
    if (env.resendApiKey) {
      const resend = new Resend(env.resendApiKey);
      const result = await resend.emails.send({
        from: env.emailFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      if (result.error) {
        return {
          ok: false,
          configured: true,
          error: result.error.message,
        };
      }
      return { ok: true, configured: true, id: result.data?.id };
    }

    if (env.smtp.host) {
      const transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port || 587,
        secure: env.smtp.port === 465,
        auth:
          env.smtp.user && env.smtp.pass
            ? { user: env.smtp.user, pass: env.smtp.pass }
            : undefined,
      });
      const info = await transporter.sendMail({
        from: env.emailFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      return { ok: true, configured: true, id: info.messageId };
    }

    return { ok: false, configured: false, error: "No email transport" };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : "Email send failed",
    };
  }
}

export function emailLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0F172A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">
        <tr><td style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:24px 28px;color:#fff;">
          <div style="font-size:20px;font-weight:700;">${brand.name}</div>
          <div style="opacity:.9;font-size:13px;margin-top:4px;">${brand.tagline}</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:22px;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 28px 24px;font-size:12px;color:#64748B;border-top:1px solid #E2E8F0;">
          This is a transactional message from ${brand.name}. Support: ${brand.supportEmail}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
