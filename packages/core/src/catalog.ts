/**
 * Catalog load + search + scan surface.
 * Load ladder lives in payload-resolve.ts (SPE 35); this file re-exports
 * load/scan and keeps search/bundle helpers.
 */
import type { CatalogIndex, CatalogSkill } from "@openwisdom/schema";

export {
  loadCatalog,
  scanSkillsToCatalog,
  type LoadedCatalog,
  type CatalogSource,
  type LoadCatalogOpts,
} from "./payload-resolve.js";

export function searchCatalog(
  index: CatalogIndex,
  query: string,
  opts?: {
    layer?: "scenario" | "reference";
    scope?: "official" | "community";
    discipline?: string;
    /**
     * Exact tag filter (case-insensitive). Any skill tag must equal `tag`.
     * Spec 33: discovery for orientation-pipeline etc. Free-text still
     * scores soft tag includes when query tokens are present.
     */
    tag?: string;
    limit?: number;
  },
): CatalogSkill[] {
  const q = query.trim().toLowerCase();
  const limit = opts?.limit ?? 20;
  const tokens = q.split(/\s+/).filter(Boolean);

  let list = index.skills.slice();
  if (opts?.layer) list = list.filter((s) => s.layer === opts.layer);
  if (opts?.scope) list = list.filter((s) => s.scope === opts.scope);
  if (opts?.discipline) {
    list = list.filter((s) =>
      s.disciplines.some((d) => d.toLowerCase() === opts.discipline!.toLowerCase()),
    );
  }
  if (opts?.tag?.trim()) {
    const want = opts.tag.trim().toLowerCase();
    list = list.filter((s) =>
      s.tags.some((tag) => tag.toLowerCase() === want),
    );
  }

  if (tokens.length === 0) return list.slice(0, limit);

  const scored = list
    .map((s) => {
      const hay = [
        s.id,
        s.name,
        s.description,
        ...s.tags,
        ...s.disciplines,
      ]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (s.id === t || s.name === t) score += 100;
        else if (s.id.includes(t) || s.name.includes(t)) score += 50;
        else if (s.tags.some((tag) => tag.toLowerCase().includes(t))) score += 20;
        else if (hay.includes(t)) score += 10;
        else return { s, score: -1 };
      }
      return { s, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.s.id.localeCompare(b.s.id));

  return scored.slice(0, limit).map((x) => x.s);
}

/**
 * Resolve a catalog bundle id to ordered skillIds (Spec 33 §5.3).
 * Throws if the bundle is unknown (callers map to UsageError).
 */
export function resolveBundle(
  index: CatalogIndex,
  id: string,
): string[] {
  const key = id.trim();
  if (!key) {
    throw new Error("Bundle id is empty");
  }
  const bundle = index.bundles?.find((b) => b.id === key);
  if (!bundle) {
    const known =
      index.bundles?.map((b) => b.id).join(", ") || "(none in catalog)";
    throw new Error(`Unknown bundle: ${key}. Known bundles: ${known}`);
  }
  return [...bundle.skillIds];
}
