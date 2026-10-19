import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/20 bg-white/10 text-white",
        secondary: "border-secondary/50 bg-secondary/10 text-secondary",
        success: "border-success/40 bg-success/10 text-success",
        warning: "border-secondary/40 bg-secondary/10 text-secondary",
        destructive: "border-destructive/40 bg-destructive/10 text-destructive",
        outline: "border-white/25 text-white/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
