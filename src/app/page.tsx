import Link from "next/link";
import {
  CalendarCheck2,
  Clock3,
  ShieldCheck,
  Users,
  BellRing,
  BarChart3,
  Link2,
  Sparkles,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { HeroCalendarPreview } from "@/components/marketing/hero-calendar-preview";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/marketing/motion";
import { brand } from "@/config/brand";
import { plans, yearlySavingsPercent } from "@/config/plans";
import { faqItems } from "@/config/faq";

const benefits = [
  {
    icon: CalendarCheck2,
    title: "Bookings that never double-book",
    body: "Atomic slot locks and real availability from hours, buffers, breaks, and holidays.",
  },
  {
    icon: Clock3,
    title: "Timezone-aware scheduling",
    body: "Store times in UTC, display in each business IANA timezone — no guesswork.",
  },
  {
    icon: Users,
    title: "Staff & services in sync",
    body: "Assign services, set schedules, and let customers book any available staff.",
  },
  {
    icon: BellRing,
    title: "Confirmations & reminders",
    body: "Transactional email when configured. SMS optional via your provider.",
  },
  {
    icon: BarChart3,
    title: "Dashboard analytics",
    body: "See booking trends, upcoming appointments, and revenue from real payments.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-tenant security",
    body: "Server-side roles, tenant isolation, and no client-trusted permissions.",
  },
];

const steps = [
  { title: "Create your account", body: "Start a free trial and verify your email." },
  { title: "Set up your business", body: "Add services, staff, hours, and branding." },
  { title: "Share your booking link", body: "Customers book online — you manage from the dashboard." },
];

const industries = [
  "Salons & barbershops",
  "Consultants & coaches",
  "Tutors & educators",
  "Wellness studios",
  "Clinics & therapists",
  "Professional services",
];

export default function HomePage() {
  const previewFaqs = faqItems.slice(0, 4);
  const highlighted = plans.find((p) => p.highlighted) || plans[1]!;

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative overflow-hidden orbital-bg">
        <div className="container-page pb-16 pt-16 sm:pb-24 sm:pt-24">
          <FadeIn>
            <p className="label-caps mb-6 text-muted-foreground">
              Appointment scheduling SaaS
            </p>
            <h1 className="display-xl max-w-4xl text-4xl text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {brand.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              {brand.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/register" className="btn-cream">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn-ghost-line">
                View Demo
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              14-day trial · Illustrative pricing · Stripe optional until configured
            </p>
          </FadeIn>

          <FadeIn delay={0.12} className="mt-14">
            <div className="frame-box border-border p-2 sm:p-3">
              <HeroCalendarPreview />
            </div>
          </FadeIn>
        </div>
        <div className="container-page">
          <div className="frame-rule" />
        </div>
      </section>

      {/* Industries */}
      <section className="section-brand py-12">
        <div className="container-page">
          <p className="label-caps mb-6 text-center text-white/65">
            Built for service businesses — no fabricated customer counts or
            invented testimonials.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {industries.map((item) => (
              <span
                key={item}
                className="border border-white/25 px-4 py-2 text-sm text-white/80"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="frame-rule" />
      </div>

      {/* Benefits */}
      <section className="py-20 sm:py-24">
        <div className="container-page">
          <FadeIn className="max-w-3xl">
            <p className="label-caps mb-4">Benefits</p>
            <h2 className="display-xl text-3xl text-foreground sm:text-4xl md:text-5xl">
              Stop juggling calendars and missed bookings
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Scattered DMs, double bookings, and no-shows cost revenue.{" "}
              {brand.name} gives every business a secure workspace with a public
              booking page that respects real availability.
            </p>
          </FadeIn>

          <StaggerChildren className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <StaggerItem key={b.title} className="bg-background p-6 sm:p-8">
                <b.icon className="mb-5 size-5 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="font-display text-xl tracking-tight text-foreground">
                  {b.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {b.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Product */}
      <section className="border-y border-border bg-section-deep py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <FadeIn>
            <p className="label-caps mb-4">
              Product UI{" "}
              <span className="ml-2 border border-secondary/60 px-2 py-0.5 text-[10px] tracking-[0.15em] text-secondary">
                LIVE
              </span>
            </p>
            <h2 className="display-xl text-3xl text-foreground sm:text-4xl">
              A dashboard that mirrors how you actually work
            </h2>
            <p className="mt-5 text-muted-foreground">
              Manage appointments, staff, customers, and billing from one place.
              Screenshots below are generated from the live application chrome —
              not stock photography.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-foreground/70">
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                Day / week / month calendar views
              </li>
              <li className="flex gap-3">
                <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                Custom booking link per business
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                Role-based staff permissions
              </li>
            </ul>
            <Link href="/features" className="btn-cream mt-10 inline-flex">
              Explore all features
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="frame-box border-border p-4 sm:p-5">
              <div className="mb-4 flex gap-2">
                <span className="size-2 rounded-full bg-primary/20" />
                <span className="size-2 rounded-full bg-primary/20" />
                <span className="size-2 rounded-full bg-primary/20" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Today", "Confirmed", "Revenue"].map((label, i) => (
                  <div
                    key={label}
                    className="border border-border bg-muted p-4"
                  >
                    <p className="label-caps text-muted-foreground">{label}</p>
                    <p className="mt-3 font-display text-3xl text-foreground">
                      {i === 2 ? "—" : i === 0 ? "8" : "24"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {i === 2 ? "When payments exist" : "Live from your data"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-28 border border-dashed border-border bg-muted/60" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How it works */}
      <section className="section-brand py-20 sm:py-24">
        <div className="container-page">
          <FadeIn className="max-w-2xl">
            <p className="label-caps mb-4 text-white/65">How it works</p>
            <h2 className="display-xl text-3xl sm:text-4xl">
              Live in three steps
            </h2>
            <p className="mt-4 text-white/70">
              From signup to your first public booking link.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-px bg-white/15 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="bg-primary p-6 sm:p-8">
                <span className="font-display text-4xl text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-xl text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/how-it-works" className="btn-ghost-line">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="frame-rule" />
      </div>

      {/* Pricing */}
      <section className="py-20 sm:py-24">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="label-caps mb-4">Pricing</p>
              <h2 className="display-xl text-3xl text-foreground sm:text-4xl">
                Simple, illustrative pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Prices below are labelled illustrative until live Stripe prices
                are configured. Yearly billing saves about{" "}
                {yearlySavingsPercent(highlighted)}% on {highlighted.name}.
              </p>
            </div>
            <Link href="/pricing" className="btn-ghost-line shrink-0">
              Compare plans
            </Link>
          </div>
          <div className="mt-12 grid gap-px bg-border lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={
                  plan.highlighted
                    ? "bg-muted p-6 sm:p-8"
                    : "bg-background p-6 sm:p-8"
                }
              >
                {plan.highlighted && (
                  <span className="label-caps mb-3 inline-block text-secondary">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-2xl text-foreground">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-6 font-display text-4xl text-foreground">
                  ${plan.monthlyPrice}
                  <span className="ml-1 text-base text-muted-foreground">/mo illus.</span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="border-t border-border pt-2.5">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="frame-rule" />
      </div>

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <p className="label-caps mb-4">FAQ</p>
            <h2 className="display-xl text-3xl text-foreground sm:text-4xl">FAQ</h2>
            <p className="mt-4 text-muted-foreground">
              Quick answers. Full searchable FAQ on the FAQ page.
            </p>
            <Link href="/faq" className="btn-ghost-line mt-8 inline-flex">
              View all FAQs
            </Link>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {previewFaqs.map((item) => (
              <div key={item.id} className="py-6">
                <h3 className="font-display text-lg text-foreground">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-brand border-t border-white/15 py-20 sm:py-28">
        <div className="container-page text-center">
          <h2 className="display-xl mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl">
            Ready to take bookings seriously?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Start your free trial, configure your business, and share a booking
            link that actually respects availability.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-cream">
              Start Free Trial
            </Link>
            <Link href="/contact" className="btn-ghost-line">
              Talk to support
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
