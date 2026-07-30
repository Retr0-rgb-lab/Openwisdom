/**
 * Read a single installable skill: catalog row + optional SKILL.md body (Spec 31).
 * Read-only; does not modify skills tree or catalog.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CatalogSkill } from "@openwisdom/schema";
import { loadCatalog } from "./catalog.js";
import { getCatalogSkill, RuntimeError, UsageError } from "./install.js";
import { resolveSkillsRoot, locateSkillDir } from "./skills-root.js";

export type GetSkillDetailOpts = {
  skill: string;
  /** Default true */
  includeBody?: boolean;
  /** Default 32000; over-long body truncated with truncated: true */
  maxBodyChars?: number;
  packageRoot?: string;
  skillsRoot?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  fromUrl?: string;
  /** Absolute catalog.json path override */
  catalogPath?: string;
};

export type SkillDetail = {
  ok: true;
  installable: true;
  catalogSource: "snapshot" | "scan";
  skill: CatalogSkill;
  body?: {
    /** Relative repoPath/SKILL.md when available, else absolute display path */
    path: string;
    content: string;
    truncated: boolean;
    chars: number;
  };
};

const DEFAULT_MAX_BODY_CHARS = 32_000;

export function getSkillDetail(opts: GetSkillDetailOpts): SkillDetail {
  const skillId = opts.skill?.trim() ?? "";
  if (!skillId) {
    throw new UsageError(
      'Missing skill id. Pass skill: "macro-scan" (use openwisdom_search / openwisdom_list to discover ids).',
    );
  }

  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const includeBody = opts.includeBody !== false;

  let loaded;
  try {
    loaded = loadCatalog({
      packageRoot: opts.packageRoot,
      catalogPath: opts.catalogPath,
      skillsRoot: opts.skillsRoot,
      cwd,
      env,
      fromUrl: opts.fromUrl,
    });
  } catch (err) {
    throw new RuntimeError(
      err instanceof Error
        ? err.message
        : "Failed to load catalog for getSkillDetail.",
    );
  }

  const entry = getCatalogSkill(loaded.index, skillId);
  if (!entry) {
    throw new UsageError(
      `Unknown skill: ${skillId}. Use openwisdom_search or openwisdom_list to find installable ids.`,
    );
  }

  if (!includeBody) {
    return {
      ok: true,
      installable: true,
      catalogSource: loaded.source,
      skill: entry,
    };
  }

  let skillsRoot: string;
  if (opts.skillsRoot) {
    skillsRoot = opts.skillsRoot;
  } else {
    try {
      skillsRoot = resolveSkillsRoot({
        env,
        cwd,
        packageRoot: opts.packageRoot,
        fromUrl: opts.fromUrl,
      });
    } catch (err) {
      throw new RuntimeError(
        err instanceof Error
          ? err.message
          : "Cannot locate skills payload source for getSkillDetail.",
      );
    }
  }

  let sourceDir: string;
  try {
    sourceDir = locateSkillDir(skillsRoot, entry.id);
  } catch (err) {
    // Fall back to name if id folder differs (should be rare)
    try {
      sourceDir = locateSkillDir(skillsRoot, entry.name);
    } catch {
      throw new RuntimeError(
        err instanceof Error
          ? err.message
          : `Skill directory not found under skills root: ${entry.id}`,
      );
    }
  }

  const skillMdAbs = path.join(sourceDir, "SKILL.md");
  if (!existsSync(skillMdAbs)) {
    throw new RuntimeError(
      `SKILL.md missing for skill ${entry.id} at ${skillMdAbs}`,
    );
  }

  let raw: string;
  try {
    raw = readFileSync(skillMdAbs, "utf8");
  } catch (err) {
    throw new RuntimeError(
      `Cannot read SKILL.md for ${entry.id}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  const maxBodyChars = Math.max(
    1,
    Math.floor(opts.maxBodyChars ?? DEFAULT_MAX_BODY_CHARS),
  );
  const truncated = raw.length > maxBodyChars;
  const content = truncated ? raw.slice(0, maxBodyChars) : raw;

  // Prefer catalog repoPath (repo-relative); else absolute filesystem path
  const bodyPath =
    entry.repoPath != null && entry.repoPath.length > 0
      ? `${toPosix(entry.repoPath).replace(/\/$/, "")}/SKILL.md`
      : skillMdAbs;

  return {
    ok: true,
    installable: true,
    catalogSource: loaded.source,
    skill: entry,
    body: {
      path: bodyPath,
      content,
      truncated,
      // Full source length (pre-truncation) so clients know total size
      chars: raw.length,
    },
  };
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}
