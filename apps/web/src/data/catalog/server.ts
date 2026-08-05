/**
 * Server-only catalog truth (SPE 37).
 *
 * Merge order (frozen — callers must not hand-roll a 5th merge):
 * 1. `loadRegistrySkills()` → `mapRegistryToEntry` → CatalogEntry[] (`source: "catalog"`)
 * 2. Overlay BOOTSTRAP / REFERENCE_BOOTSTRAP: same id keeps install truth, fills bilingual UI
 * 3. Seeds (principle / history / philosophy / external / discipline):
 *    registry present → keep install + seed UI; else discovery-only
 * 4. `attachHeat(entries, stats | null)` via `getCatalogWithHeat` — fail-open
 *
 * Heat never lives in SKILL.md / catalog.json (side channel only).
 *
 * Client components must NOT import this module — use `@/data/catalog` (query/types)
 * and receive entries via props from Server Components.
 */

import "@/lib/server-only";

import { BOOTSTRAP_CATALOG, REFERENCE_BOOTSTRAP } from "./bootstrap";
import { DISCIPLINE_SEED } from "./discipline-seed";
import { EXTERNAL_SEED } from "./external-seed";
import { loadRegistrySkills, mapRegistryToEntry } from "./load-registry";
import { HISTORY_SEED } from "./history-seed";
import { PHILOSOPHY_SEED } from "./philosophy-seed";
import { PRINCIPLE_SEED } from "./principle-seed";
import type { CatalogEntry } from "./types";
import { mergeHeat } from "@/lib/heat/merge-heat";
import type { StatsResponse } from "@/lib/heat/types";

export type { CatalogEntry } from "./types";
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

/** Module-level memo — registry + seeds are static at build/runtime. */
let cachedCatalog: CatalogEntry[] | null = null;

/**
 * Single catalog truth for web UI (static merge steps 1–3).
 * For heat-aware entries use `getCatalogWithHeat(stats)`.
 */
export function getCatalog(): CatalogEntry[] {
  if (cachedCatalog) return cachedCatalog;

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

  cachedCatalog = [...map.values()];
  return cachedCatalog;
}

/**
 * Attach side-channel heat (SPE 37 step 4). Fail-open: null stats → unchanged entries.
 * Alias of mergeHeat — prefer this name on catalog read paths.
 */
export function attachHeat(
  entries: CatalogEntry[],
  stats: StatsResponse | null,
): CatalogEntry[] {
  return mergeHeat(entries, stats);
}

/** Steps 1–4: static catalog + optional heat. */
export function getCatalogWithHeat(
  stats: StatsResponse | null,
): CatalogEntry[] {
  return attachHeat(getCatalog(), stats);
}

export function getSkillBySlug(slug: string): CatalogEntry | undefined {
  return getCatalog().find((e) => e.slug === slug);
}

/** Detail / related lookups with the same heat merge as the list page. */
export function getSkillBySlugWithHeat(
  slug: string,
  stats: StatsResponse | null,
): CatalogEntry | undefined {
  return getCatalogWithHeat(stats).find((e) => e.slug === slug);
}

/**
 * Slim search index for chrome (GlobalSearch) — drops body-heavy fields so
 * the RSC → client payload stays smaller than full detail entries.
 */
export type CatalogSearchEntry = Pick<
  CatalogEntry,
  | "id"
  | "slug"
  | "layer"
  | "scope"
  | "disciplines"
  | "language"
  | "title"
  | "summary"
  | "tags"
  | "version"
  | "updated"
  | "repoPath"
  | "install"
  | "source"
  | "provenance"
  | "featuredRank"
  | "installs30d"
  | "installsTotal"
  | "contentAvailability"
  | "installMode"
  | "externalUrl"
>;

export function toSearchIndexEntry(entry: CatalogEntry): CatalogSearchEntry {
  return {
    id: entry.id,
    slug: entry.slug,
    layer: entry.layer,
    scope: entry.scope,
    disciplines: entry.disciplines,
    language: entry.language,
    title: entry.title,
    summary: entry.summary,
    tags: entry.tags,
    version: entry.version,
    updated: entry.updated,
    repoPath: entry.repoPath,
    install: entry.install,
    source: entry.source,
    provenance: entry.provenance,
    featuredRank: entry.featuredRank,
    installs30d: entry.installs30d,
    installsTotal: entry.installsTotal,
    contentAvailability: entry.contentAvailability,
    installMode: entry.installMode,
    externalUrl: entry.externalUrl,
  };
}

/** Static slim index for header search (no heat — client may attach via /api/stats). */
export function getCatalogSearchIndex(): CatalogSearchEntry[] {
  return getCatalog().map(toSearchIndexEntry);
}

/** All known slugs (for detail reference resolution without client getCatalog). */
export function getCatalogSlugs(): string[] {
  return getCatalog().map((e) => e.slug);
}

/** Test-only: clear memo after swapping fixtures. */
export function __resetCatalogCacheForTests(): void {
  cachedCatalog = null;
}
