"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateBusinessSettingsAction, getBusinessSettingsAction } from "@/lib/actions/business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "UTC",
    phone: "",
    email: "",
    minLeadTimeMinutes: 60,
    maxAdvanceDays: 60,
    emailReminders: true,
  });

  useEffect(() => {
    (async () => {
      const result = await getBusinessSettingsAction();
      if (result.ok && result.data) {
        const b = result.data as {
          name: string;
          description?: string;
          timezone: string;
          phone?: string;
          email?: string;
          bookingSettings?: { minLeadTimeMinutes?: number; maxAdvanceDays?: number };
          reminderSettings?: { emailEnabled?: boolean };
        };
        setForm({
          name: b.name || "",
          description: b.description || "",
          timezone: b.timezone || "UTC",
          phone: b.phone || "",
          email: b.email || "",
          minLeadTimeMinutes: b.bookingSettings?.minLeadTimeMinutes ?? 60,
          maxAdvanceDays: b.bookingSettings?.maxAdvanceDays ?? 60,
          emailReminders: b.reminderSettings?.emailEnabled ?? true,
        });
      } else if (!result.ok) {
        toast.error(result.error);
      }
      setLoading(false);
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await updateBusinessSettingsAction(form);
    setPending(false);
    if (!result.ok) toast.error(result.error);
    else toast.success("Settings saved");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Business profile, booking rules, reminders.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="grid max-w-xl gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">IANA timezone</Label>
              <Input
                id="timezone"
                value={form.timezone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timezone: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lead">Min lead time (minutes)</Label>
                <Input
                  id="lead"
                  type="number"
                  value={form.minLeadTimeMinutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minLeadTimeMinutes: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advance">Max advance days</Label>
                <Input
                  id="advance"
                  type="number"
                  value={form.maxAdvanceDays}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxAdvanceDays: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <Switch
                checked={form.emailReminders}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, emailReminders: v }))
                }
              />
              Email reminders enabled
            </label>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
