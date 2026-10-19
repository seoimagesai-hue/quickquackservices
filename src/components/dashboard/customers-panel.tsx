"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  exportCustomersAction,
  listCustomersAction,
} from "@/lib/actions/customers";

export function CustomersPanel() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<
    Array<{ id: string; name: string; email: string; phone?: string; notes?: string }>
  >([]);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const res = await listCustomersAction({ q });
      if (res.ok && res.data) {
        setRows(
          res.data.items.map((c) => {
            const row = c as {
              _id: string;
              name: string;
              email: string;
              phone?: string;
              notes?: string;
            };
            return {
              id: row._id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              notes: row.notes,
            };
          })
        );
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportJson() {
    startTransition(async () => {
      const res = await exportCustomersAction();
      if (res.ok && res.data?.json) {
        const blob = new Blob([res.data.json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "customers.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={load} disabled={pending}>
          Search
        </Button>
        <Button variant="outline" onClick={exportJson} disabled={pending}>
          Export JSON
        </Button>
      </div>
      <div className="space-y-2">
        {rows.map((c) => (
          <div key={c.id} className="rounded-xl border border-border px-3 py-2">
            <p className="font-medium">{c.name}</p>
            <p className="text-sm text-muted-foreground">
              {c.email} {c.phone ? `· ${c.phone}` : ""}
            </p>
            {c.notes && <p className="mt-1 text-xs text-muted-foreground">{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
