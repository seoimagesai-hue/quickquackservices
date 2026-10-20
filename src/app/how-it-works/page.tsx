import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  {
    title: "Create account",
    body: "Register with email, set a strong password, and verify your inbox.",
  },
  {
    title: "Set business profile",
    body: "Name, slug, timezone, branding, and contact details for your workspace.",
  },
  {
    title: "Add services & staff",
    body: "Define durations and prices, invite team members, assign services.",
  },
  {
    title: "Configure availability",
    body: "Business hours, staff schedules, buffers, breaks, and holidays.",
  },
  {
    title: "Share booking link",
    body: "Publish /book/your-slug on your site or social channels.",
  },
  {
    title: "Receive & manage",
    body: "Confirmations, dashboard calendar, cancellations, and reminders.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="label-caps mb-4">How it works</p>
          <h1 className="display-xl text-4xl text-foreground sm:text-5xl">
            How it works
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            From signup to your first confirmed appointment.
          </p>
        </div>

        <div className="mt-14 grid gap-px bg-border">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="grid gap-4 bg-background p-6 sm:grid-cols-[5rem_1fr] sm:p-8"
            >
              <span className="font-display text-4xl text-primary/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-xl text-foreground">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <section className="section-brand py-16 sm:py-20">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="display-xl text-3xl sm:text-4xl">
              Ready to go live?
            </h2>
            <p className="mt-3 text-white/70">
              Start a free trial or take a quick tour of the product.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn-cream">
              Start Free Trial
            </Link>
            <Link href="/demo" className="btn-ghost-line">
              View Demo
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
