"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  FormInput,
  LayoutDashboard,
  Menu,
  Settings,
  Scissors,
  Users,
  UserCircle,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BusinessSwitcher } from "@/components/dashboard/business-switcher";
import { logoutAction } from "@/lib/actions/auth";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/services", label: "Services", icon: Scissors },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/customers", label: "Customers", icon: UserCircle },
  { href: "/dashboard/forms", label: "Booking forms", icon: FormInput },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export function SidebarNav(props: {
  businesses: { id: string; name: string; role: string }[];
  currentBusinessId: string;
  businessName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
      <form action={logoutAction} className="mt-auto px-3 pb-3 pt-2">
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </nav>
  );

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{props.businessName}</p>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0 lg:flex",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="min-w-0">
            <BrandLogo height={44} />
            <p className="mt-1 truncate font-semibold">{props.businessName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="border-b border-border p-3">
          <BusinessSwitcher
            businesses={props.businesses}
            currentBusinessId={props.currentBusinessId}
          />
        </div>
        {nav}
      </aside>
    </>
  );
}
