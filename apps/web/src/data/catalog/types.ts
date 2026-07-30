/** Catalog data contract — Spec 15 + Spec 16 extensions. Heat optional. */

export type SkillLayer = "scenario" | "reference";
export type SkillScope = "official" | "community";
export type ContentLang = "zh" | "en";
export type DisciplineId =
  | "psychology"
  | "sociology"
  | "history"
  | "political-science"
  | "economics"
  | "philosophy";

/** Honest provenance for UI badges (Spec 16). */
export type SkillProvenance =
  | "official"
  | "community"
  | "curated-external";

export type ContentAvailability =
  | "full-body"
  | "summary-only"
  | "external-only";

export type InstallMode = "cli" | "git-clone" | "link-only";

export type LocalizedString = { zh: string; en: string };

export type CatalogEntry = {
  id: string;
  slug: string;
  layer: SkillLayer;
  scope: SkillScope;
  disciplines: DisciplineId[];
  language: ContentLang;
  title: LocalizedString;
  summary: LocalizedString;
  tags: string[];
  version: string;
  updated: string;
  repoPath: string | null;
  install: { cli: string };
  /** bootstrap = product seed; catalog = generated/real tree */
  source: "bootstrap" | "catalog";
  /** UI badge; defaults from scope if omitted */
  provenance?: SkillProvenance;
  externalUrl?: string;
  license?: string;
  attribution?: string;
  author?: string;
  contentAvailability?: ContentAvailability;
  installMode?: InstallMode;
  featuredRank?: number;
  when?: LocalizedString;
  steps?: LocalizedString[];
  output?: LocalizedString[];
  bias?: LocalizedString[];
  shape?: "circle" | "square" | "triangle";
  axis?: LocalizedString;
  references?: string[];
  definition?: LocalizedString;
  bounds?: LocalizedString;
  misuse?: LocalizedString;
  questions?: LocalizedString[];
  installs30d?: number;
  installsTotal?: number;
};

export type SortKey = "featured" | "name" | "updated" | "popular";

export type CatalogQuery = {
  q?: string;
  layer?: SkillLayer | "";
  source?: SkillScope | "";
  disciplines?: DisciplineId[];
  lang?: ContentLang | "";
  sort?: SortKey;
};

/** Home short keys → filter IDs (Spec 15). */
export const DISCIPLINE_HOME_TO_ID = {
  psych: "psychology",
  socio: "sociology",
  history: "history",
  poli: "political-science",
  econ: "economics",
  philo: "philosophy",
} as const;

export const DISCIPLINE_IDS: DisciplineId[] = [
  "psychology",
  "sociology",
  "history",
  "political-science",
  "economics",
  "philosophy",
];

export function pickLocalized(
  value: LocalizedString,
  locale: string,
): string {
  if (locale === "en") return value.en;
  return value.zh;
}

export function entryProvenance(entry: CatalogEntry): SkillProvenance {
  if (entry.provenance) return entry.provenance;
  if (entry.scope === "official") return "official";
  if (entry.externalUrl) return "curated-external";
  return "community";
}
