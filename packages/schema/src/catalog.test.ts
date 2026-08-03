import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  catalogBundleSchema,
  catalogIndexSchema,
  catalogSkillSchema,
} from "./catalog.js";

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

const handoffSkill = {
  id: "responsibility-scope",
  name: "responsibility-scope",
  description: "Sort agency levels and control/obligation boundaries.",
  layer: "scenario" as const,
  scope: "official" as const,
  disciplines: ["political-science", "sociology"],
  language: "en",
  tags: ["orientation-pipeline", "responsibility", "scope"],
  version: "0.1.0",
  updated: "2026-07-31",
  repoPath: "skills/official/scenarios/responsibility-scope",
  pipeline: {
    id: "orientation-handoff",
    order: 1,
    next: "responsibility-bridge",
  },
  install: {
    cli: "npx openwisdom install responsibility-scope",
  },
};

const orientationBundle = {
  id: "orientation-handoff",
  title: "Orientation handoff",
  description: "Agency levels → ownership → analysis closure",
  skillIds: [
    "responsibility-scope",
    "responsibility-bridge",
    "analysis-closure",
  ],
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

  it("accepts optional pipeline", () => {
    const parsed = catalogSkillSchema.parse(handoffSkill);
    expect(parsed.pipeline).toEqual({
      id: "orientation-handoff",
      order: 1,
      next: "responsibility-bridge",
    });
  });

  it("allows omitting pipeline (old catalogs)", () => {
    expect(catalogSkillSchema.parse(sampleSkill).pipeline).toBeUndefined();
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

describe("catalogBundleSchema", () => {
  it("accepts orientation-handoff shape", () => {
    const parsed = catalogBundleSchema.parse(orientationBundle);
    expect(parsed.skillIds).toHaveLength(3);
  });
});

describe("catalogIndexSchema", () => {
  it("accepts schemaVersion 1 with skills array (no bundles — old catalogs)", () => {
    const index = catalogIndexSchema.parse({
      schemaVersion: 1,
      skills: [sampleSkill],
    });
    expect(index.skills).toHaveLength(1);
    expect(index.schemaVersion).toBe(1);
    expect(index.bundles).toBeUndefined();
  });

  it("accepts optional root bundles", () => {
    const index = catalogIndexSchema.parse({
      schemaVersion: 1,
      skills: [handoffSkill],
      bundles: [orientationBundle],
    });
    expect(index.bundles?.[0]?.id).toBe("orientation-handoff");
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
