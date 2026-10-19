import { connectDB } from "@/lib/db";
import { Subscription } from "@/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminSubscriptionsPage() {
  await connectDB();
  const subs = await Subscription.find()
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      {subs.map((s) => (
        <Card key={String(s._id)}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
            <div>
              <p className="font-semibold">{s.planId}</p>
              <p className="text-sm text-muted-foreground">
                Business {String(s.businessId)} · {s.billingInterval}
              </p>
            </div>
            <Badge>{s.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
