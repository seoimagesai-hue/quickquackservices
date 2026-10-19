"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listAppointmentsAction,
  updateAppointmentStatusAction,
} from "@/lib/actions/appointments";

export function AppointmentsPanel() {
  const [rows, setRows] = useState<
    Array<{
      _id: string;
      startAt: string | Date;
      status: string;
      customerId?: { name?: string; email?: string };
      serviceId?: { name?: string };
    }>
  >([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const res = await listAppointmentsAction({
        status: statusFilter || undefined,
        limit: 100,
      });
      if (res.ok && res.data) {
        setRows(res.data.items as typeof rows);
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function setStatus(id: string, status: string) {
    startTransition(async () => {
      await updateAppointmentStatusAction(id, { status });
      load();
    });
  }

  return (
    <div className="space-y-4">
      <select
        className="rounded-lg border border-border px-3 py-2 text-sm"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No show</option>
      </select>
      <div className="space-y-2">
        {rows.map((a) => (
          <div
            key={a._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
          >
            <div>
              <p className="font-medium">
                {a.customerId?.name || "Customer"} · {a.serviceId?.name || "Service"}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(a.startAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{a.status}</Badge>
              {a.status !== "cancelled" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setStatus(a._id, "completed")}
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => setStatus(a._id, "cancelled")}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
        {!rows.length && !pending && (
          <p className="text-sm text-muted-foreground">No appointments found.</p>
        )}
      </div>
    </div>
  );
}
