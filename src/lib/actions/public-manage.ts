"use server";

import { cancelAppointmentByCustomer } from "@/lib/booking/manage";
import { sendBookingCancellationEmail } from "@/lib/email/templates";
import { formatInTimeZone } from "date-fns-tz";
import { connectDB } from "@/lib/db";
import { Business, Customer, Service } from "@/models";

export async function cancelBookingPublicAction(params: {
  appointmentId: string;
  token: string;
  reason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const appt = await cancelAppointmentByCustomer(params);
    await connectDB();
    const [business, service, customer] = await Promise.all([
      Business.findById(appt.businessId).lean(),
      Service.findById(appt.serviceId).lean(),
      Customer.findById(appt.customerId).lean(),
    ]);
    if (business && service && customer?.email) {
      const whenLabel = formatInTimeZone(
        appt.startAt,
        appt.timezone || business.timezone,
        "EEE, MMM d yyyy · h:mm a"
      );
      await sendBookingCancellationEmail({
        to: customer.email,
        customerName: customer.name,
        businessName: business.name,
        serviceName: service.name,
        whenLabel,
      });
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Cancellation failed",
    };
  }
}
