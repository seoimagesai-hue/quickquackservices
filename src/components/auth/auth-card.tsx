import Link from "next/link";
import { brand } from "@/config/brand";

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
      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 text-foreground"
      >
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/80"
          aria-hidden
        >
          <span className="size-3 rounded-full border border-primary/50" />
        </span>
        <span className="font-display text-xl tracking-tight text-primary">
          {brand.name.toLowerCase()}
        </span>
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
