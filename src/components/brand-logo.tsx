import Image from "next/image";
import { cn } from "@/lib/utils";
import { brand } from "@/config/brand";

type BrandLogoProps = {
  className?: string;
  /** Display height in CSS pixels. */
  height?: number;
  priority?: boolean;
};

export function BrandLogo({
  className,
  height = 48,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={brand.name}
      width={720}
      height={240}
      className={cn("w-auto object-contain object-left", className)}
      style={{ height, width: "auto", maxWidth: "none" }}
      priority={priority}
      unoptimized
    />
  );
}
