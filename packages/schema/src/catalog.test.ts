import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { catalogIndexSchema, catalogSkillSchema } from "./catalog.js";

const sampleSkill = {
  id: "macro-scan",
  name: "macro-scan",
  description: "Scan macro structure for agent-native analysis.",
  layer: "scenario" as const,
  scope: "official" as const,
  disciplines: ["political-science", "economics", "sociology"],
  language: "zh",
  tags: ["macro", "structure"],
  version: "0.1.0",
  updated: "2026-07-30",
  repoPath: "skills/official/scenarios/macro-scan",
  references: ["path-dependence", "collective-action"],
  install: {
    cli: "npx openwisdom install macro-scan",
  },
};

describe("catalogSkillSchema", () => {
  it("accepts Spec 20 sample shape", () => {
    const parsed = catalogSkillSchema.parse(sampleSkill);
    expect(parsed.id).toBe("macro-scan");
    expect(parsed.install.cli).toContain("openwisdom install");
  });

  it("allows omitting references", () => {
    const { references: _, ...rest } = sampleSkill;
    expect(catalogSkillSchema.parse(rest).references).toBeUndefined();
  });

  it("requires install.cli", () => {
    expect(() =>
      catalogSkillSchema.parse({ ...sampleSkill, install: {} }),
    ).toThrow(ZodError);
  });

  it("requires layer and scope", () => {
    const { layer: _l, scope: _s, ...rest } = sampleSkill;
    expect(() => catalogSkillSchema.parse(rest)).toThrow(ZodError);
  });
});

describe("catalogIndexSchema", () => {
  it("accepts schemaVersion 1 with skills array", () => {
    const index = catalogIndexSchema.parse({
      schemaVersion: 1,
      skills: [sampleSkill],
    });
    expect(index.skills).toHaveLength(1);
    expect(index.schemaVersion).toBe(1);
  });

  it("accepts empty skills array", () => {
    const index = catalogIndexSchema.parse({
      schemaVersion: 1,
      skills: [],
    });
    expect(index.skills).toEqual([]);
  });

  it("rejects wrong schemaVersion", () => {
    expect(() =>
      catalogIndexSchema.parse({
        schemaVersion: 2,
        skills: [],
      }),
    ).toThrow(ZodError);
  });
});
