import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/features",
    "/pricing",
    "/how-it-works",
    "/faq",
    "/contact",
    "/about",
    "/demo",
    "/terms",
    "/privacy",
    "/cookies",
    "/refund-policy",
    "/login",
    "/register",
  ];

  return paths.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
