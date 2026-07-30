/**
 * Staging + rename install write (Spec 19).
 * Conflict: sha256 of SKILL.md content.
 *
 * Note: avoid node:fs `cpSync` — it can hard-crash Node on Windows paths
 * containing non-ASCII characters (observed under monorepo path 学习软件).
 */
import { createHash, randomBytes } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { parseSkillMarkdown } from "./frontmatter.js";

export type WriteOutcome =
  | { status: "installed"; dir: string }
  | { status: "up-to-date"; dir: string }
  | { status: "conflict"; dir: string }
  | {
      status: "dry-run";
      dir: string;
      action: "write" | "up-to-date" | "conflict" | "force-overwrite";
    }
  | { status: "error"; dir: string; message: string };

export function hashSkillMd(filePath: string): string {
  const buf = readFileSync(filePath);
  return createHash("sha256").update(buf).digest("hex");
}

/** Recursive directory copy using copyFileSync (Unicode-safe on Windows). */
export function copyDirRecursive(src: string, dest: string): void {
  const st = statSync(src);
  if (!st.isDirectory()) {
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    return;
  }
  mkdirSync(dest, { recursive: true });
  for (const ent of readdirSync(src, { withFileTypes: true })) {
    if (ent.name === "." || ent.name === "..") continue;
    const from = path.join(src, ent.name);
    const to = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyDirRecursive(from, to);
    } else if (ent.isSymbolicLink()) {
      // Spec 19: do not follow external symlink content by default — skip links
      continue;
    } else if (ent.isFile()) {
      copyFileSync(from, to);
    }
  }
}

export function writeSkillDir(opts: {
  sourceDir: string;
  targetDir: string;
  force?: boolean;
  dryRun?: boolean;
}): WriteOutcome {
  const { sourceDir, targetDir } = opts;
  const force = opts.force ?? false;
  const dryRun = opts.dryRun ?? false;

  const srcSkill = path.join(sourceDir, "SKILL.md");
  if (!existsSync(srcSkill)) {
    return {
      status: "error",
      dir: targetDir,
      message: `Source missing SKILL.md: ${sourceDir}`,
    };
  }

  // Validate frontmatter before write
  try {
    parseSkillMarkdown(readFileSync(srcSkill, "utf8"));
  } catch (err) {
    return {
      status: "error",
      dir: targetDir,
      message: `Invalid SKILL.md frontmatter: ${err instanceof Error ? err.message : err}`,
    };
  }

  const skillName = path.basename(sourceDir);
  if (
    skillName.includes("..") ||
    skillName.includes("/") ||
    skillName.includes("\\") ||
    path.basename(targetDir).includes("..")
  ) {
    return {
      status: "error",
      dir: targetDir,
      message: `Refusing path traversal skill name: ${skillName}`,
    };
  }

  const targetSkill = path.join(targetDir, "SKILL.md");
  const targetExists = existsSync(targetDir);

  if (targetExists && existsSync(targetSkill)) {
    const same = hashSkillMd(srcSkill) === hashSkillMd(targetSkill);
    if (same) {
      if (dryRun) {
        return { status: "dry-run", dir: targetDir, action: "up-to-date" };
      }
      return { status: "up-to-date", dir: targetDir };
    }
    if (!force) {
      if (dryRun) {
        return { status: "dry-run", dir: targetDir, action: "conflict" };
      }
      return { status: "conflict", dir: targetDir };
    }
    if (dryRun) {
      return { status: "dry-run", dir: targetDir, action: "force-overwrite" };
    }
  } else if (dryRun) {
    return { status: "dry-run", dir: targetDir, action: "write" };
  }

  const parent = path.dirname(targetDir);
  mkdirSync(parent, { recursive: true });

  const token = randomBytes(4).toString("hex");
  const staging = path.join(
    parent,
    `.openwisdom-staging-${path.basename(targetDir)}-${token}`,
  );

  try {
    if (existsSync(staging)) {
      rmSync(staging, { recursive: true, force: true });
    }
    copyDirRecursive(sourceDir, staging);

    const stagedSkill = path.join(staging, "SKILL.md");
    if (!existsSync(stagedSkill)) {
      throw new Error("Staging copy missing SKILL.md");
    }
    parseSkillMarkdown(readFileSync(stagedSkill, "utf8"));

    if (existsSync(targetDir)) {
      rmSync(targetDir, { recursive: true, force: true });
    }
    renameSync(staging, targetDir);
    return { status: "installed", dir: targetDir };
  } catch (err) {
    try {
      if (existsSync(staging)) {
        rmSync(staging, { recursive: true, force: true });
      }
    } catch {
      /* ignore cleanup errors */
    }
    return {
      status: "error",
      dir: targetDir,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
