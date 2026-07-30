import { BOOTSTRAP_CATALOG } from "./bootstrap";
import { DISCIPLINE_SEED } from "./discipline-seed";
import { EXTERNAL_SEED } from "./external-seed";
import { PHILOSOPHY_SEED } from "./philosophy-seed";
import { PRINCIPLE_SEED } from "./principle-seed";
import type {
  CatalogEntry,
  CatalogQuery,
  ContentLang,
  DisciplineId,
  SkillLayer,
  SkillScope,
  SortKey,
} from "./types";
import { pickLocalized } from "./types";

export * from "./types";
export { BOOTSTRAP_CATALOG } from "./bootstrap";
export { EXTERNAL_SEED } from "./external-seed";
export { DISCIPLINE_SEED } from "./discipline-seed";
export { PHILOSOPHY_SEED } from "./philosophy-seed";
export { PRINCIPLE_SEED } from "./principle-seed";

/** De-dupe by slug; official bootstrap wins over later seeds. */
export function getCatalog(): CatalogEntry[] {
  const map = new Map<string, CatalogEntry>();
  for (const entry of [
    ...BOOTSTRAP_CATALOG,
    ...PRINCIPLE_SEED,
    ...EXTERNAL_SEED,
    ...DISCIPLINE_SEED,
    ...PHILOSOPHY_SEED,
  ]) {
    if (!map.has(entry.slug)) map.set(entry.slug, entry);
  }
  return [...map.values()];
}

export function getSkillBySlug(slug: string): CatalogEntry | undefined {
  return getCatalog().find((e) => e.slug === slug);
}

export function catalogHasHeat(entries: CatalogEntry[] = getCatalog()): boolean {
  return entries.some(
    (e) => typeof e.installs30d === "number" || typeof e.installsTotal === "number",
  );
}

export function filterCatalog(
  entries: CatalogEntry[],
  query: CatalogQuery,
): CatalogEntry[] {
  const q = query.q?.trim().toLowerCase() ?? "";
  const layer = query.layer || undefined;
  const source = query.source || undefined;
  const lang = query.lang || undefined;
  const disciplines = query.disciplines?.filter(Boolean) ?? [];

  return entries.filter((entry) => {
    if (layer && entry.layer !== layer) return false;
    if (source && entry.scope !== source) return false;
    if (lang && entry.language !== lang) return false;
    if (disciplines.length > 0) {
      const hit = disciplines.some((d) => entry.disciplines.includes(d));
      if (!hit) return false;
    }
    if (q) {
      const hay = [
        entry.slug,
        entry.id,
        entry.title.zh,
        entry.title.en,
        entry.summary.zh,
        entry.summary.en,
        ...entry.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

const SCOPE_ORDER: Record<SkillScope, number> = {
  official: 0,
  community: 1,
};

const LAYER_ORDER: Record<SkillLayer, number> = {
  scenario: 0,
  reference: 1,
};

export function sortCatalog(
  entries: CatalogEntry[],
  sort: SortKey = "featured",
  locale = "zh",
): CatalogEntry[] {
  const list = [...entries];
  const effective: SortKey =
    sort === "popular" && !catalogHasHeat(list) ? "featured" : sort;

  list.sort((a, b) => {
    switch (effective) {
      case "name": {
        const an = pickLocalized(a.title, locale);
        const bn = pickLocalized(b.title, locale);
        return an.localeCompare(bn, locale === "en" ? "en" : "zh");
      }
      case "updated":
        return (b.updated || "").localeCompare(a.updated || "");
      case "popular": {
        const ap = a.installs30d ?? a.installsTotal ?? 0;
        const bp = b.installs30d ?? b.installsTotal ?? 0;
        if (bp !== ap) return bp - ap;
        return a.slug.localeCompare(b.slug);
      }
      case "featured":
      default: {
        const scopeDiff = SCOPE_ORDER[a.scope] - SCOPE_ORDER[b.scope];
        if (scopeDiff !== 0) return scopeDiff;
        const layerDiff = LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer];
        if (layerDiff !== 0) return layerDiff;
        const ra = a.featuredRank ?? 999;
        const rb = b.featuredRank ?? 999;
        if (ra !== rb) return ra - rb;
        return a.slug.localeCompare(b.slug);
      }
    }
  });

  return list;
}

export function queryCatalog(
  query: CatalogQuery,
  locale = "zh",
): CatalogEntry[] {
  return sortCatalog(filterCatalog(getCatalog(), query), query.sort ?? "featured", locale);
}

export function parseDisciplineParam(
  raw: string | string[] | undefined,
): DisciplineId[] {
  if (!raw) return [];
  const parts = Array.isArray(raw) ? raw : raw.split(",");
  const allowed = new Set<string>([
    "psychology",
    "sociology",
    "history",
    "political-science",
    "economics",
    "philosophy",
  ]);
  return parts
    .map((p) => p.trim())
    .filter((p): p is DisciplineId => allowed.has(p));
}

export function parseLayerParam(
  raw: string | undefined,
): SkillLayer | "" {
  if (raw === "scenario" || raw === "reference") return raw;
  return "";
}

export function parseSourceParam(
  raw: string | undefined,
): SkillScope | "" {
  if (raw === "official" || raw === "community") return raw;
  return "";
}

export function parseLangParam(
  raw: string | undefined,
): ContentLang | "" {
  if (raw === "zh" || raw === "en") return raw;
  return "";
}

export function parseSortParam(raw: string | undefined): SortKey {
  if (
    raw === "featured" ||
    raw === "name" ||
    raw === "updated" ||
    raw === "popular"
  ) {
    return raw;
  }
  return "featured";
}
