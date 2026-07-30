# Plan 03 — Wire monorepo + docs

## Goal

Root scripts, catalog snapshot dual-write if needed, AGENTS L1/L2, VERIFY report.

## Tasks

1. Root `package.json`: build order includes core then cli then mcp; `test` includes core/mcp; `mcp` script
2. `@openwisdom/catalog` build: write snapshot to core and/or cli as Spec 24
3. `AGENTS.md`: L1 row for MCP → Specs 22–24; L2 surface note CLI + MCP
4. Confirm `docs/specs/00-索引.md` already lists 22–25
5. Write `docs/plans/2026-07-30-mcp/VERIFY.md` with commands run and results
6. Optional: CLI subcommand `openwisdom mcp` forwarding (nice-to-have)

## Done when

- [ ] `pnpm build` / `pnpm test` green (or documented residual)
- [ ] AGENTS routes MCP
- [ ] VERIFY.md filled
