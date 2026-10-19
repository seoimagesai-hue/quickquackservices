"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { brand } from "@/config/brand";
import { toast } from "sonner";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/demo", label: "Demo" },
  { href: "/faq", label: "FAQ" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Enter your email address");
      return;
    }
    window.location.href = `mailto:${brand.infoEmail}?subject=${encodeURIComponent(
      "Newsletter interest"
    )}&body=${encodeURIComponent(`Please keep me updated.\n\nEmail: ${trimmed}`)}`;
    setEmail("");
  }

  return (
    <footer className="section-brand mt-auto border-t border-white/15">
      <div className="container-page py-16 sm:py-20">
        <div className="mb-14 max-w-2xl">
          <h2 className="display-xl text-3xl sm:text-4xl md:text-5xl">
            Bring bookings into the core of your operations
          </h2>
          <div className="mt-8">
            <Link href="/register" className="btn-cream">
              Start Free Trial
            </Link>
          </div>
        </div>

        <div className="frame-rule mb-12" />

        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p className="font-display text-xl tracking-tight text-white">
              {brand.name.toLowerCase()}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {brand.description}
            </p>
            <form
              onSubmit={onSubscribe}
              className="mt-6 flex max-w-sm flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                className="h-10 flex-1 border border-white/30 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/60"
              />
              <button
                type="submit"
                className="h-10 shrink-0 bg-white px-4 text-sm font-medium text-primary transition hover:bg-[#f0f5f3]"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-2 text-[11px] text-white/50">
              Opens your email app to {brand.infoEmail}. No mailing list is
              claimed until a provider is configured.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-5">
            <div>
              <h3 className="label-caps text-white/60">Product</h3>
              <ul className="mt-4 space-y-2.5">
                {productLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="label-caps text-white/60">Company</h3>
              <ul className="mt-4 space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="label-caps text-white/60">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <a
                  href={`mailto:${brand.contactEmail}`}
                  className="transition hover:text-white"
                >
                  {brand.contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.supportEmail}`}
                  className="transition hover:text-white"
                >
                  {brand.supportEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/15 pt-6">
          <p className="text-[11px] leading-relaxed text-white/50">
            © {year} {brand.legalName}. All rights reserved.
            <br />
            Registered in England and Wales · Company No. {brand.companyNumber}
            <br />
            {brand.registeredOffice}
          </p>
        </div>
      </div>
    </footer>
  );
}
