import type { DisciplineId } from "@/data/catalog/types";

/** Border / ~10% fill only — Spec 07 / DESIGN.md. */
export const DISCIPLINE_CSS: Record<DisciplineId, string> = {
  psychology: "var(--ow-psych)",
  sociology: "var(--ow-socio)",
  history: "var(--ow-history)",
  "political-science": "var(--ow-poli)",
  economics: "var(--ow-econ)",
  philosophy: "var(--ow-philosophy)",
  education: "var(--ow-education)",
};

export const SHAPE_ACCENT: Record<
  "circle" | "square" | "triangle",
  string
> = {
  circle: "var(--ow-primary)",
  triangle: "var(--ow-signal)",
  square: "var(--ow-structure)",
};
