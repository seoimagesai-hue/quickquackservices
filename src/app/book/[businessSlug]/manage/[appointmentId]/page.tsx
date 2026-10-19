"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type ManageData = {
  appointment: {
    id: string;
    status: string;
    startAt: string;
    endAt: string;
    timezone: string;
  };
  business?: { name: string; slug: string };
  service?: { name: string };
  customer?: { name: string; email: string };
};

function ManageInner() {
  const params = useParams<{ businessSlug: string; appointmentId: string }>();
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [data, setData] = useState<ManageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/book/${params.businessSlug}/manage/${params.appointmentId}?token=${encodeURIComponent(token)}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Invalid manage link");
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.appointmentId, params.businessSlug, token]);

  async function cancel() {
    setPending(true);
    try {
      const res = await fetch(
        `/api/book/${params.businessSlug}/manage/${params.appointmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action: "cancel", reason }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Cancel failed");
      toast.success("Appointment cancelled");
      setData((d) =>
        d
          ? {
              ...d,
              appointment: { ...d.appointment, status: "cancelled" },
            }
          : d
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setPending(false);
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to manage booking</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return <Skeleton className="h-48 w-full max-w-lg" />;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{data.business?.name || "Appointment"}</CardTitle>
        <CardDescription>
          {data.service?.name} · Status: {data.appointment.status}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {new Date(data.appointment.startAt).toLocaleString()} (
          {data.appointment.timezone})
        </p>
        {data.appointment.status !== "cancelled" &&
          data.appointment.status !== "completed" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reason">Cancellation reason (optional)</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={cancel}
              >
                {pending ? "Cancelling…" : "Cancel appointment"}
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

export default function ManageBookingPage() {
  return (
    <div className="container-page py-12">
      <Suspense fallback={<Skeleton className="h-48 w-full max-w-lg" />}>
        <ManageInner />
      </Suspense>
    </div>
  );
}
