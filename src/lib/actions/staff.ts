"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { BusinessMember, StaffAvailability, User, Token } from "@/models";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { requireBusinessAccess } from "@/lib/auth/permissions";
import { generateToken, hashToken } from "@/lib/security/password";
import { sendStaffInviteEmail } from "@/lib/email/templates";
import { getPlan } from "@/config/plans";
import { Subscription } from "@/models";
import { addDays } from "date-fns";
import { getSessionUser } from "@/lib/auth";

export async function listStaffAction(): Promise<
  ActionResult<{ staff: unknown[] }>
> {
  try {
    const { businessId } = await resolveTenantContext();
    await connectDB();
    const staff = await BusinessMember.find({ businessId })
      .populate("userId", "name email image")
      .lean();
    return {
      ok: true,
      data: {
        staff: staff.map((s) => ({
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

const inviteSchema = z.object({
  email: z.string().email(),
  title: z.string().max(120).optional(),
});

export async function inviteStaffAction(
  raw: unknown
): Promise<ActionResult> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageStaff",
    });
    const parsed = inviteSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid email" };

    await connectDB();
    const sub = await Subscription.findOne({ businessId }).lean();
    const plan = getPlan((sub?.planId as "starter") || "starter");
    const count = await BusinessMember.countDocuments({
      businessId,
      status: { $in: ["active", "invited"] },
    });
    if (count >= plan.limits.staff) {
      return {
        ok: false,
        error: `Staff limit reached for ${plan.name} plan.`,
      };
    }

    const email = parsed.data.email.toLowerCase();
    let invitee = await User.findOne({ email });
    const token = generateToken();

    if (!invitee) {
      invitee = await User.create({
        name: email.split("@")[0],
        email,
        platformRole: "user",
        status: "active",
      });
    }

    const existing = await BusinessMember.findOne({
      businessId,
      userId: invitee._id,
    });
    if (existing && existing.status !== "disabled") {
      return { ok: false, error: "Already a member" };
    }

    const member =
      existing ||
      (await BusinessMember.create({
        businessId,
        userId: invitee._id,
        role: "staff",
        title: parsed.data.title || "Staff",
        status: "invited",
        invitedEmail: email,
        isBookable: true,
        permissions: {
          manageBookings: true,
          manageServices: false,
          manageStaff: false,
          manageCustomers: true,
          manageSettings: false,
          viewAnalytics: false,
        },
      }));

    if (existing) {
      existing.status = "invited";
      existing.invitedEmail = email;
      await existing.save();
    }

    await Token.create({
      userId: invitee._id,
      type: "staff_invite",
      tokenHash: hashToken(token),
      expiresAt: addDays(new Date(), 7),
      meta: { businessId, memberId: String(member._id) },
    });

    await StaffAvailability.findOneAndUpdate(
      { businessId, memberId: member._id },
      {
        weeklyHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          day,
          enabled: day >= 1 && day <= 5,
          ranges:
            day >= 1 && day <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
        })),
        breaks: [],
      },
      { upsert: true }
    );

    const sessionUser = await getSessionUser();
    await sendStaffInviteEmail({
      to: email,
      businessName: "your team",
      inviterName: sessionUser?.name || "A Quick Quack Services user",
      token,
    });

    return { ok: true, message: "Invite sent (email when configured)" };
  } catch (e) {
    return actionError(e);
  }
}
