/**
 * Shared install / update orchestration (library; no process.exit, no TTY prompts).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  detectProviders,
  parseProvidersFlag,
  PROVIDERS,
  uniqueWriteTargets,
  type ProviderId,
} from "@openwisdom/providers";
import type { CatalogIndex, CatalogSkill } from "@openwisdom/schema";
import { writeSkillDir, type WriteOutcome } from "./copy-skill.js";
import { loadCatalog } from "./catalog.js";
import { locateSkillDir, resolveSkillsRoot } from "./skills-root.js";
import {
  reportInstallSuccess,
  type TelemetrySource,
} from "./telemetry.js";

export type Scope = "project" | "global";

export type LogLevel = "info" | "warn" | "error";

export type InstallOptions = {
  skillIds: string[];
  providers?: string; // CSV
  providerIds?: ProviderId[];
  scope?: Scope;
  cwd?: string;
  home?: string;
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  noDeps?: boolean;
  noTelemetry?: boolean;
  env?: NodeJS.ProcessEnv;
  /** Skip interactive; for tests / non-TTY */
  interactiveProviders?: ProviderId[] | null;
  /**
   * Whether stdin is a TTY. Library default **false** (non-interactive).
   * CLI should pass `process.stdin.isTTY`.
   */
  isTty?: boolean;
  /** Optional log sink; success noise is silent when omitted. Warn/error go to stderr if omitted. */
  onLog?: (level: LogLevel, message: string) => void;
  /** Telemetry source channel; default "cli" */
  telemetrySource?: TelemetrySource;
  /** Client/package version for telemetry payload */
  clientVersion?: string;
  /** Injectable package root for catalog snapshot resolution */
  packageRoot?: string;
  /** Absolute catalog.json path override */
  catalogPath?: string;
};

export type InstallSkillResult = {
  skillId: string;
  outcomes: Array<{ provider: string; outcome: WriteOutcome }>;
  ok: boolean;
};

export type InstallResult = {
  results: InstallSkillResult[];
  exitCode: number;
};

export function defaultProviderIds(cwd: string, home: string): ProviderId[] {
  const detected = detectProviders(cwd, home);
  if (detected.project.length > 0) return [...new Set(detected.project)];
  return ["claude", "agents"];
}

export function resolveProviderIds(opts: {
  providersCsv?: string;
  providerIds?: ProviderId[];
  yes?: boolean;
  cwd: string;
  home: string;
  interactive?: ProviderId[] | null;
  /** Library default false when omitted */
  isTty?: boolean;
}): ProviderId[] {
  if (opts.providerIds && opts.providerIds.length > 0) {
    return opts.providerIds;
  }
  if (opts.providersCsv?.trim()) {
    return parseProvidersFlag(opts.providersCsv);
  }
  if (opts.interactive && opts.interactive.length > 0) {
    return opts.interactive;
  }
  if (opts.yes) {
    return defaultProviderIds(opts.cwd, opts.home);
  }
  // Non-interactive missing providers → caller should surface UsageError
  const isTty = opts.isTty ?? false;
  if (!isTty) {
    throw new UsageError(
      "Missing --providers (non-TTY). Pass --providers=claude,agents or use -y.",
    );
  }
  return defaultProviderIds(opts.cwd, opts.home);
}

export class UsageError extends Error {
  readonly exitCode = 2;
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

export class RuntimeError extends Error {
  readonly exitCode = 1;
  constructor(message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}

function log(
  opts: InstallOptions,
  level: LogLevel,
  message: string,
): void {
  if (opts.onLog) {
    opts.onLog(level, message);
    return;
  }
  // Library default: silence info success noise; warn/error → stderr only
  if (level === "warn" || level === "error") {
    console.error(message);
  }
}

function expandWithDeps(
  skillIds: string[],
  catalog: CatalogIndex,
  noDeps: boolean,
  opts: InstallOptions,
): string[] {
  if (noDeps) return [...new Set(skillIds)];
  const byId = new Map(catalog.skills.map((s) => [s.id, s]));
  const out: string[] = [];
  const seen = new Set<string>();
  const queue = [...skillIds];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    const entry = byId.get(id);
    if (entry?.references?.length) {
      for (const ref of entry.references) {
        if (!seen.has(ref)) {
          if (byId.has(ref)) queue.push(ref);
          else {
            log(
              opts,
              "warn",
              `warn: reference "${ref}" listed by ${id} not in catalog; skipping`,
            );
          }
        }
      }
    }
  }
  return out;
}

export function runInstall(opts: InstallOptions): InstallResult {
  const env = opts.env ?? process.env;
  const cwd = path.resolve(opts.cwd ?? process.cwd());
  const home = opts.home ?? os.homedir();
  const yes = opts.yes ?? false;
  const force = opts.force ?? false;
  const dryRun = opts.dryRun ?? false;
  const noDeps = opts.noDeps ?? false;
  // Library default: non-interactive
  const isTty = opts.isTty ?? false;

  if (!opts.skillIds.length) {
    throw new UsageError(
      "No skill ids given. Example: openwisdom install macro-scan -y",
    );
  }

  let providerIds: ProviderId[];
  try {
    providerIds = resolveProviderIds({
      providersCsv: opts.providers,
      providerIds: opts.providerIds,
      yes,
      cwd,
      home,
      interactive: opts.interactiveProviders,
      isTty,
    });
  } catch (err) {
    if (err instanceof UsageError) throw err;
    throw new UsageError(err instanceof Error ? err.message : String(err));
  }

  const scope: Scope = opts.scope ?? "project";
  if (scope !== "project" && scope !== "global") {
    throw new UsageError(`Invalid --scope: ${scope}`);
  }

  const skillsRoot = resolveSkillsRoot({ env, cwd, packageRoot: opts.packageRoot });
  let catalog: CatalogIndex;
  try {
    catalog = loadCatalog({
      skillsRoot,
      cwd,
      env,
      packageRoot: opts.packageRoot,
      catalogPath: opts.catalogPath,
    }).index;
  } catch {
    catalog = { schemaVersion: 1, skills: [] };
  }

  const ids = expandWithDeps(opts.skillIds, catalog, noDeps, opts);
  const results: InstallSkillResult[] = [];

  for (const skillId of ids) {
    const sourceDir = locateSkillDir(skillsRoot, skillId);
    const targets = uniqueWriteTargets(
      providerIds,
      scope,
      cwd,
      home,
      skillId,
    );

    const outcomes: InstallSkillResult["outcomes"] = [];
    let skillOk = true;

    for (const t of targets) {
      const outcome = writeSkillDir({
        sourceDir,
        targetDir: t.dir,
        force,
        dryRun,
      });
      outcomes.push({ provider: t.provider, outcome });

      if (outcome.status === "conflict") {
        skillOk = false;
        log(
          opts,
          "error",
          `conflict: ${skillId} @ ${t.dir} differs from source. Use --force to overwrite.`,
        );
      } else if (outcome.status === "error") {
        skillOk = false;
        log(
          opts,
          "error",
          `error: ${skillId} @ ${t.dir}: ${outcome.message}`,
        );
      } else if (outcome.status === "dry-run") {
        log(
          opts,
          "info",
          `[dry-run] ${skillId} → ${t.dir} (${outcome.action}) [${t.provider}]`,
        );
      } else if (outcome.status === "up-to-date") {
        log(
          opts,
          "info",
          `up-to-date: ${skillId} → ${t.dir} [${t.provider}]`,
        );
      } else if (outcome.status === "installed") {
        log(
          opts,
          "info",
          `installed: ${skillId} → ${t.dir} [${t.provider}]`,
        );
      }
    }

    if (
      skillOk &&
      !dryRun &&
      outcomes.every(
        (o) =>
          o.outcome.status === "installed" ||
          o.outcome.status === "up-to-date",
      )
    ) {
      // Telemetry only when at least one fresh install succeeded for the skill
      const anyInstalled = outcomes.some((o) => o.outcome.status === "installed");
      if (anyInstalled) {
        // Fire-and-forget; never blocks / fails install
        void reportInstallSuccess(
          {
            skillId,
            providers: outcomes.map((o) => o.provider),
            scope,
          },
          {
            noTelemetryFlag: opts.noTelemetry,
            env,
            source: opts.telemetrySource ?? "cli",
            clientVersion: opts.clientVersion,
          },
        );
      }
    }

    results.push({ skillId, outcomes, ok: skillOk });
  }

  const anyFail = results.some((r) => !r.ok);
  return { results, exitCode: anyFail ? 1 : 0 };
}

/** True if dir looks like an Openwisdom-managed install (Spec 18 heuristics). */
function isOpenwisdomInstalledSkill(
  skillDir: string,
  dirName: string,
  catalogIds: Set<string>,
): boolean {
  if (catalogIds.has(dirName)) return true;
  const skillMd = path.join(skillDir, "SKILL.md");
  try {
    const raw = readFileSync(skillMd, "utf8");
    // metadata.openwisdom: true (YAML forms)
    if (/openwisdom\s*:\s*true\b/i.test(raw)) return true;
    if (/source\s*:\s*["']?openwisdom["']?/i.test(raw)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Scan provider skill roots for installed Openwisdom skills only. */
export function listInstalled(opts: {
  cwd?: string;
  home?: string;
  providers?: ProviderId[];
  scope?: "project" | "global" | "all";
  /** When set, only report skills whose id is in catalog or has openwisdom marker */
  catalogIds?: Iterable<string>;
  packageRoot?: string;
  catalogPath?: string;
  env?: NodeJS.ProcessEnv;
}): Array<{ id: string; provider: string; scope: Scope; dir: string }> {
  const cwd = path.resolve(opts.cwd ?? process.cwd());
  const home = opts.home ?? os.homedir();
  const scope = opts.scope ?? "all";
  const providerIds =
    opts.providers ??
    PROVIDERS.filter((p) => p.tier === "p0" || p.tier === "p1").map((p) => p.id);

  let catalogIds = new Set(opts.catalogIds ?? []);
  if (catalogIds.size === 0) {
    try {
      const { index } = loadCatalog({
        env: opts.env ?? process.env,
        packageRoot: opts.packageRoot,
        catalogPath: opts.catalogPath,
      });
      for (const s of index.skills) {
        catalogIds.add(s.id);
        catalogIds.add(s.name);
      }
    } catch {
      /* catalog optional — then only metadata.openwisdom markers match */
    }
  }

  const found: Array<{
    id: string;
    provider: string;
    scope: Scope;
    dir: string;
  }> = [];
  const seen = new Set<string>();

  for (const id of providerIds) {
    const def = PROVIDERS.find((p) => p.id === id);
    if (!def) continue;

    const check = (sc: Scope, base: string, rel: string | null) => {
      if (!rel) return;
      const root = path.join(base, ...rel.split("/").filter(Boolean));
      if (!existsSync(root)) return;
      let entries;
      try {
        entries = readdirSync(root, { withFileTypes: true });
      } catch {
        return;
      }
      for (const ent of entries) {
        if (!ent.isDirectory() || ent.name.startsWith(".")) continue;
        const skillDir = path.join(root, ent.name);
        const skillMd = path.join(skillDir, "SKILL.md");
        if (!existsSync(skillMd)) continue;
        if (!isOpenwisdomInstalledSkill(skillDir, ent.name, catalogIds)) continue;
        const key = path.normalize(skillDir);
        if (seen.has(key)) continue;
        seen.add(key);
        found.push({
          id: ent.name,
          provider: id,
          scope: sc,
          dir: skillDir,
        });
      }
    };

    if (scope === "project" || scope === "all") {
      check("project", cwd, def.projectSkillsDir);
    }
    if (scope === "global" || scope === "all") {
      check("global", home, def.globalSkillsDir);
    }
  }

  found.sort((a, b) => a.id.localeCompare(b.id) || a.provider.localeCompare(b.provider));
  return found;
}

export function getCatalogSkill(
  catalog: CatalogIndex,
  id: string,
): CatalogSkill | undefined {
  return catalog.skills.find((s) => s.id === id || s.name === id);
}
