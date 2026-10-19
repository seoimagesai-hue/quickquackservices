import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listUserBusinesses } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import { Business } from "@/models";
import { BUSINESS_COOKIE } from "@/lib/constants";

function memberBusinessId(
  m: Awaited<ReturnType<typeof listUserBusinesses>>[number]
): string {
  const b = m.businessId as { _id?: { toString(): string } } | string;
  if (typeof b === "string") return b;
  return String(b._id);
}

function memberBusinessName(
  m: Awaited<ReturnType<typeof listUserBusinesses>>[number]
): string {
  const b = m.businessId as { name?: string } | null;
  if (b && typeof b === "object" && "name" in b && b.name) return b.name;
  return "Business";
}

export async function getDashboardContext() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const memberships = await listUserBusinesses(user.id);
  if (!memberships.length) redirect("/onboarding");

  const jar = await cookies();
  let businessId = jar.get(BUSINESS_COOKIE)?.value;
  const ids = memberships.map(memberBusinessId);
  if (!businessId || !ids.includes(businessId)) {
    businessId = ids[0]!;
  }

  await connectDB();
  const business = await Business.findById(businessId).lean();
  if (!business) redirect("/onboarding");
  if (!business.onboardingCompleted) redirect("/onboarding");

  return {
    user,
    businessId,
    business: {
      id: String(business._id),
      name: business.name,
      slug: business.slug,
      timezone: business.timezone,
      brandColor: business.brandColor,
    },
    businesses: memberships.map((m) => ({
      id: memberBusinessId(m),
      name: memberBusinessName(m),
      role: m.role,
    })),
  };
}
