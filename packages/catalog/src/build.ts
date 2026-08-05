#!/usr/bin/env node
/**
 * Scan skills/ tree for SKILL.md; emit catalog.json + manifest.json + payload-index.
 *
 * Artifact fan-out (SPE 36):
 * - packages/catalog/dist          — build intermediate
 * - packages/cli/{catalog,skills}-snapshot  — npm `openwisdom` offline
 * - packages/mcp/{catalog,skills}-snapshot  — npm `openwisdom-mcp` offline
 * - apps/web/public/registry (+ skills/**)  — SPE 33 CDN remote face
 *
 * Does NOT write packages/core/*-snapshot (core is private; CLI/MCP host
 * packageRoot carries offline payload at runtime).
 */
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import {
  SCHEMA_VERSION,
  assertNameMatchesDir,
  catalogIndexSchema,
  inferScopeAndLayer,
  parseSkillFrontmatter,
  type CatalogBundle,
  type CatalogIndex,
  type CatalogSkill,
} from "@openwisdom/schema";

const CLI_MIN_VERSION = "0.1.0";

/**
 * Official catalog bundles (Spec 33 §5.6).
 * Truth lives here + catalog.json — never hardcode in CLI/MCP only.
 */
const OFFICIAL_BUNDLES: CatalogBundle[] = [
  {
    id: "orientation-handoff",
    title: "Orientation handoff",
    description: "Agency levels → ownership → analysis closure",
    skillIds: [
      "responsibility-scope",
      "responsibility-bridge",
      "analysis-closure",
    ],
  },
];

function findMonorepoRoot(starts: string[]): string {
  for (const start of starts) {
    let dir = resolve(start);
    for (;;) {
      if (
        existsSync(join(dir, "pnpm-workspace.yaml")) ||
        existsSync(join(dir, "skills"))
      ) {
        return dir;
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  throw new Error(
    "Could not find monorepo root (no pnpm-workspace.yaml or skills/ when walking up)",
  );
}

function toPosix(p: string): string {
  return p.split(sep).join("/");
}

/** Recursively collect absolute paths to SKILL.md under skillsRoot. */
export function findSkillMdFiles(skillsRoot: string): string[] {
  const results: string[] = [];

  function walk(dir: string): void {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name === "node_modules" || ent.name === ".git") continue;
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && ent.name === "SKILL.md") {
        results.push(full);
      }
    }
  }

  if (existsSync(skillsRoot)) {
    walk(skillsRoot);
  }
  return results;
}

function gitSha(root: string): string {
  try {
    return execSync("git rev-parse HEAD", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function updatedFromMtime(filePath: string): string {
  try {
    const mtime = statSync(filePath).mtime;
    return mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** List relative files under a skill directory (for payload-index + contentHash). */
function listSkillRelativeFiles(skillDir: string): string[] {
  const out: string[] = [];
  function walk(dir: string, prefix: string): void {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name === "node_modules" || ent.name === ".git" || ent.name === ".DS_Store") {
        continue;
      }
      const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
      const full = join(dir, ent.name);
      if (ent.isDirectory()) walk(full, rel);
      else if (ent.isFile()) out.push(rel.replace(/\\/g, "/"));
    }
  }
  walk(skillDir, "");
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

/**
 * Stable digest of skill tree files under monorepoRoot/skill.repoPath.
 * Sorted relative paths + binary contents; body-only edits change this.
 */
export function skillPayloadDigest(
  monorepoRoot: string,
  skill: CatalogSkill,
): string {
  const skillDir = join(
    monorepoRoot,
    ...skill.repoPath.replace(/\\/g, "/").split("/").filter(Boolean),
  );
  const files = existsSync(skillDir)
    ? listSkillRelativeFiles(skillDir)
    : [];
  const h = createHash("sha256");
  if (files.length === 0) {
    // Missing tree: still incorporate id/path so hash is defined
    h.update(`missing:${skill.repoPath}\n`, "utf8");
    return h.digest("hex");
  }
  for (const rel of files) {
    h.update(rel, "utf8");
    h.update("\0");
    const abs = join(skillDir, ...rel.split("/").filter(Boolean));
    try {
      h.update(readFileSync(abs));
    } catch {
      h.update(`unreadable:${rel}`, "utf8");
    }
    h.update("\0");
  }
  return h.digest("hex");
}

/**
 * Stable sha256 of skills metadata + per-skill payload digests
 * (excludes volatile `updated`). Body/asset drift changes the hash.
 */
export function contentHash(
  skills: CatalogSkill[],
  monorepoRoot: string,
): string {
  const canonical = [...skills]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      layer: s.layer,
      scope: s.scope,
      disciplines: s.disciplines,
      language: s.language,
      tags: s.tags,
      version: s.version,
      repoPath: s.repoPath,
      references: s.references ?? null,
      pipeline: s.pipeline ?? null,
      install: s.install,
      payloadDigest: skillPayloadDigest(monorepoRoot, s),
    }));
  const hex = createHash("sha256")
    .update(JSON.stringify(canonical), "utf8")
    .digest("hex");
  return `sha256-${hex}`;
}

/**
 * Emit official bundles; hard-fail when any skillIds are missing from the catalog.
 * Ship path must not emit broken bundles.
 */
export function resolveBundles(
  skillIds: Set<string>,
  declared: CatalogBundle[],
): CatalogBundle[] {
  const out: CatalogBundle[] = [];
  for (const bundle of declared) {
    const missing = bundle.skillIds.filter((id) => !skillIds.has(id));
    if (missing.length > 0) {
      throw new Error(
        `bundle "${bundle.id}" missing skill(s): ${missing.join(", ")}`,
      );
    }
    out.push(bundle);
  }
  return out;
}

/**
 * Hard-fail when any skill.references[] entry points at a missing skill id.
 */
export function assertReferencesExist(
  skills: CatalogSkill[],
  skillIds: Set<string>,
): void {
  for (const s of skills) {
    if (!s.references?.length) continue;
    const missing = s.references.filter((id) => !skillIds.has(id));
    if (missing.length > 0) {
      throw new Error(
        `skill "${s.id}" references missing skill id(s): ${missing.join(", ")}`,
      );
    }
  }
}

/**
 * Compare contentHash strings from dual-write targets; throw if any differ.
 * Parity helper for ship/CI (scripts/check-catalog-hash can reuse the idea).
 */
export function assertContentHashParity(
  entries: ReadonlyArray<{ label: string; contentHash: string }>,
): void {
  if (entries.length === 0) {
    throw new Error("assertContentHashParity: no manifests provided");
  }
  const first = entries[0]!;
  for (const e of entries) {
    if (e.contentHash !== first.contentHash) {
      throw new Error(
        `contentHash mismatch: ${first.label}=${first.contentHash} vs ${e.label}=${e.contentHash}`,
      );
    }
  }
}

function skillDirName(skillMdPath: string): string {
  return dirname(skillMdPath).split(sep).pop() ?? "";
}

export function buildSkillEntry(
  skillMdPath: string,
  monorepoRoot: string,
): CatalogSkill {
  const raw = readFileSync(skillMdPath, "utf8");
  const { data } = matter(raw);
  const fm = parseSkillFrontmatter(data);

  const dirName = skillDirName(skillMdPath);
  assertNameMatchesDir(fm.name, dirName);

  const skillDir = dirname(skillMdPath);
  const repoPath = toPosix(relative(monorepoRoot, skillDir));
  const inferred = inferScopeAndLayer(repoPath);

  const layer = fm.layer ?? inferred.layer;
  const scope = fm.scope ?? inferred.scope;
  if (!layer || !scope) {
    throw new Error(
      `Cannot resolve layer/scope for ${repoPath} (frontmatter missing and path not under skills/{official|community}/{scenarios|references}/)`,
    );
  }

  const id = fm.id;
  const entry: CatalogSkill = {
    id,
    name: fm.name,
    description: fm.description,
    layer,
    scope,
    disciplines: fm.disciplines ?? [],
    language: fm.language ?? "en",
    tags: fm.tags ?? [],
    version: fm.version ?? "0.1.0",
    updated: updatedFromMtime(skillMdPath),
    repoPath,
    install: {
      cli: `npx openwisdom install ${id}`,
    },
  };

  if (fm.references && fm.references.length > 0) {
    entry.references = fm.references;
  }

  // Spec 33: optional pipeline from frontmatter (or metadata.pipeline via parse transform)
  if (fm.pipeline) {
    entry.pipeline = fm.pipeline;
  }

  return entry;
}

function writeJson(filePath: string, value: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/**
 * Mirror monorepo skills/ into package skills-snapshot/ (install payload).
 * Prefer full tree; at minimum official/ is required for offline install.
 */
function buildPayloadIndex(
  skillsRoot: string,
  skills: CatalogSkill[],
): {
  schemaVersion: number;
  skills: Record<string, { repoPath: string; files: string[] }>;
} {
  const map: Record<string, { repoPath: string; files: string[] }> = {};
  for (const s of skills) {
    // repoPath is relative to monorepo root: skills/community/scenarios/id
    const relUnderSkills = s.repoPath
      .replace(/\\/g, "/")
      .replace(/^skills\/?/, "");
    const skillDir = join(skillsRoot, ...relUnderSkills.split("/").filter(Boolean));
    const files = existsSync(skillDir)
      ? listSkillRelativeFiles(skillDir)
      : ["SKILL.md"];
    map[s.id] = {
      repoPath: s.repoPath.replace(/\\/g, "/"),
      files: files.length ? files : ["SKILL.md"],
    };
  }
  return { schemaVersion: 1, skills: map };
}

/**
 * Mirror skills/ → apps/web/public/registry/skills/ so
 * {registryBase}/skills/community/... serves install payloads (SPE 33).
 */
function stageRegistrySkills(skillsRoot: string, registryDir: string): void {
  const dest = join(registryDir, "skills");
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(registryDir, { recursive: true });
  cpSync(skillsRoot, dest, {
    recursive: true,
    filter: (src) => {
      const base = src.split(sep).pop() ?? "";
      if (base === "node_modules" || base === ".git" || base === ".DS_Store") {
        return false;
      }
      return true;
    },
  });
  console.log(
    `  → ${toPosix(dest)}/ (remote registry skill trees)`,
  );
}

function syncSkillsSnapshot(
  skillsRoot: string,
  monorepoRoot: string,
  packageRelDirs: string[],
): void {
  // Prefer official/ only if full tree is huge later; today copy full skills/.
  const source = skillsRoot;
  if (!existsSync(source)) {
    throw new Error(`skills root missing for snapshot: ${source}`);
  }

  for (const rel of packageRelDirs) {
    const dest = join(monorepoRoot, rel, "skills-snapshot");
    if (existsSync(dest)) {
      rmSync(dest, { recursive: true, force: true });
    }
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(source, dest, {
      recursive: true,
      // skip junk that may appear under skills/
      filter: (src) => {
        const base = src.split(sep).pop() ?? "";
        if (base === "node_modules" || base === ".git" || base === ".DS_Store") {
          return false;
        }
        return true;
      },
    });
    console.log(
      `  → ${toPosix(relative(monorepoRoot, dest))}/ (skills payload)`,
    );
  }
}

/**
 * Scan skills tree and build CatalogSkill entries (no disk dual-write).
 * Throws when skills root missing or empty (SPE 38 test surface).
 */
export function collectCatalogSkills(
  skillsRoot: string,
  monorepoRoot: string,
): CatalogSkill[] {
  if (!existsSync(skillsRoot)) {
    throw new Error(
      `skills/ not found at ${skillsRoot} — refusing empty catalog`,
    );
  }

  const skillFiles = findSkillMdFiles(skillsRoot);
  if (skillFiles.length === 0) {
    throw new Error("no SKILL.md under skills/ — refusing empty catalog");
  }

  const skills: CatalogSkill[] = [];
  const seenIds = new Set<string>();

  for (const file of skillFiles.sort((a, b) => a.localeCompare(b))) {
    const entry = buildSkillEntry(file, monorepoRoot);
    if (seenIds.has(entry.id)) {
      throw new Error(`Duplicate skill id: ${entry.id}`);
    }
    seenIds.add(entry.id);
    skills.push(entry);
  }

  skills.sort((a, b) => a.id.localeCompare(b.id));
  return skills;
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const monorepoRoot = findMonorepoRoot([process.cwd(), here]);
  const skillsRoot = join(monorepoRoot, "skills");

  let skills: CatalogSkill[];
  try {
    skills = collectCatalogSkills(skillsRoot, monorepoRoot);
  } catch (err) {
    console.error(
      `[@openwisdom/catalog] ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }

  const seenIds = new Set(skills.map((s) => s.id));

  try {
    assertReferencesExist(skills, seenIds);
  } catch (err) {
    console.error(
      `[@openwisdom/catalog] ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }

  let bundles: CatalogBundle[];
  try {
    bundles = resolveBundles(seenIds, OFFICIAL_BUNDLES);
  } catch (err) {
    console.error(
      `[@openwisdom/catalog] ${err instanceof Error ? err.message : err}`,
    );
    process.exit(1);
  }

  const catalog: CatalogIndex = catalogIndexSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    skills,
    bundles,
  });

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    gitSha: gitSha(monorepoRoot),
    contentHash: contentHash(catalog.skills, monorepoRoot),
    skillCount: catalog.skills.length,
    cliMinVersion: CLI_MIN_VERSION,
    mcpMinVersion: CLI_MIN_VERSION,
    payload: {
      mode: "per-skill-tree",
      basePath: "skills",
      format: "dir",
    },
  };

  const payloadIndex = buildPayloadIndex(skillsRoot, catalog.skills);

  // SPE 36: published offline = cli + mcp only; remote = web registry; no core copy.
  const catalogTargets = [
    join(monorepoRoot, "packages/catalog/dist"),
    join(monorepoRoot, "packages/cli/catalog-snapshot"),
    join(monorepoRoot, "packages/mcp/catalog-snapshot"),
    join(monorepoRoot, "apps/web/public/registry"),
  ];

  console.log(
    `[@openwisdom/catalog] catalog targets (${catalogTargets.length}):`,
  );
  for (const dir of catalogTargets) {
    writeJson(join(dir, "catalog.json"), catalog);
    writeJson(join(dir, "manifest.json"), manifest);
    writeJson(join(dir, "payload-index.json"), payloadIndex);
  }

  // Skills payload for offline install (published bins only; SPE 36 drops core).
  const skillsSnapshotPackages = ["packages/cli", "packages/mcp"];
  console.log(
    `[@openwisdom/catalog] skills-snapshot packages: ${skillsSnapshotPackages.join(", ")}`,
  );
  syncSkillsSnapshot(skillsRoot, monorepoRoot, skillsSnapshotPackages);

  // SPE 33: static remote registry skill trees on the web app
  stageRegistrySkills(skillsRoot, join(monorepoRoot, "apps/web/public/registry"));

  const ids = catalog.skills.map((s) => s.id).join(", ");
  console.log(
    `[@openwisdom/catalog] wrote ${catalog.skills.length} skill(s) [${ids}]`,
  );
  console.log(`  contentHash=${manifest.contentHash}`);
  console.log(`  gitSha=${manifest.gitSha}`);
  for (const dir of catalogTargets) {
    console.log(`  → ${toPosix(relative(monorepoRoot, dir))}/`);
  }
}

/** Run only when executed as CLI entry (not when imported by tests). */
const isDirectRun = (() => {
  try {
    const entry = process.argv[1];
    if (!entry) return false;
    return import.meta.url === pathToFileURL(resolve(entry)).href;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  main();
}
