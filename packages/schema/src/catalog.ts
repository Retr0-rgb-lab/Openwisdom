import { z } from "zod";
import { kebabNameSchema } from "./frontmatter.js";

/**
 * One skill entry in catalog.json (Spec 20 §4.3).
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
  install: z.object({
    cli: z.string().min(1),
  }),
});

export type CatalogSkill = z.infer<typeof catalogSkillSchema>;

/** Root of catalog.json — object form for extensibility (Spec 20 §4.3). */
export const catalogIndexSchema = z.object({
  schemaVersion: z.literal(1),
  skills: z.array(catalogSkillSchema),
});

export type CatalogIndex = z.infer<typeof catalogIndexSchema>;
