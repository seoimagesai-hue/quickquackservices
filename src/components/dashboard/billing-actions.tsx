"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BillingActions({ configured }: { configured: boolean }) {
  const [pending, setPending] = useState(false);

  async function checkout(planId: string) {
    if (!configured) {
      toast.error("Stripe is not configured in this environment.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: "month" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Checkout unavailable");
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setPending(false);
    }
  }

  async function portal() {
    if (!configured) {
      toast.error("Stripe is not configured in this environment.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Portal unavailable");
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={pending} onClick={() => checkout("professional")}>
        Upgrade to Professional
      </Button>
      <Button disabled={pending} variant="outline" onClick={portal}>
        Open billing portal
      </Button>
    </div>
  );
}
