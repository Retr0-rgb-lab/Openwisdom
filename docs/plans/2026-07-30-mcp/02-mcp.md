# Plan 02 — `packages/mcp` stdio server

## Goal

Ship Openwisdom MCP server: stdio tools wrapping `@openwisdom/core`.

## Spec

22 · 23 · 24 §4

## Tasks

1. Scaffold `packages/mcp` (`openwisdom-mcp` or `@openwisdom/mcp` + bin `openwisdom-mcp`)
2. Install SDK:
   - Prefer `@modelcontextprotocol/server@^2` + zod as required by peer
   - If peer/install fails vs monorepo, use `@modelcontextprotocol/sdk@^1.30` (Plan B) and document in README
3. Implement:
   - `src/mcp.ts` — StdioServerTransport connect
   - `src/server.ts` — register tools
   - tools: `openwisdom_search`, `openwisdom_list`, `openwisdom_install`, `openwisdom_update`, `openwisdom_detect_providers`
   - Per Spec 23 schemas and cwd resolution (`cwd` → `CLAUDE_PROJECT_DIR` → `process.cwd()`)
4. **Never** `console.log` to stdout; only stderr if needed
5. Map core results to `{ content, isError? }`; include JSON text for structure
6. Telemetry source `"mcp"` on successful installs
7. tsup build → `dist/mcp.js` + shebang; bin entry
8. Tests: at least install dryRun / install write in temp dir via tool handlers or core+wrapper
9. `packages/mcp/README.md` with Claude Code / Cursor / Desktop config snippets

## Done when

- [ ] `node dist/mcp.js` starts without crashing (stdio wait)
- [ ] Tools registered with correct names
- [ ] install with explicit providers writes SKILL.md in temp
- [ ] README configs present

## Depends

Plan 01 core exports available (`runInstall`, `loadCatalog`, `searchCatalog`, `listInstalled`, `detectProviders` via providers or core)
