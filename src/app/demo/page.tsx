import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = { title: "Demo" };

export default function DemoPage() {
  return (
    <MarketingShell>
      <div className="container-page max-w-3xl py-16 sm:py-24">
        <p className="label-caps mb-4">Demo</p>
        <h1 className="display-xl text-4xl text-foreground sm:text-5xl">
          See Quick Quack Services in action
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Try the public booking experience or create your own workspace and
          manage appointments from the dashboard.
        </p>

        <div className="mt-12 grid gap-px bg-border sm:grid-cols-2">
          <div className="bg-background p-6 sm:p-8">
            <h2 className="font-display text-xl text-foreground">Public booking</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Walk through the customer booking flow on a sample business page.
            </p>
            <Link href="/book/demo-studio" className="btn-cream mt-6 inline-flex">
              Try booking
            </Link>
          </div>
          <div className="bg-background p-6 sm:p-8">
            <h2 className="font-display text-xl text-foreground">Owner dashboard</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sign in to manage calendars, staff, services, and customers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/login" className="btn-ghost-line">
                Sign in
              </Link>
              <Link href="/register" className="btn-cream">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
