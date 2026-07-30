# Plan 02 — Web 采集 + 目录合并

**独占：**  
- `apps/web/src/lib/heat/client.ts` · `fetch-stats.ts` · `merge.ts`（若 01 未建 lib/heat 根，可只建 client/merge；**勿覆盖** 01 的 store/route）  
- `apps/web/src/components/skills/SkillCard.tsx` · `SkillDetail.tsx` · `SkillsCatalog.tsx`  
- `apps/web/src/app/[locale]/skills/page.tsx`（若需 server fetch）  
- `apps/web/src/messages/{zh,en}/skills.json`（heat 键）

**禁止：** `app/api/**` · `lib/heat/memory-store|upstash|rate-limit|store.ts`（01 独占）· pages.json（03）

若与 01 并行时 `lib/heat/client.ts` 冲突：01 只写 server 文件，02 只写 `client.ts` `fetch-stats.ts` `merge-heat.ts`。

## 实现清单

1. `reportWebHeat(event, skillId)` — beacon/fetch fail-open；仅 catalog 源  
2. SkillDetail/Card 复制成功后调用  
3. catalog 源增加 Download 链 → `/api/skills/{id}/download`  
4. `fetchStats` + `mergeHeat`  
5. SkillsCatalog / page 合并 heat；展示 installs30d；popular 排序  
6. i18n heat 文案 zh/en  

## 验收

- build 通过  
- 无 heat 时 UI 不显示假 0 全表  
- 写 `reports/02-report.md`  
