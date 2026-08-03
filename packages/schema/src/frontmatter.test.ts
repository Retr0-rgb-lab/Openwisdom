import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  parseSkillFrontmatter,
  skillFrontmatterSchema,
} from "./frontmatter.js";

const macroScanLike = {
  name: "macro-scan",
  description:
    "Scan macro structure across political economy and collective action lenses for agent-native analysis.",
  layer: "scenario" as const,
  scope: "official" as const,
  disciplines: ["political-science", "economics", "sociology"],
  language: "zh",
  tags: ["macro", "structure"],
  version: "0.1.0",
  references: ["path-dependence", "collective-action"],
  license: "MIT",
  metadata: { openwisdom: true },
};

describe("skillFrontmatterSchema / parseSkillFrontmatter", () => {
  it("parses valid macro-scan-like frontmatter", () => {
    const parsed = parseSkillFrontmatter(macroScanLike);
    expect(parsed.name).toBe("macro-scan");
    expect(parsed.description.length).toBeGreaterThan(0);
    expect(parsed.id).toBe("macro-scan"); // default from name
    expect(parsed.layer).toBe("scenario");
    expect(parsed.scope).toBe("official");
    expect(parsed.disciplines).toEqual([
      "political-science",
      "economics",
      "sociology",
    ]);
    expect(parsed.references).toEqual([
      "path-dependence",
      "collective-action",
    ]);
    expect(parsed.metadata?.openwisdom).toBe(true);
  });

  it("accepts minimal agentskills fields only", () => {
    const parsed = parseSkillFrontmatter({
      name: "personal-anchor",
      description: "Minimal personal anchor scenario.",
    });
    expect(parsed.id).toBe("personal-anchor");
    expect(parsed.layer).toBeUndefined();
  });

  it("keeps explicit id when provided", () => {
    const parsed = parseSkillFrontmatter({
      name: "macro-scan",
      description: "d".repeat(10),
      id: "macro-scan-v2",
    });
    expect(parsed.id).toBe("macro-scan-v2");
  });

  it("rejects name with spaces", () => {
    expect(() =>
      parseSkillFrontmatter({
        name: "macro scan",
        description: "valid description here",
      }),
    ).toThrow(ZodError);
  });

  it("rejects name with ..", () => {
    expect(() =>
      parseSkillFrontmatter({
        name: "..",
        description: "valid description here",
      }),
    ).toThrow(ZodError);
  });

  it("rejects missing description", () => {
    expect(() =>
      parseSkillFrontmatter({
        name: "macro-scan",
      }),
    ).toThrow(ZodError);
  });

  it("rejects empty description", () => {
    expect(() =>
      parseSkillFrontmatter({
        name: "macro-scan",
        description: "",
      }),
    ).toThrow(ZodError);
  });

  it("rejects description over 1024 chars", () => {
    expect(() =>
      parseSkillFrontmatter({
        name: "macro-scan",
        description: "x".repeat(1025),
      }),
    ).toThrow(ZodError);
  });

  it("rejects invalid layer", () => {
    expect(() =>
      parseSkillFrontmatter({
        name: "macro-scan",
        description: "ok",
        layer: "workflow",
      }),
    ).toThrow(ZodError);
  });

  it("safeParse fails on bad name without throwing", () => {
    const result = skillFrontmatterSchema.safeParse({
      name: "Bad_Name",
      description: "ok",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional pipeline", () => {
    const parsed = parseSkillFrontmatter({
      name: "responsibility-scope",
      description: "Sort agency levels.",
      pipeline: {
        id: "orientation-handoff",
        order: 1,
        next: "responsibility-bridge",
      },
    });
    expect(parsed.pipeline).toEqual({
      id: "orientation-handoff",
      order: 1,
      next: "responsibility-bridge",
    });
  });

  it("promotes metadata.pipeline when top-level omitted", () => {
    const parsed = parseSkillFrontmatter({
      name: "analysis-closure",
      description: "Close the analysis run.",
      metadata: {
        openwisdom: true,
        pipeline: { id: "orientation-handoff", order: 3 },
      },
    });
    expect(parsed.pipeline).toEqual({
      id: "orientation-handoff",
      order: 3,
    });
  });

  it("parses without pipeline (old skills)", () => {
    const parsed = parseSkillFrontmatter(macroScanLike);
    expect(parsed.pipeline).toBeUndefined();
  });
});
