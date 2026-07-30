import os from "node:os";
import {
  listInstalled,
  runInstall,
  UsageError,
  RuntimeError,
  type Scope,
} from "@openwisdom/core";
import { resolveCwd } from "../lib/env.js";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";
import { MCP_VERSION } from "../version.js";
import { formatInstallPayload } from "./install.js";

export type UpdateInput = {
  /** Optional; default = installed skill ids under scope */
  skills?: string[];
  providers: string[];
  scope?: "project" | "global";
  cwd?: string;
  /**
   * Default false — aligned with CLI `openwisdom update` (force only when set).
   * Spec 23 suggests force-for-update; product follows CLI current behavior.
   */
  force?: boolean;
  dryRun?: boolean;
  noDeps?: boolean;
  noTelemetry?: boolean;
};

/** Pure handler — unit-testable without MCP transport. */
export async function handleUpdate(input: UpdateInput): Promise<ToolResult> {
  try {
    const providers = (input.providers ?? [])
      .map((p) => p.trim())
      .filter(Boolean);

    if (!providers.length) {
      return toErrorResult(
        "Missing providers[]. MCP update is non-interactive — pass explicit harness ids (e.g. [\"claude\"]). Call openwisdom_detect_providers first if unsure.",
      );
    }

    const scope: Scope = input.scope ?? "project";
    if (scope !== "project" && scope !== "global") {
      return toErrorResult(`Invalid scope: ${scope}. Use project | global.`);
    }

    const cwd = resolveCwd(input.cwd);
    const packageRoot = getMcpPackageRoot();
    let skills = (input.skills ?? []).map((s) => s.trim()).filter(Boolean);

    if (!skills.length) {
      const installed = listInstalled({
        cwd,
        home: os.homedir(),
        providers,
        scope,
        env: process.env,
        packageRoot,
      });
      skills = [...new Set(installed.map((r) => r.id))];
      if (!skills.length) {
        return toTextResult(
          {
            ok: true,
            dryRun: Boolean(input.dryRun),
            results: [],
            warnings: ["No installed skills found to update."],
            errors: [],
            exitCode: 0,
          },
          { summary: "No installed skills found to update." },
        );
      }
    }

    const dryRun = Boolean(input.dryRun);
    // Match CLI update default: force only when explicitly true
    const force = Boolean(input.force);
    const noDeps = Boolean(input.noDeps);
    const noTelemetry = Boolean(input.noTelemetry);

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
      onLog: () => {
        /* no-op */
      },
    });

    const payload = {
      ...formatInstallPayload(result, { dryRun }),
      updatedSkillIds: skills,
    };
    const isError = !payload.ok;
    const summary = isError
      ? `Update finished with errors (exit ${payload.exitCode}).`
      : dryRun
        ? `Dry-run update for ${skills.length} skill(s) → ${providers.join(",")}.`
        : `Updated ${skills.length} skill(s) → ${providers.join(",")}.`;

    return toTextResult(payload, { summary, isError });
  } catch (err) {
    if (err instanceof UsageError || err instanceof RuntimeError) {
      return toErrorResult(err.message);
    }
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}
