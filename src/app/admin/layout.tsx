import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/audit", label: "Audit logs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.platformRole !== "platform_admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/15 bg-black">
        <div className="container-page flex flex-wrap items-center gap-4 py-4">
          <p className="font-display text-lg">Platform Admin</p>
          <nav className="flex flex-wrap gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-sm px-3 py-1.5 text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
