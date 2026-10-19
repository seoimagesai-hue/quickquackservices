import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return env.isStripeConfigured();
}

export function getStripe(): Stripe {
  if (!env.stripe.secretKey) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing."
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripe.secretKey);
  }
  return stripeClient;
}

export function getStripePriceId(
  planId: string,
  interval: "month" | "year"
): string | undefined {
  const key = `STRIPE_PRICE_${planId.toUpperCase()}_${
    interval === "month" ? "MONTHLY" : "YEARLY"
  }`;
  return process.env[key]?.trim() || undefined;
}

export function stripeUnconfiguredResponse() {
  return Response.json(
    {
      ok: false,
      configured: false,
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY and related env vars.",
    },
    { status: 503 }
  );
}
