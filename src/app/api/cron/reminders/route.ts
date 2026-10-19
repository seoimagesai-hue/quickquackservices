import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { connectDB } from "@/lib/db";
import { env } from "@/lib/env";
import {
  Appointment,
  Business,
  Customer,
  Service,
} from "@/models";
import { sendAppointmentReminderEmail } from "@/lib/email/templates";
import { absoluteUrl } from "@/lib/utils";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!env.cronSecret || secret !== env.cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const now = new Date();
  const windowEnd = addHours(now, 48);

  const appointments = await Appointment.find({
    status: { $in: ["pending", "confirmed"] },
    startAt: { $gt: now, $lte: windowEnd },
    reminderEmailSentAt: null,
  })
    .limit(200)
    .lean();

  let sent = 0;
  let skipped = 0;

  for (const appt of appointments) {
    const business = await Business.findById(appt.businessId).lean();
    if (!business?.reminderSettings?.emailEnabled) {
      skipped++;
      continue;
    }

    const hoursBefore = business.reminderSettings.emailHoursBefore ?? 24;
    const sendAfter = addHours(appt.startAt, -hoursBefore);
    if (now < sendAfter) {
      skipped++;
      continue;
    }

    const [service, customer] = await Promise.all([
      Service.findById(appt.serviceId).lean(),
      Customer.findById(appt.customerId).lean(),
    ]);
    if (!service || !customer?.email) {
      skipped++;
      continue;
    }

    const whenLabel = formatInTimeZone(
      appt.startAt,
      appt.timezone || business.timezone,
      "EEE, MMM d yyyy · h:mm a"
    );

    const manageUrl = absoluteUrl(
      `/book/${business.slug}/manage/${String(appt._id)}`
    );

    const result = await sendAppointmentReminderEmail({
      to: customer.email,
      customerName: customer.name,
      businessName: business.name,
      serviceName: service.name,
      whenLabel,
      manageUrl,
    });

    if (result.ok || result.skipped) {
      await Appointment.updateOne(
        { _id: appt._id, reminderEmailSentAt: null },
        { $set: { reminderEmailSentAt: new Date() } }
      );
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, scanned: appointments.length });
}
