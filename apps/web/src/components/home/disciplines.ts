// Five discipline chip colors (specs/07 §2): logo-同源; border or 10% fill only —
// never full-card rainbow.
export const DISCIPLINE_COLORS = {
  psych: "var(--ow-psych)", // #E69622 signal
  socio: "var(--ow-socio)", // #1C4BD1 primary
  history: "var(--ow-history)", // #5C7A8A mist deepen
  poli: "var(--ow-poli)", // #3D4F8C low-sat, no bright purple
  econ: "var(--ow-econ)", // #2E6975 structure
} as const;

export type DisciplineKey = keyof typeof DISCIPLINE_COLORS;

export const DISCIPLINE_ORDER: DisciplineKey[] = [
  "psych",
  "socio",
  "history",
  "poli",
  "econ",
];
