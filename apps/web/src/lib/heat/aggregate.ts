/**
 * Day-bucket keys + rollup helpers (Spec 28 §4.1).
 *
 * installs* = cli_install_success + web_download
 * copies*   = web_copy_install only (funnel; NOT installs)
 */

import type { HeatEventName, SkillHeatStats } from "./types";

export const KEY_PREFIX = "ow:v1";

export function dayKey(
  day: string,
  skillId: string,
  event: HeatEventName,
): string {
  return `${KEY_PREFIX}:day:${day}:${skillId}:${event}`;
}

export function totalKey(skillId: string, event: HeatEventName): string {
  return `${KEY_PREFIX}:total:${skillId}:${event}`;
}

/** UTC calendar day YYYY-MM-DD. */
export function utcDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Last N UTC days including today (N=30 → 30 buckets). */
export function lastNDaysUtc(n: number, now: Date = new Date()): string[] {
  const days: string[] = [];
  const base = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  for (let i = 0; i < n; i++) {
    const t = new Date(base - i * 86_400_000);
    days.push(t.toISOString().slice(0, 10));
  }
  return days;
}

export function emptySkillStats(): SkillHeatStats {
  return {
    installsTotal: 0,
    installs30d: 0,
    cliInstallsTotal: 0,
    cliInstalls30d: 0,
    downloadsTotal: 0,
    downloads30d: 0,
    copiesTotal: 0,
    copies30d: 0,
  };
}

/**
 * Build public SkillHeatStats from per-event totals and 30d sums.
 * Enforces product rule: copy never enters installs*.
 */
export function buildSkillStats(counts: {
  cliTotal: number;
  cli30d: number;
  downloadTotal: number;
  download30d: number;
  copyTotal: number;
  copy30d: number;
}): SkillHeatStats {
  const cliTotal = Math.max(0, counts.cliTotal | 0);
  const cli30d = Math.max(0, counts.cli30d | 0);
  const downloadTotal = Math.max(0, counts.downloadTotal | 0);
  const download30d = Math.max(0, counts.download30d | 0);
  const copyTotal = Math.max(0, counts.copyTotal | 0);
  const copy30d = Math.max(0, counts.copy30d | 0);
  return {
    installsTotal: cliTotal + downloadTotal,
    installs30d: cli30d + download30d,
    cliInstallsTotal: cliTotal,
    cliInstalls30d: cli30d,
    downloadsTotal: downloadTotal,
    downloads30d: download30d,
    copiesTotal: copyTotal,
    copies30d: copy30d,
  };
}

/** Parse total key → { skillId, event } or null. */
export function parseTotalKey(
  key: string,
): { skillId: string; event: HeatEventName } | null {
  const prefix = `${KEY_PREFIX}:total:`;
  if (!key.startsWith(prefix)) return null;
  const rest = key.slice(prefix.length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon <= 0) return null;
  const skillId = rest.slice(0, lastColon);
  const event = rest.slice(lastColon + 1);
  if (!isHeatEvent(event) || !skillId) return null;
  return { skillId, event };
}

/** Parse day key → { day, skillId, event } or null. */
export function parseDayKey(
  key: string,
): { day: string; skillId: string; event: HeatEventName } | null {
  const prefix = `${KEY_PREFIX}:day:`;
  if (!key.startsWith(prefix)) return null;
  const rest = key.slice(prefix.length);
  // YYYY-MM-DD:skillId:event
  if (rest.length < 14) return null;
  const day = rest.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  if (rest[10] !== ":") return null;
  const after = rest.slice(11);
  const lastColon = after.lastIndexOf(":");
  if (lastColon <= 0) return null;
  const skillId = after.slice(0, lastColon);
  const event = after.slice(lastColon + 1);
  if (!isHeatEvent(event) || !skillId) return null;
  return { day, skillId, event };
}

function isHeatEvent(v: string): v is HeatEventName {
  return (
    v === "cli_install_success" ||
    v === "web_download" ||
    v === "web_copy_install"
  );
}
