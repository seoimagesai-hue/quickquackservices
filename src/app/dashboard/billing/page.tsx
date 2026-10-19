import { connectDB } from "@/lib/db";
import { Subscription } from "@/models";
import { getDashboardContext } from "@/lib/dashboard/context";
import { isStripeConfigured } from "@/lib/stripe";
import { BillingPanel } from "@/components/dashboard/billing-panel";

export default async function BillingPage() {
  const ctx = await getDashboardContext();
  await connectDB();
  const sub = await Subscription.findOne({ businessId: ctx.businessId }).lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Billing</h1>
      <BillingPanel
        businessId={ctx.businessId}
        stripeConfigured={isStripeConfigured()}
        subscription={
          sub
            ? {
                planId: sub.planId,
                status: sub.status,
                billingInterval: sub.billingInterval,
                currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
                cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
              }
            : null
        }
      />
    </div>
  );
}
