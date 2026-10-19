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
          Product demo
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Explore the real booking flow against seeded demo data (when MongoDB is
          configured and <code className="text-sm text-[var(--cream)]">npm run seed</code>{" "}
          has been run). Nothing here fakes a successful payment.
        </p>

        <div className="mt-12 grid gap-px bg-border sm:grid-cols-2">
          <div className="bg-background p-6 sm:p-8">
            <h2 className="font-display text-xl text-foreground">Public booking</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Book against the demo-studio workspace.
            </p>
            <Link href="/book/demo-studio" className="btn-cream mt-6 inline-flex">
              Open /book/demo-studio
            </Link>
          </div>
          <div className="bg-background p-6 sm:p-8">
            <h2 className="font-display text-xl text-foreground">Owner dashboard</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Use seeded credentials from the README after running seed.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/login" className="btn-ghost-line">
                Sign in
              </Link>
              <Link href="/register" className="btn-cream">
                Create your own
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
