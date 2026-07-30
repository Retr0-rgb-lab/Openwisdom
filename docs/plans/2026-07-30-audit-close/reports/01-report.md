# Plan 01 Report — Web catalog 单真相 + 诚实 UI

**Lane:** Web catalog  
**Date:** 2026-07-30  
**Status:** Done  

## What changed

### Data (`apps/web/src/data/catalog/**`)

| File | Change |
|------|--------|
| `types.ts` | `CatalogSourceFilter` (`official` \| `community` \| `curated`); helpers `isLinkOnlyEntry`, `catalogNeedsHonestyBanner`; query `source` no longer equals raw `SkillScope` only |
| `load-registry.ts` | **New** — static import of `public/registry/catalog.json`, parse/map to `CatalogEntry` with `source: "catalog"`, `installMode: "cli"`, provenance from scope |
| `index.ts` | `getCatalog()` merge rewrite; `filterCatalog` by provenance; `parseSourceParam` accepts `curated` |

### Components (`apps/web/src/components/skills/**`)

| File | Change |
|------|--------|
| `SkillsCatalog.tsx` | Honesty banner (`bootstrap.*`) when catalog has non-registry or curated-external; source chips **Official \| Community \| Curated** |
| `SkillCard.tsx` | Shared `isLinkOnlyEntry`; upstream primary CTA for discovery; CLI as preview only for link-only |
| `SkillDetail.tsx` | Body copy by source/provenance (`bodyCatalog` / `bodyExternal` / `bodyPending`); mobile dock prefers upstream for link-only; dangling `references[]` stay mono labels |

### i18n (`messages/{zh,en}/skills.json`)

- `filters.curated`
- `detail.bodyCatalog`
- Updated `bootstrap.body`, `empty.communityDescription`, `detail.referencesNote`, `detail.bodyExternal`
- **zh/en key parity** maintained

## How `getCatalog()` works now

```text
1. loadRegistrySkills() → map each skill → CatalogEntry
   - source: "catalog"
   - provenance: scope === official ? official : community
   - installMode: "cli"
   - contentAvailability: "summary-only"

2. For each BOOTSTRAP_CATALOG entry:
   - If slug already in map (from registry): overlay UI fields
     (title/summary/when/steps/shape/axis/references/featuredRank)
     while KEEP source: "catalog" + registry install truth
   - Else: keep bootstrap product seed (source: "bootstrap")

3. PRINCIPLE / EXTERNAL / DISCIPLINE / PHILOSOPHY seeds:
   - Skip if slug already present
   - Else force curated discovery:
     provenance: "curated-external"
     installMode: "link-only"
     contentAvailability: "external-only"
     source stays bootstrap (discovery layer)

4. If registry missing/empty → bootstrap three scenarios + curated seeds only
   (honesty banner still shows)
```

**Why static JSON import (not `fs`):** `getCatalog()` is used from client components (`SkillsCatalog`, `GlobalSearch`). Static import of `apps/web/public/registry/catalog.json` works in SSR + client bundles without `node:fs`.

## Filter semantics

| URL `?source=` | Meaning |
|----------------|---------|
| `official` | `provenance === "official"` **or** `scope === "official"` |
| `community` | **only** `provenance === "community"` — **excludes** curated-external |
| `curated` | `provenance === "curated-external"` |
| (empty) | all |

Other facets unchanged: `layer`, `discipline`, `lang`, free-text `q`, `sort`.

## Verification snapshot (local)

| Metric | Value |
|--------|------:|
| Registry skills (`loadRegistrySkills`) | 8 |
| `source === "catalog"` | 8 |
| `source === "bootstrap"` (curated discovery) | 75 |
| `filter source=official` | 8 |
| `filter source=community` | **0** (true community empty → empty-state copy) |
| `filter source=curated` | 75 |
| Honesty banner | **true** |
| Official scenarios installable | `macro-scan`, `personal-anchor`, `metacognition-audit` all `source: "catalog"`, `installMode: "cli"` |

> Registry count is 8 (≥ plan’s “current 3”) because official reference skills may already be in `catalog.json` (lane 02 / catalog:build). Plan 01 only requires `source==="catalog"` count ≥ registry size.

## Build result

```text
pnpm --filter web build
→ ✓ Compiled successfully
→ ✓ TypeScript passed
→ ✓ Generating static pages (181/181)
→ exit 0
```

## Success criteria checklist

| Criterion | Result |
|-----------|--------|
| Honesty banner on `/zh/skills` when curated/bootstrap present | Yes (`catalogNeedsHonestyBanner`) |
| Community filter ≠ curated dump | Yes (community = 0; curated = 75) |
| Official scenarios open + copy CLI | Yes (`source: catalog`, `installMode: cli`) |
| Build passes | Yes |

## Residual gaps

1. **Static registry only** — web does not live-reload registry via HTTP; rebuild / redeploy after `pnpm catalog:build`.
2. **CLI preview still on curated cards** — intentional (plan: preview allowed); not a primary install path.
3. **Dangling bootstrap `references[]`** — e.g. labels not yet in catalog still render as mono tags (not broken links). Plan 02 adds more official references over time.
4. **No real community entries yet** — empty community state is correct; waits for `skills/community/` PRs + registry rebuild.
5. **Heat / installs** still absent (by design; Spec 06).
6. **`apps/public/registry/`** may exist as a mistaken sibling path outside this lane; truth path used is `apps/web/public/registry/catalog.json`.
7. **GlobalSearch** not updated (exclusive-path ban); it still calls `getCatalog()` so it automatically sees the new merge/filter data, but has no honesty banner of its own.

## Files touched (exclusive paths only)

- `apps/web/src/data/catalog/types.ts`
- `apps/web/src/data/catalog/load-registry.ts` (new)
- `apps/web/src/data/catalog/index.ts`
- `apps/web/src/components/skills/SkillsCatalog.tsx`
- `apps/web/src/components/skills/SkillCard.tsx`
- `apps/web/src/components/skills/SkillDetail.tsx`
- `apps/web/src/messages/zh/skills.json`
- `apps/web/src/messages/en/skills.json`
- `docs/plans/2026-07-30-audit-close/reports/01-report.md` (this report)
