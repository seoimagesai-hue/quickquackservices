"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";

export function NotificationsPanel(props: { businessId: string }) {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      title: string;
      body: string;
      readAt: string | null;
      createdAt: string;
    }>
  >([]);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const res = await listNotificationsAction(props.businessId);
      if (res.ok && res.data) {
        setRows(res.data.notifications as typeof rows);
      }
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.businessId]);

  function markRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction({
        notificationId: id,
        businessId: props.businessId,
      });
      load();
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction({ businessId: props.businessId });
      load();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" disabled={pending} onClick={markAll}>
          Mark all read
        </Button>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        )}
        {rows.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border border-border px-3 py-2 ${
              n.readAt ? "opacity-70" : "bg-primary/5"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.readAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => markRead(n.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
