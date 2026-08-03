/**
 * Catalog index load order (SPE 33 / Plan 06):
 * 1. explicit catalogPath
 * 2. monorepo / OPENWISDOM_SKILLS_ROOT → package snapshot or scan (local truth)
 * 3. disk cache from remote registry (after ensureRemoteCatalog)
 * 4. package catalog-snapshot
 * 5. scan skills tree
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  catalogIndexSchema,
  type CatalogIndex,
  type CatalogSkill,
} from "@openwisdom/schema";
import {
  catalogSnapshotPath,
  findMonorepoRoot,
  getPackageRoot,
  looksLikeSkillsTree,
} from "./paths.js";
import { parseSkillMarkdown } from "./frontmatter.js";
import { resolveSkillsRoot } from "./skills-root.js";
import {
  defaultRegistryCacheDir,
  isRemoteDisabled,
  loadCachedCatalog,
} from "./registry.js";

export type CatalogSource = "snapshot" | "scan" | "cache" | "remote-cache";

export type LoadedCatalog = {
  index: CatalogIndex;
  source: CatalogSource;
  path?: string;
};

function tryLoadSnapshot(snapshotPath: string): LoadedCatalog | null {
  if (!existsSync(snapshotPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(snapshotPath, "utf8"));
    const index = catalogIndexSchema.parse(raw);
    return { index, source: "snapshot", path: snapshotPath };
  } catch (err) {
    console.error(
      `warn: catalog snapshot invalid (${snapshotPath}): ${err instanceof Error ? err.message : err}`,
    );
    return null;
  }
}

export function loadCatalog(opts?: {
  packageRoot?: string;
  /** Absolute path to catalog.json; overrides packageRoot snapshot resolution */
  catalogPath?: string;
  skillsRoot?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /** import.meta.url for host package when bundled (MCP/CLI) */
  fromUrl?: string;
  /** Prefer remote disk cache even inside monorepo (tests / force) */
  preferRegistryCache?: boolean;
  /** Registry cache directory override */
  registryCacheDir?: string;
}): LoadedCatalog {
  const env = opts?.env ?? process.env;
  const cwd = opts?.cwd ?? process.cwd();
  const packageRoot =
    opts?.packageRoot ?? getPackageRoot(opts?.fromUrl);

  // 1) Explicit path
  if (opts?.catalogPath) {
    const hit = tryLoadSnapshot(opts.catalogPath);
    if (hit) return hit;
    throw new Error(`catalogPath not loadable: ${opts.catalogPath}`);
  }

  const mono = findMonorepoRoot(cwd);
  const localSkills =
    opts?.skillsRoot ||
    (env.OPENWISDOM_SKILLS_ROOT?.trim()
      ? path.resolve(env.OPENWISDOM_SKILLS_ROOT.trim())
      : mono && existsSync(path.join(mono, "skills"))
        ? path.join(mono, "skills")
        : null);

  // 2) Local monorepo / skills root: package snapshot next to host, else scan
  const preferLocal =
    !opts?.preferRegistryCache &&
    localSkills &&
    existsSync(localSkills) &&
    looksLikeSkillsTree(localSkills);

  if (preferLocal) {
    const snap = tryLoadSnapshot(catalogSnapshotPath(packageRoot));
    if (snap) return snap;
    const skills = scanSkillsToCatalog(localSkills);
    return {
      index: { schemaVersion: 1, skills },
      source: "scan",
      path: localSkills,
    };
  }

  // 3) Registry disk cache (filled by ensureRemoteCatalog)
  if (!isRemoteDisabled(env)) {
    const cached = loadCachedCatalog(
      opts?.registryCacheDir ?? defaultRegistryCacheDir(),
    );
    if (cached) {
      return {
        index: cached.index,
        source: "remote-cache",
        path: cached.path,
      };
    }
  }

  // 4) Package snapshot
  const snapshot = catalogSnapshotPath(packageRoot);
  const snapHit = tryLoadSnapshot(snapshot);
  if (snapHit) return snapHit;

  // 5) Scan any resolvable skills root
  let skillsRoot = opts?.skillsRoot;
  if (!skillsRoot) {
    try {
      skillsRoot = resolveSkillsRoot({
        env,
        cwd,
        packageRoot,
        fromUrl: opts?.fromUrl,
      });
    } catch {
      if (mono && existsSync(path.join(mono, "skills"))) {
        skillsRoot = path.join(mono, "skills");
      }
    }
  }

  if (!skillsRoot || !existsSync(skillsRoot)) {
    throw new Error(
      [
        "No catalog snapshot, registry cache, or skills tree to scan.",
        `Expected snapshot at ${snapshot},`,
        "or set OPENWISDOM_SKILLS_ROOT / run inside monorepo with skills/,",
        "or refresh remote registry (OPENWISDOM_REGISTRY),",
        "or install a package build with catalog-snapshot + skills-snapshot.",
      ].join(" "),
    );
  }

  const skills = scanSkillsToCatalog(skillsRoot);
  return {
    index: { schemaVersion: 1, skills },
    source: "scan",
    path: skillsRoot,
  };
}

/** Walk skills root and build catalog entries from SKILL.md frontmatter. */
export function scanSkillsToCatalog(skillsRoot: string): CatalogSkill[] {
  const out: CatalogSkill[] = [];
  walkSkillDirs(skillsRoot, (skillDir, relPosix) => {
    const skillMd = path.join(skillDir, "SKILL.md");
    if (!existsSync(skillMd)) return;
    try {
      const raw = readFileSync(skillMd, "utf8");
      const fm = parseSkillMarkdown(raw);
      const inferred = inferScopeLayer(relPosix);
      const id = fm.id ?? fm.name;
      const entry: CatalogSkill = {
        id,
        name: fm.name,
        description: fm.description,
        layer: fm.layer ?? inferred.layer ?? "scenario",
        scope: fm.scope ?? inferred.scope ?? "community",
        disciplines: fm.disciplines ?? [],
        language: fm.language ?? "en",
        tags: fm.tags ?? [],
        version: fm.version ?? "0.0.0",
        updated: "1970-01-01",
        repoPath: toPosix(path.join("skills", relPosix)),
        references: fm.references,
        install: { cli: `npx openwisdom install ${id}` },
      };
      if (fm.pipeline) {
        entry.pipeline = fm.pipeline;
      }
      out.push(entry);
    } catch (err) {
      console.error(
        `warn: skip skill at ${skillDir}: ${err instanceof Error ? err.message : err}`,
      );
    }
  });
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function inferScopeLayer(relPosix: string): {
  scope?: "official" | "community";
  layer?: "scenario" | "reference";
} {
  const parts = relPosix.split("/").filter(Boolean);
  const scope = parts.includes("official")
    ? "official"
    : parts.includes("community")
      ? "community"
      : undefined;
  const layer = parts.includes("scenarios")
    ? "scenario"
    : parts.includes("references")
      ? "reference"
      : undefined;
  return { scope, layer };
}

function walkSkillDirs(
  root: string,
  visit: (skillDir: string, relPosix: string) => void,
  base = root,
  depth = 0,
): void {
  if (depth > 12) return;
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name.startsWith(".")) continue;
    const full = path.join(root, ent.name);
    const skillMd = path.join(full, "SKILL.md");
    if (existsSync(skillMd)) {
      const rel = path.relative(base, full);
      visit(full, toPosix(rel));
      continue;
    }
    walkSkillDirs(full, visit, base, depth + 1);
  }
}

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
