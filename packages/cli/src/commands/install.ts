import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import {
  detectProviders,
  PROVIDERS,
  type ProviderId,
} from "@openwisdom/providers";
import {
  runInstall,
  UsageError,
  type LogLevel,
  type Scope,
} from "@openwisdom/core";
import os from "node:os";
import path from "node:path";
import { CLI_VERSION } from "../version.js";
import { collectSkillIds } from "../lib/collect-skill-ids.js";

async function promptProviders(
  cwd: string,
  home: string,
): Promise<ProviderId[] | null> {
  const detected = detectProviders(cwd, home);
  const p0 = PROVIDERS.filter((x) => x.tier === "p0");
  const initial = detected.project.length
    ? detected.project
    : (["claude", "agents"] as ProviderId[]);

  const result = await p.multiselect({
    message: "Install into which agents?",
    options: p0.map((x) => ({
      value: x.id,
      label: `${x.label} (${x.id})`,
      hint: detected.project.includes(x.id)
        ? "detected in project"
        : detected.global.includes(x.id)
          ? "detected in home"
          : undefined,
    })),
    initialValues: initial,
    required: true,
  });

  if (p.isCancel(result)) {
    p.cancel("Install cancelled.");
    return null;
  }
  return result as ProviderId[];
}

function cliOnLog(level: LogLevel, message: string): void {
  if (level === "info") console.log(message);
  else console.error(message);
}

export const installCommand = defineCommand({
  meta: {
    name: "install",
    description:
      "Copy skill(s) into agent skill dirs (ids and/or --bundle; multi-id: install id1 id2)",
  },
  args: {
    skill: {
      type: "positional",
      description: "Skill id(s) to install (optional if --bundle is set)",
      required: false,
    },
    bundle: {
      type: "string",
      description:
        "Catalog bundle id to expand (e.g. orientation-handoff). Combines with explicit skill ids",
    },
    providers: {
      type: "string",
      description: "Comma-separated provider ids (e.g. claude,agents)",
      alias: "p",
    },
    scope: {
      type: "string",
      description: "project | global (default project with -y)",
    },
    yes: {
      type: "boolean",
      description: "Skip prompts; default providers claude,agents if none detected",
      alias: "y",
      default: false,
    },
    force: {
      type: "boolean",
      description: "Overwrite conflicting skill content",
      default: false,
    },
    "dry-run": {
      type: "boolean",
      description: "Print write plan without writing",
      default: false,
    },
    "no-telemetry": {
      type: "boolean",
      description: "Disable install telemetry for this run",
      default: false,
    },
    lang: {
      type: "string",
      description: "Prompt language zh|en (reserved)",
    },
    cwd: {
      type: "string",
      description: "Project root for --scope project",
    },
    "no-deps": {
      type: "boolean",
      description: "Do not install catalog references[]",
      default: false,
    },
    registry: {
      type: "string",
      description: "Remote registry base URL (or OPENWISDOM_REGISTRY)",
    },
    "no-remote": {
      type: "boolean",
      description: "Skip remote registry; local skills/snapshot only",
      default: false,
    },
  },
  async run({ args, rawArgs }) {
    try {
      const skillIds = collectSkillIds(
        rawArgs,
        args.skill as string | undefined,
      );
      const bundle =
        typeof args.bundle === "string" ? args.bundle.trim() : "";
      const cwd = path.resolve(
        (args.cwd as string | undefined) || process.cwd(),
      );
      const home = os.homedir();
      const yes = Boolean(args.yes);
      const isTty = Boolean(process.stdin.isTTY);
      const ci = process.env.CI === "true" || process.env.CI === "1";

      if (!skillIds.length && !bundle) {
        console.error(
          "error: No skill ids or --bundle given. Example: openwisdom install macro-scan -y --providers=claude  or  openwisdom install --bundle=orientation-handoff -y",
        );
        process.exitCode = 2;
        return;
      }

      let scope = args.scope as string | undefined;
      if (!scope) {
        if (yes || !isTty || ci) {
          scope = "project";
        } else {
          const sel = await p.select({
            message: "Install scope",
            options: [
              { value: "project", label: "project (cwd)" },
              { value: "global", label: "global (home)" },
            ],
            initialValue: "project",
          });
          if (p.isCancel(sel)) {
            p.cancel("Install cancelled.");
            process.exitCode = 0;
            return;
          }
          scope = sel as string;
        }
      }
      if (scope !== "project" && scope !== "global") {
        console.error(`error: Invalid --scope: ${scope}`);
        process.exitCode = 2;
        return;
      }

      let interactiveProviders: ProviderId[] | null = null;
      if (!args.providers && !yes && isTty && !ci) {
        interactiveProviders = await promptProviders(cwd, home);
        if (interactiveProviders === null) {
          process.exitCode = 0;
          return;
        }
      } else if (!args.providers && !yes && (!isTty || ci)) {
        console.error(
          "error: Missing --providers in non-interactive mode. Use -y or --providers=claude,agents.",
        );
        process.exitCode = 2;
        return;
      }

      const result = await runInstall({
        skillIds,
        bundle: bundle || undefined,
        providers: args.providers as string | undefined,
        providerIds: interactiveProviders ?? undefined,
        scope: scope as Scope,
        cwd,
        home,
        force: Boolean(args.force),
        dryRun: Boolean(args["dry-run"]),
        yes,
        noDeps: Boolean(args["no-deps"]),
        noTelemetry: Boolean(args["no-telemetry"]),
        interactiveProviders,
        isTty,
        onLog: cliOnLog,
        telemetrySource: "cli",
        clientVersion: CLI_VERSION,
        registry: args.registry as string | undefined,
        noRemote: Boolean(args["no-remote"]),
      });

      console.error(
        "Next: invoke the skill in your coding agent. Analysis does not run on Openwisdom servers.",
      );
      process.exitCode = result.exitCode;
    } catch (err) {
      if (err instanceof UsageError) {
        console.error(`error: ${err.message}`);
        process.exitCode = 2;
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      console.error(`error: ${message}`);
      process.exitCode = 1;
    }
  },
});
