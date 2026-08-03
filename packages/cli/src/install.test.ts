/**
 * CLI package re-runs core install acceptance via @openwisdom/core.
 * Keeps monorepo `pnpm --filter openwisdom test` green.
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
import {
  findMonorepoRoot,
  getPackageRoot,
  loadCatalog,
  runInstall,
  searchCatalog,
} from "@openwisdom/core";

// Prefer CLI package root (catalog-snapshot still shipped with openwisdom bin)
const packageRoot = getPackageRoot(
  new URL("../package.json", import.meta.url).href,
);
const monorepoRoot = findMonorepoRoot(packageRoot);
const skillsRoot = monorepoRoot
  ? path.join(monorepoRoot, "skills")
  : path.join(packageRoot, "..", "..", "skills");

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

describe("catalog search (cli → core)", () => {
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

describe("install (cli → core)", () => {
  it("installs macro-scan into tmp .claude/skills with -y", async () => {
    expect(
      existsSync(
        path.join(skillsRoot, "official", "scenarios", "macro-scan", "SKILL.md"),
      ),
    ).toBe(true);

    const cwd = makeTmp();
    const result = await runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      force: false,
      dryRun: false,
      noTelemetry: true,
      noRemote: true,
      isTty: false,
      telemetrySource: "cli",
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

  it("same content install is up-to-date", async () => {
    const cwd = makeTmp();
    const env = { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot };
    const once = async () =>
      runInstall({
        skillIds: ["macro-scan"],
        providers: "claude",
        scope: "project",
        cwd,
        yes: true,
        noTelemetry: true,
        noRemote: true,
        isTty: false,
        env,
      });

    expect((await once()).exitCode).toBe(0);
    const again = await once();
    expect(again.exitCode).toBe(0);
    expect(
      again.results[0]?.outcomes.some((o) => o.outcome.status === "up-to-date"),
    ).toBe(true);
  });

  it("conflict without force fails (exit 1)", async () => {
    const cwd = makeTmp();
    const env = { ...process.env, OPENWISDOM_SKILLS_ROOT: skillsRoot };

    const first = await runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      noTelemetry: true,
      noRemote: true,
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

    const second = await runInstall({
      skillIds: ["macro-scan"],
      providers: "claude",
      scope: "project",
      cwd,
      yes: true,
      force: false,
      noTelemetry: true,
      noRemote: true,
      isTty: false,
      env,
    });
    expect(second.exitCode).toBe(1);
    expect(
      second.results[0]?.outcomes.some((o) => o.outcome.status === "conflict"),
    ).toBe(true);
    expect(readFileSync(skillMd, "utf8")).toContain("local edit");
  });
});
