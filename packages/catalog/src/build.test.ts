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
  assertContentHashParity,
  assertReferencesExist,
  buildSkillEntry,
  collectCatalogSkills,
  contentHash,
  findSkillMdFiles,
  resolveBundles,
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

function writeOfficialSkill(
  root: string,
  id: string,
  body: string,
  frontmatterExtra = "",
): string {
  const skillDir = path.join(
    root,
    "skills",
    "official",
    "scenarios",
    id,
  );
  mkdirSync(skillDir, { recursive: true });
  const md = `---
name: ${id}
id: ${id}
description: Test skill ${id}
layer: scenario
scope: official
disciplines:
  - psychology
language: en
tags:
  - test
version: 0.1.0
${frontmatterExtra}---

${body}
`;
  writeFileSync(path.join(skillDir, "SKILL.md"), md, "utf8");
  return skillDir;
}

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

describe("contentHash", () => {
  it("is stable under skill array reorder", () => {
    const root = makeTmp();
    writeOfficialSkill(root, "alpha-skill", "# Alpha\n");
    writeOfficialSkill(root, "beta-skill", "# Beta\n");
    const skills = collectCatalogSkills(path.join(root, "skills"), root);
    const h1 = contentHash(skills, root);
    const h2 = contentHash([...skills].reverse(), root);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^sha256-[a-f0-9]{64}$/);
  });

  it("changes when SKILL.md body changes without metadata change", () => {
    const root = makeTmp();
    const skillDir = writeOfficialSkill(root, "body-skill", "# Original body\n");
    const skillsBefore = collectCatalogSkills(path.join(root, "skills"), root);
    const hashBefore = contentHash(skillsBefore, root);

    // Same frontmatter identity fields; only markdown body drifts
    writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---
name: body-skill
id: body-skill
description: Test skill body-skill
layer: scenario
scope: official
disciplines:
  - psychology
language: en
tags:
  - test
version: 0.1.0
---

# Drifted body content
`,
      "utf8",
    );
    const skillsAfter = collectCatalogSkills(path.join(root, "skills"), root);
    const hashAfter = contentHash(skillsAfter, root);
    expect(hashAfter).not.toBe(hashBefore);
  });

  it("changes when nested payload file is added", () => {
    const root = makeTmp();
    const skillDir = writeOfficialSkill(root, "asset-skill", "# With assets\n");
    const skillsBefore = collectCatalogSkills(path.join(root, "skills"), root);
    const hashBefore = contentHash(skillsBefore, root);

    writeFileSync(path.join(skillDir, "notes.md"), "extra payload\n", "utf8");
    const skillsAfter = collectCatalogSkills(path.join(root, "skills"), root);
    const hashAfter = contentHash(skillsAfter, root);
    expect(hashAfter).not.toBe(hashBefore);
  });
});

describe("resolveBundles", () => {
  it("emits bundles when all members present", () => {
    const ids = new Set(["a", "b", "c"]);
    const out = resolveBundles(ids, [
      {
        id: "pack",
        title: "Pack",
        description: "d",
        skillIds: ["a", "c"],
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.skillIds).toEqual(["a", "c"]);
  });

  it("hard-fails when a bundle member is missing", () => {
    const ids = new Set(["a"]);
    expect(() =>
      resolveBundles(ids, [
        {
          id: "broken",
          title: "Broken",
          description: "d",
          skillIds: ["a", "missing-id"],
        },
      ]),
    ).toThrow(/bundle "broken" missing skill\(s\): missing-id/);
  });
});

describe("assertReferencesExist", () => {
  it("passes when references resolve", () => {
    const root = makeTmp();
    writeOfficialSkill(root, "ref-target", "# Target\n");
    writeOfficialSkill(
      root,
      "ref-source",
      "# Source\n",
      "references:\n  - ref-target\n",
    );
    const skills = collectCatalogSkills(path.join(root, "skills"), root);
    const ids = new Set(skills.map((s) => s.id));
    expect(() => assertReferencesExist(skills, ids)).not.toThrow();
  });

  it("hard-fails when references[] points at missing id", () => {
    const root = makeTmp();
    writeOfficialSkill(
      root,
      "lonely",
      "# Lonely\n",
      "references:\n  - does-not-exist\n",
    );
    const skills = collectCatalogSkills(path.join(root, "skills"), root);
    const ids = new Set(skills.map((s) => s.id));
    expect(() => assertReferencesExist(skills, ids)).toThrow(
      /skill "lonely" references missing skill id\(s\): does-not-exist/,
    );
  });
});

describe("assertContentHashParity", () => {
  it("passes when hashes match", () => {
    expect(() =>
      assertContentHashParity([
        { label: "cli", contentHash: "sha256-abc" },
        { label: "mcp", contentHash: "sha256-abc" },
      ]),
    ).not.toThrow();
  });

  it("throws on mismatch", () => {
    expect(() =>
      assertContentHashParity([
        { label: "cli", contentHash: "sha256-a" },
        { label: "web", contentHash: "sha256-b" },
      ]),
    ).toThrow(/contentHash mismatch/);
  });
});
