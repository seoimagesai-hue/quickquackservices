import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models";
import { env } from "@/lib/env";
import {
  getStripe,
  isStripeConfigured,
  stripeUnconfiguredResponse,
} from "@/lib/stripe";
import { resolveTenantContext } from "@/lib/actions/action-utils";
import { requireBusinessAccess, AuthError } from "@/lib/auth/permissions";

export async function POST(request: Request) {
  if (!isStripeConfigured()) return stripeUnconfiguredResponse();

  let businessIdHint: string | undefined;
  try {
    const json = await request.json();
    if (json && typeof json.businessId === "string") {
      businessIdHint = json.businessId;
    }
  } catch {
    /* empty body OK */
  }

  try {
    const { user, businessId } = await resolveTenantContext(businessIdHint);
    await requireBusinessAccess(user, businessId, { roles: ["owner"] });

    await connectDB();
    const sub = await Subscription.findOne({ businessId }).lean();
    if (!sub?.stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer on file. Complete checkout first or contact support.",
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${env.appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (e) {
    if (
      e instanceof AuthError ||
      (e instanceof Error && e.message === "UNAUTHORIZED")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("stripe portal", e);
    return NextResponse.json({ error: "Portal failed" }, { status: 500 });
  }
}
