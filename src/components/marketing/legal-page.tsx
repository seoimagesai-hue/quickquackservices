import { MarketingShell } from "@/components/marketing/marketing-shell";
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
        <h1 className="display-xl text-4xl text-foreground sm:text-5xl">{title}</h1>
        <div className="mt-10 space-y-4 text-foreground/70 [&_a]:text-[var(--cream)] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_strong]:text-foreground">
          {children}
        </div>
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            {brand.legalName} (Company No. {brand.companyNumber}) ·{" "}
            {brand.registeredOffice} · Contact: {brand.supportEmail} · Governing
            law: {brand.jurisdiction}
          </p>
        </div>
      </article>
    </MarketingShell>
  );
}
