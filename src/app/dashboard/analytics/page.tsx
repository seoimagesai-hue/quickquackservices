import { connectDB } from "@/lib/db";
import { resolveTenantContext } from "@/lib/actions/action-utils";
import { Appointment } from "@/models";
import mongoose from "mongoose";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingsChart } from "@/components/dashboard/bookings-chart";

export default async function AnalyticsPage() {
  const { businessId } = await resolveTenantContext();
  await connectDB();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const rows = await Appointment.aggregate([
    {
      $match: {
        businessId: new mongoose.Types.ObjectId(businessId),
        startAt: { $gte: since },
        status: { $nin: ["cancelled"] },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$startAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const data = rows.map((r) => ({ date: r._id as string, bookings: r.count as number }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days of non-cancelled bookings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Booking trend</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length ? (
            <BookingsChart data={data} />
          ) : (
            <p className="text-sm text-muted-foreground">No booking data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
