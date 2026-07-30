# Plan 05 Report — packages/catalog

**Date:** 2026-07-30  
**Scope:** `packages/catalog/**` + generated registry/snapshot JSON  
**Status:** Done

## What shipped

Catalog build CLI that scans `skills/**/SKILL.md` and emits machine-readable `catalog.json` + `manifest.json` (Spec 20 §4).

### `packages/catalog/src/build.ts`

| Step | Behavior |
|------|----------|
| Root resolve | Walk up from `cwd` + package `dist/` for `pnpm-workspace.yaml` or `skills/` |
| Discover | Recursive `SKILL.md` under `skills/` (Node `fs`; skips `node_modules` / `.git`) |
| Parse | `gray-matter` + `parseSkillFrontmatter` (`@openwisdom/schema`) |
| Name rule | `assertNameMatchesDir(name, parentDir)` |
| Infer | Path `skills/{official\|community}/{scenarios\|references}/…` → scope + layer if FM omits |
| Fields | `repoPath` posix from root; `install.cli` = `npx openwisdom install ${id}`; `updated` = SKILL.md mtime `YYYY-MM-DD` |
| Validate | `catalogIndexSchema` (`schemaVersion: 1`) |
| Manifest | `generatedAt`, `gitSha` (`git rev-parse HEAD` \| `"unknown"`), `contentHash` = `sha256-` + stable skills JSON (excl. `updated`), `skillCount`, `cliMinVersion: "0.1.0"` |
| Write | `packages/catalog/dist/`, `packages/cli/catalog-snapshot/`, `apps/web/public/registry/` (mkdir) |
| Empty tree | `process.exit(1)` |

### `package.json` build

Unchanged: `tsc -p tsconfig.json && node dist/build.js` (shebang on `build.js` for bin).

### Outputs (generated)

```text
packages/catalog/dist/catalog.json
packages/catalog/dist/manifest.json
packages/cli/catalog-snapshot/catalog.json
packages/cli/catalog-snapshot/manifest.json
apps/web/public/registry/catalog.json
apps/web/public/registry/manifest.json
```

## Catalog contents

3 official scenarios (sorted by `id`):

| id | layer | scope | repoPath |
|----|-------|-------|----------|
| `macro-scan` | scenario | official | `skills/official/scenarios/macro-scan` |
| `metacognition-audit` | scenario | official | `skills/official/scenarios/metacognition-audit` |
| `personal-anchor` | scenario | official | `skills/official/scenarios/personal-anchor` |

Bodies are **not** embedded (index only).

## Commands run

```text
pnpm --filter @openwisdom/schema build   # OK
pnpm --filter @openwisdom/catalog build  # OK — 3 skills
# second build: same contentHash (stable for same skill content)
```

## Notes

- Defaults when frontmatter omits optionals: `disciplines`/`tags` → `[]`, `language` → `"en"`, `version` → `"0.1.0"`.
- Duplicate `id` → hard error.
- `contentHash` intentionally excludes `updated` so re-runs stay stable when mtimes are the only drift.
- No CLI user commands; no edits to `packages/cli/src`, `packages/schema/src`, or skill bodies.
- No commit (per plan instruction).

## Files touched

```text
packages/catalog/src/build.ts
packages/catalog/src/index.ts
packages/catalog/dist/*                 (generated via build)
packages/cli/catalog-snapshot/*.json    (generated)
apps/web/public/registry/*.json         (generated)
docs/plans/2026-07-30-cli/reports/05-catalog-report.md  (this file)
```
