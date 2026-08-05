/**
 * Client-safe catalog query helpers (no registry/seeds/merge).
 * Pass pre-merged `entries` from a Server Component — never call getCatalog here.
 */

import type {
  CatalogEntry,
  CatalogQuery,
  ContentLang,
  DisciplineId,
  SkillLayer,
  SortKey,
} from "./types";
import { isDisciplineId, pickLocalized } from "./types";

export function catalogHasHeat(entries: CatalogEntry[]): boolean {
  return entries.some(
    (e) =>
      typeof e.installs30d === "number" ||
      typeof e.installsTotal === "number",
  );
}

/**
 * Filter catalog for web Operate surface.
 * One library: layer / discipline / language / q only.
 * `query.source` is ignored (legacy URL param).
 */
export function filterCatalog(
  entries: CatalogEntry[],
  query: CatalogQuery,
): CatalogEntry[] {
  const q = query.q?.trim().toLowerCase() ?? "";
  const layer = query.layer || undefined;
  const lang = query.lang || undefined;
  const disciplines = query.disciplines?.filter(Boolean) ?? [];

  return entries.filter((entry) => {
    if (layer && entry.layer !== layer) return false;

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
        // Editorial rank first; layer second. No Official/Community/Curated product sort.
        const ra = a.featuredRank ?? 999;
        const rb = b.featuredRank ?? 999;
        if (ra !== rb) return ra - rb;
        const layerDiff = LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer];
        if (layerDiff !== 0) return layerDiff;
        return a.slug.localeCompare(b.slug);
      }
    }
  });

  return list;
}

/**
 * Query helper. Callers must pass `entries` (heat-merged or static from server).
 */
export function queryCatalog(
  query: CatalogQuery,
  locale = "zh",
  entries: CatalogEntry[],
): CatalogEntry[] {
  return sortCatalog(
    filterCatalog(entries, query),
    query.sort ?? "featured",
    locale,
  );
}

export function parseDisciplineParam(
  raw: string | string[] | undefined,
): DisciplineId[] {
  if (!raw) return [];
  const parts = Array.isArray(raw) ? raw : raw.split(",");
  return parts.map((p) => p.trim()).filter(isDisciplineId);
}

export function parseLayerParam(raw: string | undefined): SkillLayer | "" {
  if (raw === "scenario" || raw === "reference") return raw;
  return "";
}

/**
 * @deprecated Web filter ignores `source` (single library). Not used by SkillsCatalog.
 * Kept only so old `?source=` URLs do not throw if something still imports this.
 */
export function parseSourceParam(raw: string | undefined): "" {
  void raw;
  return "";
}

export function parseLangParam(raw: string | undefined): ContentLang | "" {
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
