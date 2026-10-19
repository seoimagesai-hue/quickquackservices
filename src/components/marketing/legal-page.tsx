import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LegalDraftNotice } from "@/components/marketing/legal-notice";
import { brand } from "@/config/brand";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingShell>
      <article className="container-page max-w-3xl py-16 sm:py-24">
        <p className="label-caps mb-4">Legal</p>
        <h1 className="display-xl text-4xl text-white sm:text-5xl">{title}</h1>
        <div className="mt-6">
          <LegalDraftNotice />
        </div>
        <div className="mt-10 space-y-4 text-white/65 [&_a]:text-[var(--cream)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-white [&_strong]:text-white/90">
          {children}
        </div>
        <div className="mt-12 border-t border-white/15 pt-6">
          <p className="text-sm text-white/40">
            {brand.legalName} (Company No. {brand.companyNumber}) ·{" "}
            {brand.registeredOffice} · Contact: {brand.supportEmail} · Governing
            law: {brand.jurisdiction}
          </p>
        </div>
      </article>
    </MarketingShell>
  );
}
