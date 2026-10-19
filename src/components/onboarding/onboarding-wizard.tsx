"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  completeOnboardingAction,
  updateBusinessProfileAction,
} from "@/lib/actions/business";
import { createServiceAction } from "@/lib/actions/services";
import { ensureDefaultBookingFormAction } from "@/lib/actions/booking-forms";
import {
  BUSINESS_CATEGORIES,
  categoryPresets,
  getCategoryPreset,
  type BusinessCategory,
} from "@/config/business-categories";
import { brand } from "@/config/brand";

const STEP_LABELS = [
  "Profile",
  "Category",
  "Services",
  "Staff",
  "Hours",
  "Preferences",
  "Forms",
  "Booking link",
];

export function OnboardingWizard(props: {
  businessId: string;
  initialName: string;
  initialTimezone: string;
  category?: string;
  customCategory?: string;
  country?: string;
  slug?: string;
  initialStep?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(
    Math.min(8, Math.max(1, props.initialStep || 1))
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [name, setName] = useState(props.initialName);
  const [timezone, setTimezone] = useState(props.initialTimezone);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(props.country || "");
  const [category, setCategory] = useState(props.category || "other");
  const [customCategory, setCustomCategory] = useState(
    props.customCategory || ""
  );
  const [serviceAreasText, setServiceAreasText] = useState("");
  const [minNotice, setMinNotice] = useState("60");
  const [maxAdvance, setMaxAdvance] = useState("60");

  const preset = useMemo(() => getCategoryPreset(category), [category]);
  const suggested = preset.suggestedServices[0]!;
  const [serviceName, setServiceName] = useState(suggested.name);
  const [duration, setDuration] = useState(String(suggested.durationMinutes));
  const [price, setPrice] = useState(String(suggested.priceCents / 100));
  const [locationType, setLocationType] = useState<
    "in_location" | "on_site" | "online" | "custom"
  >(preset.serviceMode === "on_site" ? "on_site" : "in_location");

  const bookingPath = props.slug ? `/book/${props.slug}` : null;

  function goNext() {
    setError("");
    setStep((s) => Math.min(8, s + 1));
  }

  function finish() {
    setError("");
    startTransition(async () => {
      const areas = serviceAreasText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ label, areaType: "custom" as const }));

      const profile = await updateBusinessProfileAction({
        name,
        timezone,
        phone,
        serviceAreas: areas,
        travelBufferMinutes: preset.defaultTravelBufferMinutes,
      });
      if (!profile.ok) {
        setError(profile.error);
        return;
      }

      const svc = await createServiceAction({
        name: serviceName,
        durationMinutes: Number(duration),
        priceCents: Math.round(Number(price) * 100),
        locationType,
        travelBufferMinutes: preset.defaultTravelBufferMinutes,
        onlineBookingEnabled: true,
      });
      if (!svc.ok) {
        setError(svc.error);
        return;
      }

      await ensureDefaultBookingFormAction();

      const done = await completeOnboardingAction();
      if (!done.ok) {
        setError(done.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">
          Step {step} of {STEP_LABELS.length} · {STEP_LABELS[step - 1]}
        </p>
        <h1 className="text-2xl font-bold">Set up your workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Any service business can customize this flow. Your data stays isolated
          to this workspace.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <Badge
              key={label}
              variant={i + 1 === step ? "default" : i + 1 < step ? "success" : "outline"}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tz">Timezone (IANA)</Label>
            <Input
              id="tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/New_York"
            />
          </div>
          <Button onClick={goNext} disabled={!name.trim()}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a starting preset — you can fully customize services and
            forms afterward. Custom categories are always allowed.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {BUSINESS_CATEGORIES.map((id) => {
              const c = categoryPresets[id as BusinessCategory];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCategory(id);
                    const p = getCategoryPreset(id);
                    const first = p.suggestedServices[0];
                    if (first) {
                      setServiceName(first.name);
                      setDuration(String(first.durationMinutes));
                      setPrice(String(first.priceCents / 100));
                    }
                    setLocationType(
                      p.serviceMode === "on_site" ? "on_site" : "in_location"
                    );
                  }}
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    category === id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.serviceMode}</p>
                </button>
              );
            })}
          </div>
          {(category === "other" || customCategory) && (
            <div className="space-y-2">
              <Label htmlFor="customCat">Custom category label</Label>
              <Input
                id="customCat"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Mobile pet grooming"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add your first service. Location type controls premises, on-site,
            online, or custom.
          </p>
          <div className="space-y-2">
            <Label htmlFor="svc">Service name</Label>
            <Input
              id="svc"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dur">Duration (minutes)</Label>
              <Input
                id="dur"
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Service location</Label>
            <select
              id="loc"
              className="flex h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground"
              value={locationType}
              onChange={(e) =>
                setLocationType(
                  e.target.value as typeof locationType
                )
              }
            >
              <option value="in_location" className="bg-white text-black">
                At business premises
              </option>
              <option value="on_site" className="bg-white text-black">
                At customer location
              </option>
              <option value="online" className="bg-white text-black">
                Online / virtual
              </option>
              <option value="custom" className="bg-white text-black">
                Custom location
              </option>
            </select>
          </div>
          {(locationType === "on_site" || preset.requireServiceAddress) && (
            <div className="space-y-2">
              <Label htmlFor="areas">Service areas (optional)</Label>
              <Textarea
                id="areas"
                value={serviceAreasText}
                onChange={(e) => setServiceAreasText(e.target.value)}
                placeholder="Cities or postal codes, one per line"
                rows={3}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={goNext} disabled={!serviceName.trim()}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are the first {preset.staffLabel.toLowerCase()}. Invite more
            team members from the Staff page after onboarding — email invites
            are supported.
          </p>
          <div className="rounded-xl bg-muted p-4 text-sm bg-background">
            Owner account is already linked as staff with full permissions.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Default working hours follow your category preset. Fine-tune
            availability, breaks, and time off from the Staff / Availability
            screens.
          </p>
          <ul className="list-inside list-disc text-sm text-muted-foreground">
            <li>Timezone: {timezone || "not set"}</li>
            <li>Travel buffer: {preset.defaultTravelBufferMinutes} minutes</li>
            <li>Staff label: {preset.staffLabelPlural}</li>
          </ul>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(4)}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Booking notice windows can be adjusted later in Business Settings.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minNotice">Min notice (minutes)</Label>
              <Input
                id="minNotice"
                type="number"
                min={0}
                value={minNotice}
                onChange={(e) => setMinNotice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAdvance">Max advance (days)</Label>
              <Input
                id="maxAdvance"
                type="number"
                min={1}
                value={maxAdvance}
                onChange={(e) => setMaxAdvance(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(5)}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A default booking form will be created for your category. Customize
            fields visually under Dashboard → Booking forms.
          </p>
          <div className="rounded-xl border border-dashed border-border p-4 text-sm">
            Supported fields include text, email, phone, address, dropdowns,
            checkboxes, file upload (when object storage is configured), and
            more.
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(6)}>
              Back
            </Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-4">
          {bookingPath ? (
            <p className="rounded-xl bg-primary/5 px-3 py-2 text-sm">
              Public booking link:{" "}
              <Link className="font-medium text-primary" href={bookingPath}>
                {brand.websiteUrl.replace(/\/$/, "")}
                {bookingPath}
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your booking link will appear on the dashboard after setup.
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(7)}>
              Back
            </Button>
            <Button onClick={finish} disabled={pending || !serviceName.trim()}>
              {pending ? "Saving…" : "Finish & open dashboard"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
