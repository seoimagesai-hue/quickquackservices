"use server";

import { AuthError } from "next-auth";
import { addHours, addMinutes } from "date-fns";
import { connectDB } from "@/lib/db";
import {
  Business,
  BusinessMember,
  StaffAvailability,
  Subscription,
  Token,
  User,
  AuditLog,
} from "@/models";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  generateToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "@/lib/security/password";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { slugify } from "@/lib/utils";
import { signIn, signOut } from "@/lib/auth";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email/templates";
import { getPlan } from "@/config/plans";
import { categoryDefaults } from "@/lib/business/apply-category";
import { headers } from "next/headers";

function defaultWeeklyHours() {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    enabled: day >= 1 && day <= 5,
    ranges: day >= 1 && day <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
  }));
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

export async function registerAction(
  raw: unknown
): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const limited = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.success) {
    return { ok: false, error: "Too many registration attempts. Try later." };
  }

  try {
    await connectDB();
    const email = parsed.data.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      name: parsed.data.name,
      email,
      passwordHash,
      timezone: parsed.data.timezone,
      platformRole: "user",
      emailVerified: null,
    });

    const verifyToken = generateToken();
    await Token.create({
      userId: user._id,
      type: "email_verification",
      tokenHash: hashToken(verifyToken),
      expiresAt: addHours(new Date(), 24),
    });
    await sendVerificationEmail({
      to: email,
      name: user.name,
      token: verifyToken,
    });

    if (parsed.data.businessName) {
      const base = slugify(parsed.data.businessName) || "business";
      let slug = base;
      let i = 1;
      while (await Business.findOne({ slug })) {
        slug = `${base}-${i++}`;
      }

      const defaults = categoryDefaults(parsed.data.businessCategory);
      const business = await Business.create({
        name: parsed.data.businessName,
        slug,
        ownerId: user._id,
        timezone: parsed.data.timezone,
        country: parsed.data.country || "",
        email,
        phone: parsed.data.businessPhone || "",
        category: defaults.category,
        customCategory:
          parsed.data.customCategory ||
          (defaults.category === "other"
            ? parsed.data.customCategory || ""
            : ""),
        industry: defaults.industry,
        serviceMode: defaults.serviceMode,
        requireStaffSelection: defaults.requireStaffSelection,
        requireServiceAddress: defaults.requireServiceAddress,
        travelBufferMinutes: defaults.travelBufferMinutes,
        intakeFields: defaults.intakeFields,
        bookingSettings: {
          travelBufferMinutes: defaults.bookingSettingsTravelBuffer,
        },
        businessHours: defaultWeeklyHours(),
        onboardingCompleted: false,
        onboardingStep: 1,
      });

      // Seed default booking form from category
      const { BookingForm } = await import("@/models");
      const { defaultFormFieldsForCategory } = await import(
        "@/lib/booking/form-validation"
      );
      const { nanoid } = await import("nanoid");
      await BookingForm.create({
        businessId: business._id,
        name: "Default booking form",
        isDefault: true,
        fields: defaultFormFieldsForCategory(defaults.category).map(
          (f, i) => ({
            ...f,
            id: f.id || nanoid(8),
            sortOrder: i,
            placeholder: "",
            helpText: "",
            options: [],
          })
        ),
      });

      const member = await BusinessMember.create({
        businessId: business._id,
        userId: user._id,
        role: "owner",
        permissions: {
          manageBookings: true,
          manageServices: true,
          manageStaff: true,
          manageCustomers: true,
          manageSettings: true,
          viewAnalytics: true,
        },
        title: "Owner",
        isBookable: true,
        status: "active",
      });

      await StaffAvailability.create({
        businessId: business._id,
        memberId: member._id,
        weeklyHours: defaultWeeklyHours(),
        breaks: [],
      });

      const plan = getPlan("starter");
      await Subscription.create({
        businessId: business._id,
        planId: "starter",
        status: "trialing",
        billingInterval: "month",
        trialEndsAt: addMinutes(new Date(), plan.trialDays * 24 * 60),
      });
    }

    await AuditLog.create({
      actorUserId: user._id,
      action: "user.register",
      resourceType: "User",
      resourceId: String(user._id),
      ip,
    });

    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });

    return { ok: true, data: { userId: String(user._id) } };
  } catch (error) {
    console.error("registerAction", error);
    if (error instanceof Error) {
      const msg = error.message;
      if (
        msg.includes("MONGODB_URI") ||
        msg.includes("MongoDB") ||
        msg.includes("DNS SRV") ||
        msg.includes("authentication failed")
      ) {
        return { ok: false, error: msg };
      }
    }
    return { ok: false, error: "Registration failed. Please try again." };
  }
}

export async function loginAction(
  raw: unknown
): Promise<ActionResult> {
  const email = typeof raw === "object" && raw && "email" in raw ? String((raw as { email: string }).email) : "";
  const password =
    typeof raw === "object" && raw && "password" in raw
      ? String((raw as { password: string }).password)
      : "";

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    if (error instanceof Error && error.message.includes("Too many")) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Login failed." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  raw: unknown
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const limited = rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.success) {
    return { ok: false, error: "Too many requests. Try later." };
  }

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  // Always return success to avoid email enumeration
  if (user) {
    const token = generateToken();
    await Token.create({
      userId: user._id,
      type: "password_reset",
      tokenHash: hashToken(token),
      expiresAt: addHours(new Date(), 1),
    });
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
    });
  }

  return {
    ok: true,
    message: "If an account exists, a reset link has been sent.",
  };
}

export async function resetPasswordAction(
  raw: unknown
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid password or token." };
  }

  await connectDB();
  const tokenDoc = await Token.findOne({
    tokenHash: hashToken(parsed.data.token),
    type: "password_reset",
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    return { ok: false, error: "Reset link is invalid or expired." };
  }

  const user = await User.findById(tokenDoc.userId).select("+passwordHash");
  if (!user) return { ok: false, error: "User not found." };

  user.passwordHash = await hashPassword(parsed.data.password);
  await user.save();
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  return { ok: true, message: "Password updated. You can sign in now." };
}

export async function verifyEmailAction(
  token: string
): Promise<ActionResult> {
  if (!token) return { ok: false, error: "Missing token." };
  await connectDB();
  const tokenDoc = await Token.findOne({
    tokenHash: hashToken(token),
    type: "email_verification",
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) {
    return { ok: false, error: "Verification link is invalid or expired." };
  }
  await User.findByIdAndUpdate(tokenDoc.userId, {
    emailVerified: new Date(),
  });
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();
  return { ok: true, message: "Email verified successfully." };
}

export async function changePasswordAction(params: {
  currentPassword: string;
  newPassword: string;
  userId: string;
}): Promise<ActionResult> {
  await connectDB();
  const user = await User.findById(params.userId).select("+passwordHash");
  if (!user?.passwordHash) return { ok: false, error: "User not found." };
  const ok = await verifyPassword(params.currentPassword, user.passwordHash);
  if (!ok) return { ok: false, error: "Current password is incorrect." };
  if (params.newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  user.passwordHash = await hashPassword(params.newPassword);
  await user.save();
  return { ok: true, message: "Password updated." };
}
