"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          category: fd.get("category") || "general",
          website: fd.get("website") || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not send");
        return;
      }
      toast.success(data.message || "Message received");
      e.currentTarget.reset();
    } finally {
      setPending(false);
    }
  }

  return (
    <MarketingShell>
      <div className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <p className="label-caps mb-4">Contact</p>
          <h1 className="display-xl text-4xl text-foreground sm:text-5xl">
            Contact
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Send a support request. Messages are stored securely and emailed
            when a support address and email provider are configured.
          </p>
          <div className="mt-10 space-y-4 text-sm text-muted-foreground">
            <p>
              <span className="label-caps block text-muted-foreground">
                Legal company
              </span>
              {brand.legalName}
            </p>
            <p>
              <span className="label-caps block text-muted-foreground">
                Company number
              </span>
              {brand.companyNumber}
            </p>
            <p>
              <span className="label-caps block text-muted-foreground">
                Registered office
              </span>
              {brand.registeredOffice}
            </p>
            <p>
              <span className="label-caps block text-muted-foreground">
                Customer support
              </span>
              <a
                className="text-[var(--cream)] transition hover:underline"
                href={`mailto:${brand.supportEmail}`}
              >
                {brand.supportEmail}
              </a>
            </p>
            <p>
              <span className="label-caps block text-muted-foreground">
                General contact
              </span>
              <a
                className="text-[var(--cream)] transition hover:underline"
                href={`mailto:${brand.contactEmail}`}
              >
                {brand.contactEmail}
              </a>
            </p>
            <p>
              <span className="label-caps block text-muted-foreground">Billing</span>
              <a
                className="text-[var(--cream)] transition hover:underline"
                href={`mailto:${brand.billingEmail}`}
              >
                {brand.billingEmail}
              </a>
            </p>
          </div>
        </div>

        <div className="border border-border p-6 sm:p-8">
          <h2 className="font-display text-2xl text-foreground">Support form</h2>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                className="rounded-sm border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-sm border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                required
                className="rounded-sm border-border bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="flex h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground"
                defaultValue="general"
              >
                <option value="general" className="bg-white text-black">
                  General
                </option>
                <option value="billing" className="bg-white text-black">
                  Billing
                </option>
                <option value="technical" className="bg-white text-black">
                  Technical
                </option>
                <option value="abuse" className="bg-white text-black">
                  Abuse
                </option>
                <option value="other" className="bg-white text-black">
                  Other
                </option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                required
                className="rounded-sm border-border bg-background"
              />
            </div>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}
