/**
 * Catalog build unit tests (SPE 38).
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildSkillEntry,
  collectCatalogSkills,
  findSkillMdFiles,
} from "./build.js";

const tmpDirs: string[] = [];

function makeTmp(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "ow-catalog-"));
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

const FIXTURE_SKILL_MD = `---
name: fixture-skill
id: fixture-skill
description: A single fixture skill for catalog build tests
layer: scenario
scope: official
disciplines:
  - psychology
language: en
tags:
  - test
version: 0.1.0
---

# Fixture Skill
`;

describe("collectCatalogSkills", () => {
  it("refuses missing skills root", () => {
    const root = makeTmp();
    const missing = path.join(root, "skills");
    expect(() => collectCatalogSkills(missing, root)).toThrow(
      /refusing empty catalog/,
    );
  });

  it("refuses empty skills tree (no SKILL.md)", () => {
    const root = makeTmp();
    const skills = path.join(root, "skills");
    mkdirSync(path.join(skills, "official", "scenarios"), { recursive: true });
    expect(() => collectCatalogSkills(skills, root)).toThrow(
      /no SKILL\.md|refusing empty catalog/,
    );
  });

  it("single skill fixture yields id + scope + layer", () => {
    const root = makeTmp();
    const skillDir = path.join(
      root,
      "skills",
      "official",
      "scenarios",
      "fixture-skill",
    );
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(path.join(skillDir, "SKILL.md"), FIXTURE_SKILL_MD, "utf8");

    const skillsRoot = path.join(root, "skills");
    const entries = collectCatalogSkills(skillsRoot, root);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.id).toBe("fixture-skill");
    expect(entries[0]!.scope).toBe("official");
    expect(entries[0]!.layer).toBe("scenario");
    expect(entries[0]!.repoPath).toBe(
      "skills/official/scenarios/fixture-skill",
    );
    // mtime-based updated, not the 1970 sentinel
    expect(entries[0]!.updated).not.toBe("1970-01-01");
    expect(entries[0]!.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("infers scope/layer from path when frontmatter omits them", () => {
    const root = makeTmp();
    const skillDir = path.join(
      root,
      "skills",
      "community",
      "references",
      "path-card",
    );
    mkdirSync(skillDir, { recursive: true });
    writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---
name: path-card
description: Reference card without explicit scope/layer
---
# Path
`,
      "utf8",
    );

    const entry = buildSkillEntry(
      path.join(skillDir, "SKILL.md"),
      root,
    );
    expect(entry.id).toBe("path-card");
    expect(entry.scope).toBe("community");
    expect(entry.layer).toBe("reference");
  });
});

describe("findSkillMdFiles", () => {
  it("returns empty for missing dir", () => {
    expect(findSkillMdFiles(path.join(makeTmp(), "nope"))).toEqual([]);
  });

  it("finds nested SKILL.md", () => {
    const root = makeTmp();
    const skillDir = path.join(root, "a", "b", "c");
    mkdirSync(skillDir, { recursive: true });
    const md = path.join(skillDir, "SKILL.md");
    writeFileSync(md, "# x\n", "utf8");
    expect(findSkillMdFiles(root).some((p) => existsSync(p))).toBe(true);
    expect(findSkillMdFiles(root)).toContain(md);
  });
});
