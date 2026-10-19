"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyEmailAction } from "@/lib/actions/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }
      const result = await verifyEmailAction(token);
      if (cancelled) return;
      if (result.ok) {
        setStatus("ok");
        setMessage(result.message || "Email verified.");
      } else {
        setStatus("error");
        setMessage(result.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthCard
      title={
        status === "loading"
          ? "Verifying…"
          : status === "ok"
            ? "Email verified"
            : "Verification failed"
      }
      description={message || "Please wait"}
    >
      <Button asChild className="w-full">
        <Link href={status === "ok" ? "/dashboard" : "/login"}>Continue</Link>
      </Button>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Suspense fallback={<p>Loading…</p>}>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
