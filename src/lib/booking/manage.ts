import { addMinutes } from "date-fns";
import { connectDB } from "@/lib/db";
import { Appointment, Business, Customer, Service } from "@/models";
import { hashToken } from "@/lib/security/password";

function tokenMatches(token: string, hash: string) {
  return hashToken(token) === hash;
}

export async function getAppointmentForManageToken(params: {
  appointmentId: string;
  token: string;
}) {
  await connectDB();
  const appointment = await Appointment.findById(params.appointmentId)
    .select("+manageTokenHash")
    .lean();
  if (!appointment?.manageTokenHash) return null;
  if (
    appointment.manageTokenExpiresAt &&
    appointment.manageTokenExpiresAt < new Date()
  ) {
    return null;
  }
  if (!tokenMatches(params.token, appointment.manageTokenHash)) return null;

  const [business, service, customer] = await Promise.all([
    Business.findById(appointment.businessId).lean(),
    Service.findById(appointment.serviceId).lean(),
    Customer.findById(appointment.customerId).lean(),
  ]);

  return { appointment, business, service, customer };
}

export async function cancelAppointmentByCustomer(params: {
  appointmentId: string;
  token: string;
  reason?: string;
}) {
  await connectDB();
  const appointment = await Appointment.findById(params.appointmentId).select(
    "+manageTokenHash"
  );
  if (!appointment?.manageTokenHash) {
    throw new Error("Invalid manage link");
  }
  if (
    appointment.manageTokenExpiresAt &&
    appointment.manageTokenExpiresAt < new Date()
  ) {
    throw new Error("Manage link expired");
  }
  if (!tokenMatches(params.token, appointment.manageTokenHash)) {
    throw new Error("Invalid manage link");
  }

  const business = await Business.findById(appointment.businessId).lean();
  if (!business?.bookingSettings?.allowCustomerCancel) {
    throw new Error("Online cancellation is not allowed for this business");
  }

  const hours = business.bookingSettings.cancellationPolicyHours ?? 24;
  const cutoff = addMinutes(appointment.startAt, -hours * 60);
  if (new Date() > cutoff) {
    throw new Error(
      `Cancellation must be at least ${hours} hours before the appointment`
    );
  }

  if (["cancelled", "completed", "no_show"].includes(appointment.status)) {
    throw new Error("This appointment can no longer be cancelled");
  }

  appointment.status = "cancelled";
  appointment.cancelledAt = new Date();
  appointment.cancelledBy = "customer";
  appointment.cancellationReason = params.reason || "";
  await appointment.save();

  return appointment;
}
