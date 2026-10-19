"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Briefcase,
  Users,
  UserRound,
  Settings,
  CreditCard,
  Bell,
  BarChart3,
  FormInput,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/dashboard/services", label: "Services", icon: Briefcase },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/customers", label: "Customers", icon: UserRound },
  { href: "/dashboard/forms", label: "Booking forms", icon: FormInput },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  businessName,
  bookingSlug,
}: {
  businessName?: string;
  bookingSlug?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 p-3">
      {links.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <link.icon className="size-4" strokeWidth={1.5} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 lg:hidden">
        <div>
          <p className="font-display text-base tracking-tight">
            {brand.name.toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground">{businessName}</p>
        </div>
        <Button size="icon" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            {nav}
            <form action={logoutAction} className="border-t border-border p-3">
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <LogOut className="size-4" /> Sign out
              </Button>
            </form>
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
        <div className="border-b border-border p-4">
          <p className="font-display text-lg tracking-tight">
            {brand.name.toLowerCase()}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {businessName || "Workspace"}
          </p>
          {bookingSlug && (
            <Link
              href={`/book/${bookingSlug}`}
              className="mt-2 inline-block text-xs font-medium text-[var(--cream)] hover:underline"
              target="_blank"
            >
              Public booking page ↗
            </Link>
          )}
        </div>
        {nav}
        <form
          action={logoutAction}
          className="border-t border-border p-3"
        >
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </form>
      </aside>
    </>
  );
}
