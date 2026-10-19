import { connectDB } from "@/lib/db";
import {
  Appointment,
  Business,
  Subscription,
  SupportTicket,
  User,
} from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  await connectDB();
  const [users, businesses, subscriptions, tickets, appointments] =
    await Promise.all([
      User.countDocuments({ status: "active" }),
      Business.countDocuments({ status: "active" }),
      Subscription.countDocuments({
        status: { $in: ["active", "trialing"] },
      }),
      SupportTicket.countDocuments({ status: "open" }),
      Appointment.countDocuments(),
    ]);

  const cards = [
    { label: "Users", value: users },
    { label: "Businesses", value: businesses },
    { label: "Active/trialing subs", value: subscriptions },
    { label: "Open support", value: tickets },
    { label: "Appointments", value: appointments },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
