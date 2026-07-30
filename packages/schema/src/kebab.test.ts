import { describe, expect, it } from "vitest";
import { assertNameMatchesDir, isKebabName } from "./kebab.js";

describe("isKebabName", () => {
  it("accepts valid names", () => {
    expect(isKebabName("a")).toBe(true);
    expect(isKebabName("macro-scan")).toBe(true);
    expect(isKebabName("personal-anchor")).toBe(true);
    expect(isKebabName("metacognition-audit")).toBe(true);
    expect(isKebabName("path-dependence")).toBe(true);
    expect(isKebabName("a1-b2")).toBe(true);
    expect(isKebabName("x".repeat(64))).toBe(true);
  });

  it("rejects invalid names", () => {
    expect(isKebabName("")).toBe(false);
    expect(isKebabName("Macro-Scan")).toBe(false);
    expect(isKebabName("has spaces")).toBe(false);
    expect(isKebabName("..")).toBe(false);
    expect(isKebabName("-leading")).toBe(false);
    expect(isKebabName("trailing-")).toBe(false);
    expect(isKebabName("double--hyphen")).toBe(false);
    expect(isKebabName("under_score")).toBe(false);
    expect(isKebabName("dot.name")).toBe(false);
    expect(isKebabName("x".repeat(65))).toBe(false);
  });
});

describe("assertNameMatchesDir", () => {
  it("passes when equal", () => {
    expect(() => assertNameMatchesDir("macro-scan", "macro-scan")).not.toThrow();
  });

  it("throws when different", () => {
    expect(() => assertNameMatchesDir("macro-scan", "other")).toThrow(
      /must match directory name/,
    );
  });
});
