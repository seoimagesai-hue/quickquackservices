"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createServiceAction,
  deleteServiceAction,
  listServicesAction,
} from "@/lib/actions/services";

export function ServicesPanel() {
  const [services, setServices] = useState<
    Array<{ _id: string; name: string; durationMinutes: number; priceCents: number; isActive: boolean }>
  >([]);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("0");
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const res = await listServicesAction();
      if (res.ok && res.data) {
        setServices(res.data.services as typeof services);
      }
    });
  }

  useEffect(() => {
    startTransition(async () => {
      const res = await listServicesAction();
      if (res.ok && res.data) {
        setServices(res.data.services as typeof services);
      }
    });
  }, []);

  function create(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createServiceAction({
        name,
        durationMinutes: Number(duration),
        priceCents: Math.round(Number(price) * 100),
      });
      setName("");
      load();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={create} className="space-y-3 rounded-2xl border border-border p-4">
        <h2 className="font-semibold">Add service</h2>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Price (USD)</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          Save
        </Button>
      </form>
      <div className="space-y-2">
        {services.map((s) => (
          <div
            key={s._id}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
          >
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.durationMinutes}m · ${(s.priceCents / 100).toFixed(2)}
                {!s.isActive && " · archived"}
              </p>
            </div>
            {s.isActive && (
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteServiceAction(s._id);
                    load();
                  })
                }
              >
                Archive
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
