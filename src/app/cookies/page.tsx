import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Cookie Policy" };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        This Cookie Policy explains how {brand.name}, operated by{" "}
        {brand.legalName} (Company No. {brand.companyNumber}), uses cookies.
        Contact: {brand.supportEmail}.
      </p>
      <h2 className="text-xl font-semibold pt-4">Necessary cookies</h2>
      <p>
        Required for authentication, security, and consent preferences. These
        remain active for the site to function.
      </p>
      <h2 className="text-xl font-semibold pt-4">Analytics cookies</h2>
      <p>
        Optional. Nonessential analytics scripts must remain blocked until you
        accept analytics via the cookie banner. Consent can be recorded locally
        and optionally in MongoDB.
      </p>
      <h2 className="text-xl font-semibold pt-4">Managing preferences</h2>
      <p>
        Use the cookie banner or clear site data to change analytics consent.
        Questions: {brand.contactEmail}.
      </p>
    </LegalPage>
  );
}
