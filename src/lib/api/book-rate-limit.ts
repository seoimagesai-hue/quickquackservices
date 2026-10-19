import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

export function bookRateLimit(headers: Headers, slug: string, action: string) {
  const ip = getClientIp(headers);
  return rateLimit(`book:${action}:${slug}:${ip}`, 60, 15 * 60 * 1000);
}
