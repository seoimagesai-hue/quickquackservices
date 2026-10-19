"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { registerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth/auth-card";
import { categoryPresets, BUSINESS_CATEGORIES } from "@/config/business-categories";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [category, setCategory] = useState<string>("salon");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await registerAction({
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      businessName: String(fd.get("businessName") || ""),
      businessCategory: String(fd.get("businessCategory") || category),
      customCategory: String(fd.get("customCategory") || "") || undefined,
      businessPhone: String(fd.get("businessPhone") || "") || undefined,
      country: String(fd.get("country") || "") || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Account created — finish setup to get your booking link");
    router.push("/onboarding");
    router.refresh();
  }

  const preset = categoryPresets[category as keyof typeof categoryPresets];

  return (
    <AuthCard
      title="Register your business"
      description="Create an isolated workspace for your salon, trade, or service company"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            name="businessName"
            required
            autoComplete="organization"
            placeholder="Modern Salon, ABC Plumbing…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessCategory">Business category</Label>
          <select
            id="businessCategory"
            name="businessCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {BUSINESS_CATEGORIES.map((id) => (
              <option key={id} value={id} className="bg-white text-black">
                {categoryPresets[id].label}
              </option>
            ))}
          </select>
          {preset && (
            <p className="text-xs text-muted-foreground">{preset.description}</p>
          )}
        </div>
        {(category === "other" || category === "consulting") && (
          <div className="space-y-2">
            <Label htmlFor="customCategory">Custom category label</Label>
            <Input
              id="customCategory"
              name="customCategory"
              placeholder="e.g. Photography, Tutoring, Car workshop"
            />
            <p className="text-xs text-muted-foreground">
              Any service business is welcome — presets are optional starting points.
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" autoComplete="country-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business phone</Label>
          <Input id="businessPhone" name="businessPhone" type="tel" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters with a letter and a number.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating workspace…" : "Create business account"}
        </Button>
      </form>
    </AuthCard>
  );
}
