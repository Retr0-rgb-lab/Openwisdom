# Spec 28 — 热度 API：端点与存储

> **父规格：** [27](./27-热度API总控-SPE.md) · **产品：** [06](./06-热度与遥测.md)

---

## 1. 文件布局（建议）

```text
apps/web/src/
  lib/heat/
    types.ts          # payload + stats shapes
    skill-ids.ts      # load whitelist from registry
    store.ts          # HeatStore interface
    memory-store.ts   # process-global Memory
    upstash-store.ts  # REST or @upstash/redis
    rate-limit.ts     # IP sliding window (memory)
    aggregate.ts      # day buckets → 30d/total
    config.ts         # env helpers
  app/api/
    telemetry/route.ts   # POST
    stats/route.ts       # GET
    skills/[skillId]/download/route.ts  # GET → attachment + optional count (or count in handler via store)
```

---

## 2. POST `/api/telemetry`

### 2.1 Request body（JSON）

兼容 core 已发载荷 + Web：

```ts
type TelemetryBody = {
  schemaVersion: 1;
  event: "cli_install_success" | "web_download" | "web_copy_install";
  skillId: string;
  ts?: string;           // ISO；缺省用 server now
  source: "cli" | "mcp" | "web";
  cliVersion?: string;
  sessionId?: string;
  meta?: {
    providers?: string[];
    scope?: "project" | "global";
  };
};
```

### 2.2 Validation

| 检查 | 失败 |
|------|------|
| JSON 可解析 | 400 |
| schemaVersion === 1 | 400 |
| event ∈ 枚举 | 400 |
| skillId 非空且 ∈ 白名单 | 400 `{ error: "unknown_skill" }` |
| source 与 event 粗一致（cli_install → cli\|mcp；web_* → web） | 400 可放宽：仅 warn，v1 可只校验 skillId+event |

### 2.3 Rate limit

- Key：`ip`（`x-forwarded-for` 第一段或 `request.ip`）  
- 默认：**60 req / IP / minute**（全事件合计）  
- 超限：**429** `{ error: "rate_limited" }`  
- Memory 滑动窗口即可（serverless 多实例不完美 → 文档注明；Upstash 可选 INCR 限流 P1）

### 2.4 Side effect

`await store.recordEvent({ skillId, event, day: yyyy-mm-dd })`

### 2.5 Response

| 情况 | Status | Body |
|------|--------|------|
| 成功 | 204 或 200 `{ ok: true }` | 无敏感回显 |
| 校验失败 | 400 | `{ error: string }` |
| 限流 | 429 | `{ error: "rate_limited" }` |
| 存储失败 | **204/200 仍 ok**（fail-open）并 `console.error`；或 503 但 **Web/CLI 客户端必须忽略错误** |

**推荐：** 存储异常仍 **200 `{ ok: true, persisted: false }`**，永不拖垮安装。

### 2.6 CORS

CLI 从任意 origin POST：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: content-type
```

`OPTIONS` 预检返回 204。

---

## 3. GET `/api/stats`

### 3.1 Query

| 参数 | 说明 |
|------|------|
| （无） | 返回全部已知 skill 的聚合（仅有事件的 + 白名单内） |
| `ids=a,b` | 可选过滤 |

### 3.2 Response 200

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-07-30T12:00:00.000Z",
  "skills": {
    "macro-scan": {
      "installsTotal": 10,
      "installs30d": 3,
      "cliInstallsTotal": 7,
      "cliInstalls30d": 2,
      "downloadsTotal": 3,
      "downloads30d": 1,
      "copiesTotal": 20,
      "copies30d": 5
    }
  }
}
```

**主热度：**

```
installs* = cli_install_success 计数 + web_download 计数
```

`web_copy_install` **只**进 `copies*`，**不进** `installs*`。

### 3.3 Cache

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=60
```

（5 分钟；可调）

### 3.4 空存储

`{ "schemaVersion": 1, "updatedAt": "…", "skills": {} }` — **不是** 假数字。

---

## 4. HeatStore

```ts
export type HeatEventName =
  | "cli_install_success"
  | "web_download"
  | "web_copy_install";

export interface HeatStore {
  recordEvent(input: {
    skillId: string;
    event: HeatEventName;
    day: string; // YYYY-MM-DD UTC
  }): Promise<void>;

  /** Raw day counts for rollup; or implement getAggregates directly */
  getAggregates(skillIds?: string[]): Promise<
    Record<
      string,
      {
        installsTotal: number;
        installs30d: number;
        cliInstallsTotal: number;
        cliInstalls30d: number;
        downloadsTotal: number;
        downloads30d: number;
        copiesTotal: number;
        copies30d: number;
      }
    >
  >;
}
```

### 4.1 Key 设计（Upstash / Memory 同构）

```
ow:v1:day:{YYYY-MM-DD}:{skillId}:{event}  → integer count
```

Rollup：遍历最近 30 个 UTC 日键求和 → `*30d`；另维护或扫描 total（可用 `ow:v1:total:{skillId}:{event}` INCR 同步）。

**推荐双写：** 每次 event：`INCR day-key` + `INCR total-key`，30d 读 30 个 day-key。

### 4.2 MemoryStore

- `globalThis.__owHeatMemory` 单例 Map  
- 测试可 `resetMemoryStore()`  

### 4.3 UpstashStore

Env：

| 变量 | 说明 |
|------|------|
| `UPSTASH_REDIS_REST_URL` | REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Token |

二者齐全 → 用 Upstash；否则 Memory。

实现可用 `@upstash/redis` **或** 原生 `fetch` 调 REST pipeline。优先少依赖：`fetch` + `Authorization: Bearer`。

### 4.4 getHeatStore()

```ts
export function getHeatStore(): HeatStore {
  if (hasUpstashEnv()) return getUpstashStore();
  return getMemoryStore();
}
```

---

## 5. skill 白名单

```ts
export function getKnownSkillIds(): Set<string>
```

- 优先静态 import `apps/web/public/registry/catalog.json` 的 `skills[].id`  
- 与 catalog build 同步；**community 未入库 id 拒绝**（防刷）  
- curated-only Web slug 若 **不在 registry** → 不可报主热度（复制命令也可 400 或静默 skip 客户端）

**客户端：** 仅对 `source === "catalog"` / registry id 上报。

---

## 6. GET 下载（主热度触发器）

`GET /api/skills/[skillId]/download`

| 项 | 行为 |
|----|------|
| skillId 不在白名单 | 404 |
| 成功 | `Content-Disposition: attachment; filename="{id}-SKILL.md"` 或简单 zip |
| 内容 | 从 monorepo/`skills-snapshot` 难在 Vercel 用时：返回 **registry 描述 + 指引** 或读 `public` 旁打包的 payload |
| 计数 | 成功响应前/后 `recordEvent(web_download)`（fail-open） |

**务实 v1（Vercel 无 skills 树）：**

1. 若存在 `process.cwd()` 下可读 `../../skills/...` 或 env `OPENWISDOM_SKILLS_ROOT` → 返回真实 SKILL.md  
2. 否则 302 到 GitHub raw/tree `repoPath`，**并**记 `web_download`（用户点击即计 1 次主热度——与 06「下载成功」略放宽，文档诚实写「下载/获取源码动作」）

---

## 7. 环境变量汇总

| 变量 | 谁用 |
|------|------|
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Web store |
| `OPENWISDOM_TELEMETRY_URL` | CLI/MCP → 应设为 `https://<site>/api/telemetry` |
| `OPENWISDOM_NO_TELEMETRY` | CLI/MCP |
| `HEAT_RATE_LIMIT_PER_MIN` | 可选覆盖默认 60 |

---

## 8. 测试建议

- MemoryStore incr + 30d rollup 边界（31 天前不计 30d）  
- POST unknown skill → 400  
- POST copy 不影响 installs 聚合  
- OPTIONS CORS  
