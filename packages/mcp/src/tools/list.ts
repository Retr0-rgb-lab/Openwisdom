import {
  loadCatalog,
  listInstalled,
  UsageError,
  RuntimeError,
} from "@openwisdom/core";
import { parseProvidersFlag } from "@openwisdom/providers";
import type { CatalogSkill } from "@openwisdom/schema";
import { resolveCwd } from "../lib/env.js";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";

export type ListInput = {
  mode?: "available" | "installed";
  providers?: string[];
  scope?: "project" | "global";
  cwd?: string;
};

function summarizeSkill(s: CatalogSkill) {
  const desc =
    s.description.length > 200
      ? s.description.slice(0, 197) + "..."
      : s.description;
  return {
    id: s.id,
    name: s.name,
    layer: s.layer,
    scope: s.scope,
    disciplines: s.disciplines,
    language: s.language,
    version: s.version,
    description: desc,
  };
}

/** Pure handler — unit-testable without MCP transport. */
export async function handleList(input: ListInput = {}): Promise<ToolResult> {
  try {
    const mode = input.mode ?? "available";
    const cwd = resolveCwd(input.cwd);
    const packageRoot = getMcpPackageRoot();

    if (mode === "available") {
      const { index, source } = loadCatalog({
        env: process.env,
        cwd,
        packageRoot,
      });
      const skills = index.skills.map(summarizeSkill);
      return toTextResult(
        {
          ok: true,
          mode: "available",
          source,
          count: skills.length,
          skills,
        },
        {
          summary: `Available skills: ${skills.length} (catalog: ${source}).`,
        },
      );
    }

    // mode === installed
    let providerIds: string[] | undefined;
    if (input.providers?.length) {
      try {
        providerIds = parseProvidersFlag(input.providers.join(","));
      } catch (err) {
        return toErrorResult(
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    const scope = input.scope ?? "project";

    let catalogIds: string[] | undefined;
    try {
      catalogIds = loadCatalog({
        env: process.env,
        cwd,
        packageRoot,
      }).index.skills.flatMap((s) => [s.id, s.name]);
    } catch {
      catalogIds = undefined;
    }

    const rows = listInstalled({
      cwd,
      providers: providerIds,
      scope,
      catalogIds,
      env: process.env,
      packageRoot,
    });

    const installed = rows.map((r) => ({
      skillId: r.id,
      provider: r.provider,
      path: r.dir,
      scope: r.scope,
    }));

    return toTextResult(
      {
        ok: true,
        mode: "installed",
        count: installed.length,
        installed,
      },
      {
        summary:
          installed.length === 0
            ? "No installed skills found."
            : `Installed: ${installed.length} skill placement(s).`,
      },
    );
  } catch (err) {
    if (err instanceof UsageError || err instanceof RuntimeError) {
      return toErrorResult(err.message);
    }
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}
