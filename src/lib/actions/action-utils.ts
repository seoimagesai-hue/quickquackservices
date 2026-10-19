import { cookies } from "next/headers";
import { requireSessionUser } from "@/lib/auth";
import {
  AuthError,
  listUserBusinesses,
  requireBusinessAccess,
} from "@/lib/auth/permissions";
import { BUSINESS_COOKIE } from "@/lib/constants";
import type { SessionUser } from "@/types";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

export { BUSINESS_COOKIE };

function memberBusinessId(
  m: Awaited<ReturnType<typeof listUserBusinesses>>[number]
): string {
  const b = m.businessId as { _id?: { toString(): string } } | string;
  if (typeof b === "string") return b;
  return String(b._id);
}

export async function resolveTenantContext(
  businessIdFromClient?: string
): Promise<{
  user: SessionUser;
  businessId: string;
  memberships: Awaited<ReturnType<typeof listUserBusinesses>>;
}> {
  const user = await requireSessionUser();
  const memberships = await listUserBusinesses(user.id);
  if (!memberships.length) {
    throw new AuthError("No business found for this account", 404);
  }

  let businessId = businessIdFromClient?.trim();
  if (!businessId) {
    const jar = await cookies();
    businessId = jar.get(BUSINESS_COOKIE)?.value;
  }
  if (!businessId) {
    businessId = memberBusinessId(memberships[0]!);
  }

  await requireBusinessAccess(user, businessId);
  return { user, businessId, memberships };
}

export function actionError(error: unknown): ActionResult {
  if (error instanceof AuthError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return { ok: false, error: "Please sign in to continue." };
  }
  console.error(error);
  return { ok: false, error: "Something went wrong. Please try again." };
}

/** Strip Mongo ObjectIds/Dates so values are safe for Client Components. */
export function serializeForClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
