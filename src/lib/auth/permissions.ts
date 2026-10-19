import { connectDB } from "@/lib/db";
import { BusinessMember } from "@/models";
import type { BusinessRole, SessionUser } from "@/types";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

export async function requirePlatformAdmin(user: SessionUser | null) {
  if (!user) throw new AuthError("Unauthorized", 401);
  if (user.platformRole !== "platform_admin") {
    throw new AuthError("Platform admin access required", 403);
  }
  return user;
}

export async function getMembership(userId: string, businessId: string) {
  await connectDB();
  return BusinessMember.findOne({
    userId,
    businessId,
    status: { $in: ["active", "invited"] },
  }).lean();
}

export async function requireBusinessAccess(
  user: SessionUser | null,
  businessId: string,
  options?: {
    roles?: BusinessRole[];
    permission?: keyof NonNullable<
      Awaited<ReturnType<typeof getMembership>>
    > extends never
      ? never
      : "manageBookings" | "manageServices" | "manageStaff" | "manageCustomers" | "manageSettings" | "viewAnalytics";
  }
) {
  if (!user) throw new AuthError("Unauthorized", 401);
  if (user.platformRole === "platform_admin") {
    return { role: "owner" as BusinessRole, permissions: null as null };
  }

  const member = await getMembership(user.id, businessId);
  if (!member || member.status === "disabled") {
    throw new AuthError("You do not have access to this business", 403);
  }

  if (options?.roles && !options.roles.includes(member.role as BusinessRole)) {
    throw new AuthError("Insufficient role for this action", 403);
  }

  if (options?.permission && member.role !== "owner") {
    const perms = member.permissions as Record<string, boolean> | undefined;
    if (!perms?.[options.permission]) {
      throw new AuthError("Missing permission for this action", 403);
    }
  }

  return member;
}

export async function listUserBusinesses(userId: string) {
  await connectDB();
  return BusinessMember.find({
    userId,
    status: "active",
  })
    .populate("businessId")
    .lean();
}
