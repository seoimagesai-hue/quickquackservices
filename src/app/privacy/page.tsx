import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This Privacy Policy explains how we handle personal data under UK GDPR
        and the Data Protection Act 2018. Controller: {brand.legalName} (Company
        No. {brand.companyNumber}), {brand.registeredOffice}. Contact:{" "}
        {brand.supportEmail} / {brand.contactEmail}.
      </p>
      <h2 className="text-xl font-semibold pt-4">Data we collect</h2>
      <p>
        Account details, business configuration, customer booking contact
        information, appointment metadata, custom booking-form answers, support
        messages, subscription and billing records (via Stripe), and cookie
        consent records. Payment card data is handled by Stripe — we do not
        store card numbers.
      </p>
      <h2 className="text-xl font-semibold pt-4">Purposes</h2>
      <p>
        To provide the appointment booking SaaS, authenticate users, process
        bookings and notifications, manage subscriptions, provide support, and
        meet legal obligations.
      </p>
      <h2 className="text-xl font-semibold pt-4">Processors</h2>
      <p>
        We use processors such as MongoDB Atlas (database), hosting (for example
        Vercel), Stripe (payments), and an email provider (Resend or SMTP) to
        operate the service.
      </p>
      <h2 className="text-xl font-semibold pt-4">Your rights</h2>
      <p>
        Depending on applicable law, individuals may have rights of access,
        rectification, erasure, restriction, objection and data portability.
        Business customers and end customers should contact the relevant business
        owner or {brand.supportEmail}.
      </p>
      <h2 className="text-xl font-semibold pt-4">Security</h2>
      <p>
        Passwords are hashed, sessions use secure cookies, tenant isolation is
        enforced server-side, and sensitive routes require authentication.
      </p>
      <h2 className="text-xl font-semibold pt-4">International transfers</h2>
      <p>
        Where processors store data outside the UK, we rely on appropriate
        transfer safeguards as required by applicable law.
      </p>
    </LegalPage>
  );
}
