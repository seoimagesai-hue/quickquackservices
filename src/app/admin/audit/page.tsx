import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminAuditPage() {
  await connectDB();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audit logs</h1>
      {logs.map((l) => (
        <Card key={String(l._id)}>
          <CardContent className="py-4 text-sm">
            <p className="font-medium">{l.action}</p>
            <p className="text-muted-foreground">
              {l.resourceType}
              {l.resourceId ? `:${l.resourceId}` : ""} ·{" "}
              {new Date(l.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
      {!logs.length && (
        <p className="text-sm text-muted-foreground">No audit events yet.</p>
      )}
    </div>
  );
}
