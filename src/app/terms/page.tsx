import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        Draft for review. Operated by {brand.legalName} (Company No.{" "}
        {brand.companyNumber}), registered office {brand.registeredOffice}.
        Governing law: {brand.jurisdiction}, United Kingdom.
      </p>
      <p>
        These Terms govern use of the {brand.name} appointment booking platform
        available at {brand.websiteUrl}.
      </p>
      <h2 className="text-xl font-semibold pt-4">Accounts</h2>
      <p>
        You must provide accurate registration information and keep credentials
        secure. Business owners are responsible for staff access within their
        workspace. Platform admin access is not available through public
        registration.
      </p>
      <h2 className="text-xl font-semibold pt-4">Subscriptions and payments</h2>
      <p>
        Paid plans renew until cancelled through the billing portal or account
        settings. Prices and plan limits are configured in the product; do not
        treat marketing placeholders as binding quote without a live Stripe
        checkout. Payment card data is processed by Stripe; we do not store card
        numbers.
      </p>
      <h2 className="text-xl font-semibold pt-4">Bookings and customer data</h2>
      <p>
        Businesses using the platform remain controllers of their customer and
        appointment data. You must only process personal data lawfully and in
        line with applicable UK data protection law.
      </p>
      <h2 className="text-xl font-semibold pt-4">Acceptable use</h2>
      <p>
        Do not abuse the service, attempt unauthorised access, or process
        unlawful content. We may suspend accounts for abuse or non-payment.
      </p>
      <h2 className="text-xl font-semibold pt-4">Contact</h2>
      <p>
        Questions about these Terms: {brand.contactEmail} or{" "}
        {brand.supportEmail}.
      </p>
    </LegalPage>
  );
}
