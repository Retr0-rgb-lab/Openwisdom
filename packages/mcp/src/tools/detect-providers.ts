import os from "node:os";
import {
  defaultProviderIds,
} from "@openwisdom/core";
import { detectProviders } from "@openwisdom/providers";
import { resolveCwd } from "../lib/env.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";

export type DetectProvidersInput = {
  cwd?: string;
  home?: string;
};

/** Pure handler — unit-testable without MCP transport. */
export async function handleDetectProviders(
  input: DetectProvidersInput = {},
): Promise<ToolResult> {
  try {
    const cwd = resolveCwd(input.cwd);
    const home = input.home?.trim()
      ? input.home.trim()
      : os.homedir();

    const detected = detectProviders(cwd, home);
    const recommended = defaultProviderIds(cwd, home);

    return toTextResult(
      {
        ok: true,
        cwd,
        project: detected.project,
        global: detected.global,
        recommended,
      },
      {
        summary: `Detected project=[${detected.project.join(",") || "none"}] global=[${detected.global.join(",") || "none"}]; recommended=[${recommended.join(",")}]`,
      },
    );
  } catch (err) {
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}
