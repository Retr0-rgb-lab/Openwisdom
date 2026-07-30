# Plan 01 Report — HeatStore + API routes

**Date:** 2026-07-30  
**Authority:** Specs 06 · 27 · 28 · plan `01-api-store.md`  
**Status:** Done (no git commit)

---

## Delivered

### `apps/web/src/lib/heat/**`

| File | Role |
|------|------|
| `types.ts` | `TelemetryBody`, `StatsResponse`, `SkillHeatStats`, `HeatStore`, event enums |
| `config.ts` | Upstash env, rate limit env, skills root, GitHub base URLs |
| `skill-ids.ts` | Whitelist from `public/registry/catalog.json` (`getKnownSkillIds`) |
| `aggregate.ts` | Day/total keys, 30d window, **`buildSkillStats`** (installs = cli + download only) |
| `memory-store.ts` | `globalThis.__owHeatMemory` Map; dual-write day+total; `resetMemoryStore` |
| `upstash-store.ts` | REST pipeline via **fetch** (no `@upstash/redis`) |
| `store.ts` | `getHeatStore()` → Upstash if env else Memory |
| `rate-limit.ts` | 60/min/IP sliding window (memory); `HEAT_RATE_LIMIT_PER_MIN` |
| `validate.ts` | Schema + skill whitelist + source/event consistency |
| `cors.ts` | `Access-Control-Allow-Origin: *` for CLI |
| `index.ts` | Barrel (no Plan-02 names) |
| `heat-smoke.test.ts` | node:test unit coverage |

**Not created (Plan 02 owns):** `client.ts`, `fetch-stats.ts`, `merge-heat.ts`

### API routes

| Route | Behavior |
|-------|----------|
| `POST /api/telemetry` | Validate · rate limit · `recordEvent` · CORS · OPTIONS 204 · **fail-open** `{ ok, persisted }` |
| `GET /api/stats` | Aggregates; optional `?ids=a,b`; `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`; empty `{}` on failure |
| `GET /api/skills/[skillId]/download` | Whitelist 404; serve local `SKILL.md` when found; else 302 GitHub raw; always attempts `web_download` count (fail-open) |

### Scripts

- `apps/web/scripts/heat-smoke.mjs` — zero-Next smoke proving **copy ≠ installs**

---

## Product rules locked in code

```
installs*  = cli_install_success + web_download
copies*    = web_copy_install only  (funnel; NOT installs)
unknown skillId → 400 / download 404
no writes to SKILL.md or catalog.json heat fields
```

Key layout (Memory + Upstash isomorphic):

```
ow:v1:day:{YYYY-MM-DD}:{skillId}:{event}
ow:v1:total:{skillId}:{event}
```

---

## Tests run

```bash
cd apps/web
pnpm exec tsx --test src/lib/heat/heat-smoke.test.ts
# 8/8 pass

node scripts/heat-smoke.mjs
# All heat-smoke checks passed.
# Rule verified: web_copy_install ∉ installs*
```

Covered:

- copy events raise `copies*` only  
- cli + download raise `installs*`  
- day-31 excluded from 30d  
- unknown skill validation  
- rate limit trips  

`tsc --noEmit`: no errors in heat/api paths (pre-existing `SkillCard.tsx` TS2322 only).

---

## Env (production)

| Variable | Use |
|----------|-----|
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Production store |
| `HEAT_RATE_LIMIT_PER_MIN` | Optional (default 60) |
| `OPENWISDOM_SKILLS_ROOT` | Optional SKILL.md root for download |
| CLI: `OPENWISDOM_TELEMETRY_URL=https://<site>/api/telemetry` | Client (unchanged this plan) |

Local dev: **no Upstash required** — Memory store.

---

## Manual curl (after `pnpm dev`)

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "content-type: application/json" \
  -d "{\"schemaVersion\":1,\"event\":\"cli_install_success\",\"skillId\":\"macro-scan\",\"source\":\"cli\"}"

curl -X POST http://localhost:3000/api/telemetry \
  -H "content-type: application/json" \
  -d "{\"schemaVersion\":1,\"event\":\"web_copy_install\",\"skillId\":\"macro-scan\",\"source\":\"web\"}"

curl http://localhost:3000/api/stats
# expect installs* +1 from cli only; copies* +1; copy not in installs

curl -I http://localhost:3000/api/skills/macro-scan/download
```

---

## Acceptance vs Spec 27 §5 (this plan)

| Check | Result |
|-------|--------|
| Memory record + getAggregates; copy ∉ installs | Pass (unit + smoke) |
| Unknown skill 400 | Pass (validate + test) |
| Fail-open storage | Implemented (200 `persisted:false` / empty stats) |
| CORS OPTIONS | Implemented |
| Download path + web_download | Implemented |
| No fake metrics / no SKILL.md heat writes | Observed |
| Full next build / live curl | Not required for Plan 01 unit proof; optional follow-up |

---

## Handoff to Plan 02

- Stats shape: `StatsResponse` (`schemaVersion`, `updatedAt`, `skills[id].installs30d` …)  
- Telemetry POST accepts `web_copy_install` / `web_download` / `cli_install_success`  
- Download URL for heat CTA: `/api/skills/{id}/download`  
- Client modules still to add under `lib/heat/`: `client.ts`, `fetch-stats.ts`, `merge-heat.ts`
