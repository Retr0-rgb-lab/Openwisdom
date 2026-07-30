import os from "node:os";
import {
  runInstall,
  UsageError,
  RuntimeError,
  type InstallResult,
  type Scope,
  type WriteOutcome,
} from "@openwisdom/core";
import { resolveCwd } from "../lib/env.js";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";
import { MCP_VERSION } from "../version.js";

export type InstallInput = {
  skills: string[];
  providers: string[];
  scope?: "project" | "global";
  cwd?: string;
  force?: boolean;
  dryRun?: boolean;
  noDeps?: boolean;
  noTelemetry?: boolean;
};

function outcomeAction(
  outcome: WriteOutcome,
): "copied" | "skipped" | "would_write" | "conflict" | "error" {
  switch (outcome.status) {
    case "installed":
      return "copied";
    case "up-to-date":
      return "skipped";
    case "conflict":
      return "conflict";
    case "error":
      return "error";
    case "dry-run":
      if (outcome.action === "conflict") return "conflict";
      if (outcome.action === "up-to-date") return "skipped";
      return "would_write";
    default:
      return "error";
  }
}

function formatInstallPayload(
  result: InstallResult,
  opts: { dryRun: boolean },
) {
  const warnings: string[] = [];
  const errors: string[] = [];
  const results: Array<{
    skillId: string;
    provider: string;
    path: string;
    action: string;
    message?: string;
  }> = [];

  for (const skill of result.results) {
    for (const o of skill.outcomes) {
      const action = outcomeAction(o.outcome);
      const path =
        "dir" in o.outcome ? o.outcome.dir : "";
      const entry: {
        skillId: string;
        provider: string;
        path: string;
        action: string;
        message?: string;
      } = {
        skillId: skill.skillId,
        provider: o.provider,
        path,
        action,
      };
      if (o.outcome.status === "error") {
        entry.message = o.outcome.message;
        errors.push(
          `${skill.skillId}@${o.provider}: ${o.outcome.message}`,
        );
      } else if (o.outcome.status === "conflict") {
        errors.push(
          `${skill.skillId}@${o.provider}: conflict at ${path} (use force: true)`,
        );
      }
      results.push(entry);
    }
    if (!skill.ok && skill.outcomes.length === 0) {
      errors.push(`${skill.skillId}: no write targets`);
    }
  }

  const ok = result.exitCode === 0;
  return {
    ok,
    dryRun: opts.dryRun,
    results,
    warnings,
    errors,
    exitCode: result.exitCode,
  };
}

/** Pure handler — unit-testable without MCP transport. */
export async function handleInstall(input: InstallInput): Promise<ToolResult> {
  try {
    const skills = (input.skills ?? []).map((s) => s.trim()).filter(Boolean);
    const providers = (input.providers ?? [])
      .map((p) => p.trim())
      .filter(Boolean);

    if (!skills.length) {
      return toErrorResult(
        "Missing skills[]. Pass at least one catalog id/slug. Example: openwisdom_install({ skills: [\"macro-scan\"], providers: [\"claude\"] })",
      );
    }
    if (!providers.length) {
      return toErrorResult(
        "Missing providers[]. MCP install is non-interactive — pass explicit harness ids (e.g. [\"claude\",\"agents\"]). Call openwisdom_detect_providers first if unsure.",
      );
    }

    const scope: Scope = input.scope ?? "project";
    if (scope !== "project" && scope !== "global") {
      return toErrorResult(`Invalid scope: ${scope}. Use project | global.`);
    }

    const cwd = resolveCwd(input.cwd);
    const dryRun = Boolean(input.dryRun);
    const force = Boolean(input.force);
    const noDeps = Boolean(input.noDeps);
    const noTelemetry = Boolean(input.noTelemetry);
    const packageRoot = getMcpPackageRoot();

    const result = runInstall({
      skillIds: skills,
      providerIds: providers,
      scope,
      cwd,
      home: os.homedir(),
      force,
      dryRun,
      noDeps,
      noTelemetry,
      yes: true,
      isTty: false,
      telemetrySource: "mcp",
      clientVersion: MCP_VERSION,
      env: process.env,
      packageRoot,
      // Silence success noise — never console.log on MCP stdio
      onLog: () => {
        /* no-op: tool result carries status */
      },
    });

    const payload = formatInstallPayload(result, { dryRun });
    const isError = !payload.ok;
    const summary = isError
      ? `Install finished with errors (exit ${payload.exitCode}).`
      : dryRun
        ? `Dry-run plan for ${skills.length} skill(s) → ${providers.join(",")}.`
        : `Installed ${skills.length} skill(s) → ${providers.join(",")}.`;

    return toTextResult(payload, { summary, isError });
  } catch (err) {
    if (err instanceof UsageError || err instanceof RuntimeError) {
      return toErrorResult(err.message);
    }
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}

export { formatInstallPayload };
