/**
 * @openwisdom/providers — harness → skills path table (Spec 19).
 * Pure path/detect helpers; zero network.
 */
import { existsSync } from "node:fs";
import path from "node:path";

export type ProviderId = string;

export type ProviderDefinition = {
  id: ProviderId;
  /** CLI / UX display name */
  label: string;
  /** User-facing aliases (CLI --providers) */
  aliases: string[];
  /** Relative project-root skills root (posix segments; join at runtime) */
  projectSkillsDir: string;
  /** Relative homedir skills root; null = global not supported */
  globalSkillsDir: string | null;
  /** Detection: dirs under cwd that suggest this harness */
  detectProjectMarkers: string[];
  /** Detection: dirs under home that suggest this harness */
  detectHomeMarkers: string[];
  tier: "p0" | "p1" | "experimental";
  notes?: string;
};

export type DetectResult = {
  project: ProviderId[];
  global: ProviderId[];
};

/** Join a posix-style relative path onto base (+ optional skill name). */
function joinPosix(base: string, relPosix: string, skillName?: string): string {
  const parts = relPosix.split("/").filter(Boolean);
  if (skillName !== undefined) {
    return path.join(base, ...parts, skillName);
  }
  return path.join(base, ...parts);
}

function markerExists(root: string, marker: string): boolean {
  return existsSync(joinPosix(root, marker));
}

// ---------------------------------------------------------------------------
// Provider table (P0 + P1 + experimental)
// ---------------------------------------------------------------------------

export const PROVIDERS: ProviderDefinition[] = [
  // —— P0 ——
  {
    id: "claude",
    label: "Claude Code",
    aliases: ["claude-code"],
    projectSkillsDir: ".claude/skills",
    globalSkillsDir: ".claude/skills",
    detectProjectMarkers: [".claude"],
    detectHomeMarkers: [".claude"],
    tier: "p0",
  },
  {
    id: "cursor",
    label: "Cursor",
    aliases: [],
    projectSkillsDir: ".cursor/skills",
    globalSkillsDir: ".cursor/skills",
    detectProjectMarkers: [".cursor"],
    detectHomeMarkers: [".cursor"],
    tier: "p0",
  },
  {
    id: "codex",
    label: "Codex",
    aliases: [],
    projectSkillsDir: ".agents/skills",
    globalSkillsDir: ".codex/skills",
    detectProjectMarkers: [".agents", ".codex"],
    detectHomeMarkers: [".codex"],
    tier: "p0",
    notes: "Project path shared with agents; uniqueWriteTargets dedupes.",
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    aliases: ["gemini-cli"],
    projectSkillsDir: ".gemini/skills",
    globalSkillsDir: ".gemini/skills",
    detectProjectMarkers: [".gemini"],
    detectHomeMarkers: [".gemini"],
    tier: "p0",
  },
  {
    id: "github",
    label: "GitHub Copilot",
    aliases: ["copilot"],
    projectSkillsDir: ".github/skills",
    globalSkillsDir: ".copilot/skills",
    detectProjectMarkers: [".github"],
    detectHomeMarkers: [".copilot"],
    tier: "p0",
  },
  {
    id: "agents",
    label: "Portable agents",
    aliases: ["portable"],
    projectSkillsDir: ".agents/skills",
    globalSkillsDir: ".agents/skills",
    detectProjectMarkers: [".agents"],
    detectHomeMarkers: [".agents"],
    tier: "p0",
    notes: "Cross-harness portable skills root; may share path with codex project.",
  },

  // —— P1 ——
  {
    id: "grok",
    label: "Grok",
    aliases: [],
    projectSkillsDir: ".grok/skills",
    globalSkillsDir: ".grok/skills",
    detectProjectMarkers: [".grok"],
    detectHomeMarkers: [".grok"],
    tier: "p1",
    notes: "Impeccable / ecosystem common path; verify against official docs.",
  },
  {
    id: "opencode",
    label: "OpenCode",
    aliases: [],
    projectSkillsDir: ".opencode/skills",
    globalSkillsDir: ".config/opencode/skills",
    detectProjectMarkers: [".opencode"],
    detectHomeMarkers: [".config/opencode"],
    tier: "p1",
    notes: "Global is ~/.config/opencode/skills — never ~/.opencode.",
  },
  {
    id: "pi",
    label: "Pi",
    aliases: [],
    projectSkillsDir: ".pi/skills",
    globalSkillsDir: ".pi/agent/skills",
    detectProjectMarkers: [".pi"],
    detectHomeMarkers: [".pi"],
    tier: "p1",
    notes: "Global path is .pi/agent/skills (not .pi/skills).",
  },
  {
    id: "kiro",
    label: "Kiro",
    aliases: [],
    projectSkillsDir: ".kiro/skills",
    globalSkillsDir: ".kiro/skills",
    detectProjectMarkers: [".kiro"],
    detectHomeMarkers: [".kiro"],
    tier: "p1",
  },
  {
    id: "qoder",
    label: "Qoder",
    aliases: [],
    projectSkillsDir: ".qoder/skills",
    globalSkillsDir: ".qoder/skills",
    detectProjectMarkers: [".qoder"],
    detectHomeMarkers: [".qoder"],
    tier: "p1",
  },
  {
    id: "trae",
    label: "Trae",
    aliases: [],
    projectSkillsDir: ".trae/skills",
    globalSkillsDir: ".trae/skills",
    detectProjectMarkers: [".trae"],
    detectHomeMarkers: [".trae"],
    tier: "p1",
  },
  {
    id: "trae-cn",
    label: "Trae CN",
    aliases: [],
    projectSkillsDir: ".trae-cn/skills",
    globalSkillsDir: ".trae-cn/skills",
    detectProjectMarkers: [".trae-cn"],
    detectHomeMarkers: [".trae-cn"],
    tier: "p1",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    aliases: [],
    projectSkillsDir: ".windsurf/skills",
    globalSkillsDir: ".codeium/windsurf/skills",
    detectProjectMarkers: [".windsurf"],
    detectHomeMarkers: [".codeium/windsurf", ".codeium"],
    tier: "p1",
  },
  {
    id: "cline",
    label: "Cline",
    aliases: [],
    projectSkillsDir: ".cline/skills",
    globalSkillsDir: ".cline/skills",
    detectProjectMarkers: [".cline"],
    detectHomeMarkers: [".cline"],
    tier: "p1",
  },

  // —— experimental ——
  {
    id: "rovodev",
    label: "Rovo Dev",
    aliases: [],
    projectSkillsDir: ".rovodev/skills",
    globalSkillsDir: ".rovodev/skills",
    detectProjectMarkers: [".rovodev"],
    detectHomeMarkers: [".rovodev"],
    tier: "experimental",
  },
  {
    id: "vibe",
    label: "Vibe",
    aliases: [],
    projectSkillsDir: ".vibe/skills",
    globalSkillsDir: ".vibe/skills",
    detectProjectMarkers: [".vibe"],
    detectHomeMarkers: [".vibe"],
    tier: "experimental",
  },
];

// ---------------------------------------------------------------------------
// Lookup / parse
// ---------------------------------------------------------------------------

function normalizeKey(s: string): string {
  return s.trim().toLowerCase();
}

/** Resolve by id or alias (case-insensitive). */
export function getProvider(idOrAlias: string): ProviderDefinition | undefined {
  const key = normalizeKey(idOrAlias);
  if (!key) return undefined;
  return PROVIDERS.find(
    (p) =>
      normalizeKey(p.id) === key ||
      p.aliases.some((a) => normalizeKey(a) === key),
  );
}

/**
 * Parse `--providers` CSV into canonical provider ids.
 * @throws if any token is unknown
 */
export function parseProvidersFlag(csv: string): ProviderId[] {
  const tokens = csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new Error("No providers specified in --providers flag");
  }

  const ids: ProviderId[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const provider = getProvider(token);
    if (!provider) {
      throw new Error(`Unknown provider: ${token}`);
    }
    if (!seen.has(provider.id)) {
      seen.add(provider.id);
      ids.push(provider.id);
    }
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Detect
// ---------------------------------------------------------------------------

/**
 * Detect harnesses present under cwd / home via markers.
 * P0 + P1 only (experimental requires explicit --providers).
 */
export function detectProviders(cwd: string, home: string): DetectResult {
  const project: ProviderId[] = [];
  const global: ProviderId[] = [];

  for (const p of PROVIDERS) {
    if (p.tier === "experimental") continue;

    if (p.detectProjectMarkers.some((m) => markerExists(cwd, m))) {
      project.push(p.id);
    }
    if (p.detectHomeMarkers.some((m) => markerExists(home, m))) {
      global.push(p.id);
    }
  }

  return { project, global };
}

// ---------------------------------------------------------------------------
// Resolve / unique write targets
// ---------------------------------------------------------------------------

export function resolveSkillDir(opts: {
  provider: ProviderId;
  scope: "project" | "global";
  cwd: string;
  home: string;
  skillName: string;
}): string {
  const provider = getProvider(opts.provider);
  if (!provider) {
    throw new Error(`Unknown provider: ${opts.provider}`);
  }

  if (opts.scope === "project") {
    return joinPosix(opts.cwd, provider.projectSkillsDir, opts.skillName);
  }

  if (provider.globalSkillsDir === null) {
    throw new Error(
      `Provider "${provider.id}" does not support global scope`,
    );
  }
  return joinPosix(opts.home, provider.globalSkillsDir, opts.skillName);
}

/**
 * Resolve write targets and dedupe when multiple providers share the same dir
 * (e.g. codex + agents both use project `.agents/skills/<name>`).
 * First provider id in the input list wins for a given path.
 */
export function uniqueWriteTargets(
  providers: string[],
  scope: "project" | "global",
  cwd: string,
  home: string,
  skillName: string,
): { provider: string; dir: string }[] {
  const out: { provider: string; dir: string }[] = [];
  const seenDirs = new Set<string>();

  for (const id of providers) {
    const dir = resolveSkillDir({
      provider: id,
      scope,
      cwd,
      home,
      skillName,
    });
    // Normalize for stable dedupe across slash styles
    const key = path.normalize(dir);
    if (seenDirs.has(key)) continue;
    seenDirs.add(key);
    out.push({ provider: getProvider(id)?.id ?? id, dir });
  }

  return out;
}
