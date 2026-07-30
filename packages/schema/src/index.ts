/** @openwisdom/schema — SKILL.md frontmatter + catalog index (Plan 02 / Spec 20) */

export const SCHEMA_VERSION = 1 as const;

export {
  isKebabName,
  assertNameMatchesDir,
} from "./kebab.js";

export {
  kebabNameSchema,
  skillFrontmatterSchema,
  parseSkillFrontmatter,
  type SkillFrontmatter,
} from "./frontmatter.js";

export {
  catalogSkillSchema,
  catalogIndexSchema,
  type CatalogSkill,
  type CatalogIndex,
} from "./catalog.js";
