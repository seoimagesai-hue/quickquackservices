/**
 * In-memory sliding-window rate limiter.
 * For production multi-instance deploys, replace with Redis/Upstash.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.timestamps[0] ?? now;
    return {
      success: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  return {
    success: true,
    remaining: limit - bucket.timestamps.length,
    resetAt: now + windowMs,
  };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") || "unknown";
}
