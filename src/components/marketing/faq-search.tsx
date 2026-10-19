"use client";

import { useMemo, useState } from "react";
import { faqItems, type FaqItem } from "@/config/faq";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqSearch() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div>
      <Input
        type="search"
        placeholder="Search questions…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
        aria-label="Search FAQ"
      />
      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No matches for your search.</p>
      ) : (
        <Accordion type="single" collapsible className="mt-8 max-w-3xl">
          {filtered.map((item: FaqItem) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
