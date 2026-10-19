"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { verifyEmailAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/auth-card";

export function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "Missing verification token."
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void verifyEmailAction(token).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setStatus("ok");
        setMessage(result.message || "Email verified.");
        toast.success(result.message);
      } else {
        setStatus("error");
        setMessage(result.error);
        toast.error(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthCard title="Verify email" description="Confirming your email address">
      {status === "loading" && (
        <p className="text-sm text-muted-foreground">Verifying…</p>
      )}
      {status !== "loading" && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
      <Button asChild className="mt-4 w-full">
        <Link href="/login">Continue to sign in</Link>
      </Button>
    </AuthCard>
  );
}
