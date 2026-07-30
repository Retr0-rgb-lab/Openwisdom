import { z } from "zod";
import { isKebabName } from "./kebab.js";

/** Zod refine for kebab skill names (1–64). */
export const kebabNameSchema = z
  .string()
  .min(1)
  .max(64)
  .refine(isKebabName, {
    message:
      "must be kebab-case (a-z0-9, single hyphens, no leading/trailing/consecutive hyphens, 1–64 chars)",
  });

/**
 * SKILL.md YAML frontmatter (agentskills minimum + Openwisdom extensions).
 * `id` defaults to `name` after parse.
 */
export const skillFrontmatterSchema = z
  .object({
    name: kebabNameSchema,
    description: z.string().min(1).max(1024),
    id: kebabNameSchema.optional(),
    layer: z.enum(["scenario", "reference"]).optional(),
    scope: z.enum(["official", "community"]).optional(),
    disciplines: z.array(z.string().min(1)).optional(),
    language: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
    version: z.string().min(1).optional(),
    references: z.array(kebabNameSchema).optional(),
    license: z.string().min(1).optional(),
    metadata: z
      .object({
        openwisdom: z.union([z.boolean(), z.string()]).optional(),
      })
      .passthrough()
      .optional(),
  })
  .transform((data) => ({
    ...data,
    id: data.id ?? data.name,
  }));

export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>;

/** Parse and validate a frontmatter object (throws ZodError on invalid). */
export function parseSkillFrontmatter(data: unknown): SkillFrontmatter {
  return skillFrontmatterSchema.parse(data);
}
