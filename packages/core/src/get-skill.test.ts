/**
 * getSkillDetail tests (Spec 31 Wave 1).
 */
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getSkillDetail } from "./get-skill.js";
import { RuntimeError, UsageError } from "./install.js";
import { findMonorepoRoot, getPackageRoot } from "./paths.js";

const packageRoot = getPackageRoot();
const monorepoRoot = findMonorepoRoot(packageRoot);
const skillsRoot = monorepoRoot
  ? path.join(monorepoRoot, "skills")
  : path.join(packageRoot, "skills-snapshot");

const tmpDirs: string[] = [];

afterEach(() => {
  while (tmpDirs.length) {
    const d = tmpDirs.pop()!;
    try {
      rmSync(d, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

describe("getSkillDetail", () => {
  it("returns macro-scan catalog row + body with frontmatter", () => {
    const detail = getSkillDetail({
      skill: "macro-scan",
      packageRoot,
      skillsRoot,
      env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
    });

    expect(detail.ok).toBe(true);
    expect(detail.installable).toBe(true);
    expect(detail.catalogSource === "snapshot" || detail.catalogSource === "scan").toBe(
      true,
    );
    expect(detail.skill.id).toBe("macro-scan");
    expect(detail.skill.name).toBe("macro-scan");
    expect(detail.skill.layer).toBe("scenario");

    expect(detail.body).toBeDefined();
    expect(detail.body!.truncated).toBe(false);
    expect(detail.body!.chars).toBeGreaterThan(0);
    expect(detail.body!.content).toMatch(/name:\s*macro-scan/);
    expect(detail.body!.content).toMatch(/layer:\s*scenario/);
    expect(detail.body!.path).toMatch(/SKILL\.md$/);
    // Prefer repo-relative path when catalog has repoPath
    if (detail.skill.repoPath) {
      expect(detail.body!.path).toContain(
        detail.skill.repoPath.replace(/\\/g, "/"),
      );
    }
  });

  it("resolves via package skills-snapshot without monorepo OPENWISDOM_SKILLS_ROOT", () => {
    const snapshotRoot = path.join(packageRoot, "skills-snapshot");
    const detail = getSkillDetail({
      skill: "macro-scan",
      packageRoot,
      skillsRoot: snapshotRoot,
      env: {
        PATH: process.env.PATH,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
      },
    });
    expect(detail.skill.id).toBe("macro-scan");
    expect(detail.body?.content).toMatch(/name:\s*macro-scan|layer:\s*scenario/);
  });

  it("omits body when includeBody is false", () => {
    const detail = getSkillDetail({
      skill: "macro-scan",
      includeBody: false,
      packageRoot,
      skillsRoot,
      env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
    });
    expect(detail.skill.id).toBe("macro-scan");
    expect(detail.body).toBeUndefined();
  });

  it("truncates body when maxBodyChars is small", () => {
    const detail = getSkillDetail({
      skill: "macro-scan",
      maxBodyChars: 50,
      packageRoot,
      skillsRoot,
      env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
    });
    expect(detail.body).toBeDefined();
    expect(detail.body!.truncated).toBe(true);
    expect(detail.body!.content.length).toBe(50);
    // chars = full source length (pre-truncation)
    expect(detail.body!.chars).toBeGreaterThan(50);
  });

  it("throws UsageError for unknown skill", () => {
    expect(() =>
      getSkillDetail({
        skill: "definitely-not-a-skill-xyz",
        packageRoot,
        skillsRoot,
        env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
      }),
    ).toThrow(UsageError);
  });

  it("throws UsageError for empty skill id", () => {
    expect(() =>
      getSkillDetail({
        skill: "   ",
        packageRoot,
        skillsRoot,
        env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
      }),
    ).toThrow(UsageError);
  });

  it("throws RuntimeError when skills root is missing", () => {
    // Catalog-only package outside monorepo: snapshot loads, body root fails
    const empty = path.join(
      os.tmpdir(),
      `ow-get-empty-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    mkdirSync(path.join(empty, "catalog-snapshot"), { recursive: true });
    tmpDirs.push(empty);
    copyFileSync(
      path.join(packageRoot, "catalog-snapshot", "catalog.json"),
      path.join(empty, "catalog-snapshot", "catalog.json"),
    );

    expect(() =>
      getSkillDetail({
        skill: "macro-scan",
        packageRoot: empty,
        cwd: empty,
        env: {
          PATH: process.env.PATH,
          TEMP: process.env.TEMP,
          TMP: process.env.TMP,
        },
      }),
    ).toThrow(RuntimeError);
  });
});
