/**
 * Load machine registry (installable truth) from public/registry/catalog.json.
 *
 * Static JSON import keeps getCatalog() usable from client components
 * (SkillsCatalog / GlobalSearch) without bundling node:fs.
 * Artifact path mirrors apps/web/public/registry/catalog.json
 * (cwd when running web scripts: apps/web).
 */

import registryJson from "../../../public/registry/catalog.json";
import type {
  CatalogEntry,
  ContentLang,
  DisciplineId,
  SkillLayer,
  SkillScope,
} from "./types";

/** Minimal shape of one skill in public/registry/catalog.json */
export type RegistrySkill = {
  id: string;
  name: string;
  description: string;
  layer: SkillLayer;
  scope: SkillScope;
  disciplines: string[];
  language: string;
  tags: string[];
  version: string;
  updated: string;
  repoPath: string;
  references?: string[];
  install?: { cli?: string };
};

type RegistryIndex = {
  schemaVersion?: number;
  skills?: RegistrySkill[];
};

const DISCIPLINE_SET = new Set<string>([
  "psychology",
  "sociology",
  "history",
  "political-science",
  "economics",
  "philosophy",
]);

function asDiscipline(id: string): DisciplineId | null {
  return DISCIPLINE_SET.has(id) ? (id as DisciplineId) : null;
}

function asLayer(raw: string): SkillLayer | null {
  if (raw === "scenario" || raw === "reference") return raw;
  return null;
}

function asScope(raw: string): SkillScope | null {
  if (raw === "official" || raw === "community") return raw;
  return null;
}

function asLang(raw: string): ContentLang {
  return raw === "en" ? "en" : "zh";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Parse & validate one registry skill; return null if unusable. */
export function parseRegistrySkill(raw: unknown): RegistrySkill | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : id;
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  if (!id || !description) return null;

  const layer = asLayer(String(raw.layer ?? ""));
  const scope = asScope(String(raw.scope ?? ""));
  if (!layer || !scope) return null;

  const disciplines = Array.isArray(raw.disciplines)
    ? raw.disciplines.filter((d): d is string => typeof d === "string")
    : [];
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === "string")
    : [];
  const language =
    typeof raw.language === "string" && raw.language.trim()
      ? raw.language.trim()
      : "zh";
  const version =
    typeof raw.version === "string" && raw.version.trim()
      ? raw.version.trim()
      : "0.1.0";
  const updated =
    typeof raw.updated === "string" && raw.updated.trim()
      ? raw.updated.trim()
      : "";
  const repoPath =
    typeof raw.repoPath === "string" && raw.repoPath.trim()
      ? raw.repoPath.trim()
      : `skills/${scope}/${layer === "scenario" ? "scenarios" : "references"}/${id}`;

  let installCli =
    isRecord(raw.install) && typeof raw.install.cli === "string"
      ? raw.install.cli.trim()
      : "";
  if (!installCli) {
    installCli = `npx openwisdom install ${id}`;
  }

  const references = Array.isArray(raw.references)
    ? raw.references.filter((r): r is string => typeof r === "string")
    : undefined;

  return {
    id,
    name,
    description,
    layer,
    scope,
    disciplines,
    language,
    tags,
    version,
    updated,
    repoPath,
    references,
    install: { cli: installCli },
  };
}

/** Read skills array from registry JSON (empty if missing/invalid). */
export function loadRegistrySkills(): RegistrySkill[] {
  try {
    const root = registryJson as RegistryIndex;
    if (!root || !Array.isArray(root.skills)) return [];
    const out: RegistrySkill[] = [];
    for (const item of root.skills) {
      const parsed = parseRegistrySkill(item);
      if (parsed) out.push(parsed);
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Map a machine-registry skill to CatalogEntry (installable truth).
 * UI-rich fields (when/steps/shape) filled later via bootstrap overlay.
 */
export function mapRegistryToEntry(skill: RegistrySkill): CatalogEntry {
  const disciplines = skill.disciplines
    .map(asDiscipline)
    .filter((d): d is DisciplineId => d !== null);

  const desc = skill.description;
  return {
    id: skill.id,
    slug: skill.id,
    layer: skill.layer,
    scope: skill.scope,
    disciplines:
      disciplines.length > 0 ? disciplines : (["psychology"] as DisciplineId[]),
    language: asLang(skill.language),
    title: { zh: skill.name, en: skill.name },
    summary: { zh: desc, en: desc },
    tags: skill.tags,
    version: skill.version,
    updated: skill.updated,
    repoPath: skill.repoPath,
    install: {
      cli: skill.install?.cli ?? `npx openwisdom install ${skill.id}`,
    },
    source: "catalog",
    provenance: skill.scope === "official" ? "official" : "community",
    installMode: "cli",
    contentAvailability: "summary-only",
    references: skill.references,
  };
}
