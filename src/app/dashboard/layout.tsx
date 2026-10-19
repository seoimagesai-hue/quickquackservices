import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listUserBusinesses } from "@/lib/auth/permissions";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { connectDB, isDbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  if (!isDbReady()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          Database is not configured. Set <code className="text-[var(--cream)]">MONGODB_URI</code> in your
          environment to use the dashboard.
        </p>
      </div>
    );
  }

  await connectDB();
  const memberships = await listUserBusinesses(user.id);
  const first = memberships[0];
  const business =
    first?.businessId && typeof first.businessId === "object"
      ? (first.businessId as { name?: string; slug?: string })
      : null;

  if (!memberships.length) {
    redirect("/onboarding");
  }

  if (business && "onboardingCompleted" in business && !business.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col bg-black lg:flex-row">
      <DashboardSidebar
        businessName={business?.name}
        bookingSlug={business?.slug}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden border-b border-white/15 bg-black px-6 py-4 lg:block">
          <p className="label-caps text-white/40">
            Signed in as <span className="normal-case tracking-normal text-white/70">{user.email}</span>
          </p>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
