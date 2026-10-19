import Link from "next/link";
import { dashboardOverviewAction } from "@/lib/actions/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const result = await dashboardOverviewAction();

  if (!result.ok || !result.data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-red-600">{result.ok ? "No data" : result.error}</p>
        <Button asChild>
          <Link href="/onboarding">Complete onboarding</Link>
        </Button>
      </div>
    );
  }

  const { todayCount, upcomingCount, confirmedCount, revenueCents, upcoming } =
    result.data;

  const kpis = [
    { label: "Today", value: todayCount },
    { label: "Upcoming", value: upcomingCount },
    { label: "Confirmed", value: confirmedCount },
    {
      label: "Paid revenue",
      value:
        revenueCents > 0
          ? `$${(revenueCents / 100).toFixed(0)}`
          : "—",
      hint: revenueCents === 0 ? "Shows when payments succeed" : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Live metrics from your MongoDB appointments.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments">Manage bookings</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {k.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{k.value}</p>
              {k.hint && (
                <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(upcoming as Array<{
            _id: string;
            startAt: string | Date;
            status: string;
            serviceId?: { name?: string };
            customerId?: { name?: string };
          }>).length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
          )}
          {(upcoming as Array<{
            _id: string;
            startAt: string | Date;
            status: string;
            serviceId?: { name?: string };
            customerId?: { name?: string };
          }>).map((a) => (
            <div
              key={a._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 dark:border-border"
            >
              <div>
                <p className="font-medium">
                  {a.serviceId?.name || "Service"} · {a.customerId?.name || "Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.startAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="success">{a.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
