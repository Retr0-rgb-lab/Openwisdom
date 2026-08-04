/**
 * Skill id whitelist from machine registry (Spec 28 §5 / SPE 37 G3).
 * Unknown skillId → 400; never create garbage keys.
 *
 * **Single registry path:** reuses `loadRegistrySkillsLenient` from
 * `data/catalog/registry-source` (the only static catalog.json import).
 * Avoids pulling `@openwisdom/schema` into API / tsx test graphs; skill set
 * matches getCatalog() after the same per-item parse.
 */

import { loadRegistrySkillsLenient } from "@/data/catalog/registry-source";

let cachedIds: Set<string> | null = null;
let cachedRepoPaths: Map<string, string> | null = null;

function loadRegistry(): void {
  if (cachedIds && cachedRepoPaths) return;
  const ids = new Set<string>();
  const paths = new Map<string, string>();
  try {
    for (const s of loadRegistrySkillsLenient()) {
      ids.add(s.id);
      if (s.repoPath) {
        paths.set(s.id, s.repoPath);
      }
    }
  } catch {
    // empty whitelist — all skillIds rejected
  }
  cachedIds = ids;
  cachedRepoPaths = paths;
}

/** Known installable skill ids from public/registry/catalog.json. */
export function getKnownSkillIds(): Set<string> {
  loadRegistry();
  return cachedIds!;
}

export function isKnownSkillId(skillId: string): boolean {
  return getKnownSkillIds().has(skillId);
}

/** Relative repo path (e.g. skills/official/scenarios/macro-scan). */
export function getSkillRepoPath(skillId: string): string | undefined {
  loadRegistry();
  return cachedRepoPaths!.get(skillId);
}

/** Test-only: clear caches after swapping registry (not used in prod). */
export function __resetSkillIdCacheForTests(): void {
  cachedIds = null;
  cachedRepoPaths = null;
}
