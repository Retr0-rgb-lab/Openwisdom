# Plan 04 Report — packages/providers

**Date:** 2026-07-30  
**Scope:** `packages/providers/**` only  
**Status:** Done

## What shipped

Full ProviderDefinition table + path/detect helpers per Spec 19 / Plan 04.

### Exports (`packages/providers/src/index.ts`)

| Export | Role |
|--------|------|
| `ProviderId`, `ProviderDefinition`, `DetectResult` | Types |
| `PROVIDERS` | Full table (P0 + P1 + experimental) |
| `getProvider(idOrAlias)` | Case-insensitive id/alias lookup |
| `parseProvidersFlag(csv)` | CSV → canonical ids; **throws** on unknown |
| `detectProviders(cwd, home)` | Marker scan → `{ project, global }` (P0+P1; skips experimental) |
| `resolveSkillDir({ provider, scope, cwd, home, skillName })` | Absolute skill install dir |
| `uniqueWriteTargets(providers, scope, cwd, home, skillName)` | Resolve + **dedupe by path** |

### P0 paths (posix segments → `path.join`)

| id | project | global |
|----|---------|--------|
| claude | `.claude/skills` | `.claude/skills` |
| cursor | `.cursor/skills` | `.cursor/skills` |
| codex | `.agents/skills` | `.codex/skills` |
| gemini | `.gemini/skills` | `.gemini/skills` |
| github | `.github/skills` | `.copilot/skills` |
| agents | `.agents/skills` | `.agents/skills` |

### P1 (at least required + extras from Spec 19)

grok, opencode (`global` = `.config/opencode/skills`), pi (`global` = `.pi/agent/skills`), kiro, qoder, trae, trae-cn, windsurf, cline — all `tier: "p1"`.

### Experimental

rovodev, vibe — present for explicit `--providers`; excluded from `detectProviders`.

## Tests (vitest)

`packages/providers/src/index.test.ts`:

1. resolve claude project → `join(cwd, '.claude/skills', name)`  
2. uniqueWriteTargets `codex`+`agents` project → **one** dir  
3. opencode global → `join(home, '.config/opencode/skills', name)`  
4. unknown provider throws  
5. aliases resolve (claude-code, copilot, portable)

## Commands run

```text
pnpm install --filter @openwisdom/providers
pnpm --filter @openwisdom/providers build   # OK
pnpm --filter @openwisdom/providers test    # 6 passed
```

## Notes

- Zero network imports; only `node:fs` (existsSync for detect) + `node:path`.
- Path roots stored as posix strings; runtime splits on `/` then `path.join` (Windows-safe).
- File copy / conflict / install write remain CLI lane (Plan 06) — out of scope.
- No commit (per plan instruction).
- Added `@types/node` devDependency for path/fs types.

## Files touched

```text
packages/providers/package.json
packages/providers/src/index.ts
packages/providers/src/index.test.ts
docs/plans/2026-07-30-cli/reports/04-providers-report.md  (this file)
```
