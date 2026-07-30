# Plan 03 Report — CLI/MCP 载荷 + MCP snapshot

**Lane:** Core/CLI/MCP  
**Date:** 2026-07-30  
**Status:** Done  

## Summary

Offline install/search no longer depends on a monorepo `skills/` checkout when package snapshots are present:

1. **skills payload snapshot** — catalog build copies `skills/` → `packages/{core,cli,mcp}/skills-snapshot/`
2. **`resolveSkillsRoot` priority** — `OPENWISDOM_SKILLS_ROOT` → monorepo `skills/` → package `skills-snapshot/`
3. **MCP catalog-snapshot dual-write** — `packages/mcp/catalog-snapshot/{catalog,manifest}.json`
4. **MCP tools** pass `packageRoot: getMcpPackageRoot()` so bundled/unbundled load finds MCP snapshots
5. **CLI `-V`** prints version (exit 0), same as `--version`

## Changes

### Catalog build (`packages/catalog/src/build.ts`)

- Dual-write catalog targets now include `packages/mcp/catalog-snapshot`
- New `syncSkillsSnapshot()`: full `skills/` tree →  
  `packages/core|cli|mcp/skills-snapshot/`

### Core

| File | Change |
|------|--------|
| `paths.ts` | `PACKAGE_NAMES` + `openwisdom-mcp`; `skillsSnapshotPath`, `looksLikeSkillsTree` |
| `skills-root.ts` | Fallback to package `skills-snapshot`; clearer multi-step error (no “GitHub only”) |
| `catalog.ts` | Error text mentions snapshot payload; optional `fromUrl` |
| `install.ts` | Passes `packageRoot` into `resolveSkillsRoot` |
| `index.ts` | Re-exports new path helpers |
| `package.json` | `files` includes `skills-snapshot` |
| `install.test.ts` | Plan 03 offline tests (tmpdir outside monorepo) |

### CLI

| File | Change |
|------|--------|
| `cli.ts` | Early handle `-V` / `--version`; unknown-command path tries exit 2 when caught |
| `package.json` | `files` includes `skills-snapshot` |

### MCP

| File | Change |
|------|--------|
| `lib/package-root.ts` | `getMcpPackageRoot()` via core `getPackageRoot` |
| `tools/{search,list,install,update}.ts` | Explicit `packageRoot` for catalog + install |
| `package.json` | `files` includes `catalog-snapshot` + `skills-snapshot` |
| `install.test.ts` | Snapshot search `source: "snapshot"`; install without env skills root |

## Acceptance

| Check | Result |
|-------|--------|
| No monorepo skills / no `OPENWISDOM_SKILLS_ROOT` → install macro-scan from snapshot | **Pass** (unit + CLI smoke) |
| MCP package has catalog-snapshot; search offline `source: "snapshot"` | **Pass** |
| core / cli / mcp tests green | **Pass** (22 / 10 / 9) |
| CLI `-V` / `--version` exit 0 | **Pass** → `0.1.0` |
| Unknown command exit 2 | **Residual** — citty prints `ERROR Unknown command` and exits **1** before our catch; documented |

## Smoke proof

### CLI offline install (cwd = `%TEMP%`, no `OPENWISDOM_SKILLS_ROOT`)

```text
node packages/cli/dist/cli.js install macro-scan --providers=claude -y --cwd <temp>
→ exit=0
→ installed macro-scan (+ catalog reference deps path-dependence, collective-action)
→ .claude/skills/macro-scan/SKILL.md present with frontmatter name: macro-scan
```

Payload resolution: monorepo walk from temp fails → package `skills-snapshot` next to `openwisdom` package root succeeds. Catalog index from `catalog-snapshot` expands `references[]`.

### MCP catalog snapshot load

```text
loadCatalog({ packageRoot: packages/mcp, env: {}, cwd: TEMP })
→ source= snapshot, count= 8
→ search "macro" → macro-scan
```

### Snapshot artifacts present

```text
packages/core/skills-snapshot/official/scenarios/macro-scan/SKILL.md
packages/cli/skills-snapshot/official/scenarios/macro-scan/SKILL.md
packages/mcp/skills-snapshot/official/scenarios/macro-scan/SKILL.md
packages/mcp/catalog-snapshot/catalog.json
packages/mcp/catalog-snapshot/manifest.json
```

Catalog build skill count at last run: **8** (3 scenarios + 5 references).

## Commands run

```bash
pnpm --filter @openwisdom/catalog build
pnpm --filter @openwisdom/core build && pnpm --filter @openwisdom/core test
pnpm --filter openwisdom build && pnpm --filter openwisdom test
pnpm --filter openwisdom-mcp build && pnpm --filter openwisdom-mcp test
# plus CLI smoke install / -V (see above)
```

## Residuals / non-goals

- **Unknown command exit 2:** citty owns the process exit for unknown commands → remains **1**. Would need citty fork or pre-argv validation; not worth the coupling for this wave.
- **GitHub sparse fetch:** deferred (plan optional / 二期).
- **npm publish:** not done (plan non-goal).
- **Telemetry fail-open:** unchanged.

## Notes for VERIFY

- After content changes under `skills/`, re-run `pnpm --filter @openwisdom/catalog build` so snapshots stay in sync.
- Published packages must include `catalog-snapshot` + `skills-snapshot` (already in `files`).
- Windows path with non-ASCII monorepo root (`学习软件`) exercised by all local runs.
