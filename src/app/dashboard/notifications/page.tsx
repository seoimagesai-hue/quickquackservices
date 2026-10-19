import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Notification } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await connectDB();
  const items = await Notification.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">In-app notification center.</p>
      </div>
      <div className="space-y-3">
        {items.map((n) => (
          <Card key={String(n._id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{n.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-2 text-xs text-white/40">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
