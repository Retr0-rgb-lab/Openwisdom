# Plan 03 report — skills seed

**Status:** DONE  
**Date:** 2026-07-30  
**Scope:** `skills/**` only (plus this report). No `packages/*` or `apps/*` edits. No commit.

## Created paths

| Path | Notes |
|------|--------|
| `skills/official/scenarios/macro-scan/SKILL.md` | scenario · official · disciplines political-science, economics, sociology |
| `skills/official/scenarios/personal-anchor/SKILL.md` | scenario · official · disciplines history, sociology |
| `skills/official/scenarios/metacognition-audit/SKILL.md` | scenario · official · disciplines psychology |
| `skills/official/references/.gitkeep` | empty tree marker; no reference cards yet |
| `skills/community/.gitkeep` | empty community root marker |

## Frontmatter checklist (each scenario)

- `name` = directory name  
- `id` = same as `name`  
- English `description` (agent routing, within 1–1024 chars)  
- `layer: scenario`, `scope: official`, `language: zh`, `version: 0.1.0`  
- `tags` aligned with bootstrap  
- `disciplines` aligned with `apps/web/src/data/catalog/bootstrap.ts`  
- `metadata.openwisdom: true`  
- **No** `references` key (avoids hanging-ref until reference cards exist)

## Body alignment

Titles/summaries/when/steps semantics taken from bootstrap + Home copy:

| id | title (zh/en) | tags |
|----|---------------|------|
| macro-scan | 宏观扫描 / Macro Scan | macro, structure, systems |
| personal-anchor | 个人锚点 / Personal Anchor | anchor, history, orientation |
| metacognition-audit | 元认知体检 / Metacognition Audit | metacognition, bias, audit |

Each body has: When, Steps, Output, Bias/metacognition checkpoints, Notes (analysis runs in the user's agent). Calm tone; no install heat or fake metrics.

## Concerns / follow-ups (non-blocking)

1. **Web bootstrap still lists planned reference ids** (`path-dependence`, etc.) while skills omit `references`. Catalog build should treat missing refs as OK; Lead may later clear bootstrap `references` or add real cards under `skills/official/references/`.
2. **Title/summary bilingual in web** vs **single English `description` + zh-first body** in SKILL.md — Spec 20 allows v1 single-language description; catalog/web mapping may still need bootstrap or i18n overlay until catalog pipeline lands.
3. **Schema validation not run in this plan** (out of scope: no `packages/*`). Recommend Plan 08 / catalog build to parse these three files with `@openwisdom/schema`.
4. **No assets/** subdirs — not required by plan.

## Done criteria

- [x] Three dirs each contain valid `SKILL.md`  
- [x] `name` matches directory name  
- [x] No fake install counts in body  
- [x] references omitted until cards exist  
- [x] Report written  
