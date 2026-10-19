"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listAppointmentsAction,
  updateAppointmentStatusAction,
} from "@/lib/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Row = {
  _id: string;
  startAt: string;
  status: string;
  serviceId?: { name?: string };
  customerId?: { name?: string; email?: string };
  serviceAddress?: { formatted?: string };
  problemDescription?: string;
};

export default function AppointmentsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [status, setStatus] = useState("");

  async function refresh(nextStatus = status) {
    const result = await listAppointmentsAction({
      status: nextStatus || undefined,
      limit: 50,
    });
    if (result.ok && result.data) {
      setItems(result.data.items as Row[]);
    } else if (!result.ok) {
      toast.error(result.error);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listAppointmentsAction({ limit: 50 });
      if (cancelled) return;
      if (result.ok && result.data) {
        setItems(result.data.items as Row[]);
      } else if (!result.ok) {
        toast.error(result.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Filter, confirm, complete, or cancel.</p>
        </div>
        <select
          className="h-10 rounded-xl border border-white/15 bg-white px-3 text-sm dark:border-white/15 bg-black"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            void refresh(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No-show</option>
        </select>
      </div>

      <div className="space-y-3">
        {items.map((a) => (
          <Card key={a._id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">
                  {a.serviceId?.name || "Service"} · {a.customerId?.name || "Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.startAt).toLocaleString()}
                  {a.customerId?.email ? ` · ${a.customerId.email}` : ""}
                </p>
                {a.serviceAddress?.formatted && (
                  <p className="text-xs text-muted-foreground">
                    On-site: {a.serviceAddress.formatted}
                  </p>
                )}
                {a.problemDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {a.problemDescription}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{a.status}</Badge>
                {a.status === "confirmed" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const r = await updateAppointmentStatusAction(a._id, {
                          status: "completed",
                        });
                        if (!r.ok) toast.error(r.error);
                        else await refresh();
                      }}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        const r = await updateAppointmentStatusAction(a._id, {
                          status: "cancelled",
                          reason: "Cancelled by staff",
                        });
                        if (!r.ok) toast.error(r.error);
                        else await refresh();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <p className="text-sm text-muted-foreground">No appointments found.</p>
        )}
      </div>
    </div>
  );
}
