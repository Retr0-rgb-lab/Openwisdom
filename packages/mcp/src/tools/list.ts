import {
  ensureCatalogForUse,
  loadCatalog,
  listInstalled,
  searchCatalog,
  UsageError,
  RuntimeError,
} from "@openwisdom/core";
import { parseProvidersFlag } from "@openwisdom/providers";
import { resolveCwd } from "../lib/env.js";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";
import { toSkillCard, type DetailLevel } from "./skill-card.js";

export type ListInput = {
  mode?: "available" | "installed";
  providers?: string[];
  /**
   * installed: project | global (write scope)
   * available: official | community (catalog filter)
   */
  scope?: "project" | "global" | "official" | "community";
  /** available only */
  layer?: "scenario" | "reference";
  /** available only */
  discipline?: string;
  /** available only — exact tag filter (Spec 33) */
  tag?: string;
  /** available only — free text (reuses searchCatalog) */
  q?: string;
  detail?: DetailLevel;
  /** available default high enough for full catalog (≥50) */
  limit?: number;
  cwd?: string;
  /** Remote registry base URL (or OPENWISDOM_REGISTRY env). */
  registry?: string;
  /** Skip remote registry; local skills/snapshot only. */
  noRemote?: boolean;
};

const DEFAULT_AVAILABLE_LIMIT = 100;

function catalogEnvOpts(input: ListInput): {
  registry?: string;
  noRemote: boolean;
} {
  const registry =
    typeof input.registry === "string" && input.registry.trim()
      ? input.registry.trim()
      : undefined;
  return { registry, noRemote: Boolean(input.noRemote) };
}

/** Pure handler — unit-testable without MCP transport. */
export async function handleList(input: ListInput = {}): Promise<ToolResult> {
  try {
    const mode = input.mode ?? "available";
    const cwd = resolveCwd(input.cwd);
    const packageRoot = getMcpPackageRoot();
    const catalogOpts = catalogEnvOpts(input);

    if (mode === "available") {
      const { index, source } = await ensureCatalogForUse({
        env: process.env,
        cwd,
        packageRoot,
        registry: catalogOpts.registry,
        noRemote: catalogOpts.noRemote,
      });

      const detail: DetailLevel = input.detail === "full" ? "full" : "card";
      const limit = Math.max(
        1,
        Math.floor(input.limit ?? DEFAULT_AVAILABLE_LIMIT),
      );

      const catalogScope =
        input.scope === "official" || input.scope === "community"
          ? input.scope
          : undefined;

      // q empty + optional filters → full catalog slice after filters (Spec 31/33).
      const hits = searchCatalog(index, input.q?.trim() ?? "", {
        layer: input.layer,
        scope: catalogScope,
        discipline: input.discipline?.trim() || undefined,
        tag: input.tag?.trim() || undefined,
        limit,
      });

      const skills = hits.map((s) => toSkillCard(s, detail));
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

    const installScope =
      input.scope === "global" || input.scope === "project"
        ? input.scope
        : "project";

    let catalogIds: string[] | undefined;
    try {
      // Prefer same noRemote policy as available mode when enriching ids.
      const env = { ...process.env };
      if (catalogOpts.noRemote) env.OPENWISDOM_NO_REMOTE = "1";
      catalogIds = loadCatalog({
        env,
        cwd,
        packageRoot,
      }).index.skills.flatMap((s) => [s.id, s.name]);
    } catch {
      catalogIds = undefined;
    }

    const rows = listInstalled({
      cwd,
      providers: providerIds,
      scope: installScope,
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
