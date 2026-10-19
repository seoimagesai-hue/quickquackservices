import { connectDB } from "@/lib/db";
import { SupportTicket } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminSupportPage() {
  await connectDB();
  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Support requests</h1>
      {tickets.map((t) => (
        <Card key={String(t._id)}>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{t.subject}</CardTitle>
              <Badge>{t.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t.name} · {t.email} · {t.category}
            </p>
            <p className="mt-2 text-sm">{t.message}</p>
          </CardContent>
        </Card>
      ))}
      {!tickets.length && (
        <p className="text-sm text-muted-foreground">No tickets yet.</p>
      )}
    </div>
  );
}
