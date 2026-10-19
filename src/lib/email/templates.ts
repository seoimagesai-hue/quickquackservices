import { absoluteUrl } from "@/lib/utils";
import { emailLayout, sendEmail } from "@/lib/email/client";
import { brand } from "@/config/brand";

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  token: string;
}) {
  const url = absoluteUrl(`/verify-email?token=${params.token}`);
  const html = emailLayout(
    "Verify your email",
    `<p>Hi ${params.name},</p>
     <p>Confirm your email address to activate your ${brand.name} account.</p>
     <p style="margin:24px 0;"><a href="${url}" style="background:#6366F1;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Verify email</a></p>
     <p style="font-size:13px;color:#64748B;">Or paste this link:<br/>${url}</p>
     <p style="font-size:13px;color:#64748B;">This link expires in 24 hours.</p>`
  );
  return sendEmail({
    to: params.to,
    subject: `Verify your email — ${brand.name}`,
    html,
    text: `Verify your email: ${url}`,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  token: string;
}) {
  const url = absoluteUrl(`/reset-password?token=${params.token}`);
  const html = emailLayout(
    "Reset your password",
    `<p>Hi ${params.name},</p>
     <p>We received a request to reset your password.</p>
     <p style="margin:24px 0;"><a href="${url}" style="background:#6366F1;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Reset password</a></p>
     <p style="font-size:13px;color:#64748B;">If you did not request this, you can ignore this email. Link expires in 1 hour.</p>`
  );
  return sendEmail({
    to: params.to,
    subject: `Reset your password — ${brand.name}`,
    html,
    text: `Reset password: ${url}`,
  });
}

export async function sendBookingConfirmationEmail(params: {
  to: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  whenLabel: string;
  timezone: string;
  manageUrl: string;
}) {
  const html = emailLayout(
    "Booking confirmed",
    `<p>Hi ${params.customerName},</p>
     <p>Your appointment with <strong>${params.businessName}</strong> is confirmed.</p>
     <ul>
       <li><strong>Service:</strong> ${params.serviceName}</li>
       <li><strong>When:</strong> ${params.whenLabel} (${params.timezone})</li>
     </ul>
     <p style="margin:24px 0;"><a href="${params.manageUrl}" style="background:#6366F1;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Manage booking</a></p>`
  );
  return sendEmail({
    to: params.to,
    subject: `Confirmed: ${params.serviceName} at ${params.businessName}`,
    html,
  });
}

export async function sendBookingCancellationEmail(params: {
  to: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  whenLabel: string;
}) {
  const html = emailLayout(
    "Booking cancelled",
    `<p>Hi ${params.customerName},</p>
     <p>Your appointment for <strong>${params.serviceName}</strong> with ${params.businessName} on ${params.whenLabel} has been cancelled.</p>`
  );
  return sendEmail({
    to: params.to,
    subject: `Cancelled: ${params.serviceName} at ${params.businessName}`,
    html,
  });
}

export async function sendStaffInviteEmail(params: {
  to: string;
  businessName: string;
  inviterName: string;
  token: string;
}) {
  const url = absoluteUrl(`/register?invite=${params.token}`);
  const html = emailLayout(
    "You're invited",
    `<p>${params.inviterName} invited you to join <strong>${params.businessName}</strong> on ${brand.name}.</p>
     <p style="margin:24px 0;"><a href="${url}" style="background:#6366F1;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;">Accept invite</a></p>`
  );
  return sendEmail({
    to: params.to,
    subject: `Join ${params.businessName} on ${brand.name}`,
    html,
  });
}

export async function sendSupportNotificationEmail(params: {
  to: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const html = emailLayout(
    "New support request",
    `<p><strong>From:</strong> ${params.name} (${params.email})</p>
     <p><strong>Subject:</strong> ${params.subject}</p>
     <p>${params.message.replace(/\n/g, "<br/>")}</p>`
  );
  return sendEmail({
    to: params.to,
    subject: `[Support] ${params.subject}`,
    html,
  });
}

export async function sendAppointmentReminderEmail(params: {
  to: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  whenLabel: string;
  manageUrl: string;
}) {
  const html = emailLayout(
    "Appointment reminder",
    `<p>Hi ${params.customerName},</p>
     <p>This is a reminder for your upcoming appointment.</p>
     <ul>
       <li><strong>Business:</strong> ${params.businessName}</li>
       <li><strong>Service:</strong> ${params.serviceName}</li>
       <li><strong>When:</strong> ${params.whenLabel}</li>
     </ul>
     <p><a href="${params.manageUrl}">Manage booking</a></p>`
  );
  return sendEmail({
    to: params.to,
    subject: `Reminder: ${params.serviceName} at ${params.businessName}`,
    html,
  });
}
