"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Service, AuditLog } from "@/models";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { requireBusinessAccess } from "@/lib/auth/permissions";
import { getPlan } from "@/config/plans";
import { Subscription } from "@/models";

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  priceCents: z.coerce.number().int().min(0),
  currency: z.string().default("USD"),
  bufferBeforeMinutes: z.coerce.number().int().min(0).default(0),
  bufferAfterMinutes: z.coerce.number().int().min(0).default(0),
  locationType: z
    .enum(["in_location", "on_site", "online", "custom", "either"])
    .default("in_location"),
  locationLabel: z.string().max(200).optional(),
  onlineBookingEnabled: z.boolean().default(true),
  travelBufferMinutes: z.coerce.number().int().min(0).max(240).default(0),
  isActive: z.boolean().default(true),
  depositRequired: z.boolean().default(false),
  depositCents: z.coerce.number().int().min(0).default(0),
});

export async function listServicesAction(): Promise<
  ActionResult<{ services: unknown[] }>
> {
  try {
    const { businessId } = await resolveTenantContext();
    await connectDB();
    const services = await Service.find({ businessId })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return {
      ok: true,
      data: {
        services: services.map((s) => ({
          ...s,
          _id: String(s._id),
          businessId: String(s.businessId),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function createServiceAction(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageServices",
    });
    const parsed = serviceSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Invalid" };
    }

    await connectDB();
    const sub = await Subscription.findOne({ businessId }).lean();
    const plan = getPlan((sub?.planId as "starter") || "starter");
    const count = await Service.countDocuments({ businessId, isActive: true });
    if (count >= plan.limits.services) {
      return {
        ok: false,
        error: `Plan limit reached (${plan.limits.services} services). Upgrade to add more.`,
      };
    }

    const service = await Service.create({
      ...parsed.data,
      businessId,
    });
    await AuditLog.create({
      actorUserId: user.id,
      businessId,
      action: "service.create",
      resourceType: "Service",
      resourceId: String(service._id),
    });
    return { ok: true, data: { id: String(service._id) } };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateServiceAction(
  id: string,
  raw: unknown
): Promise<ActionResult> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageServices",
    });
    const parsed = serviceSchema.partial().safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid input" };
    }
    await connectDB();
    const updated = await Service.findOneAndUpdate(
      { _id: id, businessId },
      { $set: parsed.data },
      { new: true }
    );
    if (!updated) return { ok: false, error: "Service not found" };
    return { ok: true, message: "Service updated" };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageServices",
    });
    await connectDB();
    const updated = await Service.findOneAndUpdate(
      { _id: id, businessId },
      { $set: { isActive: false } }
    );
    if (!updated) return { ok: false, error: "Service not found" };
    return { ok: true, message: "Service archived" };
  } catch (e) {
    return actionError(e);
  }
}
