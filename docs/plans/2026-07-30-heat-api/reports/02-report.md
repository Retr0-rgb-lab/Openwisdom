# Plan 02 Report — Web 采集 + 目录合并

**Date:** 2026-07-30  
**Authority:** Specs 27 / 29 · plan `02-web-collect-merge.md`  
**Build:** `pnpm --filter web build` — **PASS**

---

## Delivered

### Created (exclusive)

| File | Role |
|------|------|
| `apps/web/src/lib/heat/client.ts` | `reportWebHeat(event, skillId)` — sendBeacon → fetch keepalive; fail-open |
| `apps/web/src/lib/heat/fetch-stats.ts` | `fetchStats()` → `StatsResponse \| null`; revalidate 300s; fail-open |
| `apps/web/src/lib/heat/merge-heat.ts` | `mergeHeat(entries, stats)` — write heat only when `stats.skills[id]` exists |

### Edited

| File | Change |
|------|--------|
| `SkillCard.tsx` | Catalog copy → `web_copy_install`; heat label when `installs30d` number; Download → `/api/skills/{id}/download` for catalog |
| `SkillDetail.tsx` | Same copy telemetry; optional 30d/total heat; Download on CLI/GitHub/Manual + mobile dock |
| `SkillsCatalog.tsx` | Accepts heat-merged `entries`; `catalogHasHeat` gates popular sort; heat note footer |
| `skills/page.tsx` | Server `fetchStats` + `mergeHeat(getCatalog())` → catalog |
| `messages/{zh,en}/skills.json` | `heat.installs30d` / `heat.installsTotal` / `heat.note` + `card.download` |

### Not touched (as required)

- `app/api/**`, store/rate-limit (plan 01)
- `pages.json`, `packages/*`

---

## Behavior checklist

| Requirement | Status |
|-------------|--------|
| `reportWebHeat` beacon/fetch fail-open | Done |
| Only `source === "catalog"` on copy | Done (curated/preview skip) |
| Copy success → `web_copy_install` | Done (card + detail) |
| Catalog Download → `/api/skills/{id}/download` (server counts; no double client `web_download`) | Done |
| `fetchStats` + `mergeHeat` on catalog page | Done |
| Heat UI only when number present (no fake zeros when stats empty/null) | Done |
| Popular sort chip when heat present (`catalogHasHeat` + existing sort by `installs30d`) | Done |
| zh/en heat i18n | Done |

---

## Notes

1. **Fail-open:** If `/api/stats` is down or returns empty `skills: {}`, entries keep `installs*` undefined → no heat numbers, popular chip hidden.
2. **Download path:** Client uses anchor to download API so plan 01 server can record `web_download` once (Spec 29: avoid double-count).
3. **Detail page heat:** Detail route does not yet server-merge stats (out of exclusive page list). Detail shows heat only if entry already carries numbers; catalog is the primary heat surface. Copy + Download telemetry still work on detail for catalog skills.
4. **Types:** Local `StatsResponse` lives in `fetch-stats.ts` to avoid conflicting with plan 01 `types.ts`.

---

## Acceptance commands

```bash
pnpm --filter web build
# PASS (2026-07-30)
```

Manual (with plan 01 routes + dev server):

1. Copy CLI on a catalog skill → Network POST `/api/telemetry` with `web_copy_install` (or beacon).
2. Click Download on catalog skill → GET `/api/skills/{id}/download`.
3. Curated skill copy → no report (client skip).
4. Stats empty → catalog usable, no heat digits.
