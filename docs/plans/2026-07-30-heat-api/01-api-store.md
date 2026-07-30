# Plan 01 — HeatStore + API routes

**独占：**  
- `apps/web/src/lib/heat/**`（新建）  
- `apps/web/src/app/api/telemetry/route.ts`  
- `apps/web/src/app/api/stats/route.ts`  
- `apps/web/src/app/api/skills/[skillId]/download/route.ts`  
- 可选 `apps/web/package.json` 仅当必须加依赖（优先 **无** `@upstash/redis`，用 fetch REST）  
- 可选 `apps/web/src/lib/heat/*.test.ts` 或 `scripts/heat-smoke.mjs`

**禁止：** `components/**` · `messages/**` · packages/*

## 实现清单

1. `types.ts` — TelemetryBody · StatsResponse  
2. `skill-ids.ts` — import registry catalog.json → Set of ids  
3. `memory-store.ts` — global Map；day+total keys；`getAggregates` 30d  
4. `upstash-store.ts` — 若 `UPSTASH_REDIS_REST_URL`+`TOKEN` 则 REST INCR/GET  
5. `store.ts` — `getHeatStore()`  
6. `rate-limit.ts` — 60/min/IP memory  
7. `POST /api/telemetry` — validate · limit · record · CORS · OPTIONS  
8. `GET /api/stats` — aggregates · Cache-Control  
9. `GET /api/skills/[skillId]/download` — whitelist；尽量读 skills 或 302 GitHub；record `web_download`  

## 验收命令

```bash
# after next dev or via node unit tests on store
# POST example:
# curl -X POST http://localhost:3000/api/telemetry -H "content-type: application/json" -d "{\"schemaVersion\":1,\"event\":\"cli_install_success\",\"skillId\":\"macro-scan\",\"source\":\"cli\"}"
```

- Memory 下 record + getAggregates：copy 不进 installs  
- unknown skill 400  
- 写 `reports/01-report.md`  
