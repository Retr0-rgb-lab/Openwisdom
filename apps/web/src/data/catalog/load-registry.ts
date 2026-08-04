/**
 * Public registry loader (SPE 37 G3 + P1-a).
 *
 * - JSON truth: `registry-source.ts` (single static import)
 * - Soft gate: `@openwisdom/schema` catalogIndexSchema when available
 * - Fail-open: schema miss / mismatch → lenient parse, never throw
 *
 * Heat skill-ids import `loadRegistrySkills` from here or
 * `loadRegistrySkillsLenient` from registry-source (same JSON).
 */

import { catalogIndexSchema } from "@openwisdom/schema";
import {
  getRegistryJson,
  loadRegistrySkillsLenient,
  mapRegistryToEntry,
  parseRegistrySkill,
  parseRegistrySkillsArray,
  type RegistrySkill,
} from "./registry-source";

export type { RegistrySkill } from "./registry-source";
export {
  mapRegistryToEntry,
  parseRegistrySkill,
  loadRegistrySkillsLenient,
} from "./registry-source";

/**
 * Read skills from registry JSON.
 * Prefer catalogIndexSchema; on failure: dev warn + lenient skills[].
 */
export function loadRegistrySkills(): RegistrySkill[] {
  try {
    const json = getRegistryJson();
    const validated = catalogIndexSchema.safeParse(json);
    if (validated.success) {
      return parseRegistrySkillsArray(validated.data.skills);
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[openwisdom] catalog.json failed catalogIndexSchema; lenient parse",
        validated.error.issues.slice(0, 5),
      );
    }
    return loadRegistrySkillsLenient();
  } catch {
    return loadRegistrySkillsLenient();
  }
}
