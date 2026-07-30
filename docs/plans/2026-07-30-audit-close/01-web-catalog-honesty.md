# Plan 01 — Web catalog 单真相 + 诚实 UI

**Lane:** Web catalog · **Specs:** 12–16 · 审计 P0#1/#7/#8 · P1 数据诚实  
**独占：** `apps/web/src/data/catalog/**` · `apps/web/src/components/skills/**` · `apps/web/src/messages/{zh,en}/skills.json`  
**禁止改：** GlobalSearch、site shell、packages/*、skills/**、install/docs 页面

## Goal

1. 机器目录（registry）= **可安装真相**；TS curated seeds = **发现层**，诚实标注。  
2. 挂载 bootstrap/curated **诚实横幅**（`skills.bootstrap.*` 已有文案）。  
3. Source 筛选改为按 **provenance**（或新增 facet），`community` 仅真社区/空态可用。  
4. `link-only` / external-only **不把 CLI 当主 CTA**（已有部分逻辑则加固）。

## Tasks

### T1 — 类型与加载

- [ ] 扩展 `types.ts`：`CatalogEntry.source` 允许 `"catalog" | "bootstrap"`；确保 `provenance: "official" | "community" | "curated-external"` 齐全。  
- [ ] 新增 `load-registry.ts`（或写在 `index.ts`）：在 **构建/服务端** 用 `fs` 读 `apps/web/public/registry/catalog.json`（路径相对 monorepo：`path.join(process.cwd(), "public/registry/catalog.json")` — web 的 cwd 为 `apps/web`）。  
- [ ] 将 registry 中每条 `CatalogSkill` **映射**为 `CatalogEntry` 最小字段：  
  - `slug/id/name` ← skill id/name  
  - `title`/`summary`：优先已有 bootstrap 中英；否则 description 双语同文  
  - `layer` `scope` `disciplines` `language` `tags` `version` `repoPath`  
  - `install.cli` ← registry 或 `npx openwisdom install ${id}`  
  - `source: "catalog"`  
  - `provenance: scope === "official" ? "official" : "community"`  
  - `installMode: "cli"` / contentAvailability installable  
- [ ] `getCatalog()` 合并顺序：  
  1. registry 映射（installable）  
  2. 用 `BOOTSTRAP_CATALOG` **overlay** 丰富 UI 字段（when/steps/shape）但 **保留** `source: "catalog"` 若 slug 在 registry  
  3. principle/external/discipline/philosophy seeds — 强制 `provenance: "curated-external"`，`installMode: "link-only"`，`contentAvailability: "external-only"`，**清空或忽略** 主路径 `install.cli` 展示依赖（可留 preview 字段）  
- [ ] 若 registry 缺失/空：fallback 仅 bootstrap 三场景 + 横幅文案说明。

### T2 — filter 语义

- [ ] `filterCatalog`：`query.source`  
  - `official` → `provenance === "official"` 或 `scope === "official"`  
  - `community` → **仅** `provenance === "community"`（**不要** curated-external）  
  - 可选：若 UI 要 curated 筛选，用 `provenance=curated-external` 或现有 chip 文案改为 Official | Community | Curated  
- [ ] 推荐 UI：三芯片 **Official | Community | Curated**（i18n 键加入 `filters.curated` / `filters.provenance*`），URL 可用 `source=official|community|curated`。  
- [ ] `source=community` 且 0 结果时，**现有** community 空态文案必须可触发（真社区空）。

### T3 — 诚实横幅

- [ ] `SkillsCatalog` intro 区渲染横幅：当 catalog 含任何 `source !== "catalog"` **或** 含 `curated-external` 时显示 `t("bootstrap.title")` / `t("bootstrap.body")`。  
- [ ] 样式：`border border-line bg-surface-muted`（Spec 15）。  
- [ ] 详情页：`source === "bootstrap"` 或 curated 显示对应 note（可用已有 `bodyPending` / `bodyExternal`，官方 catalog 源改更诚实文案）。

### T4 — 卡片/详情 install 诚实

- [ ] `SkillCard` / `SkillDetail`：`installMode === "link-only"` 时主按钮 = 上游链接；CLI 仅 preview 或隐藏。  
- [ ] 官方 `source==="catalog"` 保留 copy CLI + 诚实「npm 发布状态」note（已有则保留）。  
- [ ] 清除 bootstrap 官方条上 **悬空** `references[]` 中不存在的 slug：只保留 catalog/registry 中真实存在的 id（02 跑完后会有更多；本 lane 用 `getCatalog()` 过滤死链，死 id 显示 mono 标签即可）。

### T5 — i18n + 验收

- [ ] zh/en `skills.json` 键对称（新增 curated / banner 相关）。  
- [ ] Run: `pnpm --filter web build`  
- [ ] 手查逻辑：`getCatalog()` 中 `source==="catalog"` 数量应 ≥ registry skill 数（当前 3）；`curated-external` ≥ 1；community 过滤可为空。  
- [ ] 写 `reports/01-report.md`。

## 验收

- [ ] 诚实横幅在 `/zh/skills` 可见  
- [ ] Community 过滤不出现 75 条 curated  
- [ ] 官方三场景仍可打开详情并 copy CLI  
- [ ] build 通过  
