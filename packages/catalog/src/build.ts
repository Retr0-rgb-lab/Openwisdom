#!/usr/bin/env node
/**
 * Scan skills/ tree for SKILL.md; emit catalog.json + manifest.json.
 * Writes to packages/catalog/dist, packages/{cli,core,mcp}/catalog-snapshot,
 * apps/web/public/registry. Also copies skills/ → packages/{cli,core,mcp}/skills-snapshot
 * so install works without a monorepo checkout (Plan 03).
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
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import {
  assertNameMatchesDir,
  catalogIndexSchema,
  parseSkillFrontmatter,
  type CatalogBundle,
  type CatalogIndex,
  type CatalogSkill,
} from "@openwisdom/schema";

const CLI_MIN_VERSION = "0.1.0";
const SCHEMA_VERSION = 1 as const;

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
function findSkillMdFiles(skillsRoot: string): string[] {
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

/**
 * Infer scope + layer from repo-relative posix path:
 * skills/{official|community}/{scenarios|references}/...
 */
function inferScopeAndLayer(repoPathPosix: string): {
  scope?: "official" | "community";
  layer?: "scenario" | "reference";
} {
  const parts = repoPathPosix.split("/").filter(Boolean);
  // skills / scope / kind / name...
  if (parts[0] !== "skills") return {};
  const scopePart = parts[1];
  const kindPart = parts[2];
  const scope =
    scopePart === "official" || scopePart === "community"
      ? scopePart
      : undefined;
  const layer =
    kindPart === "scenarios"
      ? "scenario"
      : kindPart === "references"
        ? "reference"
        : undefined;
  return { scope, layer };
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

/** Stable sha256 of skills payload (excludes volatile `updated`). */
function contentHash(skills: CatalogSkill[]): string {
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
    }));
  const hex = createHash("sha256")
    .update(JSON.stringify(canonical), "utf8")
    .digest("hex");
  return `sha256-${hex}`;
}

/**
 * Emit official bundles; warn (not fail) when skillIds missing during partial land.
 * When every declared id is present, still emit; missing ids stay listed for install
 * expansion once skills land (Spec 33 partial-land soft rule).
 */
function resolveBundles(
  skillIds: Set<string>,
  declared: CatalogBundle[],
): CatalogBundle[] {
  const out: CatalogBundle[] = [];
  for (const bundle of declared) {
    const missing = bundle.skillIds.filter((id) => !skillIds.has(id));
    if (missing.length > 0) {
      console.warn(
        `[@openwisdom/catalog] warn: bundle "${bundle.id}" missing skill(s): ${missing.join(", ")} (partial land — still emitting)`,
      );
    }
    out.push(bundle);
  }
  return out;
}

function skillDirName(skillMdPath: string): string {
  return dirname(skillMdPath).split(sep).pop() ?? "";
}

function buildSkillEntry(
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
/** List relative files under a skill directory (for remote install payload-index). */
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

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const monorepoRoot = findMonorepoRoot([process.cwd(), here]);
  const skillsRoot = join(monorepoRoot, "skills");

  if (!existsSync(skillsRoot)) {
    console.error(
      `[@openwisdom/catalog] skills/ not found at ${skillsRoot} — refusing empty catalog`,
    );
    process.exit(1);
  }

  const skillFiles = findSkillMdFiles(skillsRoot);
  if (skillFiles.length === 0) {
    console.error(
      "[@openwisdom/catalog] no SKILL.md under skills/ — refusing empty catalog",
    );
    process.exit(1);
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

  const bundles = resolveBundles(seenIds, OFFICIAL_BUNDLES);

  const catalog: CatalogIndex = catalogIndexSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    skills,
    bundles,
  });

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    gitSha: gitSha(monorepoRoot),
    contentHash: contentHash(catalog.skills),
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

  // Spec 24 + Plan 03: dual-write snapshots for CLI + core + MCP; keep web registry.
  const catalogTargets = [
    join(monorepoRoot, "packages/catalog/dist"),
    join(monorepoRoot, "packages/cli/catalog-snapshot"),
    join(monorepoRoot, "packages/core/catalog-snapshot"),
    join(monorepoRoot, "packages/mcp/catalog-snapshot"),
    join(monorepoRoot, "apps/web/public/registry"),
  ];

  for (const dir of catalogTargets) {
    writeJson(join(dir, "catalog.json"), catalog);
    writeJson(join(dir, "manifest.json"), manifest);
    writeJson(join(dir, "payload-index.json"), payloadIndex);
  }

  // Skills payload for offline install (no monorepo skills/ checkout).
  syncSkillsSnapshot(skillsRoot, monorepoRoot, [
    "packages/core",
    "packages/cli",
    "packages/mcp",
  ]);

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

main();
