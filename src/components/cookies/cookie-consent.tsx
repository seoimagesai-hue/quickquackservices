"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "appointly_cookie_consent";

type Consent = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

function readLocal(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

function getVisitorId(): string {
  const key = "appointly_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

async function persist(consent: Consent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  try {
    await fetch("/api/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        analytics: consent.analytics,
        marketing: false,
        policyVersion: "1.0",
      }),
    });
  } catch {
    /* localStorage is sufficient fallback */
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("appointly:consent", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("appointly:consent", onStoreChange);
  };
}

function getSnapshot() {
  return !readLocal();
}

function getServerSnapshot() {
  return false;
}

export function CookieConsent() {
  const needsBanner = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  const visible = needsBanner && !dismissed;

  async function save(analyticsEnabled: boolean) {
    const consent: Consent = {
      necessary: true,
      analytics: analyticsEnabled,
      updatedAt: new Date().toISOString(),
    };
    await persist(consent);
    window.dispatchEvent(
      new CustomEvent("appointly:consent", { detail: consent })
    );
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm border border-border bg-white p-5 shadow-lg sm:left-auto"
      )}
    >
      <p className="label-caps text-muted-foreground">Cookies</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">
        Necessary cookies keep the site working. Analytics cookies are optional
        and stay off until you accept.{" "}
        <Link href="/cookies" className="underline underline-offset-2">
          Cookie policy
        </Link>
      </p>

      {showPrefs && (
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="size-4 rounded-sm border-border bg-background text-[var(--cream)] focus:ring-[var(--cream)]"
          />
          Allow analytics cookies (optional)
        </label>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => save(true)}>
          Accept all
        </Button>
        <Button size="sm" variant="outline" onClick={() => save(false)}>
          Necessary only
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowPrefs((v) => !v)}
        >
          {showPrefs ? "Hide" : "Preferences"}
        </Button>
        {showPrefs && (
          <Button size="sm" variant="secondary" onClick={() => save(analytics)}>
            Save preferences
          </Button>
        )}
      </div>
    </div>
  );
}
