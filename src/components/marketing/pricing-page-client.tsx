"use client";

import { useState } from "react";
import Link from "next/link";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PricingPageClient({ stripeConfigured }: { stripeConfigured: boolean }) {
  const [yearly, setYearly] = useState(false);
  void stripeConfigured;

  return (
    <>
      <div className="mb-10 flex items-center justify-center gap-3">
        <Label htmlFor="billing-toggle" className={!yearly ? "font-semibold text-foreground" : ""}>
          Monthly
        </Label>
        <Switch
          id="billing-toggle"
          checked={yearly}
          onCheckedChange={setYearly}
          aria-label="Toggle yearly billing"
        />
        <Label htmlFor="billing-toggle" className={yearly ? "font-semibold text-foreground" : ""}>
          Yearly
        </Label>
      </div>

      <PricingCards interval={yearly ? "year" : "month"} />

      <div className="mt-12 max-w-3xl space-y-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground/80">Billing:</strong> Subscriptions
          renew automatically until you cancel. Switch between monthly and yearly
          anytime from your account.
        </p>
        <p>
          <strong className="text-foreground/80">Free trial:</strong> 14 days on
          every plan. Cancel anytime from billing settings — see{" "}
          <Link href="/refund-policy" className="text-[var(--cream)] hover:underline">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </>
  );
}
