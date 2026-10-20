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
    body: "Share a public booking page so customers can book your services online anytime.",
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
    body: "Automatic booking confirmations and reminders so customers never miss an appointment.",
  },
  {
    icon: MessageSquare,
    title: "SMS reminders",
    body: "Optional text reminders to cut no-shows and keep your calendar full.",
  },
  {
    icon: CreditCard,
    title: "Payments & deposits",
    body: "Secure online payments and deposits at booking — card details stay with Stripe.",
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
          <h1 className="display-xl text-4xl text-foreground sm:text-5xl">
            Everything you need to take bookings online
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            From public booking pages to staff calendars, reminders, and payments —
            Quick Quack Services keeps your appointments organised in one place.
          </p>
        </div>

        <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-background p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between gap-2">
                <f.icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-xl text-foreground">{f.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>

      </div>

      <section className="section-brand py-16 sm:py-20">
        <div className="container-page flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="display-xl text-3xl sm:text-4xl">
              Put these features to work
            </h2>
            <p className="mt-3 text-white/70">
              Start your free trial and set up your booking page in minutes.
            </p>
          </div>
          <Link href="/register" className="btn-cream">
            Start Free Trial
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
