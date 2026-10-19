"use client";

import { useMemo, useState } from "react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/config/faq";

export default function FaqPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(needle) ||
        item.answer.toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <MarketingShell>
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-3xl">
          <p className="label-caps mb-4">FAQ</p>
          <h1 className="display-xl text-4xl text-white sm:text-5xl">FAQ</h1>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            Searchable answers about accounts, bookings, billing, and privacy.
          </p>
          <Input
            className="mt-8 max-w-md rounded-sm border-white/20 bg-black"
            placeholder="Search FAQ…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search FAQ"
          />
        </div>

        <div className="mt-12 max-w-3xl border-y border-white/15">
          <Accordion type="single" collapsible className="w-full">
            {filtered.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-white/15"
              >
                <AccordionTrigger className="font-display text-left text-lg text-white hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/55">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {!filtered.length && (
            <p className="py-8 text-center text-sm text-white/45">No matches.</p>
          )}
        </div>
      </div>
    </MarketingShell>
  );
}
