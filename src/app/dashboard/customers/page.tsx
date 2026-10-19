"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteCustomerAction,
  exportCustomersAction,
  listCustomersAction,
} from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Row = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export default function CustomersPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  async function refresh(query = q) {
    const result = await listCustomersAction({ q: query });
    if (result.ok && result.data) setItems(result.data.items as Row[]);
    else if (!result.ok) toast.error(result.error);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listCustomersAction({});
      if (cancelled) return;
      if (result.ok && result.data) setItems(result.data.items as Row[]);
      else if (!result.ok) toast.error(result.error);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">Search, export, or soft-delete.</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void refresh(q);
            }}
            className="w-48"
          />
          <Button variant="outline" onClick={() => refresh(q)}>
            Search
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const result = await exportCustomersAction();
              if (!result.ok || !result.data) {
                toast.error(!result.ok ? result.error : "Export failed");
                return;
              }
              const blob = new Blob([result.data.json], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "customers.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((c) => (
          <Card key={c._id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.email}
                  {c.phone ? ` · ${c.phone}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const r = await deleteCustomerAction(c._id);
                  if (!r.ok) toast.error(r.error);
                  else {
                    toast.success("Deleted");
                    await refresh();
                  }
                }}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <p className="text-sm text-muted-foreground">No customers yet.</p>
        )}
      </div>
    </div>
  );
}
