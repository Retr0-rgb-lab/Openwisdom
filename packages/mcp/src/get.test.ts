/**
 * openwisdom_get + Spec 31 search/list enrichments (pure handlers).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findMonorepoRoot } from "@openwisdom/core";
import { handleGet } from "./tools/get.js";
import { handleSearch } from "./tools/search.js";
import { handleList } from "./tools/list.js";
import { getMcpPackageRoot } from "./lib/package-root.js";
import { isErrorResult } from "./lib/result.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const monorepoRoot = findMonorepoRoot(packageRoot);
const skillsRoot = monorepoRoot
  ? path.join(monorepoRoot, "skills")
  : path.join(packageRoot, "..", "..", "skills");

function parsePayload(r: { content: Array<{ text: string }> }): Record<string, unknown> {
  const jsonBlock = r.content
    .map((c) => c.text)
    .find((t) => t.trimStart().startsWith("{"));
  expect(jsonBlock).toBeTruthy();
  return JSON.parse(jsonBlock!) as Record<string, unknown>;
}

describe("openwisdom_get handler", () => {
  it("returns macro-scan body with YAML frontmatter", async () => {
    const prev = process.env.OPENWISDOM_SKILLS_ROOT;
    process.env.OPENWISDOM_SKILLS_ROOT = skillsRoot;
    try {
      if (
        !existsSync(
          path.join(
            skillsRoot,
            "official",
            "scenarios",
            "macro-scan",
            "SKILL.md",
          ),
        ) &&
        !existsSync(
          path.join(
            getMcpPackageRoot(),
            "skills-snapshot",
            "official",
            "scenarios",
            "macro-scan",
            "SKILL.md",
          ),
        )
      ) {
        return;
      }

      const r = await handleGet({ skill: "macro-scan" });
      expect(isErrorResult(r)).toBe(false);
      const payload = parsePayload(r);
      expect(payload.ok).toBe(true);
      expect(payload.installable).toBe(true);
      const skill = payload.skill as { id?: string };
      expect(skill.id).toBe("macro-scan");
      const body = payload.body as {
        content?: string;
        truncated?: boolean;
        chars?: number;
        path?: string;
      };
      expect(body?.content).toBeTruthy();
      expect(body.content).toMatch(/^---/);
      expect(body.content).toMatch(/name:\s*macro-scan/);
      expect(body.truncated).toBe(false);
      expect(typeof body.chars).toBe("number");
      expect((body.chars as number) > 0).toBe(true);
      expect(body.path).toMatch(/SKILL\.md$/);
    } finally {
      if (prev === undefined) delete process.env.OPENWISDOM_SKILLS_ROOT;
      else process.env.OPENWISDOM_SKILLS_ROOT = prev;
    }
  });

  it("includeBody:false omits body", async () => {
    const r = await handleGet({ skill: "macro-scan", includeBody: false });
    expect(isErrorResult(r)).toBe(false);
    const payload = parsePayload(r);
    expect(payload.ok).toBe(true);
    expect(payload.body).toBeUndefined();
  });

  it("unknown skill → isError", async () => {
    const r = await handleGet({ skill: "definitely-not-a-skill-xyz" });
    expect(isErrorResult(r)).toBe(true);
    const text = r.content.map((c) => c.text).join("\n");
    expect(text).toMatch(/Unknown skill|search|list/i);
  });

  it("missing skill arg → isError", async () => {
    const r = await handleGet({ skill: "   " });
    expect(isErrorResult(r)).toBe(true);
  });
});

describe("openwisdom_search Spec 31", () => {
  it("rejects empty query without filters", async () => {
    const r = await handleSearch({ query: "" });
    expect(isErrorResult(r)).toBe(true);
  });

  it("empty query + layer=scenario returns only scenarios", async () => {
    const r = await handleSearch({ query: "", layer: "scenario", limit: 50 });
    expect(isErrorResult(r)).toBe(false);
    const payload = parsePayload(r);
    expect(payload.ok).toBe(true);
    const skills = payload.skills as Array<{
      layer: string;
      tags?: unknown;
      references?: unknown;
      repoPath?: string;
      updated?: string;
    }>;
    expect(skills.length).toBeGreaterThan(0);
    expect(skills.every((s) => s.layer === "scenario")).toBe(true);
    // Full web catalog materialize includes official + community scenarios
    expect(skills.length).toBeGreaterThanOrEqual(3);
    for (const s of skills) {
      expect(Array.isArray(s.tags)).toBe(true);
      expect(Array.isArray(s.references)).toBe(true);
      expect(typeof s.repoPath).toBe("string");
      expect(typeof s.updated).toBe("string");
    }
  });

  it("finds macro-scan and includes tags/repoPath", async () => {
    const r = await handleSearch({ query: "macro" });
    expect(isErrorResult(r)).toBe(false);
    const payload = parsePayload(r);
    const skills = payload.skills as Array<{
      id: string;
      tags?: unknown;
      repoPath?: string;
    }>;
    const hit = skills.find((s) => s.id === "macro-scan");
    expect(hit).toBeTruthy();
    expect(Array.isArray(hit!.tags)).toBe(true);
    expect(typeof hit!.repoPath).toBe("string");
  });
});

describe("openwisdom_list Spec 31", () => {
  it("available returns official catalog with tags/references", async () => {
    const r = await handleList({ mode: "available", limit: 100 });
    expect(isErrorResult(r)).toBe(false);
    const payload = parsePayload(r);
    const skills = payload.skills as Array<{
      id: string;
      tags?: unknown;
      references?: unknown;
      repoPath?: string;
      updated?: string;
    }>;
    expect(skills.length).toBeGreaterThanOrEqual(8);
    for (const s of skills) {
      expect(Array.isArray(s.tags)).toBe(true);
      expect(Array.isArray(s.references)).toBe(true);
      expect(typeof s.repoPath).toBe("string");
      expect(typeof s.updated).toBe("string");
    }
  });

  it("available layer=scenario filters", async () => {
    const r = await handleList({
      mode: "available",
      layer: "scenario",
      limit: 50,
    });
    expect(isErrorResult(r)).toBe(false);
    const payload = parsePayload(r);
    const skills = payload.skills as Array<{ layer: string }>;
    expect(skills.length).toBeGreaterThanOrEqual(3);
    expect(skills.every((s) => s.layer === "scenario")).toBe(true);
  });
});

describe("skills-snapshot body integrity", () => {
  it("package snapshot macro-scan matches readable content when present", () => {
    const snap = path.join(
      getMcpPackageRoot(),
      "skills-snapshot",
      "official",
      "scenarios",
      "macro-scan",
      "SKILL.md",
    );
    if (!existsSync(snap)) return;
    const body = readFileSync(snap, "utf8");
    expect(body.startsWith("---")).toBe(true);
    expect(body).toContain("name: macro-scan");
  });
});
