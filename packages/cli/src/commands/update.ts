import { defineCommand } from "citty";
import os from "node:os";
import path from "node:path";
import {
  ensureRemoteCatalog,
  listInstalled,
  runInstall,
  UsageError,
  type LogLevel,
  type Scope,
} from "@openwisdom/core";
import { CLI_VERSION } from "../version.js";

function collectSkillIds(rawArgs: string[], positional?: string): string[] {
  const ids: string[] = [];
  if (positional) ids.push(positional);
  let skipNext = false;
  const flagValueKeys = new Set([
    "--providers",
    "--scope",
    "--cwd",
    "--lang",
  ]);
  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i]!;
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (a === "update") continue;
    if (flagValueKeys.has(a)) {
      skipNext = true;
      continue;
    }
    if (a.startsWith("--providers=") || a.startsWith("--scope=")) continue;
    if (a.startsWith("--cwd=")) continue;
    if (a.startsWith("-")) continue;
    if (!ids.includes(a)) ids.push(a);
  }
  return ids;
}

function cliOnLog(level: LogLevel, message: string): void {
  if (level === "info") console.log(message);
  else console.error(message);
}

export const updateCommand = defineCommand({
  meta: {
    name: "update",
    description:
      "Re-copy installed (or named) skills from local skills root / monorepo",
  },
  args: {
    skill: {
      type: "positional",
      description: "Skill id(s) to update (default: all installed)",
      required: false,
    },
    providers: {
      type: "string",
      description: "Limit providers",
    },
    scope: {
      type: "string",
      description: "project | global",
      default: "project",
    },
    yes: {
      type: "boolean",
      description: "Skip confirmation",
      alias: "y",
      default: false,
    },
    force: {
      type: "boolean",
      description: "Overwrite local modifications",
      default: false,
    },
    "dry-run": {
      type: "boolean",
      description: "Print plan only",
      default: false,
    },
    "no-telemetry": {
      type: "boolean",
      default: false,
    },
    cwd: {
      type: "string",
      description: "Project root",
    },
    "refresh-only": {
      type: "boolean",
      description: "Refresh remote catalog cache only (no skill write)",
      default: false,
    },
    "no-deps": {
      type: "boolean",
      default: false,
    },
    registry: {
      type: "string",
      description: "Remote registry base URL",
    },
    "no-remote": {
      type: "boolean",
      description: "Skip remote registry",
      default: false,
    },
  },
  async run({ args, rawArgs }) {
    try {
      if (args["refresh-only"]) {
        if (args["no-remote"]) {
          console.error("error: --refresh-only requires remote (drop --no-remote)");
          process.exitCode = 2;
          return;
        }
        const result = await ensureRemoteCatalog({
          registry: args.registry as string | undefined,
          forceRefresh: true,
          onLog: (level, message) => {
            if (level === "info") console.log(message);
            else console.error(message);
          },
        });
        if (result.ok) {
          console.log(
            `Catalog cache ok (${result.source})${result.contentHash ? ` hash=${result.contentHash}` : ""}`,
          );
          if (result.catalogPath) console.log(`  ${result.catalogPath}`);
          process.exitCode = 0;
        } else {
          console.error(
            `error: registry refresh failed${result.message ? `: ${result.message}` : ""}`,
          );
          process.exitCode = 1;
        }
        return;
      }

      const cwd = path.resolve(
        (args.cwd as string | undefined) || process.cwd(),
      );
      const home = os.homedir();
      let skillIds = collectSkillIds(rawArgs, args.skill as string | undefined);
      const isTty = Boolean(process.stdin.isTTY);

      if (!skillIds.length) {
        const installed = listInstalled({
          cwd,
          home,
          scope:
            args.scope === "global"
              ? "global"
              : args.scope === "project"
                ? "project"
                : "all",
        });
        skillIds = [...new Set(installed.map((r) => r.id))];
        if (!skillIds.length) {
          console.error("No installed skills found to update.");
          process.exitCode = 0;
          return;
        }
        console.error(`# updating ${skillIds.length} installed skill(s)`);
      }

      const scope = (args.scope as string) || "project";
      if (scope !== "project" && scope !== "global") {
        console.error(`error: Invalid --scope: ${scope}`);
        process.exitCode = 2;
        return;
      }

      // update is non-interactive by default when -y or CI; require providers or -y defaults
      const yes = Boolean(args.yes) || !isTty;
      const result = await runInstall({
        skillIds,
        providers: args.providers as string | undefined,
        scope: scope as Scope,
        cwd,
        home,
        force: Boolean(args.force),
        dryRun: Boolean(args["dry-run"]),
        yes,
        noDeps: Boolean(args["no-deps"]),
        noTelemetry: Boolean(args["no-telemetry"]),
        isTty,
        onLog: cliOnLog,
        telemetrySource: "cli",
        clientVersion: CLI_VERSION,
        registry: args.registry as string | undefined,
        noRemote: Boolean(args["no-remote"]),
      });

      process.exitCode = result.exitCode;
    } catch (err) {
      if (err instanceof UsageError) {
        console.error(`error: ${err.message}`);
        process.exitCode = 2;
        return;
      }
      console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
      process.exitCode = 1;
    }
  },
});
