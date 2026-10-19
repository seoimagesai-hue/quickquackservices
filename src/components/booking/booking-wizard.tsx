"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DynamicFormFields,
  type PublicFormField,
} from "@/components/booking/dynamic-form-fields";

type IntakeField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  isAddress?: boolean;
};

type BookingFormPayload = {
  id: string;
  name: string;
  fields: PublicFormField[];
};

type Service = {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  locationType?: string;
  locationLabel?: string;
  bookingFormId?: string | null;
};

type Staff = {
  id: string;
  name: string;
  title?: string;
  serviceIds: string[];
};

type Slot = { startAt: string; endAt: string; label: string };

type Biz = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  timezone: string;
  category?: string;
  categoryLabel?: string;
  serviceMode?: string;
  requireStaffSelection?: boolean;
  requireServiceAddress?: boolean;
  staffLabel?: string;
  staffLabelPlural?: string;
  intakeFields?: IntakeField[];
  serviceAreas?: Array<{ label: string }>;
  bookingForm?: BookingFormPayload | null;
  formsById?: Record<string, BookingFormPayload>;
  uploads?: { configured?: boolean };
};

const steps = ["Service", "Staff", "Date", "Time", "Details", "Done"] as const;

const LOCATION_LABELS: Record<string, string> = {
  in_location: "At premises",
  on_site: "At your location",
  online: "Online / virtual",
  custom: "Custom location",
};

export function BookingWizard({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [business, setBusiness] = useState<Biz | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | "any">("any");
  const [dateYmd, setDateYmd] = useState("");
  const [slots, setSlots] = useState<
    Array<{ staffMemberId: string; slots: Slot[] }>
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selected, setSelected] = useState<{
    staffMemberId: string;
    startAt: string;
    endAt: string;
    label: string;
  } | null>(null);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formAnswers, setFormAnswers] = useState<Record<string, unknown>>({});
  const [success, setSuccess] = useState<{
    appointmentId: string;
    manageToken: string;
    when: string;
    manageUrl?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/book/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Business not found");
        if (cancelled) return;
        setBusiness(data.business);
        setServices(data.services || []);
        setStaff(data.staff || []);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  const activeForm = useMemo(() => {
    if (!business) return null;
    if (
      selectedService?.bookingFormId &&
      business.formsById?.[selectedService.bookingFormId]
    ) {
      return business.formsById[selectedService.bookingFormId];
    }
    return business.bookingForm || null;
  }, [business, selectedService]);

  const needsAddress =
    Boolean(business?.requireServiceAddress) ||
    selectedService?.locationType === "on_site" ||
    business?.serviceMode === "on_site";

  const staffLabel = business?.staffLabel || "Staff";
  const requireStaff = Boolean(business?.requireStaffSelection);

  const filteredStaff = useMemo(() => {
    if (!serviceId) return staff;
    return staff.filter(
      (s) => !s.serviceIds?.length || s.serviceIds.includes(serviceId)
    );
  }, [staff, serviceId]);

  const intakeFields = business?.intakeFields || [];
  const useDynamicForm = Boolean(activeForm?.fields?.length);

  async function loadSlots(ymd: string) {
    if (!serviceId) return;
    setSlotsLoading(true);
    setSelected(null);
    setHoldToken(null);
    try {
      const res = await fetch(
        `/api/book/${slug}/slots?serviceId=${serviceId}&staffId=${staffId}&date=${ymd}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load slots");
      setSlots(data.results || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Slot load failed");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function holdSlot(slot: {
    staffMemberId: string;
    startAt: string;
    endAt: string;
    label: string;
  }) {
    setSelected(slot);
    try {
      const res = await fetch(`/api/book/${slug}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          staffMemberId: slot.staffMemberId,
          startAt: slot.startAt,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.holdToken) {
        throw new Error(data.error || "Slot unavailable");
      }
      setHoldToken(data.holdToken);
      setFormAnswers({});
      setStep(4);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not hold slot");
      setSelected(null);
      setHoldToken(null);
    }
  }

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!holdToken) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const intakeAnswers: Record<string, string> = {};
    if (!useDynamicForm) {
      for (const field of intakeFields) {
        if (field.isAddress || field.key === "notes") continue;
        const val = String(fd.get(`intake_${field.key}`) || "").trim();
        if (val) intakeAnswers[field.key] = val;
      }
    }

    const addressFromForm = activeForm?.fields.find((f) => f.type === "address");
    const addressFormatted = useDynamicForm
      ? String(
          (addressFromForm && formAnswers[addressFromForm.id]) ||
            fd.get("serviceAddress") ||
            ""
        ).trim()
      : String(fd.get("serviceAddress") || "").trim();

    const problemDescription = useDynamicForm
      ? String(
          formAnswers.problemDescription ||
            fd.get("problemDescription") ||
            ""
        ).trim()
      : String(
          fd.get("problemDescription") ||
            fd.get("intake_problemDescription") ||
            ""
        ).trim();

    const notes = useDynamicForm
      ? String(formAnswers.notes || fd.get("notes") || "").trim()
      : String(fd.get("notes") || intakeAnswers.notes || "").trim();

    try {
      const res = await fetch(`/api/book/${slug}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdToken,
          formId: activeForm?.id,
          formAnswers: useDynamicForm ? formAnswers : undefined,
          customer: {
            name: fd.get("name"),
            email: fd.get("email"),
            phone: fd.get("phone") || undefined,
            notes: notes || undefined,
            serviceAddress: addressFormatted
              ? { formatted: addressFormatted }
              : undefined,
            problemDescription: problemDescription || undefined,
            intakeAnswers: useDynamicForm ? undefined : intakeAnswers,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setSuccess({
        appointmentId: data.appointmentId,
        manageToken: data.manageToken,
        when: selected?.label || "",
        manageUrl: data.manageUrl as string | undefined,
      });
      setStep(5);
      toast.success("Booking confirmed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  function afterServiceSelected(id: string) {
    setServiceId(id);
    if (requireStaff) {
      setStep(1);
    } else {
      setStaffId("any");
      setStep(2);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking unavailable</CardTitle>
          <CardDescription>{error || "Business not found"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const flatSlots = slots.flatMap((r) =>
    r.slots.map((s) => ({ ...s, staffMemberId: r.staffMemberId }))
  );

  const showLegacyAddress =
    needsAddress &&
    (!useDynamicForm || !activeForm?.fields.some((f) => f.type === "address"));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {(business.categoryLabel || business.category) && (
            <Badge variant="secondary">
              {business.categoryLabel || business.category}
            </Badge>
          )}
          {needsAddress && <Badge variant="outline">On-site visit</Badge>}
        </div>
        <h1 className="display-xl text-3xl text-foreground sm:text-4xl">{business.name}</h1>
        {business.description && (
          <p className="mt-2 text-muted-foreground">
            {business.description}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Timezone: {business.timezone}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((label, i) => {
          if (label === "Staff" && !requireStaff) return null;
          return (
            <Badge
              key={label}
              variant={i === step ? "default" : i < step ? "success" : "outline"}
            >
              {label === "Staff" ? staffLabel : label}
            </Badge>
          );
        })}
      </div>

      {step === 0 && (
        <div className="grid gap-3">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => afterServiceSelected(s.id)}
              className={cn(
                "border border-border bg-background p-4 text-left transition hover:border-border",
                serviceId === s.id && "border-[var(--cream)] ring-1 ring-[var(--cream)]/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.durationMinutes} min
                    {s.locationType
                      ? ` · ${LOCATION_LABELS[s.locationType] || s.locationLabel || s.locationType}`
                      : ""}
                  </p>
                  {s.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  )}
                </div>
                <p className="font-semibold">
                  {(s.priceCents / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: s.currency || "USD",
                  })}
                </p>
              </div>
            </button>
          ))}
          {!services.length && (
            <p className="text-sm text-muted-foreground">No services available.</p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Choose a {staffLabel.toLowerCase()}, or any available.
          </p>
          <button
            type="button"
            className="w-full border border-border bg-background p-4 text-left transition hover:border-border"
            onClick={() => {
              setStaffId("any");
              setStep(2);
            }}
          >
            <p className="font-semibold">Any available {staffLabel.toLowerCase()}</p>
          </button>
          {filteredStaff.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full border border-border bg-background p-4 text-left transition hover:border-border"
              onClick={() => {
                setStaffId(s.id);
                setStep(2);
              }}
            >
              <p className="font-semibold">{s.name}</p>
              {s.title && <p className="text-sm text-muted-foreground">{s.title}</p>}
            </button>
          ))}
          <Button variant="ghost" onClick={() => setStep(0)}>
            Back
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pick a date</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="date"
              value={dateYmd}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDateYmd(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep(requireStaff ? 1 : 0)}
              >
                Back
              </Button>
              <Button
                disabled={!dateYmd}
                onClick={async () => {
                  await loadSlots(dateYmd);
                  setStep(3);
                }}
              >
                Show times
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {slotsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : flatSlots.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {flatSlots.map((s) => (
                <Button
                  key={`${s.staffMemberId}-${s.startAt}`}
                  variant="outline"
                  onClick={() => holdSlot(s)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No times available that day.</p>
          )}
          <Button variant="ghost" onClick={() => setStep(2)}>
            Back
          </Button>
        </div>
      )}

      {step === 4 && holdToken && (
        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>
              Holding {selected?.label} — complete within a few minutes.
              {needsAddress
                ? " This is an on-site appointment — service address required."
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={confirm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>

              {showLegacyAddress && (
                <div className="space-y-2">
                  <Label htmlFor="serviceAddress">Service address</Label>
                  <Textarea
                    id="serviceAddress"
                    name="serviceAddress"
                    rows={3}
                    required
                    placeholder="Street, city, region, postal code"
                  />
                  {!!business.serviceAreas?.length && (
                    <p className="text-xs text-muted-foreground">
                      Service areas:{" "}
                      {business.serviceAreas.map((a) => a.label).join(", ")}
                    </p>
                  )}
                </div>
              )}

              {useDynamicForm && activeForm ? (
                <DynamicFormFields
                  fields={activeForm.fields}
                  answers={formAnswers}
                  onChange={(id, value) =>
                    setFormAnswers((prev) => ({ ...prev, [id]: value }))
                  }
                  uploadsConfigured={Boolean(business.uploads?.configured)}
                />
              ) : (
                <>
                  {intakeFields.map((field) => {
                    if (field.isAddress) return null;
                    if (field.key === "notes" && !field.required) {
                      return (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor="notes">{field.label}</Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            placeholder={field.placeholder}
                          />
                        </div>
                      );
                    }
                    if (field.key === "problemDescription") {
                      return (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor="problemDescription">{field.label}</Label>
                          <Textarea
                            id="problemDescription"
                            name="problemDescription"
                            rows={3}
                            required={field.required}
                            placeholder={field.placeholder}
                          />
                        </div>
                      );
                    }
                    if (field.type === "select") {
                      return (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={`intake_${field.key}`}>
                            {field.label}
                          </Label>
                          <select
                            id={`intake_${field.key}`}
                            name={`intake_${field.key}`}
                            required={field.required}
                            className="flex h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground"
                            defaultValue=""
                          >
                            <option value="" disabled className="bg-white text-black">
                              Select…
                            </option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt} className="bg-white text-black">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    if (field.type === "textarea") {
                      return (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={`intake_${field.key}`}>
                            {field.label}
                          </Label>
                          <Textarea
                            id={`intake_${field.key}`}
                            name={`intake_${field.key}`}
                            rows={3}
                            required={field.required}
                            placeholder={field.placeholder}
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`intake_${field.key}`}>{field.label}</Label>
                        <Input
                          id={`intake_${field.key}`}
                          name={`intake_${field.key}`}
                          required={field.required}
                          placeholder={field.placeholder}
                        />
                      </div>
                    );
                  })}

                  {!intakeFields.some((f) => f.key === "notes") && (
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea id="notes" name="notes" rows={2} />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Confirming…" : "Confirm booking"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 5 && success && (
        <Card className="border-success/40">
          <CardHeader>
            <CardTitle>You&apos;re booked</CardTitle>
            <CardDescription>
              Appointment confirmed{success.when ? ` for ${success.when}` : ""}.
              A confirmation email is sent when email is configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a
                href={
                  success.manageUrl ||
                  `/book/${slug}/manage/${success.appointmentId}?token=${success.manageToken}`
                }
              >
                Manage booking
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
