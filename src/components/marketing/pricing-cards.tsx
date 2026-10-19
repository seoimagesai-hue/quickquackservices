"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { plans, yearlySavingsPercent, type PlanDefinition } from "@/config/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PricingCards({
  interval,
  compact,
}: {
  interval: "month" | "year";
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-6",
        compact ? "md:grid-cols-3" : "lg:grid-cols-3"
      )}
    >
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} interval={interval} compact={compact} />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  interval,
  compact,
}: {
  plan: PlanDefinition;
  interval: "month" | "year";
  compact?: boolean;
}) {
  const price = interval === "month" ? plan.monthlyPrice : plan.yearlyPrice;
  const suffix = interval === "month" ? "/mo" : "/yr";
  const savings = yearlySavingsPercent(plan);

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        plan.highlighted && "border-primary/40 shadow-glow ring-1 ring-primary/20"
      )}
    >
      {plan.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Illustrative price
          </p>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">${price}</span>
            <span className="text-muted-foreground">{suffix}</span>
          </p>
          {interval === "year" && savings > 0 && (
            <p className="mt-1 text-xs text-success">Save ~{savings}% vs monthly</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {plan.features.slice(0, compact ? 4 : undefined).map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
          <Link href="/register">Start {plan.trialDays}-day trial</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
