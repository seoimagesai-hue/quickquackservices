import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).limit(100).lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      {users.map((u) => (
        <Card key={String(u._id)}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{u.platformRole}</Badge>
              <Badge>{u.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
