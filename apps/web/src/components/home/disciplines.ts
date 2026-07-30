// Five discipline chip colors (specs/02 §5): border or 10% fill only —
// never full-card rainbow.
export const DISCIPLINE_COLORS = {
  psych: "var(--ow-psych)",
  socio: "var(--ow-socio)",
  history: "var(--ow-history)",
  poli: "var(--ow-poli)",
  econ: "var(--ow-econ)",
} as const;

export type DisciplineKey = keyof typeof DISCIPLINE_COLORS;

export const DISCIPLINE_ORDER: DisciplineKey[] = [
  "psych",
  "socio",
  "history",
  "poli",
  "econ",
];
