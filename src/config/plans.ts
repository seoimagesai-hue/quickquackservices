/**
 * Illustrative subscription plans — replace prices/Stripe IDs when live billing is configured.
 */
export type PlanId = "starter" | "professional" | "business";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  /** Illustrative monthly price in major currency units */
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  trialDays: number;
  limits: {
    staff: number;
    services: number;
    appointmentsPerMonth: number;
    locations: number;
  };
  features: string[];
  highlighted?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export const plans: PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo providers getting started online.",
    monthlyPrice: 19,
    yearlyPrice: 190,
    currency: "USD",
    trialDays: 14,
    limits: {
      staff: 1,
      services: 10,
      appointmentsPerMonth: 100,
      locations: 1,
    },
    features: [
      "Online booking page",
      "1 staff member",
      "Up to 10 services",
      "Email confirmations",
      "Basic analytics",
      "14-day free trial",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need more control.",
    monthlyPrice: 49,
    yearlyPrice: 490,
    currency: "USD",
    trialDays: 14,
    limits: {
      staff: 10,
      services: 50,
      appointmentsPerMonth: 1000,
      locations: 1,
    },
    features: [
      "Everything in Starter",
      "Up to 10 staff",
      "Calendar day/week/month views",
      "Customer CRM",
      "Email reminders",
      "Optional booking deposits",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For multi-staff studios with advanced needs.",
    monthlyPrice: 99,
    yearlyPrice: 990,
    currency: "USD",
    trialDays: 14,
    limits: {
      staff: 50,
      services: 200,
      appointmentsPerMonth: 10000,
      locations: 5,
    },
    features: [
      "Everything in Professional",
      "Up to 50 staff",
      "Advanced analytics & reports",
      "Custom booking branding",
      "SMS reminders (provider required)",
      "Role-based permissions",
      "Audit logs",
    ],
  },
];

export function getPlan(id: PlanId): PlanDefinition {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function yearlySavingsPercent(plan: PlanDefinition): number {
  const monthlyAnnual = plan.monthlyPrice * 12;
  if (monthlyAnnual <= 0) return 0;
  return Math.round(((monthlyAnnual - plan.yearlyPrice) / monthlyAnnual) * 100);
}
