"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { switchBusinessAction } from "@/lib/actions/business";

export function BusinessSwitcher(props: {
  businesses: { id: string; name: string; role: string }[];
  currentBusinessId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (props.businesses.length <= 1) {
    return (
      <p className="text-xs text-muted-foreground">
        {props.businesses[0]?.name || "Business"}
      </p>
    );
  }

  return (
    <select
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      value={props.currentBusinessId}
      disabled={pending}
      onChange={(e) => {
        const id = e.target.value;
        startTransition(async () => {
          await switchBusinessAction(id);
          router.refresh();
        });
      }}
    >
      {props.businesses.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name} ({b.role})
        </option>
      ))}
    </select>
  );
}
