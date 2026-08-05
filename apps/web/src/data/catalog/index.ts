/**
 * Client-safe catalog barrel.
 *
 * - Types + pure query helpers only (safe for `"use client"` modules).
 * - Full registry + seed merge lives in `./server` (`getCatalog`, heat merge).
 *   Server Components / route handlers import `@/data/catalog/server`.
 *
 * Do not re-export `./server` from this file — that would pull seeds into
 * every client importer of `@/data/catalog`.
 */

export * from "./types";
export {
  catalogHasHeat,
  filterCatalog,
  sortCatalog,
  queryCatalog,
  parseDisciplineParam,
  parseLayerParam,
  parseSourceParam,
  parseLangParam,
  parseSortParam,
} from "./query";

/** Re-export client-safe heat merge (pure; no store / no seeds). */
export { attachHeat, mergeHeat } from "@/lib/heat/merge-heat";
