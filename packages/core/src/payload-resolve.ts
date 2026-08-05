/**
 * PayloadResolve — single seam for catalog / skill-body / install path ladders (SPE 35).
 *
 * Policy modes (domain semantics; implementation lives only here):
 * - catalog  — search / list / bundle expand
 * - body     — get-skill / read SKILL.md (no remote download)
 * - install  — runInstall write source (SPE 33 order: local → remote → package snapshot)
 *
 * SPE 33 install order (iron rule):
 * 1. OPENWISDOM_SKILLS_ROOT / monorepo skills/ via locateSkillDir
 * 2. remote: ensureRemoteSkillDir (fail-open)
 * 3. package skills-snapshot/
 *
 * Catalog order (fail-open where noted):
 * 1. explicit catalogPath
 * 2. monorepo / skills root local (unless preferRegistryCache) → package snapshot or scan
 * 3. registry disk cache (unless NO_REMOTE)
 * 4. package catalog-snapshot
 * 5. scan
 *
 * Body order: env → monorepo → package skills-snapshot (no forced remote).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  catalogIndexSchema,
  inferScopeAndLayer,
  type CatalogIndex,
  type CatalogSkill,
} from "@openwisdom/schema";
import { parseSkillMarkdown } from "./frontmatter.js";
import {
  catalogSnapshotPath,
  findMonorepoRoot,
  getPackageRoot,
  looksLikeSkillsTree,
  skillsSnapshotPath,
} from "./paths.js";
import {
  defaultRegistryCacheDir,
  ensureRemoteCatalog,
  ensureRemoteSkillDir,
  isRemoteDisabled,
  loadCachedCatalog,
  loadPayloadIndex,
  type RegistryResolveOpts,
} from "./registry.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CatalogSource = "snapshot" | "scan" | "cache" | "remote-cache";

export type LoadedCatalog = {
  index: CatalogIndex;
  source: CatalogSource;
  path?: string;
};

export type PayloadResolveBaseOpts = {
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  packageRoot?: string;
  /** import.meta.url for host package when bundled (MCP/CLI) */
  fromUrl?: string;
};

export type LoadCatalogOpts = PayloadResolveBaseOpts & {
  /** Absolute path to catalog.json; overrides packageRoot snapshot resolution */
  catalogPath?: string;
  skillsRoot?: string;
  /** Prefer remote disk cache even inside monorepo (tests / force) */
  preferRegistryCache?: boolean;
  /** Registry cache directory override */
  registryCacheDir?: string;
};

export type ResolveSkillsTreeRootOpts = PayloadResolveBaseOpts;

export type ResolveSkillPayloadDirOpts = PayloadResolveBaseOpts & {
  skillId: string;
  catalog: CatalogIndex;
  skillsRoot?: string;
  registry?: RegistryResolveOpts;
};

export type EnsureCatalogForUseOpts = LoadCatalogOpts & {
  /** Skip remote catalog refresh */
  noRemote?: boolean;
  registry?: string;
  forceRegistryRefresh?: boolean;
  fetchImpl?: typeof fetch;
  onLog?: (level: "info" | "warn" | "error", message: string) => void;
};

// ─── Shared helpers ──────────────────────────────────────────────────────────

function resolvePackageRoot(opts?: PayloadResolveBaseOpts): string {
  return opts?.packageRoot ?? getPackageRoot(opts?.fromUrl);
}

function tryLoadSnapshot(snapshotPath: string): LoadedCatalog | null {
  if (!existsSync(snapshotPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(snapshotPath, "utf8"));
    const index = catalogIndexSchema.parse(raw);
    return { index, source: "snapshot", path: snapshotPath };
  } catch {
    // Library default: silent on invalid snapshot (callers use onLog via ensure*).
    return null;
  }
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function updatedFromMtime(filePath: string): string {
  try {
    const mtime = statSync(filePath).mtime;
    return mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// ─── locateSkillDir (install / body) ─────────────────────────────────────────

/**
 * Find skill directory by id under skills root.
 * Prefer exact folder name match under any depth: .../id/SKILL.md
 */
export function locateSkillDir(skillsRoot: string, skillId: string): string {
  if (
    skillId.includes("..") ||
    skillId.includes("/") ||
    skillId.includes("\\") ||
    path.isAbsolute(skillId)
  ) {
    throw new Error(`Invalid skill id (path traversal rejected): ${skillId}`);
  }

  const found = walkForSkill(skillsRoot, skillId);
  if (!found) {
    throw new Error(
      `Skill not found under skills root: ${skillId} (root=${skillsRoot})`,
    );
  }
  return found;
}

function walkForSkill(dir: string, skillId: string, depth = 0): string | null {
  if (depth > 10) return null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.name === skillId) {
      const skillMd = path.join(full, "SKILL.md");
      if (existsSync(skillMd)) return full;
    }
    const nested = walkForSkill(full, skillId, depth + 1);
    if (nested) return nested;
  }
  return null;
}

// ─── Body policy ─────────────────────────────────────────────────────────────

/**
 * Body policy: skills tree root for reading SKILL.md (get-skill).
 * Order: OPENWISDOM_SKILLS_ROOT → monorepo skills/ → package skills-snapshot.
 * Does not force remote download (SPE 35).
 *
 * @alias resolveSkillsRoot (public name kept on skills-root thin wrapper)
 */
export function resolveSkillsTreeRoot(
  opts?: ResolveSkillsTreeRootOpts,
): string {
  const env = opts?.env ?? process.env;
  const cwd = opts?.cwd ?? process.cwd();

  const fromEnv = env.OPENWISDOM_SKILLS_ROOT?.trim();
  if (fromEnv) {
    const resolved = path.resolve(fromEnv);
    if (!existsSync(resolved)) {
      throw new Error(
        `OPENWISDOM_SKILLS_ROOT does not exist: ${resolved}`,
      );
    }
    return resolved;
  }

  const mono = findMonorepoRoot(cwd);
  if (mono) {
    const skills = path.join(mono, "skills");
    if (existsSync(skills) && looksLikeSkillsTree(skills)) return skills;
  }

  // Package skills-snapshot (npm publish payload / offline install)
  const rootsToTry: string[] = [];
  if (opts?.packageRoot) {
    rootsToTry.push(path.resolve(opts.packageRoot));
  } else {
    try {
      rootsToTry.push(getPackageRoot(opts?.fromUrl));
    } catch {
      /* ignore */
    }
  }

  const seen = new Set<string>();
  for (const root of rootsToTry) {
    const key = path.normalize(root);
    if (seen.has(key)) continue;
    seen.add(key);
    const snap = skillsSnapshotPath(root);
    if (looksLikeSkillsTree(snap)) return snap;
  }

  throw new Error(
    [
      "Cannot locate skills payload source.",
      "Tried, in order:",
      "1) OPENWISDOM_SKILLS_ROOT env",
      "2) monorepo skills/ (checkout with skills/official)",
      "3) package skills-snapshot/ next to openwisdom / openwisdom-mcp / @openwisdom/core",
      "Set OPENWISDOM_SKILLS_ROOT to a skills/ tree, run from an Openwisdom checkout,",
      "or install a package build that includes skills-snapshot.",
    ].join(" "),
  );
}

// ─── Install policy ──────────────────────────────────────────────────────────

/**
 * Install policy: on-disk skill directory for runInstall (SPE 33).
 * 1) OPENWISDOM_SKILLS_ROOT / monorepo skills/ only (not package snapshot)
 * 2) remote registry download into cache
 * 3) package skills-snapshot (offline fallback)
 *
 * @alias resolveInstallSourceDir (public name kept on install thin wrapper)
 */
export async function resolveSkillPayloadDir(
  opts: ResolveSkillPayloadDirOpts,
): Promise<string> {
  const skillId = opts.skillId;
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const localRoots: string[] = [];

  if (opts.skillsRoot) localRoots.push(opts.skillsRoot);

  const fromEnv = env.OPENWISDOM_SKILLS_ROOT?.trim();
  if (fromEnv) localRoots.push(path.resolve(fromEnv));

  const mono = findMonorepoRoot(cwd);
  if (mono) {
    const skills = path.join(mono, "skills");
    if (existsSync(skills)) localRoots.push(skills);
  }

  const tried = new Set<string>();
  for (const root of localRoots) {
    const key = path.normalize(root);
    if (tried.has(key) || !existsSync(root)) continue;
    tried.add(key);
    try {
      return locateSkillDir(root, skillId);
    } catch {
      /* try next */
    }
  }

  const entry =
    opts.catalog.skills.find((s) => s.id === skillId || s.name === skillId) ??
    null;
  if (entry && opts.registry) {
    // Prefer remote over package snapshot so content deploys beat stale npm payloads
    const dir = await ensureRemoteSkillDir(entry, {
      ...opts.registry,
      forceRefresh: opts.registry.forceRefresh,
      payloadIndex: loadPayloadIndex(opts.registry.cacheDir),
    });
    if (dir) return dir;
  }

  const pkg = opts.packageRoot ?? getPackageRoot(opts.fromUrl);
  const snap = skillsSnapshotPath(pkg);
  if (existsSync(snap)) {
    try {
      return locateSkillDir(snap, skillId);
    } catch {
      /* fall through */
    }
  }

  throw new Error(
    `Skill not found locally or via registry: ${skillId}. Try openwisdom update --refresh-only or set OPENWISDOM_SKILLS_ROOT.`,
  );
}

// ─── Catalog policy ──────────────────────────────────────────────────────────

/**
 * Catalog policy: load catalog index (SPE 33 / SPE 35).
 * Fail-open path prefers local monorepo truth, then remote cache, then snapshots, then scan.
 */
export function loadCatalog(opts?: LoadCatalogOpts): LoadedCatalog {
  const env = opts?.env ?? process.env;
  const cwd = opts?.cwd ?? process.cwd();
  const packageRoot = resolvePackageRoot(opts);

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
      skillsRoot = resolveSkillsTreeRoot({
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

/**
 * Best-effort remote catalog refresh, then loadCatalog policy.
 * Remote failures never throw (ensure* style).
 */
export async function ensureCatalogForUse(
  opts?: EnsureCatalogForUseOpts,
): Promise<LoadedCatalog> {
  const env = { ...(opts?.env ?? process.env) };
  if (opts?.noRemote) env.OPENWISDOM_NO_REMOTE = "1";

  if (!opts?.noRemote && !isRemoteDisabled(env)) {
    await ensureRemoteCatalog({
      env,
      registry: opts?.registry,
      forceRefresh: opts?.forceRegistryRefresh,
      cacheDir: opts?.registryCacheDir,
      fetchImpl: opts?.fetchImpl,
      onLog: opts?.onLog,
    });
  }

  return loadCatalog({
    ...opts,
    env,
  });
}

// ─── Runtime skill scan (SPE 38: shared scope/layer + mtime updated) ──────────

/** Walk skills root and build catalog entries from SKILL.md frontmatter. */
export function scanSkillsToCatalog(skillsRoot: string): CatalogSkill[] {
  const out: CatalogSkill[] = [];
  walkSkillDirs(skillsRoot, (skillDir, relPosix) => {
    const skillMd = path.join(skillDir, "SKILL.md");
    if (!existsSync(skillMd)) return;
    try {
      const raw = readFileSync(skillMd, "utf8");
      const fm = parseSkillMarkdown(raw);
      const inferred = inferScopeAndLayer(relPosix);
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
        updated: updatedFromMtime(skillMd),
        repoPath: toPosix(path.join("skills", relPosix)),
        references: fm.references,
        install: { cli: `npx openwisdom install ${id}` },
      };
      if (fm.pipeline) {
        entry.pipeline = fm.pipeline;
      }
      out.push(entry);
    } catch {
      // Skip unreadable / invalid SKILL.md; library default is silent (no console).
    }
  });
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
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
