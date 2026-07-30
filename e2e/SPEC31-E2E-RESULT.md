# Spec 31 Local E2E Result

- **Date:** 2026-07-30
- **Cwd:** `e2e/`
- **MCP binary:** monorepo `packages/mcp/dist/mcp.js` (0.1.1, **not** npm)
- **Script:** `node spec31-local-mcp.mjs`

## Result: **13/13 PASS**

| Check | Result |
|-------|--------|
| tools include `openwisdom_get` (6 tools) | PASS |
| list available = 8 official + tags | PASS |
| search `macro` → macro-scan | PASS |
| search `""` + `layer=scenario` → 3 scenarios | PASS |
| get macro-scan body (frontmatter, ~2473 chars) | PASS |
| get unknown skill errors | PASS |
| install dryRun + real into e2e | PASS |
| list installed has macro-scan (6 placements) | PASS |

## CLI (local monorepo)

```text
node ../packages/cli/dist/cli.js list          → 8 skills
node ../packages/cli/dist/cli.js search macro  → macro-scan
node ../packages/cli/dist/cli.js list --installed → 6 (after MCP install)
```

## Product loops verified

1. **Official catalog browse:** list full library + tags  
2. **Scenario search:** keyword + layer filter  
3. **Get body before install:** SKILL.md readable via MCP  
4. **Install + list installed:** files under `.claude/skills` and `.agents/skills`

## How to re-run

```powershell
cd E:\学习软件\Openwisdom
pnpm --filter openwisdom-mcp build
cd e2e
node spec31-local-mcp.mjs
```
