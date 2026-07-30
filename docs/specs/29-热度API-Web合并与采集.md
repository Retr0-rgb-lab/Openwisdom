# Spec 29 — 热度 API：Web 合并与采集

> **父规格：** [27](./27-热度API总控-SPE.md) · 端点 [28](./28-热度API-端点与存储.md) · 产品 [06](./06-热度与遥测.md)

---

## 1. 客户端上报 helper

**文件：** `apps/web/src/lib/heat/client.ts`（`"use client"` 可调用部分放 client 组件内）

```ts
export type WebHeatEvent = "web_copy_install" | "web_download";

/** Fail-open: never throw; prefer sendBeacon then fetch keepalive */
export function reportWebHeat(event: WebHeatEvent, skillId: string): void
```

Payload：

```json
{
  "schemaVersion": 1,
  "event": "web_copy_install",
  "skillId": "macro-scan",
  "source": "web",
  "ts": "<ISO>"
}
```

规则：

- 仅当 `skillId` 属于 **registry 可安装集**（与 `entry.source === "catalog"` 对齐）时上报  
- curated / link-only：**不上报** 主热度；复制 CLI preview 也不报或报 copy 但服务端会 400——推荐客户端直接 skip  
- URL：同源 `/api/telemetry`（相对路径）  
- 失败静默  

---

## 2. 采集挂载点

| UI | 事件 | 条件 |
|----|------|------|
| `SkillDetail` 复制 CLI 成功 | `web_copy_install` | catalog 源 skill |
| `SkillCard` 复制 CLI 成功 | `web_copy_install` | 同上 |
| `InstallCommand` 复制（全局无 skill） | **不报** skill 级 或 skillId=`_site` **拒绝**——全局命令不报 skill 热度 |
| 详情 / 卡片「Download」 | 走 `/api/skills/[id]/download` 或 `window.location`；服务端计 `web_download` | 优先服务端计数，避免双计 |
| 上游外链（curated） | **不计** Openwisdom 主热度 | |

若详情尚无 Download 按钮：为 **catalog 源** 增加次要动作「Download SKILL.md」链到 download API。

---

## 3. Stats 拉取与合并

### 3.1 获取

**Server Component 优先（目录页）：**

```ts
// skills/page or SkillsCatalog wrapper
const stats = await fetchStats(); // fetch(`${base}/api/stats`, { next: { revalidate: 300 } })
```

客户端导航后刷新：可选 SWR；v1 可仅 RSC + 300s revalidate。

`fetchStats` 实现于 `lib/heat/fetch-stats.ts`：

- 失败 → `null`  
- 成功 → `StatsResponse`  

### 3.2 合并

```ts
export function mergeHeat(
  entries: CatalogEntry[],
  stats: StatsResponse | null,
): CatalogEntry[]
```

- 对每个 entry，若 `stats.skills[id]` 存在：写入 `installs30d` / `installsTotal`  
- 无 stats 或无该 key：字段 **保持 undefined**（`catalogHasHeat` 为 false 则隐藏 UI）  
- **禁止** 用 0 填充全表假装有数据（0 仅当 API 明确返回 0 且 skill 在 skills map 中）

### 3.3 UI

| 位置 | 行为 |
|------|------|
| SkillCard | `installs30d` 有值时显示小号「{n} · 30d」；无则完全不渲染热度 |
| SkillDetail | 可选展示 30d + total |
| 排序 `popular` | `catalogHasHeat` true 时芯片可见；比较 `installs30d` 降序，缺失当 -1 |
| 默认 sort | 仍 `featured` |

文案 i18n：`skills.heat.installs30d` / `skills.heat.note`（「热度≠质量」短提示可放目录注脚）。

---

## 4. Docs / Install 文案

在 `/docs` FAQ 或新小节 **「隐私与遥测」**：

- 采集：skillId、事件类型、日桶；CLI 版本；不采集姓名邮箱路径  
- 关闭：`--no-telemetry` · `OPENWISDOM_NO_TELEMETRY=1` · `CI=true`  
- 设置：`OPENWISDOM_TELEMETRY_URL=https://<your-deployment>/api/telemetry`  
- 热度不等于学术质量  
- 复制命令不进主榜  

`/install` 可链到该 FAQ。

zh/en `pages.json` 或 `shell` 键对称。

---

## 5. 安全与诚实

- 不在前端展示「正在追踪你」恐吓文案；克制一行即可  
- 不把 Memory store 数据当作生产承诺  
- 不伪造趋势图  

---

## 6. 验收（Web）

- [ ] 复制 catalog skill CLI → Network POST telemetry 200；stats copies* 增；installs* 不变  
- [ ] Download API → installs* 增  
- [ ] curated skill 复制不 POST 或 400 且 UI 不炸  
- [ ] stats 全挂：目录照常，无热度数字  
- [ ] popular 在有 heat 时排序合理  
