"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { requirePlatformAdmin } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import {
  AuditLog,
  Business,
  Subscription,
  SupportTicket,
  User,
} from "@/models";
import { actionError, type ActionResult } from "@/lib/actions/action-utils";

async function adminGuard() {
  const user = await getSessionUser();
  await requirePlatformAdmin(user);
  return user!;
}

export async function adminOverviewAction(): Promise<
  ActionResult<{
    users: number;
    businesses: number;
    activeSubscriptions: number;
    openTickets: number;
  }>
> {
  try {
    await adminGuard();
    await connectDB();
    const [users, businesses, activeSubscriptions, openTickets] =
      await Promise.all([
        User.countDocuments({ status: { $ne: "deleted" } }),
        Business.countDocuments({}),
        Subscription.countDocuments({
          status: { $in: ["trialing", "active", "past_due"] },
        }),
        SupportTicket.countDocuments({
          status: { $in: ["open", "in_progress"] },
        }),
      ]);
    return {
      ok: true,
      data: { users, businesses, activeSubscriptions, openTickets },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function adminListBusinessesAction(): Promise<
  ActionResult<{ businesses: unknown[] }>
> {
  try {
    await adminGuard();
    await connectDB();
    const rows = await Business.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return {
      ok: true,
      data: {
        businesses: rows.map((b) => ({
          id: String(b._id),
          name: b.name,
          slug: b.slug,
          timezone: b.timezone,
          onboardingCompleted: b.onboardingCompleted,
          createdAt: b.createdAt.toISOString(),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function adminListUsersAction(): Promise<
  ActionResult<{ users: unknown[] }>
> {
  try {
    await adminGuard();
    await connectDB();
    const rows = await User.find({ status: { $ne: "deleted" } })
      .sort({ createdAt: -1 })
      .limit(200)
      .select("name email platformRole status emailVerified lastLoginAt createdAt")
      .lean();
    return {
      ok: true,
      data: {
        users: rows.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          platformRole: u.platformRole,
          status: u.status,
          emailVerified: Boolean(u.emailVerified),
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
          createdAt: u.createdAt.toISOString(),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function adminListSubscriptionsAction(): Promise<
  ActionResult<{ subscriptions: unknown[] }>
> {
  try {
    await adminGuard();
    await connectDB();
    const rows = await Subscription.find()
      .sort({ updatedAt: -1 })
      .limit(200)
      .populate("businessId", "name slug")
      .lean();
    return {
      ok: true,
      data: {
        subscriptions: rows.map((s) => ({
          id: String(s._id),
          businessId: String(s.businessId?._id ?? s.businessId),
          businessName:
            typeof s.businessId === "object" &&
            s.businessId &&
            "name" in s.businessId
              ? (s.businessId as { name: string }).name
              : "—",
          planId: s.planId,
          status: s.status,
          billingInterval: s.billingInterval,
          stripeCustomerId: s.stripeCustomerId,
          currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function adminListSupportTicketsAction(): Promise<
  ActionResult<{ tickets: unknown[] }>
> {
  try {
    await adminGuard();
    await connectDB();
    const rows = await SupportTicket.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return {
      ok: true,
      data: {
        tickets: rows.map((t) => ({
          id: String(t._id),
          name: t.name,
          email: t.email,
          subject: t.subject,
          category: t.category,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

const ticketStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export async function adminUpdateSupportTicketAction(
  raw: unknown
): Promise<ActionResult> {
  const parsed = ticketStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid ticket update" };
  }
  try {
    await adminGuard();
    await connectDB();
    await SupportTicket.findByIdAndUpdate(parsed.data.ticketId, {
      status: parsed.data.status,
    });
    return { ok: true, message: "Ticket updated" };
  } catch (e) {
    return actionError(e);
  }
}

export async function adminListAuditLogsAction(): Promise<
  ActionResult<{ logs: unknown[] }>
> {
  try {
    await adminGuard();
    await connectDB();
    const rows = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    return {
      ok: true,
      data: {
        logs: rows.map((l) => ({
          id: String(l._id),
          action: l.action,
          resourceType: l.resourceType,
          resourceId: l.resourceId,
          actorUserId: l.actorUserId ? String(l.actorUserId) : null,
          businessId: l.businessId ? String(l.businessId) : null,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}
