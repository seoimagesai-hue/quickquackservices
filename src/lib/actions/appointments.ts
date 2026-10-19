"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Appointment, Customer, Service } from "@/models";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { requireBusinessAccess } from "@/lib/auth/permissions";
import type { AppointmentStatus } from "@/types";

export async function listAppointmentsAction(params?: {
  status?: string;
  page?: number;
  limit?: number;
  q?: string;
}): Promise<ActionResult<{ items: unknown[]; total: number }>> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageBookings",
    });
    await connectDB();
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const filter: Record<string, unknown> = { businessId };
    if (params?.status) filter.status = params.status;

    const [items, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ startAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("serviceId", "name durationMinutes")
        .populate("customerId", "name email phone")
        .populate({
          path: "staffMemberId",
          select: "title userId",
          populate: { path: "userId", select: "name email" },
        })
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return {
      ok: true,
      data: {
        total,
        items: items.map((a) => ({
          ...a,
          _id: String(a._id),
          businessId: String(a.businessId),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

const statusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ]),
  reason: z.string().max(500).optional(),
});

export async function updateAppointmentStatusAction(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageBookings",
    });
    const parsed = statusSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid status" };

    await connectDB();
    const appointment = await Appointment.findOne({ _id: id, businessId });
    if (!appointment) return { ok: false, error: "Not found" };

    appointment.status = parsed.data.status as AppointmentStatus;
    if (parsed.data.status === "cancelled") {
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = "staff";
      appointment.cancellationReason = parsed.data.reason || "";
    }
    await appointment.save();
    return { ok: true, message: "Updated" };
  } catch (e) {
    return actionError(e);
  }
}

export async function dashboardOverviewAction(): Promise<
  ActionResult<{
    todayCount: number;
    upcomingCount: number;
    confirmedCount: number;
    revenueCents: number;
    upcoming: unknown[];
  }>
> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId);
    await connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [todayCount, upcomingCount, confirmedCount, revenueAgg, upcoming] =
      await Promise.all([
        Appointment.countDocuments({
          businessId,
          startAt: { $gte: start, $lte: end },
          status: { $in: ["pending", "confirmed"] },
        }),
        Appointment.countDocuments({
          businessId,
          startAt: { $gte: new Date() },
          status: { $in: ["pending", "confirmed"] },
        }),
        Appointment.countDocuments({
          businessId,
          status: "confirmed",
        }),
        Appointment.aggregate([
          {
            $match: {
              businessId: businessId as unknown as object,
              paymentStatus: "paid",
            },
          },
          { $group: { _id: null, total: { $sum: "$priceCents" } } },
        ]),
        Appointment.find({
          businessId,
          startAt: { $gte: new Date() },
          status: { $in: ["pending", "confirmed"] },
        })
          .sort({ startAt: 1 })
          .limit(8)
          .populate("serviceId", "name")
          .populate("customerId", "name")
          .lean(),
      ]);

    // Fix ObjectId match for aggregation
    const mongoose = await import("mongoose");
    const revenue = await Appointment.aggregate([
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          paymentStatus: "paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$priceCents" } } },
    ]);

    return {
      ok: true,
      data: {
        todayCount,
        upcomingCount,
        confirmedCount,
        revenueCents: revenue[0]?.total || revenueAgg[0]?.total || 0,
        upcoming: upcoming.map((a) => ({
          ...a,
          _id: String(a._id),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

// silence unused imports used for typing clarity in editors
void Customer;
void Service;
