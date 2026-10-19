import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { StripeWebhookEvent, Subscription } from "@/models";
import { env } from "@/lib/env";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import type { PlanId } from "@/config/plans";
import type { SubscriptionStatus } from "@/types";

function periodStart(sub: Stripe.Subscription): number | undefined {
  return (sub as Stripe.Subscription & { current_period_start?: number })
    .current_period_start;
}

function periodEnd(sub: Stripe.Subscription): number | undefined {
  return (sub as Stripe.Subscription & { current_period_end?: number })
    .current_period_end;
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "none";
  }
}

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const businessId = sub.metadata?.businessId;
  if (!businessId) return;

  const planId = (sub.metadata?.planId || "starter") as PlanId;
  await Subscription.findOneAndUpdate(
    { businessId },
    {
      planId,
      status: mapStripeStatus(sub.status),
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      stripeSubscriptionId: sub.id,
      stripePriceId: sub.items.data[0]?.price?.id || null,
      billingInterval:
        sub.items.data[0]?.price?.recurring?.interval === "year"
          ? "year"
          : "month",
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      currentPeriodStart: periodStart(sub)
        ? new Date(periodStart(sub)! * 1000)
        : null,
      currentPeriodEnd: periodEnd(sub)
        ? new Date(periodEnd(sub)! * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    },
    { upsert: true, new: true }
  );
}

export async function POST(request: Request) {
  if (!isStripeConfigured() || !env.stripe.webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      env.stripe.webhookSecret
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await connectDB();
  try {
    await StripeWebhookEvent.create({
      eventId: event.id,
      type: event.type,
      payload: { id: event.id, type: event.type },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    throw err;
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const stripe = getStripe();
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSubscriptionFromStripe(sub);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(sub);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
