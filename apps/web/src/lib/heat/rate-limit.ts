/**
 * In-memory sliding-window rate limit: N requests / IP / minute (Spec 28 §2.3).
 * Serverless multi-instance imperfect — documented; Upstash limit is P1.
 */

import { getRateLimitPerMin } from "./config";

type Entry = { timestamps: number[] };

type GlobalRl = typeof globalThis & {
  __owHeatRateLimit?: Map<string, Entry>;
};

function bucket(): Map<string, Entry> {
  const g = globalThis as GlobalRl;
  if (!g.__owHeatRateLimit) {
    g.__owHeatRateLimit = new Map();
  }
  return g.__owHeatRateLimit;
}

const WINDOW_MS = 60_000;

/**
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  ip: string,
  opts?: { limit?: number; now?: number },
): boolean {
  const limit = opts?.limit ?? getRateLimitPerMin();
  const now = opts?.now ?? Date.now();
  const key = ip || "unknown";
  const m = bucket();
  let entry = m.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    m.set(key, entry);
  }
  const cutoff = now - WINDOW_MS;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  if (entry.timestamps.length >= limit) {
    return false;
  }
  entry.timestamps.push(now);
  return true;
}

/** Extract client IP for rate limiting (not persisted in stats). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function resetRateLimitForTests(): void {
  const g = globalThis as GlobalRl;
  g.__owHeatRateLimit = new Map();
}
