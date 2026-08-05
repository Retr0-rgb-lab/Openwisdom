/**
 * Rate limit for POST /api/telemetry (Spec 28 §2.3).
 *
 * Backend selection:
 * - **Upstash** when `UPSTASH_REDIS_REST_URL` + `TOKEN` are set (shared across
 *   serverless instances — preferred in production).
 * - **In-memory** sliding window otherwise (local dev / single process).
 *
 * Multi-instance without Upstash under-protects; documented, not a hard fail.
 * Fail-open on Redis errors → allow request (telemetry must not brick clients).
 */

import { getRateLimitPerMin, getUpstashConfig, hasUpstashEnv } from "./config";

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
 * Process-local sliding window. Used in dev and as Upstash fallback.
 * @returns true if allowed, false if rate limited
 */
export function checkMemoryRateLimit(
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

/**
 * Fixed-window counter in Upstash (1 key / IP / UTC minute).
 * Shared across instances when Redis env is present.
 */
async function checkUpstashRateLimit(
  ip: string,
  opts?: { limit?: number; now?: number },
): Promise<boolean> {
  const cfg = getUpstashConfig();
  if (!cfg) return checkMemoryRateLimit(ip, opts);

  const limit = opts?.limit ?? getRateLimitPerMin();
  const now = opts?.now ?? Date.now();
  const minute = Math.floor(now / WINDOW_MS);
  const safeIp = (ip || "unknown").replace(/[^a-zA-Z0-9.:_-]/g, "_").slice(0, 128);
  const key = `ow:heat:rl:${safeIp}:${minute}`;

  const pipelineUrl = cfg.url.replace(/\/$/, "") + "/pipeline";
  const res = await fetch(pipelineUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, 120],
    ]),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash rate-limit ${res.status}`);
  }
  const json = (await res.json()) as Array<{ result?: unknown; error?: string }>;
  if (!Array.isArray(json) || json[0]?.error) {
    throw new Error("Upstash rate-limit: bad response");
  }
  const n = Number(json[0]?.result);
  if (!Number.isFinite(n)) {
    throw new Error("Upstash rate-limit: non-numeric INCR");
  }
  return n <= limit;
}

/**
 * Prefer shared Upstash when configured; else memory.
 * Async so Redis can be used without breaking local sync tests —
 * use `checkMemoryRateLimit` / sync alias for unit tests.
 *
 * Fail-open: Redis errors fall back to memory (still best-effort).
 */
export async function checkRateLimit(
  ip: string,
  opts?: { limit?: number; now?: number },
): Promise<boolean> {
  if (hasUpstashEnv()) {
    try {
      return await checkUpstashRateLimit(ip, opts);
    } catch (err) {
      console.error(
        "[heat/rate-limit] Upstash failed; falling back to memory",
        err,
      );
      return checkMemoryRateLimit(ip, opts);
    }
  }
  return checkMemoryRateLimit(ip, opts);
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
