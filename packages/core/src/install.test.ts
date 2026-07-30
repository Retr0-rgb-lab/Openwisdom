/**
 * Install / catalog acceptance tests for @openwisdom/core.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog, searchCatalog } from "./catalog.js";
import { runInstall, resolveProviderIds, UsageError } from "./install.js";
import { findMonorepoRoot, getPackageRoot } from "./paths.js";

const packageRoot = getPackageRoot();
const monorepoRoot = findMonorepoRoot(packageRoot);
const skillsRoot = monorepoRoot
  ? path.join(monorepoRoot, "skills")
  : path.join(packageRoot, "..", "..", "skills");

/** Prefer package-local tmp — avoids odd TEMP drive edge cases. */
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

describe("catalog search", () => {
  it("search macro finds macro-scan", () => {
    const { index } = loadCatalog({
      packageRoot,
      skillsRoot,
      env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
    });
    const hits = searchCatalog(index, "macro");
    expect(hits.some((s) => s.id === "macro-scan")).toBe(true);
  });
});

describe("resolveProviderIds", () => {
  it("defaults isTty to false and throws without providers", () => {
    expect(() =>
      resolveProviderIds({
        cwd: process.cwd(),
        home: process.cwd(),
      }),
    ).toThrow(UsageError);
  });

  it("accepts explicit providers when isTty false", () => {
    const ids = resolveProviderIds({
      providersCsv: "claude",
      cwd: process.cwd(),
      home: process.cwd(),
      isTty: false,
    });
    expect(ids).toEqual(["claude"]);
  });
});

describe("install", () => {
  it("installs macro-scan into tmp .claude/skills with -y", () => {
    expect(
      existsSync(
        path.join(skillsRoot, "official", "scenarios", "macro-scan", "SKILL.md"),
      ),
    ).toBe(true);

    const cwd = makeTmp();
    const result = runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      force: false,
      dryRun: false,
      noTelemetry: true,
      isTty: false,
      env: { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot },
    });

    expect(result.exitCode).toBe(0);
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
  });

  it("same content install is up-to-date", () => {
    const cwd = makeTmp();
    const env = { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot };
    const once = () =>
      runInstall({
        skillIds: ["macro-scan"],
        providers: "claude",
        scope: "project",
        cwd,
        yes: true,
        noTelemetry: true,
        isTty: false,
        env,
      });

    expect(once().exitCode).toBe(0);
    const again = once();
    expect(again.exitCode).toBe(0);
    expect(
      again.results[0]?.outcomes.some((o) => o.outcome.status === "up-to-date"),
    ).toBe(true);
  });

  it("conflict without force fails (exit 1)", () => {
    const cwd = makeTmp();
    const env = { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot };

    const first = runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      noTelemetry: true,
      isTty: false,
      env,
    });
    expect(first.exitCode).toBe(0);

    const skillMd = path.join(
      cwd,
      ".claude",
      "skills",
      "macro-scan",
      "SKILL.md",
    );
    writeFileSync(
      skillMd,
      readFileSync(skillMd, "utf8") + "\n<!-- local edit -->\n",
      "utf8",
    );

    const second = runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      force: false,
      noTelemetry: true,
      isTty: false,
      env,
    });
    expect(second.exitCode).toBe(1);
    expect(
      second.results[0]?.outcomes.some((o) => o.outcome.status === "conflict"),
    ).toBe(true);
    // local edit preserved
    expect(readFileSync(skillMd, "utf8")).toContain("local edit");
  });
});


describe("skills-snapshot offline (Plan 03)", () => {
  it("resolveSkillsRoot falls back to package skills-snapshot outside monorepo", async () => {
    const { resolveSkillsRoot, locateSkillDir } = await import("./skills-root.js");
    const os = await import("node:os");
    const outside = path.join(
      os.tmpdir(),
      `ow-core-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    mkdirSync(outside, { recursive: true });
    tmpDirs.push(outside);
    const skillDir = path.join(
      outside,
      "skills-snapshot",
      "official",
      "scenarios",
      "macro-scan",
    );
    mkdirSync(skillDir, { recursive: true });
    const monoSkill = path.join(skillsRoot, "official", "scenarios", "macro-scan", "SKILL.md");
    if (existsSync(monoSkill)) {
      writeFileSync(path.join(skillDir, "SKILL.md"), readFileSync(monoSkill, "utf8"), "utf8");
    } else {
      writeFileSync(
        path.join(skillDir, "SKILL.md"),
        "---\nname: macro-scan\nid: macro-scan\ndescription: t\nlayer: scenario\nscope: official\n---\n# t\n",
        "utf8",
      );
    }
    const root = resolveSkillsRoot({
      env: {},
      cwd: outside,
      packageRoot: outside,
    });
    expect(path.normalize(root)).toBe(
      path.normalize(path.join(outside, "skills-snapshot")),
    );
    expect(locateSkillDir(root, "macro-scan")).toContain("macro-scan");
  });

  it("error message mentions skills-snapshot not GitHub-only", async () => {
    const { resolveSkillsRoot } = await import("./skills-root.js");
    const os = await import("node:os");
    const empty = path.join(
      os.tmpdir(),
      `ow-empty-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    mkdirSync(empty, { recursive: true });
    tmpDirs.push(empty);
    let message = "";
    try {
      resolveSkillsRoot({ env: {}, cwd: empty, packageRoot: empty });
    } catch (err) {
      message = err instanceof Error ? err.message : String(err);
    }
    expect(message).toMatch(/skills-snapshot/);
    expect(message).not.toMatch(/GitHub fetch is not enabled/);
  });

  it("installs macro-scan from skills-snapshot without OPENWISDOM_SKILLS_ROOT", async () => {
    const os = await import("node:os");
    const outsidePkg = path.join(
      os.tmpdir(),
      `ow-pkg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    const cwd = path.join(
      os.tmpdir(),
      `ow-cwd-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    mkdirSync(outsidePkg, { recursive: true });
    mkdirSync(cwd, { recursive: true });
    tmpDirs.push(outsidePkg, cwd);

    const skillDir = path.join(
      outsidePkg,
      "skills-snapshot",
      "official",
      "scenarios",
      "macro-scan",
    );
    mkdirSync(skillDir, { recursive: true });
    const monoSkill = path.join(skillsRoot, "official", "scenarios", "macro-scan", "SKILL.md");
    expect(existsSync(monoSkill)).toBe(true);
    writeFileSync(path.join(skillDir, "SKILL.md"), readFileSync(monoSkill, "utf8"), "utf8");

    const result = runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      noTelemetry: true,
      isTty: false,
      packageRoot: outsidePkg,
      env: {
        PATH: process.env.PATH,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
      },
    });
    expect(result.exitCode).toBe(0);
    const skillMd = path.join(cwd, ".claude", "skills", "macro-scan", "SKILL.md");
    expect(existsSync(skillMd)).toBe(true);
    expect(readFileSync(skillMd, "utf8")).toContain("name: macro-scan");
  });
});
