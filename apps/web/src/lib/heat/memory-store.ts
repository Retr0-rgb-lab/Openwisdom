/**
 * Process-global Memory HeatStore (dev/test; Spec 28 §4.2).
 */

import {
  buildSkillStats,
  dayKey,
  lastNDaysUtc,
  parseTotalKey,
  totalKey,
} from "./aggregate";
import type { HeatEventName, HeatStore, SkillHeatStats } from "./types";

type GlobalHeat = typeof globalThis & {
  __owHeatMemory?: Map<string, number>;
};

function map(): Map<string, number> {
  const g = globalThis as GlobalHeat;
  if (!g.__owHeatMemory) {
    g.__owHeatMemory = new Map();
  }
  return g.__owHeatMemory;
}

function incr(key: string, by = 1): void {
  const m = map();
  m.set(key, (m.get(key) ?? 0) + by);
}

function get(key: string): number {
  return map().get(key) ?? 0;
}

export function resetMemoryStore(): void {
  const g = globalThis as GlobalHeat;
  g.__owHeatMemory = new Map();
}

export function getMemoryStore(): HeatStore {
  return memoryStore;
}

const memoryStore: HeatStore = {
  async recordEvent(input): Promise<void> {
    const { skillId, event, day } = input;
    incr(dayKey(day, skillId, event), 1);
    incr(totalKey(skillId, event), 1);
  },

  async getAggregates(skillIds?: string[]): Promise<Record<string, SkillHeatStats>> {
    const m = map();
    const filter =
      skillIds && skillIds.length > 0 ? new Set(skillIds) : null;

    const skillSet = new Set<string>();
    for (const key of m.keys()) {
      const parsed = parseTotalKey(key);
      if (!parsed) continue;
      if (filter && !filter.has(parsed.skillId)) continue;
      skillSet.add(parsed.skillId);
    }

    const days30 = lastNDaysUtc(30);
    const out: Record<string, SkillHeatStats> = {};

    for (const skillId of skillSet) {
      const cliTotal = get(totalKey(skillId, "cli_install_success"));
      const downloadTotal = get(totalKey(skillId, "web_download"));
      const copyTotal = get(totalKey(skillId, "web_copy_install"));

      let cli30d = 0;
      let download30d = 0;
      let copy30d = 0;
      for (const day of days30) {
        cli30d += get(dayKey(day, skillId, "cli_install_success"));
        download30d += get(dayKey(day, skillId, "web_download"));
        copy30d += get(dayKey(day, skillId, "web_copy_install"));
      }

      const stats = buildSkillStats({
        cliTotal,
        cli30d,
        downloadTotal,
        download30d,
        copyTotal,
        copy30d,
      });

      if (
        stats.installsTotal === 0 &&
        stats.copiesTotal === 0 &&
        stats.cliInstallsTotal === 0 &&
        stats.downloadsTotal === 0
      ) {
        continue;
      }

      out[skillId] = stats;
    }

    return out;
  },
};

/** Direct map access for tests (read-only inspection). */
export function __memoryRawGet(key: string): number {
  return get(key);
}

export function __memorySeed(
  skillId: string,
  event: HeatEventName,
  day: string,
  count: number,
): void {
  const m = map();
  m.set(dayKey(day, skillId, event), count);
  m.set(
    totalKey(skillId, event),
    (m.get(totalKey(skillId, event)) ?? 0) + count,
  );
}
