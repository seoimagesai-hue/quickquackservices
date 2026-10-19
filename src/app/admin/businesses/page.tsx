import { connectDB } from "@/lib/db";
import { Business } from "@/models";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminBusinessesPage() {
  await connectDB();
  const businesses = await Business.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Businesses</h1>
      {businesses.map((b) => (
        <Card key={String(b._id)}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-muted-foreground">/{b.slug}</p>
            </div>
            <Badge>{b.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
