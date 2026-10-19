"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { inviteStaffAction, listStaffAction } from "@/lib/actions/staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type StaffRow = {
  _id: string;
  role: string;
  title?: string;
  status: string;
  userId?: { name?: string; email?: string };
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [pending, setPending] = useState(false);

  async function refresh() {
    const result = await listStaffAction();
    if (result.ok && result.data) setStaff(result.data.staff as StaffRow[]);
    else if (!result.ok) toast.error(result.error);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await listStaffAction();
      if (cancelled) return;
      if (result.ok && result.data) setStaff(result.data.staff as StaffRow[]);
      else if (!result.ok) toast.error(result.error);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff</h1>
        <p className="text-sm text-muted-foreground">
          Invite teammates. They cannot access other businesses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite staff</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              const fd = new FormData(e.currentTarget);
              const result = await inviteStaffAction({
                email: fd.get("email"),
                title: fd.get("title"),
              });
              setPending(false);
              if (!result.ok) toast.error(result.error);
              else {
                toast.success(result.message || "Invited");
                e.currentTarget.reset();
                await refresh();
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Stylist" />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Inviting…" : "Send invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {staff.map((s) => (
          <Card key={s._id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">
                  {s.userId?.name || s.title || "Staff"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {s.userId?.email} · {s.role}
                </p>
              </div>
              <Badge variant={s.status === "active" ? "success" : "warning"}>
                {s.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
