# Plan 05 Report — GlobalSearch lint 修复

**Lane:** Web lint  
**File:** `apps/web/src/components/site/GlobalSearch.tsx`  
**Date:** 2026-07-30

## Goal

Clear `pnpm --filter web lint` errors from GlobalSearch so web lint has zero errors.

## Before

`pnpm --filter web lint` **exit 1**

| Location | Severity | Rule | Message |
|----------|----------|------|---------|
| `GlobalSearch.tsx:131` | **error** | `react-hooks/set-state-in-effect` | Synchronous `setQ(urlQ)` / `setQ("")` inside `useEffect` on open/prefill |
| `GlobalSearch.tsx:166` | **error** | `react-hooks/set-state-in-effect` | Synchronous `setActive(0)` inside `useEffect` on `[q]` |
| `GlobalSearch.tsx:28` | warning | `@typescript-eslint/no-unused-vars` | Unused `Link` import |
| `scripts/check-card-entity.mjs:96` | warning | `@typescript-eslint/no-unused-vars` | Unrelated; out of scope |

## Fix strategy

Chosen approach from plan options: **event-handler prefill + remount seed**, not `queueMicrotask`.

1. **Prefill on open (was effect)**  
   - `prefillFromCatalogUrl(pathname, searchParams)` — if on `/skills` and `?q=` present, use it; else `""`.  
   - Called from **click** (`openPalette`) and **⌘K/Ctrl+K open path**, and from `handleOpenChange(true)`.  
   - `seedQ` + `paletteEpoch` key remount `CommandPalette` so `useState(seedQ)` initializes cleanly (no open-effect `setQ` / `setActive`).

2. **Reset active on query change (was effect)**  
   - `onChange` of the search input: `setQ(value)` + `setActive(0)` in the same event handler.

3. **Focus**  
   - Kept as `useEffect` that only focuses the input (DOM / external system; no `setState`).

4. **Cleanup**  
   - Removed unused `Link` import (was a warning in this file).

## Behavior preserved

| Behavior | How |
|----------|-----|
| ⌘K / Ctrl+K toggle | Global keydown: open → `openPalette()`; close → `setOpen(false)` |
| Prefill `q` on `/skills?q=…` | `prefillFromCatalogUrl` at open time |
| Empty open elsewhere | seed `""` |
| Featured 3 when empty `q` | unchanged `featured` / `rows` logic |
| Search → catalog | `goCatalogSearch` / Enter / search-catalog row |
| `/skills` merge `q` | same `URLSearchParams` merge when already on catalog |

## After

```text
pnpm --filter web lint
# exit 0
# 0 errors
# 1 warning (scripts/check-card-entity.mjs — unrelated, not this plan)
```

| Rule | Status |
|------|--------|
| `react-hooks/set-state-in-effect` on GlobalSearch | **gone** (0 errors) |
| `@typescript-eslint/no-unused-vars` (`Link`) | **gone** (import removed) |

## Files touched

- `apps/web/src/components/site/GlobalSearch.tsx` — only implementation file  
- `docs/plans/2026-07-30-audit-close/reports/05-report.md` — this report  

No git commit (per plan).
