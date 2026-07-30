# Spec 27 — 热度 API 总控（SPE）

> **状态：** Implemented（2026-07-30 plan heat-api；生产需配 Upstash）  
> **产品语义权威：** [06-热度与遥测](./06-热度与遥测.md)（事件定义、fail-open、不进 SKILL.md）  
> **实现分册：** [28 端点与存储](./28-热度API-端点与存储.md) · [29 Web 合并与采集](./29-热度API-Web合并与采集.md)  
> **知识库：** `docs/知识库/02` #11 · `05` §5  

---

## 1. 目标（本波必须）

| # | 目标 |
|---|------|
| G1 | `POST /api/telemetry` 接收匿名事件；校验 schema + skillId 白名单；限流 |
| G2 | `GET /api/stats` 返回聚合 installs（30d + total）；可缓存 |
| G3 | Web：复制 install 命令上报 `web_copy_install`（**不进**主榜） |
| G4 | Web：至少一条 **主热度** 路径 `web_download`（见 29：下载 SKILL 附件或 zip） |
| G5 | 目录合并 stats → 有数才显示；`sort=popular` 按 `installs30d` |
| G6 | 全程 **fail-open**：API 挂不挡浏览/安装/复制 |
| G7 | Docs 含隐私与关闭说明（可扩 `/docs` FAQ） |
| G8 | CLI/MCP 已有客户端：文档写明 `OPENWISDOM_TELEMETRY_URL=<site>/api/telemetry` |

**非目标：** 登录、用户画像、验证码、把 stats 写进 git/catalog.json 提交、强制 Upstash 才能本地 dev。

---

## 2. 架构

```text
CLI/MCP (packages/core) ──POST──► /api/telemetry ──► HeatStore (memory | Upstash)
Web copy / download      ──POST──► /api/telemetry ──┘
Skills catalog/detail    ──GET───► /api/stats     ◄── HeatStore rollup
```

- 实现位置：**`apps/web`** Next.js Route Handlers（与站点同域，CORS 对 CLI 需允许 POST）。  
- 存储抽象：`HeatStore` 接口；**无 env → Memory**（dev/test）；**有 Upstash REST env → Redis**。  
- skill 白名单：读 `public/registry/catalog.json` 的 id 集合（构建期文件；运行时 fs 或 import）。

---

## 3. 波次与并行

| Plan | 内容 | 并行 |
|------|------|------|
| A | `lib/heat/*` + `api/telemetry` + `api/stats` + store | 先 / 可与 B 接口约定后并行 |
| B | Web 采集客户端 + 目录/详情合并 + popular | 依赖 A 路由 shape |
| C | Docs 隐私文案 + install 页遥测说明 | 可与 B 并行（messages） |
| D | 单元测试 store + route handlers（若可） | 随 A |

详细：`docs/plans/2026-07-30-heat-api/`

---

## 4. 铁律

1. **不写** `SKILL.md` / registry catalog 热度字段进 git 真相。  
2. **复制命令 ≠ 安装热度。**  
3. **未知 skillId → 400**，不创建垃圾键。  
4. **限流超限 → 429**，客户端静默。  
5. **Memory store** 仅 dev/test；生产文档要求配置 Upstash。  
6. **无假数据**：未配置存储时 stats 可返回空对象 `{}`，UI 隐藏数字。  

---

## 5. 验收（整波）

- [ ] POST 合法 `cli_install_success` → GET stats 该 skill `installs30d`/`cliInstalls*` 增加  
- [ ] POST `web_copy_install` → `installs30d` **不变**；可选 funnel 字段增加  
- [ ] POST `web_download` → `installs30d` 增加  
- [ ] 未知 skillId → 400  
- [ ] 无 Upstash 时本地 Memory 可测通  
- [ ] stats 失败/空：目录仍可用，无假数字  
- [ ] Docs 有关闭 CLI 遥测说明  
- [ ] `pnpm --filter web build` 通过  

---

## 6. 与既有代码接点

| 接点 | 路径 |
|------|------|
| CLI/MCP 客户端 | `packages/core/src/telemetry.ts`（**本波可不改**；仅文档默认 URL） |
| Catalog 类型已有 | `installs30d?` / `installsTotal?` on `CatalogEntry` |
| `catalogHasHeat` / popular sort | `apps/web/src/data/catalog` 已有钩子 |
| 复制命令 UI | `InstallCommand` · `SkillDetail` · `SkillCard` |
