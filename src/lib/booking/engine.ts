import { addMinutes } from "date-fns";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import {
  Appointment,
  BookingHold,
  Business,
  BusinessMember,
  Customer,
  Service,
  StaffAvailability,
  TimeOff,
} from "@/models";
import { calculateAvailableSlots, makeSlotKey } from "@/lib/booking/slots";
import { generateToken, hashToken } from "@/lib/security/password";
import type { WeeklyHours } from "@/types";

const HOLD_TTL_MS = 10 * 60 * 1000;

export async function getBusinessBySlug(slug: string) {
  await connectDB();
  return Business.findOne({ slug: slug.toLowerCase(), status: "active" }).lean();
}

export async function listBookableServices(businessId: string) {
  await connectDB();
  return Service.find({
    businessId,
    isActive: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
}

export async function listBookableStaff(
  businessId: string,
  serviceId?: string
) {
  await connectDB();
  const query: Record<string, unknown> = {
    businessId,
    status: "active",
    isBookable: true,
  };
  if (serviceId) {
    query.$or = [
      { serviceIds: { $size: 0 } },
      { serviceIds: serviceId },
      { serviceIds: new mongoose.Types.ObjectId(serviceId) },
    ];
  }
  return BusinessMember.find(query)
    .select("title bio avatarUrl userId serviceIds role")
    .populate("userId", "name image")
    .lean();
}

export async function getAvailableSlots(params: {
  businessId: string;
  serviceId: string;
  staffMemberId?: string | "any";
  dateYmd: string;
}) {
  await connectDB();
  const business = await Business.findById(params.businessId).lean();
  if (!business) throw new Error("Business not found");

  const service = await Service.findOne({
    _id: params.serviceId,
    businessId: params.businessId,
    isActive: true,
  }).lean();
  if (!service) throw new Error("Service not found");

  let staffIds: string[] = [];
  if (params.staffMemberId && params.staffMemberId !== "any") {
    staffIds = [params.staffMemberId];
  } else {
    const staff = await listBookableStaff(params.businessId, params.serviceId);
    staffIds = staff.map((s) => String(s._id));
  }

  const dayStart = new Date(`${params.dateYmd}T00:00:00.000Z`);
  const dayEnd = new Date(`${params.dateYmd}T23:59:59.999Z`);
  // Expand window for timezone safety
  const windowStart = addMinutes(dayStart, -24 * 60);
  const windowEnd = addMinutes(dayEnd, 24 * 60);

  const results: Array<{
    staffMemberId: string;
    slots: Array<{ startAt: string; endAt: string; label: string }>;
  }> = [];

  for (const staffId of staffIds) {
    const availability = await StaffAvailability.findOne({
      businessId: params.businessId,
      memberId: staffId,
    }).lean();

    const weeklyHours =
      (availability?.weeklyHours as WeeklyHours[] | undefined)?.length
        ? (availability!.weeklyHours as WeeklyHours[])
        : (business.businessHours as WeeklyHours[]);

    const [appointments, holds, timeOff] = await Promise.all([
      Appointment.find({
        businessId: params.businessId,
        staffMemberId: staffId,
        status: { $in: ["pending", "confirmed"] },
        startAt: { $lt: windowEnd },
        endAt: { $gt: windowStart },
      })
        .select("startAt endAt")
        .lean(),
      BookingHold.find({
        businessId: params.businessId,
        staffMemberId: staffId,
        status: "active",
        expiresAt: { $gt: new Date() },
        startAt: { $lt: windowEnd },
        endAt: { $gt: windowStart },
      })
        .select("startAt endAt")
        .lean(),
      TimeOff.find({
        businessId: params.businessId,
        memberId: staffId,
        startAt: { $lt: windowEnd },
        endAt: { $gt: windowStart },
      })
        .select("startAt endAt")
        .lean(),
    ]);

    const travelBuffer = Math.max(
      service.travelBufferMinutes || 0,
      business.travelBufferMinutes || 0,
      business.bookingSettings?.travelBufferMinutes || 0
    );
    const isOnSite =
      service.locationType === "on_site" ||
      (service.locationType !== "in_location" &&
        (business.serviceMode === "on_site" ||
          business.requireServiceAddress));

    const slots = calculateAvailableSlots({
      dateYmd: params.dateYmd,
      timezone: business.timezone,
      durationMinutes: service.durationMinutes,
      bufferBeforeMinutes:
        (service.bufferBeforeMinutes ||
          business.bookingSettings?.bufferBeforeMinutes ||
          0) + (isOnSite ? travelBuffer : 0),
      bufferAfterMinutes:
        (service.bufferAfterMinutes ||
          business.bookingSettings?.bufferAfterMinutes ||
          0) + (isOnSite ? travelBuffer : 0),
      slotIntervalMinutes:
        business.bookingSettings?.slotIntervalMinutes || 15,
      weeklyHours,
      breaks: (availability?.breaks as Array<{
        day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
        start: string;
        end: string;
      }>) || [],
      holidays: (business.holidays || []).map(
        (h: { date: string }) => h.date
      ),
      timeOff: timeOff.map((t) => ({
        startAt: t.startAt,
        endAt: t.endAt,
      })),
      existingAppointments: appointments.map((a) => ({
        startAt: a.startAt,
        endAt: a.endAt,
      })),
      activeHolds: holds.map((h) => ({
        startAt: h.startAt,
        endAt: h.endAt,
      })),
      minLeadTimeMinutes: business.bookingSettings?.minLeadTimeMinutes ?? 60,
      maxAdvanceDays: business.bookingSettings?.maxAdvanceDays ?? 60,
    });

    results.push({
      staffMemberId: staffId,
      slots: slots.map((s) => ({
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
        label: s.label,
      })),
    });
  }

  return { business, service, results };
}

export async function createHold(params: {
  businessId: string;
  serviceId: string;
  staffMemberId: string;
  startAt: string;
}) {
  await connectDB();
  const startAt = new Date(params.startAt);
  if (Number.isNaN(startAt.getTime())) {
    throw new Error("Invalid start time");
  }

  const service = await Service.findOne({
    _id: params.serviceId,
    businessId: params.businessId,
    isActive: true,
  }).lean();
  if (!service) throw new Error("Service not found");

  const endAt = addMinutes(startAt, service.durationMinutes);
  const slotKey = makeSlotKey(params.staffMemberId, startAt);
  const holdToken = nanoid(32);
  const expiresAt = new Date(Date.now() + HOLD_TTL_MS);

  try {
    const hold = await BookingHold.create({
      businessId: params.businessId,
      staffMemberId: params.staffMemberId,
      serviceId: params.serviceId,
      slotKey,
      startAt,
      endAt,
      holdToken,
      expiresAt,
      status: "active",
    });
    return {
      holdToken,
      expiresAt: expiresAt.toISOString(),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      holdId: String(hold._id),
    };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      throw new Error("This time slot was just taken. Please choose another.");
    }
    throw err;
  }
}

export async function confirmBooking(params: {
  businessId: string;
  holdToken: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
    serviceAddress?: {
      line1?: string;
      line2?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
      formatted?: string;
    };
    problemDescription?: string;
    intakeAnswers?: Record<string, string>;
  };
}) {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hold = await BookingHold.findOne({
      holdToken: params.holdToken,
      businessId: params.businessId,
      status: "active",
      expiresAt: { $gt: new Date() },
    }).session(session);

    if (!hold) {
      throw new Error("Hold expired or invalid. Please select a time again.");
    }

    // Overlap guard inside transaction
    const conflict = await Appointment.findOne({
      businessId: params.businessId,
      staffMemberId: hold.staffMemberId,
      status: { $in: ["pending", "confirmed"] },
      startAt: { $lt: hold.endAt },
      endAt: { $gt: hold.startAt },
    }).session(session);

    if (conflict) {
      hold.status = "released";
      await hold.save({ session });
      throw new Error("This time slot is no longer available.");
    }

    const business = await Business.findById(params.businessId).session(session);
    if (!business) throw new Error("Business not found");

    const service = await Service.findById(hold.serviceId).session(session);
    if (!service) throw new Error("Service not found");

    let customer = await Customer.findOne({
      businessId: params.businessId,
      email: params.customer.email.toLowerCase(),
      deletedAt: null,
    }).session(session);

    if (!customer) {
      const created = await Customer.create(
        [
          {
            businessId: params.businessId,
            name: params.customer.name,
            email: params.customer.email.toLowerCase(),
            phone: params.customer.phone || "",
          },
        ],
        { session }
      );
      customer = created[0]!;
    } else {
      customer.name = params.customer.name;
      if (params.customer.phone) customer.phone = params.customer.phone;
      await customer.save({ session });
    }

    const requireAddress =
      business.requireServiceAddress ||
      service.locationType === "on_site" ||
      business.serviceMode === "on_site";

    const formattedAddress =
      params.customer.serviceAddress?.formatted?.trim() ||
      [
        params.customer.serviceAddress?.line1,
        params.customer.serviceAddress?.city,
        params.customer.serviceAddress?.region,
        params.customer.serviceAddress?.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

    if (requireAddress && !formattedAddress) {
      throw new Error("A service address is required for this appointment.");
    }

    // Validate required intake fields
    const intakeAnswers = params.customer.intakeAnswers || {};
    for (const field of business.intakeFields || []) {
      if (!field.required) continue;
      if (field.isAddress) continue; // handled above
      if (field.key === "problemDescription") {
        if (!params.customer.problemDescription?.trim() && !intakeAnswers[field.key]?.trim()) {
          throw new Error(`${field.label} is required.`);
        }
        continue;
      }
      if (field.key === "notes") continue;
      if (!intakeAnswers[field.key]?.trim()) {
        throw new Error(`${field.label} is required.`);
      }
    }

    // Optional service-area check (soft gate when areas configured)
    const areas = (business.serviceAreas || []) as Array<{ label: string }>;
    if (requireAddress && areas.length && formattedAddress) {
      const hay = formattedAddress.toLowerCase();
      const inArea = areas.some((a) =>
        hay.includes(String(a.label).toLowerCase())
      );
      if (!inArea) {
        throw new Error(
          "This address sits outside the configured service area. Contact the business directly."
        );
      }
    }

    const manageToken = generateToken(24);
    const appointmentDocs = await Appointment.create(
      [
        {
          businessId: params.businessId,
          serviceId: hold.serviceId,
          staffMemberId: hold.staffMemberId,
          customerId: customer._id,
          startAt: hold.startAt,
          endAt: hold.endAt,
          timezone: business.timezone,
          status: "confirmed",
          priceCents: service.priceCents,
          currency: service.currency || business.currency,
          depositCents: service.depositRequired ? service.depositCents : 0,
          customerNotes: params.customer.notes || "",
          serviceAddress: {
            line1: params.customer.serviceAddress?.line1 || "",
            line2: params.customer.serviceAddress?.line2 || "",
            city: params.customer.serviceAddress?.city || "",
            region: params.customer.serviceAddress?.region || "",
            postalCode: params.customer.serviceAddress?.postalCode || "",
            country: params.customer.serviceAddress?.country || "",
            formatted: formattedAddress || "",
          },
          problemDescription:
            params.customer.problemDescription ||
            intakeAnswers.problemDescription ||
            "",
          intakeAnswers,
          manageTokenHash: hashToken(manageToken),
          manageTokenExpiresAt: addMinutes(hold.startAt, 7 * 24 * 60),
          source: "online",
        },
      ],
      { session }
    );

    const appointment = appointmentDocs[0]!;
    hold.status = "consumed";
    hold.appointmentId = appointment._id;
    await hold.save({ session });

    await session.commitTransaction();

    return {
      appointmentId: String(appointment._id),
      manageToken,
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      timezone: business.timezone,
      serviceName: service.name,
      customerEmail: customer.email,
      customerName: customer.name,
      businessName: business.name,
      businessSlug: business.slug,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
