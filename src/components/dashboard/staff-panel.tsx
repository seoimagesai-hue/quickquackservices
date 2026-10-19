"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteStaffAction, listStaffAction } from "@/lib/actions/staff";

export function StaffPanel() {
  const [staff, setStaff] = useState<
    Array<{ id: string; title?: string; status: string; user?: { name?: string; email?: string } }>
  >([]);
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function load() {
    startTransition(async () => {
      const res = await listStaffAction();
      if (res.ok && res.data) setStaff(res.data.staff as typeof staff);
    });
  }

  useEffect(() => {
    startTransition(async () => {
      const res = await listStaffAction();
      if (res.ok && res.data) setStaff(res.data.staff as typeof staff);
    });
  }, []);

  function invite(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    startTransition(async () => {
      const res = await inviteStaffAction({ email });
      setMsg(res.ok ? res.message || "Sent" : res.error);
      if (res.ok) {
        setEmail("");
        load();
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={invite} className="flex flex-wrap gap-2 rounded-2xl border border-border p-4">
        <div className="min-w-[200px] flex-1 space-y-2">
          <Label>Invite by email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            Invite
          </Button>
        </div>
        {msg && <p className="w-full text-sm text-muted-foreground">{msg}</p>}
      </form>
      <div className="space-y-2">
        {staff.map((m) => (
          <div key={m.id} className="rounded-xl border border-border px-3 py-2">
            <p className="font-medium">{m.user?.name || m.title || "Staff"}</p>
            <p className="text-xs text-muted-foreground">
              {m.user?.email} · {m.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
