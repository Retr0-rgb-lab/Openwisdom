import { BOOTSTRAP_CATALOG, REFERENCE_BOOTSTRAP } from "./bootstrap";
import { DISCIPLINE_SEED } from "./discipline-seed";
import { EXTERNAL_SEED } from "./external-seed";
import { loadRegistrySkills, mapRegistryToEntry } from "./load-registry";
import { HISTORY_SEED } from "./history-seed";
import { PHILOSOPHY_SEED } from "./philosophy-seed";
import { PRINCIPLE_SEED } from "./principle-seed";
import type {
  CatalogEntry,
  CatalogQuery,
  CatalogSourceFilter,
  ContentLang,
  DisciplineId,
  SkillLayer,
  SortKey,
} from "./types";
import { pickLocalized } from "./types";

export * from "./types";
export { BOOTSTRAP_CATALOG, REFERENCE_BOOTSTRAP } from "./bootstrap";
export { EXTERNAL_SEED } from "./external-seed";
export { DISCIPLINE_SEED } from "./discipline-seed";
export { HISTORY_SEED } from "./history-seed";
export { PHILOSOPHY_SEED } from "./philosophy-seed";
export { PRINCIPLE_SEED } from "./principle-seed";
export {
  loadRegistrySkills,
  mapRegistryToEntry,
  parseRegistrySkill,
} from "./load-registry";

/**
 * Curated discovery seeds: always honest external provenance.
 * CLI install strings may remain as preview only; UI treats as link-only.
 */
function asCuratedDiscovery(entry: CatalogEntry): CatalogEntry {
  return {
    ...entry,
    provenance: "curated-external",
    installMode: "link-only",
    contentAvailability: "external-only",
    // Discovery layer — not machine registry
    source: entry.source === "catalog" ? "catalog" : "bootstrap",
  };
}

/**
 * Overlay bootstrap UI richness onto a registry (installable) entry.
 * Preserves source: "catalog" and install truth from registry.
 */
function overlayBootstrap(
  registryEntry: CatalogEntry,
  boot: CatalogEntry,
): CatalogEntry {
  return {
    ...boot,
    // Installable truth from registry
    id: registryEntry.id,
    slug: registryEntry.slug,
    layer: registryEntry.layer,
    scope: registryEntry.scope,
    version: registryEntry.version || boot.version,
    updated: registryEntry.updated || boot.updated,
    repoPath: registryEntry.repoPath ?? boot.repoPath,
    install: registryEntry.install,
    source: "catalog",
    provenance:
      registryEntry.provenance ??
      (registryEntry.scope === "official" ? "official" : "community"),
    installMode: "cli",
    contentAvailability:
      registryEntry.contentAvailability ?? "summary-only",
    disciplines:
      registryEntry.disciplines.length > 0
        ? registryEntry.disciplines
        : boot.disciplines,
    tags: registryEntry.tags.length > 0 ? registryEntry.tags : boot.tags,
    language: registryEntry.language || boot.language,
    // Prefer bilingual bootstrap copy when present
    title: boot.title,
    summary: boot.summary,
    when: boot.when,
    steps: boot.steps,
    output: boot.output,
    bias: boot.bias,
    shape: boot.shape,
    axis: boot.axis,
    references: boot.references ?? registryEntry.references,
    featuredRank: boot.featuredRank ?? registryEntry.featuredRank,
  };
}

/**
 * Single catalog truth for web UI.
 *
 * Merge order:
 * 1. Machine registry (installable) — source: "catalog"
 * 2. Bootstrap overlay for UI fields on matching slugs (keeps source: "catalog")
 * 3. Curated seeds (principle/external/discipline/philosophy) as discovery only
 *
 * If registry missing/empty: bootstrap three scenarios + curated seeds + honesty banner.
 */
export function getCatalog(): CatalogEntry[] {
  const map = new Map<string, CatalogEntry>();

  const registrySkills = loadRegistrySkills();
  for (const skill of registrySkills) {
    const entry = mapRegistryToEntry(skill);
    map.set(entry.slug, entry);
  }

  // Scenarios + official reference UI overlays (bilingual title/summary/when)
  for (const boot of [...BOOTSTRAP_CATALOG, ...REFERENCE_BOOTSTRAP]) {
    const existing = map.get(boot.slug);
    if (existing && existing.source === "catalog") {
      map.set(boot.slug, overlayBootstrap(existing, boot));
    } else if (!existing) {
      // Registry gap: product seed still discoverable
      map.set(boot.slug, { ...boot, source: "bootstrap" });
    }
  }

  const curatedSeeds = [
    ...PRINCIPLE_SEED,
    ...HISTORY_SEED,
    ...EXTERNAL_SEED,
    ...DISCIPLINE_SEED,
    ...PHILOSOPHY_SEED,
  ];
  for (const seed of curatedSeeds) {
    const existing = map.get(seed.slug);
    if (existing && existing.source === "catalog") {
      // Registry has installable pack (often materialized community skill):
      // keep install truth, retain seed UI + honest curated provenance.
      map.set(seed.slug, {
        ...seed,
        id: existing.id,
        slug: existing.slug,
        source: "catalog",
        scope: existing.scope,
        version: existing.version || seed.version,
        updated: existing.updated || seed.updated,
        repoPath: existing.repoPath ?? seed.repoPath,
        install: existing.install,
        installMode: "cli",
        contentAvailability:
          seed.contentAvailability === "external-only"
            ? "summary-only"
            : (seed.contentAvailability ?? "full-body"),
        provenance: seed.provenance ?? "curated-external",
        externalUrl: seed.externalUrl ?? existing.externalUrl,
        references: seed.references ?? existing.references,
      });
    } else if (!existing) {
      // Not yet in machine registry — discovery-only until materialize + catalog:build
      map.set(seed.slug, asCuratedDiscovery(seed));
    }
  }

  return [...map.values()];
}

export function getSkillBySlug(slug: string): CatalogEntry | undefined {
  return getCatalog().find((e) => e.slug === slug);
}

export function catalogHasHeat(
  entries: CatalogEntry[] = getCatalog(),
): boolean {
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

export function queryCatalog(
  query: CatalogQuery,
  locale = "zh",
): CatalogEntry[] {
  return sortCatalog(
    filterCatalog(getCatalog(), query),
    query.sort ?? "featured",
    locale,
  );
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
    "education",
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
): CatalogSourceFilter | "" {
  if (raw === "official" || raw === "community" || raw === "curated") {
    return raw;
  }
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
