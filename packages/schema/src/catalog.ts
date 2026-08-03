import { z } from "zod";
import { kebabNameSchema, skillPipelineSchema } from "./frontmatter.js";

export { skillPipelineSchema };
export type { SkillPipeline } from "./frontmatter.js";

/**
 * Catalog root bundle: ordered skill set for multi-skill install (Spec 33 §5.2).
 * skillIds order is the install/pipeline truth source — not encoded as a skill entity.
 */
export const catalogBundleSchema = z.object({
  id: kebabNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  skillIds: z.array(kebabNameSchema).min(1),
});

export type CatalogBundle = z.infer<typeof catalogBundleSchema>;

/**
 * One skill entry in catalog.json (Spec 20 §4.3 + Spec 33 optional pipeline).
 * Heat / installs are out of band (Spec 06).
 */
export const catalogSkillSchema = z.object({
  id: kebabNameSchema,
  name: kebabNameSchema,
  description: z.string().min(1).max(1024),
  layer: z.enum(["scenario", "reference"]),
  scope: z.enum(["official", "community"]),
  disciplines: z.array(z.string().min(1)),
  language: z.string().min(1),
  tags: z.array(z.string().min(1)),
  version: z.string().min(1),
  updated: z.string().min(1),
  repoPath: z.string().min(1),
  references: z.array(kebabNameSchema).optional(),
  /** Optional pipeline membership (handoff chains, etc.) */
  pipeline: skillPipelineSchema.optional(),
  install: z.object({
    cli: z.string().min(1),
  }),
});

export type CatalogSkill = z.infer<typeof catalogSkillSchema>;

/**
 * Root of catalog.json — object form for extensibility (Spec 20 §4.3 + Spec 33).
 * `bundles` is optional so older catalogs without it still parse.
 */
export const catalogIndexSchema = z.object({
  schemaVersion: z.literal(1),
  skills: z.array(catalogSkillSchema),
  bundles: z.array(catalogBundleSchema).optional(),
});

export type CatalogIndex = z.infer<typeof catalogIndexSchema>;
