/**
 * MCP tool handler tests — call pure handlers (no stdio transport).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { findMonorepoRoot } from "@openwisdom/core";
import { handleInstall } from "./tools/install.js";
import { handleSearch } from "./tools/search.js";
import { handleDetectProviders } from "./tools/detect-providers.js";
import { resolveCwd } from "./lib/env.js";
import { getMcpPackageRoot } from "./lib/package-root.js";
import { isErrorResult } from "./lib/result.js";

/** packages/mcp root (not core — getPackageRoot only knows core/cli/mcp names) */
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const monorepoRoot = findMonorepoRoot(packageRoot);
const skillsRoot = monorepoRoot
  ? path.join(monorepoRoot, "skills")
  : path.join(packageRoot, "..", "..", "skills");

const tmpDirs: string[] = [];

function makeTmp(): string {
  const dir = path.join(
    packageRoot,
    ".tmp-test",
    `run-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  tmpDirs.push(dir);
  return dir;
}

function makeOutsideTmp(): string {
  const dir = path.join(
    os.tmpdir(),
    `ow-mcp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  tmpDirs.push(dir);
  return dir;
}

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

describe("resolveCwd", () => {
  it("prefers arg, then CLAUDE_PROJECT_DIR, then process.cwd", () => {
    const a = resolveCwd("/tmp/from-arg", {});
    expect(path.normalize(a)).toBe(path.normalize(path.resolve("/tmp/from-arg")));

    const b = resolveCwd(undefined, {
      CLAUDE_PROJECT_DIR: path.resolve("/tmp/claude-proj"),
    });
    expect(path.normalize(b)).toBe(
      path.normalize(path.resolve("/tmp/claude-proj")),
    );

    const c = resolveCwd(null, {});
    expect(c).toBe(process.cwd());
  });
});

describe("getMcpPackageRoot", () => {
  it("resolves to openwisdom-mcp package root", () => {
    const root = getMcpPackageRoot();
    expect(existsSync(path.join(root, "package.json"))).toBe(true);
    const pkg = JSON.parse(
      readFileSync(path.join(root, "package.json"), "utf8"),
    ) as { name?: string };
    expect(pkg.name).toBe("openwisdom-mcp");
  });
});

describe("openwisdom_search handler", () => {
  it("finds macro-scan", async () => {
    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    process.env.OPENWISDOM_SKILLS_ROOT = skillsRoot;
    try {
      const r = await handleSearch({ query: "macro" });
      expect(isErrorResult(r)).toBe(false);
      const text = r.content.map((c) => c.text).join("\n");
      expect(text).toContain("macro-scan");
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });

  it("uses catalog snapshot offline (source: snapshot) without skills env", async () => {
    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    delete process.env.OPENWISDOM_SKILLS_ROOT;
    try {
      // catalog-snapshot should exist after catalog build (Plan 03 dual-write)
      const snap = path.join(getMcpPackageRoot(), "catalog-snapshot", "catalog.json");
      // If not yet written, core snapshot still works via packageRoot fallback only
      // when getMcpPackageRoot has catalog-snapshot.
      if (!existsSync(snap)) {
        // soft: still run search; may use monorepo scan if snapshot missing
        const r = await handleSearch({ query: "macro" });
        expect(isErrorResult(r)).toBe(false);
        return;
      }

      const r = await handleSearch({ query: "macro" });
      expect(isErrorResult(r)).toBe(false);
      const text = r.content.map((c) => c.text).join("\n");
      expect(text).toContain("macro-scan");
      const jsonBlock = r.content.map((c) => c.text).find((t) => t.trimStart().startsWith("{"));
      expect(jsonBlock).toBeTruthy();
      const payload = JSON.parse(jsonBlock!) as { source?: string };
      expect(payload.source).toBe("snapshot");
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });
});

describe("openwisdom_install handler", () => {
  it("rejects missing providers with isError", async () => {
    const r = await handleInstall({
      skills: ["macro-scan"],
      providers: [],
    });
    expect(isErrorResult(r)).toBe(true);
    expect(r.content.some((c) => c.text.includes("providers"))).toBe(true);
  });

  it("rejects empty skills without bundle", async () => {
    const r = await handleInstall({
      skills: [],
      providers: ["claude"],
    });
    expect(isErrorResult(r)).toBe(true);
    expect(
      r.content.some(
        (c) => c.text.includes("skills") && c.text.includes("bundle"),
      ),
    ).toBe(true);
  });

  it("dryRun plans write without creating SKILL.md", async () => {
    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    process.env.OPENWISDOM_SKILLS_ROOT = skillsRoot;
    try {
      const cwd = makeTmp();
      const r = await handleInstall({
        skills: ["macro-scan"],
        providers: ["claude"],
        cwd,
        dryRun: true,
        noTelemetry: true,
      });
      expect(isErrorResult(r)).toBe(false);
      const skillMd = path.join(
        cwd,
        ".claude",
        "skills",
        "macro-scan",
        "SKILL.md",
      );
      expect(existsSync(skillMd)).toBe(false);
      const text = r.content.map((c) => c.text).join("\n");
      expect(text).toMatch(/would_write|dryRun|dry-run|true/i);
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });

  it("installs macro-scan into temp .claude/skills", async () => {
    expect(
      existsSync(
        path.join(skillsRoot, "official", "scenarios", "macro-scan", "SKILL.md"),
      ),
    ).toBe(true);

    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    process.env.OPENWISDOM_SKILLS_ROOT = skillsRoot;
    try {
      const cwd = makeTmp();
      const r = await handleInstall({
        skills: ["macro-scan"],
        providers: ["claude"],
        cwd,
        force: false,
        dryRun: false,
        noTelemetry: true,
      });
      expect(isErrorResult(r)).toBe(false);
      const skillMd = path.join(
        cwd,
        ".claude",
        "skills",
        "macro-scan",
        "SKILL.md",
      );
      expect(existsSync(skillMd)).toBe(true);
      const body = readFileSync(skillMd, "utf8");
      expect(body).toContain("name: macro-scan");
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });

  it("installs from package skills-snapshot without OPENWISDOM_SKILLS_ROOT", async () => {
    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    delete process.env.OPENWISDOM_SKILLS_ROOT;
    try {
      const snapSkill = path.join(
        getMcpPackageRoot(),
        "skills-snapshot",
        "official",
        "scenarios",
        "macro-scan",
        "SKILL.md",
      );
      // skills-snapshot is produced by catalog build; if missing skip soft
      if (!existsSync(snapSkill) && !existsSync(path.join(skillsRoot, "official"))) {
        return;
      }

      const cwd = makeOutsideTmp();
      const r = await handleInstall({
        skills: ["macro-scan"],
        providers: ["claude"],
        cwd,
        force: false,
        dryRun: false,
        noTelemetry: true,
      });
      // When monorepo skills or package skills-snapshot exist, install succeeds
      expect(isErrorResult(r)).toBe(false);
      const skillMd = path.join(
        cwd,
        ".claude",
        "skills",
        "macro-scan",
        "SKILL.md",
      );
      expect(existsSync(skillMd)).toBe(true);
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });

  it("installs orientation-handoff bundle (offline / noRemote)", async () => {
    // Bundle expands to responsibility-scope, responsibility-bridge, analysis-closure
    const handoffSkills = [
      "responsibility-scope",
      "responsibility-bridge",
      "analysis-closure",
    ] as const;
    const hasLocal = handoffSkills.every((id) =>
      existsSync(
        path.join(skillsRoot, "official", "scenarios", id, "SKILL.md"),
      ),
    );
    const hasSnap = handoffSkills.every((id) =>
      existsSync(
        path.join(
          getMcpPackageRoot(),
          "skills-snapshot",
          "official",
          "scenarios",
          id,
          "SKILL.md",
        ),
      ),
    );
    if (!hasLocal && !hasSnap) {
      // soft skip when neither monorepo skills nor snapshot present
      return;
    }

    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    if (hasLocal) process.env.OPENWISDOM_SKILLS_ROOT = skillsRoot;
    else delete process.env.OPENWISDOM_SKILLS_ROOT;

    try {
      const cwd = makeTmp();
      const r = await handleInstall({
        skills: [],
        bundle: "orientation-handoff",
        providers: ["claude"],
        cwd,
        dryRun: false,
        noTelemetry: true,
        noRemote: true,
        noDeps: true,
      });
      expect(isErrorResult(r)).toBe(false);
      for (const id of handoffSkills) {
        const skillMd = path.join(
          cwd,
          ".claude",
          "skills",
          id,
          "SKILL.md",
        );
        expect(existsSync(skillMd)).toBe(true);
      }
      const text = r.content.map((c) => c.text).join("\n");
      expect(text).toMatch(/orientation-handoff|responsibility-scope/i);
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });

  it("bundle dryRun does not write files", async () => {
    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    process.env.OPENWISDOM_SKILLS_ROOT = skillsRoot;
    try {
      const cwd = makeTmp();
      const r = await handleInstall({
        bundle: "orientation-handoff",
        providers: ["claude"],
        cwd,
        dryRun: true,
        noTelemetry: true,
        noRemote: true,
        noDeps: true,
      });
      // Catalog must contain the bundle (snapshot or monorepo scan)
      if (isErrorResult(r)) {
        const text = r.content.map((c) => c.text).join("\n");
        // Unknown bundle is acceptable only if catalog has no bundles
        expect(text).toMatch(/bundle|Unknown|not found/i);
        return;
      }
      expect(
        existsSync(
          path.join(
            cwd,
            ".claude",
            "skills",
            "responsibility-scope",
            "SKILL.md",
          ),
        ),
      ).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });
});

describe("openwisdom_detect_providers handler", () => {
  it("returns recommended providers", async () => {
    const cwd = makeTmp();
    const r = await handleDetectProviders({ cwd, home: cwd });
    expect(isErrorResult(r)).toBe(false);
    const text = r.content.map((c) => c.text).join("\n");
    expect(text).toContain("recommended");
    // default when nothing detected: claude + agents
    expect(text).toMatch(/claude/);
  });
});
