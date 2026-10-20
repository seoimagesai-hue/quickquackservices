import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-10 flex items-center">
        <BrandLogo height={56} priority />
      </Link>
      <div className="w-full max-w-md border border-border bg-background p-6 sm:p-8">
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
