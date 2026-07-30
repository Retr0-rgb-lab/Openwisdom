# Plan 02 Report — 官方学科 Reference 种子

**Lane:** Content  
**Date:** 2026-07-30  
**Status:** Done

## Deliverables

### 1. Five official reference SKILL.md

| id | path | disciplines |
|----|------|-------------|
| `path-dependence` | `skills/official/references/path-dependence/SKILL.md` | economics, history |
| `collective-action` | `skills/official/references/collective-action/SKILL.md` | sociology, political-science |
| `social-stratification` | `skills/official/references/social-stratification/SKILL.md` | sociology |
| `confirmation-bias` | `skills/official/references/confirmation-bias/SKILL.md` | psychology |
| `prospect-theory` | `skills/official/references/prospect-theory/SKILL.md` | psychology, economics |

Each file follows the plan template: Definition / When to use / Core claims / Limits / Notes.  
Real social-science concepts; classic literature cited as Author (year) directions only (no fake DOIs/page numbers); no fake metrics.

**Discipline coverage (v1 five fields):** psychology, sociology, history, political-science, economics — all present in at least one reference frontmatter.

### 2. Scenario frontmatter `references` wiring

| scenario | references |
|----------|------------|
| `macro-scan` | `path-dependence`, `collective-action` |
| `personal-anchor` | `social-stratification` |
| `metacognition-audit` | `confirmation-bias`, `prospect-theory` |

Minimal body notes updated: removed “reference 尚未入库”; pointed to frontmatter ids; light in-step mention of loadable references. Steps structure unchanged.

### 3. Schema

- `references[]` already supported in `packages/schema` (`frontmatter.ts` + catalog schema).
- **No schema code change required.**
- `pnpm --filter @openwisdom/schema test` → **21/21 passed**.

### 4. Catalog build

```text
pnpm catalog:build
→ wrote 8 skill(s)
  [collective-action, confirmation-bias, macro-scan, metacognition-audit,
   path-dependence, personal-anchor, prospect-theory, social-stratification]
  contentHash=sha256-128398a8470364e281f6889385cdc5c11a28bd1f464cc104975f8139d55286f5
  skillCount=8
```

**Four-end snapshot consistency** (same `skillCount` + `contentHash`):

| sink | skillCount |
|------|------------|
| `apps/web/public/registry/manifest.json` | 8 |
| `packages/cli/catalog-snapshot/manifest.json` | 8 |
| `packages/core/catalog-snapshot/manifest.json` | 8 |
| `packages/mcp/catalog-snapshot/manifest.json` | 8 |

### 5. CLI list

`pnpm cli list` → **# available (snapshot): 8**, including all five references.

## Acceptance checklist

- [x] `skills/official/references` 下 5 目录  
- [x] catalog manifest `skillCount >= 8`  
- [x] 无 frontmatter 校验失败  
- [x] schema tests pass  
- [x] CLI lists references  
- [x] report written  

## Notes / side fixes

1. **Unblock catalog tsc:** Plan 03 left a JSDoc comment in `packages/catalog/src/build.ts` containing `packages/*/skills-snapshot`, which prematurely closed the block comment and broke `tsc`. Minimal fix: rewrite that path as `packages/{cli,core,mcp}/skills-snapshot` so `pnpm catalog:build` can run. No dual-write logic changed by this lane beyond that comment string.
2. Generated registry/snapshots (including `apps/web/public/registry` and package snapshots) were written by `catalog:build` as allowed for plan 02 acceptance.
3. **No git commit.**

## Out of scope (not done)

- Web UI for reference detail pages  
- CLI/MCP business logic (lane 03)  
- npm publish  
