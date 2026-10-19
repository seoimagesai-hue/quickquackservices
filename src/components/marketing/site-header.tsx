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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white text-foreground">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:h-16 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/80"
            aria-hidden
          >
            <span className="size-3 rounded-full border border-primary/60" />
          </span>
          <span className="truncate font-display text-xl tracking-tight text-primary sm:text-2xl">
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
                "px-3 py-2 text-[15px] text-foreground/70 transition-colors hover:text-primary",
                pathname === link.href && "text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden text-[15px] text-foreground/70 transition hover:text-primary sm:inline"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden rounded-sm bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition hover:bg-primary/90 sm:inline-flex"
          >
            Start Free Trial
          </Link>
          <button
            type="button"
            className="flex h-9 w-10 items-center justify-center border border-border text-foreground transition hover:border-primary"
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
        <div className="border-t border-border bg-white px-5 pb-6 pt-4 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <nav className="grid gap-1 sm:grid-cols-2" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "border-b border-border py-3 text-lg text-foreground/80 transition hover:text-primary",
                    pathname === link.href && "text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-lg text-foreground/80 transition hover:text-primary"
              >
                Demo
              </Link>
            </nav>
            <div className="mt-5 flex flex-wrap gap-3 sm:hidden">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-ghost-line"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="btn-cream"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
      <div className="frame-rule" />
    </header>
  );
}
