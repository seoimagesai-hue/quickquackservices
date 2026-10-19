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
          <h1 className="display-xl text-4xl text-white sm:text-5xl">
            How it works
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            From signup to your first confirmed appointment.
          </p>
        </div>

        <div className="mt-14 grid gap-px bg-white/15">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="grid gap-4 bg-black p-6 sm:grid-cols-[5rem_1fr] sm:p-8"
            >
              <span className="font-display text-4xl text-white/20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-xl text-white">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/register" className="btn-cream">
            Start Free Trial
          </Link>
          <Link href="/demo" className="btn-ghost-line">
            View Demo
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
