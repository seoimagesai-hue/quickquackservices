import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listUserBusinesses } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import { Business } from "@/models";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/onboarding");

  await connectDB();
  const memberships = await listUserBusinesses(user.id);

  if (!memberships.length) {
    return (
      <div className="container-page flex min-h-screen items-center justify-center py-16">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Create your business</CardTitle>
            <CardDescription>
              Register a business account to get an isolated workspace and public
              booking link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/register">Register your business</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const populated = memberships[0]!.businessId as
    | { _id: unknown; onboardingCompleted?: boolean }
    | string;

  const businessId =
    typeof populated === "object"
      ? String(populated._id)
      : String(populated);

  const business = await Business.findById(businessId).lean();
  if (!business) redirect("/register");

  if (business.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="container-page flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-lg">
        <OnboardingWizard
          businessId={String(business._id)}
          initialName={business.name}
          initialTimezone={business.timezone}
          category={business.category}
          customCategory={business.customCategory}
          country={business.country}
          slug={business.slug}
          initialStep={business.onboardingStep || 1}
        />
      </div>
    </div>
  );
}
