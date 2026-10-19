import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Business, Subscription } from "@/models";
import { env } from "@/lib/env";
import {
  getStripe,
  getStripePriceId,
  isStripeConfigured,
  stripeUnconfiguredResponse,
} from "@/lib/stripe";
import type { PlanId } from "@/config/plans";
import { resolveTenantContext } from "@/lib/actions/action-utils";
import { requireBusinessAccess, AuthError } from "@/lib/auth/permissions";

const bodySchema = z.object({
  planId: z.enum(["starter", "professional", "business"]),
  interval: z.enum(["month", "year"]).default("month"),
  businessId: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isStripeConfigured()) return stripeUnconfiguredResponse();

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { user, businessId } = await resolveTenantContext(
      parsed.data.businessId
    );
    await requireBusinessAccess(user, businessId, { roles: ["owner"] });

    const priceId = getStripePriceId(
      parsed.data.planId as PlanId,
      parsed.data.interval
    );
    if (!priceId) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          error: `No Stripe price configured for plan ${parsed.data.planId} (${parsed.data.interval}). Set STRIPE_PRICE_* env vars.`,
        },
        { status: 503 }
      );
    }

    await connectDB();
    const business = await Business.findById(businessId).lean();
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    let sub = await Subscription.findOne({ businessId: business._id });
    if (!sub) {
      sub = await Subscription.create({
        businessId: business._id,
        planId: parsed.data.planId,
        status: "none",
        billingInterval: parsed.data.interval,
      });
    }

    const stripe = getStripe();
    let customerId = sub.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: business.name,
        metadata: {
          businessId: String(business._id),
          userId: user.id,
        },
      });
      customerId = customer.id;
      sub.stripeCustomerId = customerId;
      await sub.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${env.appUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${env.appUrl}/dashboard/billing?checkout=cancelled`,
      metadata: {
        businessId: String(business._id),
        planId: parsed.data.planId,
      },
      subscription_data: {
        metadata: {
          businessId: String(business._id),
          planId: parsed.data.planId,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    if (e instanceof AuthError || (e instanceof Error && e.message === "UNAUTHORIZED")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("stripe checkout", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
