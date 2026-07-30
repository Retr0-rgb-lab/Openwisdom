import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getProvider,
  parseProvidersFlag,
  resolveSkillDir,
  uniqueWriteTargets,
} from "./index.js";

describe("resolveSkillDir", () => {
  it("resolves claude project path", () => {
    const cwd = path.join("E:", "tmp", "project");
    const dir = resolveSkillDir({
      provider: "claude",
      scope: "project",
      cwd,
      home: path.join("E:", "Users", "me"),
      skillName: "macro-scan",
    });
    expect(dir).toBe(path.join(cwd, ".claude", "skills", "macro-scan"));
  });
});

describe("uniqueWriteTargets", () => {
  it("dedupes codex + agents project to one dir", () => {
    const cwd = path.join("E:", "tmp", "repo");
    const home = path.join("E:", "Users", "me");
    const targets = uniqueWriteTargets(
      ["codex", "agents"],
      "project",
      cwd,
      home,
      "macro-scan",
    );
    expect(targets).toHaveLength(1);
    expect(targets[0]!.dir).toBe(
      path.join(cwd, ".agents", "skills", "macro-scan"),
    );
    // First provider in the list wins
    expect(targets[0]!.provider).toBe("codex");
  });
});

describe("opencode global", () => {
  it("resolves to .config/opencode/skills under home", () => {
    const home = path.join("E:", "Users", "me");
    const dir = resolveSkillDir({
      provider: "opencode",
      scope: "global",
      cwd: path.join("E:", "tmp", "repo"),
      home,
      skillName: "macro-scan",
    });
    expect(dir).toBe(
      path.join(home, ".config", "opencode", "skills", "macro-scan"),
    );
  });
});

describe("parseProvidersFlag / unknown", () => {
  it("throws on unknown provider", () => {
    expect(() => parseProvidersFlag("claude,not-a-real-harness")).toThrow(
      /Unknown provider/i,
    );
  });

  it("accepts aliases and returns canonical ids", () => {
    expect(parseProvidersFlag("claude-code,copilot")).toEqual([
      "claude",
      "github",
    ]);
  });
});

describe("getProvider", () => {
  it("finds by alias", () => {
    expect(getProvider("portable")?.id).toBe("agents");
  });
});
