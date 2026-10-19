import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/onboarding", "/api/", "/book/*/manage"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
