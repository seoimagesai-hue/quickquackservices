import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${brand.name} and ${brand.legalName}, the UK company behind the appointment booking platform.`,
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <div className="container-page max-w-3xl py-16 sm:py-24">
        <p className="label-caps mb-4">About</p>
        <h1 className="display-xl text-4xl text-foreground sm:text-5xl">
          About {brand.name}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {brand.description}
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="font-display text-2xl text-foreground">The product</h2>
            <p className="mt-3 text-muted-foreground">
              {brand.name} is an appointment booking software platform for
              service businesses. Businesses can create an isolated workspace,
              configure services and staff, customise booking forms, share a
              public booking link, and manage customers, calendars and
              appointments online.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Who it&apos;s for</h2>
            <p className="mt-3 text-muted-foreground">
              Salons, barbershops, consultants, coaches, tutors, wellness
              studios, trades and other appointment-based service providers who
              need multi-staff scheduling with tenant isolation.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">
              Platform features
            </h2>
            <ul className="mt-4 space-y-2 border-t border-border text-muted-foreground">
              {[
                "Online appointment booking with real-time availability",
                "Customer, staff and service management",
                "Custom booking forms and booking page links",
                "Calendar views, reminders and subscription billing",
              ].map((item) => (
                <li
                  key={item}
                  className="border-b border-border py-3 pl-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-border p-6 text-sm">
            <h2 className="font-display text-xl text-foreground">Legal company</h2>
            <p className="mt-3 text-muted-foreground">
              The {brand.name} appointment booking product is operated by the
              legal company below. The product name and the legal company name
              are related but distinct.
            </p>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="label-caps text-muted-foreground">Legal company name</dt>
                <dd className="mt-1 text-foreground/80">{brand.legalName}</dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Company number</dt>
                <dd className="mt-1 text-foreground/80">{brand.companyNumber}</dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Registered office</dt>
                <dd className="mt-1 text-foreground/80">{brand.registeredOffice}</dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Country</dt>
                <dd className="mt-1 text-foreground/80">{brand.country}</dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Official website</dt>
                <dd className="mt-1">
                  <a
                    className="text-[var(--cream)] hover:underline"
                    href={brand.officialWebsiteUrl}
                  >
                    {brand.officialWebsiteUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label-caps text-muted-foreground">Companies House</dt>
                <dd className="mt-1">
                  <Link
                    className="text-[var(--cream)] hover:underline"
                    href={brand.companiesHouseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View filing for {brand.companyNumber}
                  </Link>
                </dd>
              </div>
            </dl>
            <p className="mt-6 border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs text-foreground/80">
              {brand.companiesHouseStatusNote}
            </p>
          </section>
        </div>
      </div>
    </MarketingShell>
  );
}
