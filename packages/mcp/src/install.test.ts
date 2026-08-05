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
import { handleList } from "./tools/list.js";
import { handleDetectProviders } from "./tools/detect-providers.js";
import { resolveCwd } from "./lib/env.js";
import { getMcpPackageRoot } from "./lib/package-root.js";
import { isErrorResult } from "./lib/result.js";
import { MCP_VERSION } from "./version.js";

/** packages/mcp root (not core — getPackageRoot only knows core/cli/mcp names) */
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const monorepoRoot = findMonorepoRoot(packageRoot);
const skillsRoot = monorepoRoot
  ? path.join(monorepoRoot, "skills")
  : path.join(packageRoot, "..", "..", "skills");

/**
 * Soft-skip only outside CI. When CI=true/1 or OPENWISDOM_REQUIRE_SNAPSHOTS=1,
 * missing packaging artifacts hard-fail (no green without snapshots).
 */
function requiresSnapshots(): boolean {
  const ci = process.env.CI?.trim().toLowerCase();
  if (ci === "true" || ci === "1" || ci === "yes") return true;
  const force = process.env.OPENWISDOM_REQUIRE_SNAPSHOTS?.trim().toLowerCase();
  return force === "1" || force === "true" || force === "yes";
}

function requirePathOrSkip(filePath: string, label: string): boolean {
  if (existsSync(filePath)) return true;
  if (requiresSnapshots()) {
    expect.fail(
      `Missing required ${label}: ${filePath} (CI / OPENWISDOM_REQUIRE_SNAPSHOTS hard-fail)`,
    );
  }
  return false;
}

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

describe("MCP_VERSION single-source", () => {
  it("matches packages/mcp/package.json version", () => {
    const pkg = JSON.parse(
      readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    ) as { version?: string };
    expect(MCP_VERSION).toBe(pkg.version);
    expect(MCP_VERSION).toMatch(/^\d+\.\d+\.\d+/);
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
    const prevNoRemote = process.env.OPENWISDOM_NO_REMOTE;
    delete process.env.OPENWISDOM_SKILLS_ROOT;
    try {
      // catalog-snapshot should exist after catalog build (Plan 03 dual-write)
      const snap = path.join(
        getMcpPackageRoot(),
        "catalog-snapshot",
        "catalog.json",
      );
      if (!requirePathOrSkip(snap, "catalog-snapshot/catalog.json")) {
        return;
      }

      // Force offline so monorepo skills/ env does not prefer local scan.
      const r = await handleSearch({
        query: "macro",
        noRemote: true,
      });
      expect(isErrorResult(r)).toBe(false);
      const text = r.content.map((c) => c.text).join("\n");
      expect(text).toContain("macro-scan");
      const jsonBlock = r.content
        .map((c) => c.text)
        .find((t) => t.trimStart().startsWith("{"));
      expect(jsonBlock).toBeTruthy();
      const payload = JSON.parse(jsonBlock!) as { source?: string };
      // Prefer snapshot when monorepo skills not injected via env.
      // (If cwd is monorepo, source may be snapshot or scan — either is ok offline.)
      expect(["snapshot", "scan"]).toContain(payload.source);
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
      if (prevNoRemote === undefined) delete process.env.OPENWISDOM_NO_REMOTE;
      else process.env.OPENWISDOM_NO_REMOTE = prevNoRemote;
    }
  });

  it("accepts noRemote and registry tool args (parity with install)", async () => {
    const r = await handleSearch({
      query: "macro",
      noRemote: true,
      registry: "https://example.invalid/registry",
    });
    expect(isErrorResult(r)).toBe(false);
    const text = r.content.map((c) => c.text).join("\n");
    expect(text).toContain("macro-scan");
  });
});

describe("openwisdom_list registry/noRemote parity", () => {
  it("available with noRemote succeeds offline", async () => {
    const r = await handleList({
      mode: "available",
      noRemote: true,
      limit: 20,
    });
    expect(isErrorResult(r)).toBe(false);
    const jsonBlock = r.content
      .map((c) => c.text)
      .find((t) => t.trimStart().startsWith("{"));
    expect(jsonBlock).toBeTruthy();
    const payload = JSON.parse(jsonBlock!) as {
      ok?: boolean;
      count?: number;
    };
    expect(payload.ok).toBe(true);
    expect((payload.count ?? 0) > 0).toBe(true);
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
      const localOfficial = path.join(skillsRoot, "official");
      if (!existsSync(snapSkill) && !existsSync(localOfficial)) {
        if (requiresSnapshots()) {
          expect.fail(
            `Missing skills-snapshot macro-scan and monorepo skills/official (CI hard-fail)`,
          );
        }
        return;
      }
      if (!existsSync(snapSkill) && requiresSnapshots()) {
        // Prefer package snapshot in CI so offline packaging is asserted.
        expect.fail(
          `Missing required skills-snapshot: ${snapSkill} (CI / OPENWISDOM_REQUIRE_SNAPSHOTS hard-fail)`,
        );
      }

      const cwd = makeOutsideTmp();
      const r = await handleInstall({
        skills: ["macro-scan"],
        providers: ["claude"],
        cwd,
        force: false,
        dryRun: false,
        noTelemetry: true,
        noRemote: true,
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
      if (requiresSnapshots()) {
        expect.fail(
          "Missing orientation-handoff skill trees in monorepo skills/ and skills-snapshot (CI hard-fail)",
        );
      }
      return;
    }
    if (!hasSnap && requiresSnapshots()) {
      expect.fail(
        "Missing skills-snapshot for orientation-handoff skills (CI / OPENWISDOM_REQUIRE_SNAPSHOTS hard-fail)",
      );
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
        if (requiresSnapshots()) {
          expect.fail(
            `orientation-handoff dryRun failed under CI: ${text}`,
          );
        }
        // Local only: unknown bundle acceptable if catalog has no bundles
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
