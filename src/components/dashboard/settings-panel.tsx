"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  getBusinessSettingsAction,
  updateBusinessProfileAction,
  updateBusinessSettingsAction,
} from "@/lib/actions/business";

type BusinessSettings = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone: string;
  brandColor?: string;
  businessHours: Array<{
    day: number;
    enabled: boolean;
    ranges: { start: string; end: string }[];
  }>;
  bookingSettings?: {
    minLeadTimeMinutes: number;
    maxAdvanceDays: number;
    allowCustomerCancel: boolean;
    allowCustomerReschedule: boolean;
    cancellationPolicyHours: number;
  };
  reminderSettings?: {
    emailEnabled: boolean;
    emailHoursBefore: number;
  };
};

export function SettingsPanel() {
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const res = await getBusinessSettingsAction();
      if (res.ok && res.data) {
        setBusiness(res.data as unknown as BusinessSettings);
      }
    });
  }

  useEffect(() => {
    load();
  }, []);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setMessage("");
    setError("");
    startTransition(async () => {
      const res = await updateBusinessProfileAction({
        name: business.name,
        description: business.description,
        phone: business.phone,
        email: business.email,
        website: business.website,
        timezone: business.timezone,
        brandColor: business.brandColor,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage(res.message || "Saved");
    });
  }

  function saveBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setMessage("");
    setError("");
    startTransition(async () => {
      const res = await updateBusinessSettingsAction({
        businessHours: business.businessHours,
        bookingSettings: business.bookingSettings,
        reminderSettings: business.reminderSettings,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage(res.message || "Saved");
    });
  }

  if (!business) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  const booking = business.bookingSettings ?? {
    minLeadTimeMinutes: 60,
    maxAdvanceDays: 60,
    allowCustomerCancel: true,
    allowCustomerReschedule: false,
    cancellationPolicyHours: 24,
  };
  const reminders = business.reminderSettings ?? {
    emailEnabled: true,
    emailHoursBefore: 24,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-border p-4">
        <h2 className="font-semibold">Business profile</h2>
        <p className="text-xs text-muted-foreground">
          Public booking URL: /book/{business.slug}
        </p>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={business.name}
            onChange={(e) => setBusiness({ ...business, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={business.description || ""}
            onChange={(e) =>
              setBusiness({ ...business, description: e.target.value })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={business.email || ""}
              onChange={(e) => setBusiness({ ...business, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={business.phone || ""}
              onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Input
            value={business.timezone}
            onChange={(e) =>
              setBusiness({ ...business, timezone: e.target.value })
            }
          />
        </div>
        <Button type="submit" disabled={pending}>
          Save profile
        </Button>
      </form>

      <form onSubmit={saveBooking} className="space-y-4 rounded-2xl border border-border p-4">
        <h2 className="font-semibold">Booking & reminders</h2>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="allow-cancel">Allow customer cancellation</Label>
          <Switch
            id="allow-cancel"
            checked={booking.allowCustomerCancel}
            onCheckedChange={(v) =>
              setBusiness({
                ...business,
                bookingSettings: { ...booking, allowCustomerCancel: v },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Cancellation policy (hours before)</Label>
          <Input
            type="number"
            value={booking.cancellationPolicyHours}
            onChange={(e) =>
              setBusiness({
                ...business,
                bookingSettings: {
                  ...booking,
                  cancellationPolicyHours: Number(e.target.value),
                },
              })
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="email-reminders">Email reminders</Label>
          <Switch
            id="email-reminders"
            checked={reminders.emailEnabled}
            onCheckedChange={(v) =>
              setBusiness({
                ...business,
                reminderSettings: { ...reminders, emailEnabled: v },
              })
            }
          />
        </div>
        <Button type="submit" disabled={pending}>
          Save booking rules
        </Button>
      </form>

      {message && <p className="text-sm text-emerald-600 lg:col-span-2">{message}</p>}
      {error && <p className="text-sm text-red-600 lg:col-span-2">{error}</p>}
    </div>
  );
}
