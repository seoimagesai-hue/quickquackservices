"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Business } from "@/models";
import { requireBusinessAccess } from "@/lib/auth/permissions";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { BUSINESS_COOKIE } from "@/lib/constants";
import type { WeeklyHours } from "@/types";

export async function getBusinessSettingsAction(
  businessId?: string
): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const ctx = await resolveTenantContext(businessId);
    await connectDB();
    const business = await Business.findById(ctx.businessId).lean();
    if (!business) return { ok: false, error: "Business not found" };
    return {
      ok: true,
      data: {
        id: String(business._id),
        name: business.name,
        slug: business.slug,
        description: business.description,
        phone: business.phone,
        email: business.email,
        website: business.website,
        timezone: business.timezone,
        brandColor: business.brandColor,
        businessHours: business.businessHours,
        holidays: business.holidays,
        bookingSettings: business.bookingSettings,
        reminderSettings: business.reminderSettings,
        onboardingCompleted: business.onboardingCompleted,
        category: business.category,
        serviceMode: business.serviceMode,
        requireServiceAddress: business.requireServiceAddress,
        requireStaffSelection: business.requireStaffSelection,
        travelBufferMinutes: business.travelBufferMinutes,
        serviceAreas: business.serviceAreas,
        intakeFields: business.intakeFields,
        _id: String(business._id),
        ownerId: String(business.ownerId),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

const flatSettingsSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().max(2000).optional(),
  timezone: z.string().min(1).max(64),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  minLeadTimeMinutes: z.coerce.number().int().min(0).max(10080),
  maxAdvanceDays: z.coerce.number().int().min(1).max(365),
  emailReminders: z.boolean(),
});

const profileSchema = z.object({
  businessId: z.string().optional(),
  name: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().max(200).optional(),
  timezone: z.string().min(1),
  brandColor: z.string().max(32).optional(),
  serviceAreas: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        areaType: z
          .enum(["city", "region", "postal", "custom"])
          .default("custom"),
      })
    )
    .optional(),
  travelBufferMinutes: z.coerce.number().int().min(0).max(240).optional(),
});

const extendedSettingsSchema = z.object({
  businessId: z.string().optional(),
  businessHours: z.array(
    z.object({
      day: z.number().min(0).max(6),
      enabled: z.boolean(),
      ranges: z.array(z.object({ start: z.string(), end: z.string() })),
    })
  ),
  holidays: z
    .array(z.object({ date: z.string(), name: z.string().optional() }))
    .optional(),
  bookingSettings: z
    .object({
      minLeadTimeMinutes: z.number().min(0),
      maxAdvanceDays: z.number().min(1),
      bufferBeforeMinutes: z.number().min(0),
      bufferAfterMinutes: z.number().min(0),
      slotIntervalMinutes: z.number().min(5),
      allowCustomerCancel: z.boolean(),
      allowCustomerReschedule: z.boolean(),
      cancellationPolicyHours: z.number().min(0),
      confirmationMessage: z.string().max(2000).optional(),
    })
    .optional(),
  reminderSettings: z
    .object({
      emailEnabled: z.boolean(),
      emailHoursBefore: z.number().min(1),
    })
    .optional(),
});

export async function updateBusinessSettingsAction(
  raw: unknown
): Promise<ActionResult> {
  const flat = flatSettingsSchema.safeParse(raw);
  if (flat.success) {
    try {
      const ctx = await resolveTenantContext();
      await requireBusinessAccess(ctx.user, ctx.businessId, {
        roles: ["owner"],
        permission: "manageSettings",
      });
      await connectDB();
      await Business.findByIdAndUpdate(ctx.businessId, {
        $set: {
          name: flat.data.name,
          description: flat.data.description || "",
          timezone: flat.data.timezone,
          phone: flat.data.phone || "",
          email: flat.data.email || "",
          "bookingSettings.minLeadTimeMinutes": flat.data.minLeadTimeMinutes,
          "bookingSettings.maxAdvanceDays": flat.data.maxAdvanceDays,
          "reminderSettings.emailEnabled": flat.data.emailReminders,
        },
      });
      return { ok: true, message: "Saved" };
    } catch (e) {
      return actionError(e);
    }
  }

  const parsed = extendedSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }
  try {
    const ctx = await resolveTenantContext(parsed.data.businessId);
    await requireBusinessAccess(ctx.user, ctx.businessId, {
      permission: "manageSettings",
    });
    await connectDB();
    const update: Record<string, unknown> = {
      businessHours: parsed.data.businessHours as WeeklyHours[],
    };
    if (parsed.data.holidays) update.holidays = parsed.data.holidays;
    if (parsed.data.bookingSettings)
      update.bookingSettings = parsed.data.bookingSettings;
    if (parsed.data.reminderSettings)
      update.reminderSettings = parsed.data.reminderSettings;
    await Business.findByIdAndUpdate(ctx.businessId, update);
    return { ok: true, message: "Settings saved" };
  } catch (e) {
    return actionError(e);
  }
}

export async function updateBusinessProfileAction(
  raw: unknown
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }
  try {
    const ctx = await resolveTenantContext(parsed.data.businessId);
    await requireBusinessAccess(ctx.user, ctx.businessId, {
      permission: "manageSettings",
    });
    await connectDB();
    const update: Record<string, unknown> = {
      name: parsed.data.name,
      description: parsed.data.description || "",
      phone: parsed.data.phone || "",
      email: parsed.data.email || "",
      website: parsed.data.website || "",
      timezone: parsed.data.timezone,
    };
    if (parsed.data.brandColor) update.brandColor = parsed.data.brandColor;
    if (parsed.data.serviceAreas) update.serviceAreas = parsed.data.serviceAreas;
    if (parsed.data.travelBufferMinutes !== undefined) {
      update.travelBufferMinutes = parsed.data.travelBufferMinutes;
      update["bookingSettings.travelBufferMinutes"] =
        parsed.data.travelBufferMinutes;
    }
    await Business.findByIdAndUpdate(ctx.businessId, { $set: update });
    return { ok: true, message: "Profile updated" };
  } catch (e) {
    return actionError(e);
  }
}

export async function completeOnboardingAction(
  businessId?: string
): Promise<ActionResult> {
  try {
    const ctx = await resolveTenantContext(businessId);
    await requireBusinessAccess(ctx.user, ctx.businessId, { roles: ["owner"] });
    await connectDB();
    await Business.findByIdAndUpdate(ctx.businessId, {
      onboardingCompleted: true,
      onboardingStep: 8,
    });
    return { ok: true, message: "Onboarding complete" };
  } catch (e) {
    return actionError(e);
  }
}

export async function switchBusinessAction(
  businessId: string
): Promise<ActionResult> {
  try {
    await resolveTenantContext(businessId);
    const jar = await cookies();
    jar.set(BUSINESS_COOKIE, businessId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return { ok: true };
  } catch (e) {
    return actionError(e);
  }
}
