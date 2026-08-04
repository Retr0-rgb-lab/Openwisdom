import { describe, expect, it } from "vitest";
import { inferScopeAndLayer } from "./scope-layer.js";

describe("inferScopeAndLayer", () => {
  it("parses monorepo-relative skills/ paths (catalog build shape)", () => {
    expect(
      inferScopeAndLayer("skills/official/scenarios/macro-scan"),
    ).toEqual({ scope: "official", layer: "scenario" });
    expect(
      inferScopeAndLayer("skills/community/references/path-dependence"),
    ).toEqual({ scope: "community", layer: "reference" });
  });

  it("parses skills-root-relative paths (runtime scan shape)", () => {
    expect(inferScopeAndLayer("official/scenarios/macro-scan")).toEqual({
      scope: "official",
      layer: "scenario",
    });
    expect(
      inferScopeAndLayer("community/references/path-dependence"),
    ).toEqual({ scope: "community", layer: "reference" });
  });

  it("returns empty when layout is unknown", () => {
    expect(inferScopeAndLayer("random/path")).toEqual({});
    expect(inferScopeAndLayer("skills/only-one-segment")).toEqual({});
    expect(inferScopeAndLayer("")).toEqual({});
  });
});
