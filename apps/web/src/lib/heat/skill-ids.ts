/**
 * Skill id whitelist from machine registry (Spec 28 §5).
 * Unknown skillId → 400; never create garbage keys.
 */

import registryJson from "../../../public/registry/catalog.json";

type RegistrySkill = {
  id?: string;
  repoPath?: string;
};

type RegistryIndex = {
  skills?: RegistrySkill[];
};

let cachedIds: Set<string> | null = null;
let cachedRepoPaths: Map<string, string> | null = null;

function loadRegistry(): void {
  if (cachedIds && cachedRepoPaths) return;
  const ids = new Set<string>();
  const paths = new Map<string, string>();
  try {
    const root = registryJson as RegistryIndex;
    const skills = Array.isArray(root?.skills) ? root.skills : [];
    for (const s of skills) {
      const id = typeof s.id === "string" ? s.id.trim() : "";
      if (!id) continue;
      ids.add(id);
      if (typeof s.repoPath === "string" && s.repoPath.trim()) {
        paths.set(id, s.repoPath.trim());
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
