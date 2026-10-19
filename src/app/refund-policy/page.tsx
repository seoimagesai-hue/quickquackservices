import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>
        Draft for review. Issued by {brand.legalName} (Company No.{" "}
        {brand.companyNumber}), {brand.registeredOffice}. This draft does not
        invent guaranteed refund amounts, statutory rights beyond what counsel
        confirms, or VAT registration details.
      </p>
      <h2 className="text-xl font-semibold pt-4">Subscription cancellations</h2>
      <p>
        You may cancel a subscription from billing settings or the Stripe billing
        portal when configured. Access typically continues until the end of the
        current paid period unless otherwise stated at checkout. Confirm exact
        timing with live Stripe configuration and counsel.
      </p>
      <h2 className="text-xl font-semibold pt-4">Subscription refunds</h2>
      <p>
        Refund eligibility for platform subscription fees is not finalised in
        this draft. Do not publish specific refund windows or percentages until
        approved. Contact {brand.billingEmail} with your account email and
        invoice ID to request a review once policies are confirmed.
      </p>
      <h2 className="text-xl font-semibold pt-4">Appointment deposits</h2>
      <p>
        Where a business collects deposits through the platform, deposit refunds
        follow that business&apos;s cancellation rules and applicable consumer
        law. Platform fees, if any, require separate confirmation.
      </p>
      <h2 className="text-xl font-semibold pt-4">How to contact us</h2>
      <p>
        Billing: {brand.billingEmail}. Support: {brand.supportEmail}. Website:{" "}
        {brand.websiteUrl}.
      </p>
    </LegalPage>
  );
}
