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
        Issued by {brand.legalName} (Company No. {brand.companyNumber}),{" "}
        {brand.registeredOffice}.
      </p>
      <h2 className="text-xl font-semibold pt-4">Subscription cancellations</h2>
      <p>
        You may cancel a subscription from billing settings or the Stripe billing
        portal. Access typically continues until the end of the current paid
        period unless otherwise stated at checkout.
      </p>
      <h2 className="text-xl font-semibold pt-4">Subscription refunds</h2>
      <p>
        To request a refund review for platform subscription fees, contact{" "}
        {brand.billingEmail} with your account email and invoice ID. Nothing in
        this policy limits any rights you may have under applicable UK consumer
        law.
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
        {brand.officialWebsiteUrl}.
      </p>
    </LegalPage>
  );
}
