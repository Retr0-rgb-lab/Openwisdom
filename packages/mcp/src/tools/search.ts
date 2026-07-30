import {
  loadCatalog,
  searchCatalog,
  UsageError,
  RuntimeError,
} from "@openwisdom/core";
import { getMcpPackageRoot } from "../lib/package-root.js";
import { toErrorResult, toTextResult, type ToolResult } from "../lib/result.js";
import { toSkillCard, type DetailLevel } from "./skill-card.js";

export type SearchInput = {
  /** Free text; may be empty when layer|scope|discipline is set (Spec 31). */
  query?: string;
  layer?: "scenario" | "reference";
  scope?: "official" | "community";
  discipline?: string;
  limit?: number;
  detail?: DetailLevel;
  /** Reserved: remote catalog refresh (not implemented; ignored). */
  refresh?: boolean;
};

/** Pure handler — unit-testable without MCP transport. */
export async function handleSearch(input: SearchInput = {}): Promise<ToolResult> {
  try {
    const query = input.query?.trim() ?? "";
    const hasFilter = Boolean(
      input.layer || input.scope || input.discipline?.trim(),
    );

    if (!query && !hasFilter) {
      return toErrorResult(
        [
          "Missing query (and no layer/scope/discipline filter).",
          'Example: openwisdom_search({ query: "macro" })',
          'or openwisdom_search({ query: "", layer: "scenario" })',
          "or openwisdom_list to browse the full Official catalog.",
        ].join(" "),
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
    const detail: DetailLevel = input.detail === "full" ? "full" : "card";

    // Empty query + filters: searchCatalog filters without requiring tokens.
    const hits = searchCatalog(index, query, {
      layer: input.layer,
      scope: input.scope,
      discipline: input.discipline?.trim() || undefined,
      limit,
    });

    const skills = hits.map((s) => toSkillCard(s, detail));
    const filterNote = [
      input.layer ? `layer=${input.layer}` : null,
      input.scope ? `scope=${input.scope}` : null,
      input.discipline?.trim()
        ? `discipline=${input.discipline.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join(", ");

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
            ? query
              ? `No skills matched "${query}".`
              : `No skills matched filters (${filterNote || "none"}).`
            : query
              ? `Found ${skills.length} skill(s) for "${query}" (catalog: ${source}).`
              : `Found ${skills.length} skill(s) with filters (${filterNote}) (catalog: ${source}).`,
      },
    );
  } catch (err) {
    if (err instanceof UsageError || err instanceof RuntimeError) {
      return toErrorResult(err.message);
    }
    return toErrorResult(err instanceof Error ? err.message : String(err));
  }
}
