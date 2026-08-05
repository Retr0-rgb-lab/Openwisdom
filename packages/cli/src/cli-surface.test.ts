/**
 * Minimal CLI surface tests — citty wiring / help / version / usage exits.
 * Intentionally does NOT only re-export @openwisdom/core APIs.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { renderUsage, runCommand } from "citty";
import { CLI_VERSION } from "./version.js";
import { main, PACKAGE_MANAGER_SUBCOMMANDS } from "./main.js";
import { collectSkillIds } from "./lib/collect-skill-ids.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const pkg = JSON.parse(
  readFileSync(path.join(packageRoot, "package.json"), "utf8"),
) as { name: string; version: string };

afterEach(() => {
  process.exitCode = undefined;
});

describe("version single-source", () => {
  it("CLI_VERSION matches packages/cli/package.json", () => {
    expect(pkg.name).toBe("openwisdom");
    expect(CLI_VERSION).toBe(pkg.version);
    expect(CLI_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("citty meta.version is the same package.json version", async () => {
    const meta =
      typeof main.meta === "function" ? await main.meta() : await main.meta;
    expect(meta?.version).toBe(pkg.version);
    expect(meta?.name).toBe("openwisdom");
  });
});

describe("command surface (package-manager only)", () => {
  it("exposes only search / list / install / update (no LLM run)", async () => {
    const subs =
      typeof main.subCommands === "function"
        ? await main.subCommands()
        : await main.subCommands;
    expect(subs).toBeTruthy();
    const keys = Object.keys(subs!).sort();
    expect(keys).toEqual([...PACKAGE_MANAGER_SUBCOMMANDS].sort());
    for (const banned of ["run", "analyze", "chat", "recommend", "agent"]) {
      expect(keys).not.toContain(banned);
    }
  });

  it("renderUsage lists package-manager commands and version context", async () => {
    const usage = await renderUsage(main);
    expect(usage).toMatch(/search/i);
    expect(usage).toMatch(/list/i);
    expect(usage).toMatch(/install/i);
    expect(usage).toMatch(/update/i);
    expect(usage).toMatch(/openwisdom/i);
    expect(usage).not.toMatch(/\brun\b.*llm/i);
  });
});

describe("usage exit codes (citty command layer)", () => {
  it("search without query or --tag sets exitCode 2", async () => {
    process.exitCode = undefined;
    // Drive the search subcommand directly so we do not depend on parent wiring quirks.
    const subs =
      typeof main.subCommands === "function"
        ? await main.subCommands()
        : await main.subCommands;
    await runCommand(subs!.search!, { rawArgs: [] });
    expect(process.exitCode).toBe(2);
  });

  it("install without skill ids or --bundle sets exitCode 2", async () => {
    process.exitCode = undefined;
    const subs =
      typeof main.subCommands === "function"
        ? await main.subCommands()
        : await main.subCommands;
    await runCommand(subs!.install!, { rawArgs: [] });
    expect(process.exitCode).toBe(2);
  });

  it("root runCommand dispatches search and sets exitCode 2 on empty query", async () => {
    process.exitCode = undefined;
    await runCommand(main, { rawArgs: ["search"] });
    expect(process.exitCode).toBe(2);
  });
});

describe("collectSkillIds (CLI adapter arg wiring)", () => {
  it("collects multi-id install args and skips known flags", () => {
    expect(
      collectSkillIds(
        ["install", "macro-scan", "personal-anchor", "-y", "--providers", "claude"],
        undefined,
      ),
    ).toEqual(["macro-scan", "personal-anchor"]);
  });

  it("merges positional with leftover raw ids", () => {
    expect(
      collectSkillIds(
        ["install", "macro-scan", "personal-anchor", "--force"],
        "macro-scan",
      ),
    ).toEqual(["macro-scan", "personal-anchor"]);
  });

  it("skips equals-style flag values", () => {
    expect(
      collectSkillIds(
        [
          "update",
          "macro-scan",
          "--providers=claude,agents",
          "--scope=project",
          "--bundle=orientation-handoff",
        ],
        undefined,
      ),
    ).toEqual(["macro-scan"]);
  });
});
