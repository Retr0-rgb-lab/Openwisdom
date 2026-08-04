/**
 * Server-side (or universal) stats fetch for catalog heat merge (Spec 29).
 * Fail-open: network / parse / empty API → null (UI hides heat).
 *
 * Stats shape lives in ./types only (SPE 37 G6) — re-exported here for callers.
 */

import type { SkillHeatStats, StatsResponse } from "./types";

export type { SkillHeatStats, StatsResponse };

function resolveStatsUrl(): string {
  const explicit =
    process.env.OPENWISDOM_STATS_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) {
    const base = explicit.replace(/\/$/, "");
    return base.endsWith("/api/stats") ? base : `${base}/api/stats`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}/api/stats`;
  }
  // Local / build-time fallback; fetch failure → null
  return "http://127.0.0.1:3000/api/stats";
}

function isStatsResponse(data: unknown): data is StatsResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (obj.schemaVersion !== 1) return false;
  if (!obj.skills || typeof obj.skills !== "object" || Array.isArray(obj.skills)) {
    return false;
  }
  return true;
}

/**
 * Fetch aggregate heat stats. Returns null on any failure so callers
 * never paint fake zeros across the catalog.
 */
export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(resolveStatsUrl(), {
      method: "GET",
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!isStatsResponse(data)) return null;
    return data;
  } catch {
    return null;
  }
}
