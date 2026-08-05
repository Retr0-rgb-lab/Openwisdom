#!/usr/bin/env node
/**
 * Catalog snapshot contentHash parity gate (wave w-impl-arch-01 / claim i7).
 *
 * Compares contentHash (and skillCount when present) across the three fan-out
 * surfaces that ship the machine catalog:
 *   - packages/cli/catalog-snapshot/
 *   - packages/mcp/catalog-snapshot/
 *   - apps/web/public/registry/
 *
 * Prefers manifest.json; falls back to catalog.json if manifest is missing.
 *
 * Exit codes:
 *   0 — all present surfaces agree on contentHash (+ skillCount when both set)
 *   1 — mismatch, missing files, or unreadable / incomplete metadata
 *
 * Release note:
 *   Before publish / release, run `pnpm catalog:sync-web` (materialize + catalog
 *   build) so cli / mcp / web registry snapshots stay aligned, then re-run
 *   `pnpm catalog:check-hash` (this script).
 *
 * Usage: node scripts/check-catalog-hash.mjs
 * Root:  pnpm catalog:check-hash
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** @type {{ id: string, dir: string }[]} */
const SURFACES = [
  { id: "cli", dir: "packages/cli/catalog-snapshot" },
  { id: "mcp", dir: "packages/mcp/catalog-snapshot" },
  { id: "web", dir: "apps/web/public/registry" },
];

/**
 * @param {string} absPath
 * @returns {unknown}
 */
function readJson(absPath) {
  return JSON.parse(readFileSync(absPath, "utf8"));
}

/**
 * Resolve manifest.json or catalog.json under a snapshot dir.
 * @param {string} surfaceDirAbs
 * @returns {{ path: string, kind: "manifest" | "catalog" } | null}
 */
function resolveSnapshotFile(surfaceDirAbs) {
  const manifest = join(surfaceDirAbs, "manifest.json");
  if (existsSync(manifest)) {
    return { path: manifest, kind: "manifest" };
  }
  const catalog = join(surfaceDirAbs, "catalog.json");
  if (existsSync(catalog)) {
    return { path: catalog, kind: "catalog" };
  }
  return null;
}

/**
 * Extract contentHash + optional skillCount from a snapshot JSON object.
 * @param {unknown} data
 * @param {"manifest" | "catalog"} kind
 * @returns {{ contentHash: string, skillCount: number | null }}
 */
function extractMeta(data, kind) {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`expected JSON object in ${kind}`);
  }
  /** @type {Record<string, unknown>} */
  const obj = data;

  const contentHash = obj.contentHash;
  if (typeof contentHash !== "string" || contentHash.length === 0) {
    throw new Error(
      `missing or empty contentHash (looked in ${kind}; catalog.json usually has no contentHash — prefer manifest.json)`,
    );
  }

  let skillCount = null;
  if (typeof obj.skillCount === "number" && Number.isFinite(obj.skillCount)) {
    skillCount = obj.skillCount;
  } else if (Array.isArray(obj.skills)) {
    skillCount = obj.skills.length;
  }

  return { contentHash, skillCount };
}

function main() {
  /** @type {{ id: string, relFile: string, contentHash: string, skillCount: number | null }[]} */
  const rows = [];
  /** @type {string[]} */
  const errors = [];

  for (const surface of SURFACES) {
    const dirAbs = resolve(ROOT, surface.dir);
    const file = resolveSnapshotFile(dirAbs);
    if (!file) {
      errors.push(
        `[${surface.id}] missing both manifest.json and catalog.json under ${surface.dir}`,
      );
      continue;
    }
    const relFile = join(surface.dir, file.kind === "manifest" ? "manifest.json" : "catalog.json");
    try {
      const meta = extractMeta(readJson(file.path), file.kind);
      rows.push({
        id: surface.id,
        relFile,
        contentHash: meta.contentHash,
        skillCount: meta.skillCount,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`[${surface.id}] ${relFile}: ${msg}`);
    }
  }

  if (errors.length > 0) {
    console.error("catalog-hash: FAIL — could not load snapshot metadata:");
    for (const e of errors) console.error(`  ${e}`);
    if (rows.length > 0) {
      console.error("partial reads:");
      for (const r of rows) {
        console.error(
          `  ${r.id} ${r.relFile} contentHash=${r.contentHash} skillCount=${r.skillCount ?? "n/a"}`,
        );
      }
    }
    console.error(
      "hint: run `pnpm catalog:sync-web` then re-check (release path requires sync before publish).",
    );
    process.exit(1);
  }

  if (rows.length < 2) {
    console.error(
      `catalog-hash: FAIL — need at least 2 surfaces to compare, got ${rows.length}`,
    );
    process.exit(1);
  }

  const baseline = rows[0];
  let mismatch = false;

  for (const r of rows) {
    if (r.contentHash !== baseline.contentHash) {
      mismatch = true;
    }
    if (
      r.skillCount != null &&
      baseline.skillCount != null &&
      r.skillCount !== baseline.skillCount
    ) {
      mismatch = true;
    }
  }

  console.log("catalog-hash: surfaces");
  for (const r of rows) {
    console.log(
      `  ${r.id.padEnd(4)} ${r.relFile}  contentHash=${r.contentHash}  skillCount=${r.skillCount ?? "n/a"}`,
    );
  }

  if (mismatch) {
    console.error("catalog-hash: FAIL — contentHash and/or skillCount mismatch across surfaces");
    console.error(
      "hint: run `pnpm catalog:sync-web` (materialize + catalog build) before publish, then `pnpm catalog:check-hash`.",
    );
    process.exit(1);
  }

  console.log(
    `catalog-hash: OK — ${rows.length} surfaces match contentHash=${baseline.contentHash}` +
      (baseline.skillCount != null ? ` skillCount=${baseline.skillCount}` : ""),
  );
  process.exit(0);
}

main();
