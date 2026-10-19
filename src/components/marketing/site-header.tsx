"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-black">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/80"
            aria-hidden
          >
            <span className="size-3 rounded-full border border-black/60" />
          </span>
          <span className="truncate font-display text-lg tracking-tight sm:text-xl">
            {brand.name.toLowerCase()}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-[13px] text-black/65 transition-colors hover:text-black",
                pathname === link.href && "text-black"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden text-[13px] text-black/70 transition hover:text-black sm:inline"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden rounded-sm bg-black px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black/85 sm:inline-flex"
          >
            Start Free Trial
          </Link>
          <button
            type="button"
            className="flex h-9 w-10 items-center justify-center border border-black/25 text-black transition hover:border-black"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="font-mono text-sm tracking-widest" aria-hidden>
              {open ? "[×]" : "[=]"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white px-5 pb-6 pt-4 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <nav className="grid gap-1 sm:grid-cols-2" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "border-b border-black/10 py-3 text-base text-black/80 transition hover:text-black",
                    pathname === link.href && "text-black"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="border-b border-black/10 py-3 text-base text-black/80 transition hover:text-black"
              >
                Demo
              </Link>
            </nav>
            <div className="mt-5 flex flex-wrap gap-3 sm:hidden">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-ghost-line border-black/30 text-black hover:border-black hover:bg-black/5"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-sm bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="frame-rule bg-black/15" />
    </header>
  );
}
