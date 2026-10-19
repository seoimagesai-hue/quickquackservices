import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarRange,
  Clock,
  CreditCard,
  Globe2,
  Mail,
  MessageSquare,
  Shield,
  Users2,
  BarChart3,
  Link2,
  Ban,
  Settings2,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Everything Quick Quack Services implements for multi-tenant appointment booking.",
};

const features = [
  {
    icon: Globe2,
    title: "24/7 online booking",
    body: "Public booking pages at /book/[slug] with optional staff-specific flows.",
  },
  {
    icon: Clock,
    title: "Real-time availability",
    body: "Slots computed from hours, duration, buffers, breaks, holidays, holds, and appointments — with atomic locks to prevent double booking.",
  },
  {
    icon: Settings2,
    title: "Services & durations",
    body: "CRUD services with price, duration, buffers, and deposit flags.",
  },
  {
    icon: Users2,
    title: "Staff schedules",
    body: "Invite staff, assign services, set weekly hours, breaks, and time off.",
  },
  {
    icon: CalendarRange,
    title: "Calendar views",
    body: "Day, week, and month views in the business dashboard.",
  },
  {
    icon: Users2,
    title: "Customer CRM",
    body: "Customer records, notes, booking history, search, and export/deletion workflows.",
  },
  {
    icon: Mail,
    title: "Email confirmations & reminders",
    body: "Transactional email when Resend/SMTP is configured. Reminder cron with deduplication.",
  },
  {
    icon: MessageSquare,
    title: "SMS reminders",
    body: "Requires external SMS provider configuration (SMS_PROVIDER / SMS_API_KEY). Marked unconfigured until set.",
    config: true,
  },
  {
    icon: CreditCard,
    title: "Payments & deposits",
    body: "Stripe Checkout for subscriptions and optional deposits. Never stores card data. Unconfigured until Stripe keys exist.",
    config: true,
  },
  {
    icon: Link2,
    title: "Custom booking links",
    body: "Unique business slug plus manage links with signed expiring tokens.",
  },
  {
    icon: Globe2,
    title: "Time zones & business hours",
    body: "IANA timezones, weekly hours, holidays, lead times, and advance windows.",
  },
  {
    icon: Ban,
    title: "Buffers, breaks & holidays",
    body: "Per-service and business buffers; staff breaks; business holiday calendar.",
  },
  {
    icon: BarChart3,
    title: "Reports & analytics",
    body: "Booking trends and KPIs from real appointment and payment data.",
  },
  {
    icon: Shield,
    title: "Roles & permissions",
    body: "Platform admin, owner, staff, and customer roles with server-side checks.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="label-caps mb-4">Features</p>
          <h1 className="display-xl text-4xl text-white sm:text-5xl">
            Built for real bookings — not demos
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            Every feature below is implemented in the product, or clearly marked
            as needing an external provider.
          </p>
        </div>

        <div className="mt-14 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-black p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-2">
                <f.icon className="size-5 text-white/45" strokeWidth={1.5} />
                {f.config && (
                  <span className="border border-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-secondary">
                    Provider config
                  </span>
                )}
              </div>
              <h2 className="font-display text-xl text-white">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Link href="/register" className="btn-cream">
            Start Free Trial
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
