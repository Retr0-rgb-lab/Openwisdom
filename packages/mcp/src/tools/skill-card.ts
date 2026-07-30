/**
 * Shared catalog skill card shaping for search / list (Spec 31).
 */
import type { CatalogSkill } from "@openwisdom/schema";

export type DetailLevel = "card" | "full";

const CARD_DESC_MAX = 400;

/** Always includes tags / references / repoPath / updated for scenario matching. */
export function toSkillCard(
  s: CatalogSkill,
  detail: DetailLevel = "card",
): Record<string, unknown> {
  const description =
    detail === "full" || s.description.length <= CARD_DESC_MAX
      ? s.description
      : s.description.slice(0, CARD_DESC_MAX - 3) + "...";

  return {
    id: s.id,
    name: s.name,
    layer: s.layer,
    scope: s.scope,
    disciplines: s.disciplines,
    language: s.language,
    version: s.version,
    description,
    tags: s.tags ?? [],
    references: s.references ?? [],
    repoPath: s.repoPath,
    updated: s.updated,
  };
}
