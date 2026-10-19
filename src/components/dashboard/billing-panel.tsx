"use client";

import { useState, useTransition } from "react";
import { plans } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BillingPanel(props: {
  businessId: string;
  stripeConfigured: boolean;
  subscription: {
    planId: string;
    status: string;
    billingInterval: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function checkout(planId: string, interval: "month" | "year") {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: props.businessId,
          planId,
          interval,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; configured?: boolean };
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        return;
      }
      if (data.url) window.location.href = data.url;
    });
  }

  function portal() {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: props.businessId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Portal unavailable");
        return;
      }
      if (data.url) window.location.href = data.url;
    });
  }

  if (!props.stripeConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Billing
            <Badge variant="outline">Stripe unconfigured</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Set <code className="rounded bg-muted px-1">STRIPE_SECRET_KEY</code> and
            price IDs to enable checkout and the customer portal.
          </p>
          {props.subscription && (
            <p>
              Current plan (local record): {props.subscription.planId} ·{" "}
              {props.subscription.status}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {props.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current subscription</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge>{props.subscription.planId}</Badge>
            <span className="text-sm capitalize">{props.subscription.status}</span>
            <span className="text-sm text-muted-foreground">
              {props.subscription.billingInterval}ly
            </span>
            {props.subscription.currentPeriodEnd && (
              <span className="text-sm text-muted-foreground">
                Renews{" "}
                {new Date(props.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
            <Button variant="outline" size="sm" disabled={pending} onClick={portal}>
              Manage in Stripe
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => checkout(plan.id, "month")}
                >
                  Monthly
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => checkout(plan.id, "year")}
                >
                  Yearly
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
