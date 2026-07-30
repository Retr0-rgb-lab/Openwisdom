# Plan 01 — Extract `@openwisdom/core`

## Goal

Create `packages/core` with shared non-interactive install/catalog APIs. Point CLI at core. No MCP SDK here.

## Spec

22 §4 · 24 §3

## Tasks

1. Scaffold `packages/core`:
   - `package.json` name `@openwisdom/core`, private, type module, scripts build/test
   - `tsconfig.json`, vitest
   - deps: `@openwisdom/schema`, `@openwisdom/providers` workspace
2. Move / re-export from `packages/cli/src/` into core (prefer **move** then re-export thin shims from CLI only if needed):
   - install-core → install
   - catalog, copy-skill, skills-root, frontmatter, paths, telemetry
3. API cleanups (required):
   - `InstallOptions.isTty` injectable; **default false**
   - Telemetry: `source: "cli" | "mcp"`, injectable clientVersion
   - Logging: prefer `onLog` or silent; avoid unconditional stdout `console.log` in library path
   - Catalog snapshot: resolve from core package root **or** injectable `catalogPath` / `packageRoot`
4. Copy or dual-write `catalog-snapshot` so core can load offline index (catalog build may need update in plan 03; for now copy snapshot into core and document)
5. Update `packages/cli`:
   - depend on `@openwisdom/core`
   - commands import from core
   - pass `isTty`, `source: "cli"`
   - tsup noExternal include core
6. Tests: port install/telemetry tests to core or keep in cli importing core; all must pass
7. `pnpm install` at root; build core + cli

## Done when

- [ ] `@openwisdom/core` builds
- [ ] CLI tests pass
- [ ] No citty/clack in core package.json
- [ ] `runInstall` works with explicit providers and isTty false

## Out of scope

MCP package, AGENTS docs (plan 03)
