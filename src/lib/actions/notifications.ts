"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";

export async function listNotificationsAction(
  businessId?: string
): Promise<ActionResult<{ notifications: unknown[] }>> {
  try {
    const ctx = await resolveTenantContext(businessId);
    await connectDB();
    const rows = await Notification.find({
      userId: ctx.user.id,
      $or: [{ businessId: null }, { businessId: ctx.businessId }],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return {
      ok: true,
      data: {
        notifications: rows.map((n) => ({
          id: String(n._id),
          type: n.type,
          title: n.title,
          body: n.body,
          href: n.href,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

const markSchema = z.object({
  notificationId: z.string().min(1),
  businessId: z.string().optional(),
});

export async function markNotificationReadAction(
  raw: unknown
): Promise<ActionResult> {
  const parsed = markSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request" };
  }
  try {
    const ctx = await resolveTenantContext(parsed.data.businessId);
    await connectDB();
    await Notification.findOneAndUpdate(
      {
        _id: parsed.data.notificationId,
        userId: ctx.user.id,
      },
      { readAt: new Date() }
    );
    return { ok: true };
  } catch (e) {
    return actionError(e);
  }
}

const markAllSchema = z.object({
  businessId: z.string().optional(),
});

export async function markAllNotificationsReadAction(
  raw: unknown
): Promise<ActionResult> {
  const parsed = markAllSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request" };
  }
  try {
    const ctx = await resolveTenantContext(parsed.data.businessId);
    await connectDB();
    await Notification.updateMany(
      {
        userId: ctx.user.id,
        readAt: null,
        $or: [{ businessId: null }, { businessId: ctx.businessId }],
      },
      { readAt: new Date() }
    );
    return { ok: true };
  } catch (e) {
    return actionError(e);
  }
}
