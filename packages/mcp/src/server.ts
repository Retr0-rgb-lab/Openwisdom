/**
 * Create and configure Openwisdom McpServer with tools (Spec 23 + Spec 31).
 * Package manager only — no analyze / run / LLM tools.
 */
import { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { handleSearch } from "./tools/search.js";
import { handleList } from "./tools/list.js";
import { handleGet } from "./tools/get.js";
import { handleInstall } from "./tools/install.js";
import { handleUpdate } from "./tools/update.js";
import { handleDetectProviders } from "./tools/detect-providers.js";
import { MCP_VERSION } from "./version.js";

const providerId = z
  .string()
  .min(1)
  .describe(
    "Harness provider id (e.g. claude, cursor, agents, codex, gemini)",
  );

export function createServer(): McpServer {
  const server = new McpServer({
    name: "openwisdom",
    version: MCP_VERSION,
  });

  // —— openwisdom_search ——
  server.registerTool(
    "openwisdom_search",
    {
      title: "Search Openwisdom skills",
      description:
        "Search the installable catalog by free text and/or layer/scope/discipline/tag filters. Read-only. Query may be empty when a filter is set. Optional registry / noRemote align with install/update and CLI (also OPENWISDOM_REGISTRY / OPENWISDOM_NO_REMOTE env). Discovery algorithm (handoff / orientation): (1) search or list with tag=orientation-pipeline; (2) list mode=installed; (3) client: missing skills by pipeline.order; (4) get → install(skills: [...]) or install(bundle); (5) analysis runs in the agent session — not via MCP. Prefer list|search → get → install. Cards include tags/references and optional pipeline. Empty hits are success with skills=[]. No recommend/run/analyze tools.",
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe(
            "Free-text query (AND-matched tokens). Optional if layer, scope, discipline, or tag is set.",
          ),
        layer: z
          .enum(["scenario", "reference"])
          .optional()
          .describe("Filter by skill layer"),
        scope: z
          .enum(["official", "community"])
          .optional()
          .describe("Filter by provenance"),
        discipline: z
          .string()
          .optional()
          .describe("Filter by discipline id (e.g. psychology)"),
        tag: z
          .string()
          .optional()
          .describe(
            "Exact tag filter (e.g. orientation-pipeline). Case-insensitive equality on skill tags.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Max results (default 20)"),
        detail: z
          .enum(["card", "full"])
          .optional()
          .describe(
            "card (default): description truncated at 400; full: full description. tags/references/pipeline always returned when present.",
          ),
        refresh: z
          .boolean()
          .optional()
          .describe(
            "Force re-download of remote registry catalog into local cache (fail-open on network errors). Registry URL: registry field or OPENWISDOM_REGISTRY env.",
          ),
        registry: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Remote registry base URL (overrides OPENWISDOM_REGISTRY env)",
          ),
        noRemote: z
          .boolean()
          .optional()
          .describe(
            "Skip remote registry; local skills/snapshot only (default false)",
          ),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => handleSearch(args),
  );

  // —— openwisdom_list ——
  server.registerTool(
    "openwisdom_list",
    {
      title: "List Openwisdom skills",
      description:
        "Browse the full installable catalog (available) or list skills already installed under harness paths. Read-only. Optional registry / noRemote align with install/update and CLI. Discovery algorithm: search/list with tag → list mode=installed → install missing by pipeline.order → analysis in agent session (not MCP). Recommended flow: list|search → openwisdom_get(skill) → detect_providers → install. available supports layer/scope/discipline/tag/q filters; cards include tags/references and optional pipeline. No recommend/run tools.",
      inputSchema: z.object({
        mode: z
          .enum(["available", "installed"])
          .optional()
          .describe("Default available"),
        providers: z
          .array(providerId)
          .optional()
          .describe("When mode=installed, filter harnesses"),
        scope: z
          .enum(["project", "global", "official", "community"])
          .optional()
          .describe(
            "installed: project|global write scope (default project). available: official|community catalog filter.",
          ),
        layer: z
          .enum(["scenario", "reference"])
          .optional()
          .describe("available only: filter by skill layer"),
        discipline: z
          .string()
          .optional()
          .describe("available only: filter by discipline id"),
        tag: z
          .string()
          .optional()
          .describe(
            "available only: exact tag filter (e.g. orientation-pipeline)",
          ),
        q: z
          .string()
          .optional()
          .describe("available only: optional free-text filter"),
        detail: z
          .enum(["card", "full"])
          .optional()
          .describe(
            "card (default): description may truncate at 400; full: no truncate. tags/references/pipeline when present.",
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("available: max results (default 100, covers full catalog)"),
        cwd: z
          .string()
          .optional()
          .describe("Project root; default CLAUDE_PROJECT_DIR or process.cwd()"),
        registry: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Remote registry base URL (overrides OPENWISDOM_REGISTRY env)",
          ),
        noRemote: z
          .boolean()
          .optional()
          .describe(
            "Skip remote registry; local skills/snapshot only (default false)",
          ),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (args) => handleList(args),
  );

  // —— openwisdom_get ——
  server.registerTool(
    "openwisdom_get",
    {
      title: "Get Openwisdom skill detail",
      description:
        "Open one installable skill: full catalog row + SKILL.md body (read before install). Aligns Web Official detail with local skills-snapshot. Recommended flow: list|search → get → detect_providers → install(dryRun) → install. Does not run analysis.",
      inputSchema: z.object({
        skill: z
          .string()
          .min(1)
          .describe("Catalog id or name (e.g. macro-scan)"),
        includeBody: z
          .boolean()
          .optional()
          .describe("Include SKILL.md body (default true)"),
        maxBodyChars: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Truncate body after N chars (default 32000); truncated=true when cut"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (args) => handleGet(args),
  );

  // —— openwisdom_install ——
  server.registerTool(
    "openwisdom_install",
    {
      title: "Install Openwisdom skills",
      description:
        "Install catalog skills (and/or a catalog bundle) into selected agent harness directories. Non-interactive: providers is required. skills[] and/or bundle required (same as CLI). Prefer openwisdom_get first to read SKILL.md, then detect_providers → install(dryRun:true) → install. For multi-skill pipelines: search/list by tag, or pass bundle (e.g. orientation-handoff). Optional registry / noRemote align with CLI. Does not run analysis or call models — package manager only.",
      inputSchema: z.object({
        skills: z
          .array(z.string().min(1))
          .optional()
          .describe(
            "Catalog skill id/slug list. Optional when bundle is set; may combine with bundle.",
          ),
        bundle: z
          .string()
          .min(1)
          .optional()
          .describe(
            'Catalog bundle id to expand (e.g. "orientation-handoff"). Combines with skills[].',
          ),
        providers: z
          .array(providerId)
          .min(1)
          .describe(
            'Target harness ids — required (e.g. ["claude","agents"]). Never guessed silently.',
          ),
        scope: z
          .enum(["project", "global"])
          .optional()
          .describe("Default project"),
        cwd: z
          .string()
          .optional()
          .describe("Project root; default CLAUDE_PROJECT_DIR or process.cwd()"),
        force: z
          .boolean()
          .optional()
          .describe("Overwrite conflicting SKILL.md (default false)"),
        dryRun: z
          .boolean()
          .optional()
          .describe("Plan only; no write / no telemetry (default false)"),
        noDeps: z
          .boolean()
          .optional()
          .describe("Do not expand catalog references[] (default false)"),
        noTelemetry: z
          .boolean()
          .optional()
          .describe("Disable install success telemetry for this call"),
        registry: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Remote registry base URL (overrides OPENWISDOM_REGISTRY env)",
          ),
        noRemote: z
          .boolean()
          .optional()
          .describe(
            "Skip remote registry; local skills/snapshot only (default false)",
          ),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
        idempotentHint: true,
      },
    },
    async (args) => handleInstall(args),
  );

  // —— openwisdom_update ——
  server.registerTool(
    "openwisdom_update",
    {
      title: "Update installed Openwisdom skills",
      description:
        "Re-copy installed (or named) skills from the current catalog/skills root, or refreshOnly to re-download remote catalog cache (CLI --refresh-only). skills optional (default: all installed under scope). force defaults false. providers required for skill update; optional when refreshOnly is true. Optional registry / noRemote align with CLI.",
      inputSchema: z.object({
        skills: z
          .array(z.string().min(1))
          .optional()
          .describe("Skill ids; omit to update all installed under scope"),
        providers: z
          .array(providerId)
          .optional()
          .describe(
            "Target harness ids (required for skill update; optional when refreshOnly)",
          ),
        scope: z
          .enum(["project", "global"])
          .optional()
          .describe("Default project"),
        cwd: z.string().optional().describe("Project root"),
        force: z
          .boolean()
          .optional()
          .describe(
            "Overwrite local modifications (default false; same as CLI)",
          ),
        dryRun: z.boolean().optional().describe("Plan only"),
        noDeps: z.boolean().optional(),
        noTelemetry: z.boolean().optional(),
        refreshOnly: z
          .boolean()
          .optional()
          .describe(
            "Refresh remote catalog cache only (no skill write). Requires remote (not noRemote).",
          ),
        registry: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Remote registry base URL (overrides OPENWISDOM_REGISTRY env)",
          ),
        noRemote: z
          .boolean()
          .optional()
          .describe(
            "Skip remote registry; local skills/snapshot only (default false)",
          ),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => handleUpdate(args),
  );

  // —— openwisdom_detect_providers ——
  server.registerTool(
    "openwisdom_detect_providers",
    {
      title: "Detect agent skill harnesses",
      description:
        "Detect which coding-agent harnesses exist in the project or home (read-only). Use recommended[] as providers for openwisdom_install.",
      inputSchema: z.object({
        cwd: z.string().optional().describe("Project root to scan"),
        home: z.string().optional().describe("Home directory override"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (args) => handleDetectProviders(args),
  );

  return server;
}
