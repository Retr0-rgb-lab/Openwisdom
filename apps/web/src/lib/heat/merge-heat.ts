/**
 * Merge side-channel heat stats onto catalog entries (Spec 29 / SPE 37 G4).
 * Never fill missing skills with 0 — only write when API has a key.
 *
 * Prefer catalog `attachHeat` / `getCatalogWithHeat` so callers do not hand-roll merge.
 */

import type { CatalogEntry } from "@/data/catalog/types";
import type { StatsResponse } from "./types";

/**
 * For each entry, if `stats.skills[entry.id]` exists, set
 * `installs30d` / `installsTotal` from the API (including explicit 0).
 * Without stats or without a key, heat fields stay undefined.
 */
export function mergeHeat(
  entries: CatalogEntry[],
  stats: StatsResponse | null,
): CatalogEntry[] {
  if (!stats?.skills) {
    return entries;
  }

  const map = stats.skills;
  return entries.map((entry) => {
    const heat = map[entry.id];
    if (!heat || typeof heat !== "object") {
      return entry;
    }
    const next: CatalogEntry = { ...entry };
    if (typeof heat.installs30d === "number") {
      next.installs30d = heat.installs30d;
    }
    if (typeof heat.installsTotal === "number") {
      next.installsTotal = heat.installsTotal;
    }
    return next;
  });
}

/** Alias — same fail-open semantics (SPE 37 step 4). */
export const attachHeat = mergeHeat;
