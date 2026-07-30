import {
  loadCatalog,
  searchCatalog,
  UsageError,
  RuntimeError,
} from "@openwisdom/core";
import type { CatalogSkill } from "@openwisdom/schema";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";

export type SearchInput = {
  query: string;
  layer?: "scenario" | "reference";
  scope?: "official" | "community";
  discipline?: string;
  limit?: number;
  /** Reserved: remote catalog refresh (not implemented; ignored). */
  refresh?: boolean;
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
export async function handleSearch(input: SearchInput): Promise<ToolResult> {
  try {
    const query = input.query?.trim() ?? "";
    if (!query) {
      return toErrorResult(
        'Missing query. Example: openwisdom_search({ query: "macro" })',
      );
    }

    // refresh is accepted for schema parity; remote refresh not implemented (fail-open local).
    void input.refresh;

    const { index, source } = loadCatalog({
      env: process.env,
      cwd: process.cwd(),
      packageRoot: getMcpPackageRoot(),
    });

    const limit = Math.min(50, Math.max(1, input.limit ?? 20));
    const hits = searchCatalog(index, query, {
      layer: input.layer,
      scope: input.scope,
      discipline: input.discipline,
      limit,
    });

    const skills = hits.map(summarizeSkill);
    return toTextResult(
      {
        ok: true,
        query,
        source,
        count: skills.length,
        skills,
      },
      {
        summary:
          skills.length === 0
            ? `No skills matched "${query}".`
            : `Found ${skills.length} skill(s) for "${query}" (catalog: ${source}).`,
      },
    );
  } catch (err) {
    if (err instanceof UsageError || err instanceof RuntimeError) {
      return toErrorResult(err.message);
    }
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}
