"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { plans, yearlySavingsPercent } from "@/config/plans";

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const stripeConfigured = Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );

  return (
    <MarketingShell>
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="label-caps mb-4">Pricing</p>
          <h1 className="display-xl text-4xl text-foreground sm:text-5xl">
            Plans that scale with your team
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Illustrative prices for planning. Live checkout requires Stripe
            configuration. Every plan includes a 14-day trial.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Label htmlFor="billing" className="text-foreground/70">
              Monthly
            </Label>
            <Switch
              id="billing"
              checked={yearly}
              onCheckedChange={setYearly}
            />
            <Label htmlFor="billing" className="text-foreground/70">
              Yearly{" "}
              <span className="text-success">
                (save ~{yearlySavingsPercent(plans[1]!)}%)
              </span>
            </Label>
          </div>
          {!stripeConfigured && (
            <p className="mt-6 border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-foreground/80">
              Stripe is <strong className="text-secondary">not configured</strong>{" "}
              in this deployment. Checkout buttons will show an unconfigured
              state until keys are added.
            </p>
          )}
        </div>

        <div className="mt-14 grid gap-px bg-border lg:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = yearly ? "/year" : "/mo";
            return (
              <div
                key={plan.id}
                className={
                  plan.highlighted
                    ? "flex flex-col bg-muted p-6 sm:p-8"
                    : "flex flex-col bg-background p-6 sm:p-8"
                }
              >
                {plan.highlighted && (
                  <span className="label-caps mb-3 text-secondary">
                    Most popular
                  </span>
                )}
                <h2 className="font-display text-2xl text-foreground">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-6 font-display text-4xl text-foreground">
                  ${price}
                  <span className="ml-1 text-base text-muted-foreground">
                    {period} illus.
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Limits: {plan.limits.staff} staff · {plan.limits.services}{" "}
                  services · {plan.limits.appointmentsPerMonth}/mo bookings
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-foreground/70">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 border-t border-border pt-3">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-success"
                        strokeWidth={1.5}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${plan.id}`}
                  className={
                    plan.highlighted
                      ? "btn-cream mt-8 w-full text-center"
                      : "btn-ghost-line mt-8 w-full text-center"
                  }
                >
                  Start {plan.trialDays}-day trial
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-3xl space-y-4 border border-border p-6 text-sm text-muted-foreground">
          <h2 className="font-display text-xl text-foreground">Billing terms</h2>
          <p>
            Subscriptions renew automatically at the chosen monthly or yearly
            interval until cancelled. Cancel anytime from the billing portal;
            access continues until period end.
          </p>
          <p>
            Refunds follow the{" "}
            <Link href="/refund-policy" className="text-[var(--cream)] underline underline-offset-2">
              Refund Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
