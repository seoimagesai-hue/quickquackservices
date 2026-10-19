"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminUpdateSupportTicketAction } from "@/lib/actions/admin";
import { AdminTable } from "@/components/admin/admin-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = ["open", "in_progress", "resolved", "closed"] as const;

export function AdminSupportPanel(props: {
  tickets: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    category: string;
    status: string;
    createdAt: string;
  }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function updateStatus(ticketId: string, status: string) {
    startTransition(async () => {
      await adminUpdateSupportTicketAction({ ticketId, status });
      router.refresh();
    });
  }

  return (
    <AdminTable
      columns={["Subject", "From", "Category", "Status", "Created"]}
      empty="No tickets."
      rows={props.tickets.map((t) => [
        t.subject,
        `${t.name} · ${t.email}`,
        t.category,
        <Select
          key={`sel-${t.id}`}
          defaultValue={t.status}
          disabled={pending}
          onValueChange={(v) => updateStatus(t.id, v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
        new Date(t.createdAt).toLocaleString(),
      ])}
    />
  );
}
