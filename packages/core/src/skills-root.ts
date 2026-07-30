/**
 * Resolve where skill payloads live on disk (install source).
 * Priority:
 * 1. OPENWISDOM_SKILLS_ROOT
 * 2. monorepo skills/
 * 3. package skills-snapshot/ (opts.packageRoot, else getPackageRoot())
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  findMonorepoRoot,
  getPackageRoot,
  looksLikeSkillsTree,
  skillsSnapshotPath,
} from "./paths.js";

export function resolveSkillsRoot(opts?: {
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  /**
   * Prefer this package root when resolving skills-snapshot.
   * When set, only this root is checked for skills-snapshot (no silent
   * fallback to getPackageRoot) so tests can isolate offline payload.
   */
  packageRoot?: string;
  /** import.meta.url override for getPackageRoot (tests / bundled hosts) */
  fromUrl?: string;
}): string {
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
