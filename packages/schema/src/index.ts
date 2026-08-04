/** @openwisdom/schema — SKILL.md frontmatter + catalog index (Plan 02 / Spec 20) */

export const SCHEMA_VERSION = 1 as const;

export {
  isKebabName,
  assertNameMatchesDir,
} from "./kebab.js";

export {
  kebabNameSchema,
  skillPipelineSchema,
  skillFrontmatterSchema,
  parseSkillFrontmatter,
  type SkillFrontmatter,
  type SkillPipeline,
} from "./frontmatter.js";

export {
  catalogSkillSchema,
  catalogBundleSchema,
  catalogIndexSchema,
  type CatalogSkill,
  type CatalogBundle,
  type CatalogIndex,
} from "./catalog.js";

export { inferScopeAndLayer } from "./scope-layer.js";
