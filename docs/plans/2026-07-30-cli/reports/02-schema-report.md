# Plan 02 — schema report

**Status:** DONE  
**Date:** 2026-07-30  
**Package:** `@openwisdom/schema`

## Summary

Implemented Zod schemas and helpers for SKILL.md frontmatter and `catalog.json` index per Spec 20 §3–4 and Plan 02. Build and tests pass. Scope limited to `packages/schema/**` (plus this report under the plan reports path).

## Files changed

| Path | Action |
|------|--------|
| `packages/schema/src/index.ts` | Rewrote — re-exports API + `SCHEMA_VERSION` |
| `packages/schema/src/kebab.ts` | Added — `isKebabName`, `assertNameMatchesDir` |
| `packages/schema/src/frontmatter.ts` | Added — `kebabNameSchema`, `skillFrontmatterSchema`, `parseSkillFrontmatter`, `SkillFrontmatter` |
| `packages/schema/src/catalog.ts` | Added — `catalogSkillSchema`, `catalogIndexSchema`, types |
| `packages/schema/src/kebab.test.ts` | Added |
| `packages/schema/src/frontmatter.test.ts` | Added |
| `packages/schema/src/catalog.test.ts` | Added |
| `docs/plans/2026-07-30-cli/reports/02-schema-report.md` | Added (this file) |

`package.json` / `tsconfig.json` left as scaffolded (already had zod, vitest, build/test scripts).

## Public API

- `SCHEMA_VERSION` (`1`)
- `isKebabName(name)` — a-z0-9, single hyphens, no leading/trailing/consecutive, 1–64
- `assertNameMatchesDir(name, dirName)` — throws if mismatch
- `kebabNameSchema` / `skillFrontmatterSchema` / `parseSkillFrontmatter`
- `catalogSkillSchema` / `catalogIndexSchema`
- Types: `SkillFrontmatter`, `CatalogSkill`, `CatalogIndex`

### Frontmatter rules

- Required: `name` (kebab), `description` (1–1024)
- Optional: `id` (defaults to `name` after parse), `layer`, `scope`, `disciplines`, `language`, `tags`, `version`, `references`, `license`, `metadata` (passthrough; `openwisdom?: boolean | string`)

### Catalog skill (required unless noted)

`id`, `name`, `description`, `layer`, `scope`, `disciplines`, `language`, `tags`, `version`, `updated`, `repoPath`, `install.cli`; optional `references`.

Index: `{ schemaVersion: 1, skills: CatalogSkill[] }`.

## Test output summary

```text
pnpm --filter @openwisdom/schema build  → tsc OK
pnpm --filter @openwisdom/schema test   → vitest run

Test Files  3 passed (3)
     Tests  21 passed (21)
```

Coverage highlights:

- Valid macro-scan-like FM + minimal agentskills pair
- Invalid names (spaces, `..`, bad case, length)
- Description bounds / missing fields / bad layer
- Catalog sample shape, empty skills, wrong `schemaVersion`
- `assertNameMatchesDir` pass/fail

## Concerns

1. **`id` default via `.transform`** — parsed output always has `id: string`. Callers using `safeParse` get transformed data only on success (normal Zod behavior). Input type still allows optional `id`.
2. **`version` not strict semver** — stored as non-empty string; Spec 20 says “semver” narratively but no regex enforced (keeps bootstrap flexible).
3. **`updated` not ISO-date-validated** — free non-empty string (`"2026-07-30"` style examples).
4. **`language` free string** — not restricted to `zh` \| `en`.
5. **No YAML parsing here** — package validates plain objects; catalog builder owns gray-matter / frontmatter extraction (Plan 05).
6. **Did not commit / publish** per plan instructions.

## Verify commands

```bash
pnpm --filter @openwisdom/schema build
pnpm --filter @openwisdom/schema test
```
