# Spec 31 — MCP Official 目录浏览（Web Official ↔ 搜 / 读 / 装）

> **状态：** Implemented  
> **日期：** 2026-07-30  
> **上级：** [22-MCP总控-SPE](./22-MCP总控-SPE.md) · [23-MCP Tools](./23-MCP-Tools与协议.md)  
> **对标：** React Bits 社区 MCP 的「索引 list/search + get 正文」模式  
> **目标用户效果：**  
> 1. 网页 **Official** skill ↔ MCP **搜 / 读正文 / 装**  
> 2. MCP **按场景关键词搜** → 读 SKILL.md → install → **在 Agent 里用 skill**（MCP 不 run 分析）

---

## 1. 摘要

在**不改变**「MCP = 包管理器、不调 LLM」前提下，把 MCP 从「薄卡片 + 只能装」升级为 **Official 可装库的完整浏览**：

| 步骤 | 工具 | 能力 |
|------|------|------|
| 浏览全库 | `openwisdom_list`（增强） | 全量 / 分面过滤；元数据完整 |
| 按场景搜 | `openwisdom_search`（增强） | 关键词 + layer/scope/discipline；可仅筛选 |
| 打开一项 | **`openwisdom_get`（新增）** | 返回 catalog 行 + **SKILL.md 全文** |
| 装进 harness | `openwisdom_install`（已有） | 显式 `providers` |
| 探测环境 | `openwisdom_detect_providers`（已有） | 只读 |

**Catalog 真相：** 与网页 **registry / CLI snapshot 同源**（当前 8 official）。  
**不包含：** 网页 Curated discovery（link-only）— 本 SPE **明确不做**混装。

---

## 2. 产品闭环（验收句）

### 2.1 网页 Official → MCP 使用

1. 用户在站点 Skills 筛 **Official** 看到 `macro-scan`（或任意 registry id）。  
2. Agent 调 `openwisdom_search` / `openwisdom_list` 能命中同一 id。  
3. Agent 调 `openwisdom_get({ skill: "macro-scan" })` 得到与安装包内一致的 SKILL.md。  
4. Agent 调 `openwisdom_install` 写入 `.claude/skills` 等。  
5. 用户在 Agent 会话中按 skill 触发分析（**不**经过 MCP run）。

### 2.2 MCP 按场景搜 → 装 → 用

1. `openwisdom_search({ query: "bias" })` 或 `{ query: "macro", layer: "scenario" }` 返回候选。  
2. `openwisdom_get` 读工作流再决定装哪个。  
3. `openwisdom_install` + 用户/Agent 会话使用。

### 2.3 非目标（本 SPE）

- Curated / external 发现卡进 MCP catalog  
- `openwisdom_run` / 分析 / 托管会话  
- 远程无限 body API（正文读 **本地 skills-snapshot**）  
- 把 heat 写入 SKILL.md  

---

## 3. 数据源

| 内容 | 来源 | 说明 |
|------|------|------|
| 索引 | `catalog-snapshot/catalog.json` | 与 `apps/web/public/registry`、CLI 同构 |
| 正文 | `skills-snapshot/**/SKILL.md` | 安装载荷；`get` 只读不改 |
| 可选 dev | `OPENWISDOM_SKILLS_ROOT` / monorepo `skills/` | 与 install 定位一致（`locateSkillDir`） |

**禁止** get 时伪造正文；定位失败 → `isError` + 可操作提示。

---

## 4. 工具契约变更

### 4.1 新增 `openwisdom_get`

| | |
|--|--|
| **意图** | 打开单个 **可安装** skill 的元数据 + SKILL.md（React Bits `get_component` 对等） |
| **Annotations** | `readOnlyHint: true`, `destructiveHint: false` |
| **CLI 对等** | 无独立命令亦可；语义 = 读将安装的文件 |

**Input：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skill` | string | **是** | catalog id 或 name（如 `macro-scan`） |
| `includeBody` | boolean | 否 | 默认 `true` |
| `maxBodyChars` | int | 否 | 默认 `32000`；超长截断并 `truncated: true` |

**Output（成功）：**

```json
{
  "ok": true,
  "installable": true,
  "catalogSource": "snapshot" | "scan",
  "skill": { /* 完整 CatalogSkill 字段，含 tags/references/repoPath/updated/install */ },
  "body": {
    "path": "skills/official/scenarios/macro-scan/SKILL.md",
    "content": "---\n...",
    "truncated": false,
    "chars": 4111
  }
}
```

`includeBody: false` 时省略 `body`。

**错误：**

- 未知 skill → 提示 search/list  
- 无 skills 树 → 提示 snapshot 损坏或 `OPENWISDOM_SKILLS_ROOT`  

---

### 4.2 增强 `openwisdom_search`

| 变更 | 说明 |
|------|------|
| `query` | **可为空** 若提供了任一 filter（layer/scope/discipline）；否则仍要求 query 或提示用 list |
| 返回卡片 | 增加 `tags`, `references`, `repoPath`, `updated`；`description` 默认仍可截断 400 或提供完整（见 `detail`） |
| `detail` | 可选 `card` \| `full`：full 不截断 description，并带 tags/refs |
| 空结果 | 仍 `ok: true`, `count: 0` |

推荐 Agent：场景探索用  
`search({ query: "situation structure", layer: "scenario" })`  
或  
`search({ query: "", layer: "scenario" })`（仅筛层）。

---

### 4.3 增强 `openwisdom_list`（mode=available）

| 字段 | 说明 |
|------|------|
| `layer` / `scope` / `discipline` | 可选过滤 |
| `q` | 可选自由文本（复用 searchCatalog） |
| `detail` | `card` \| `full`（默认 card，但 **tags/references 始终返回** 以便场景匹配） |
| `limit` / `offset` | 可选；默认 limit 足够覆盖当前 catalog（≥50 或全量） |

mode=installed 行为不变。

---

### 4.4 工具数量

v1 工具数：**6**（原 5 + get）。仍符合 Spec 23「少而稳」。

推荐 Agent 流程（写入 README + tool description）：

```text
openwisdom_list | openwisdom_search
  → openwisdom_get(skill)
  → openwisdom_detect_providers
  → openwisdom_install(dryRun: true)
  → openwisdom_install
  → （在 Agent 中调用 skill，非 MCP）
```

---

## 5. 与网页 Official 对齐

| 网页 Official | MCP |
|---------------|-----|
| registry id / slug | catalog `id` / `name` |
| layer / scope / disciplines / tags | 同名字段 |
| 详情页正文 | `openwisdom_get.body.content` |
| 安装命令 | `skill.install.cli` + install 工具 |
| Curated 分面 | **不对齐**（本 SPE 范围外） |

站点文案可提示：MCP/CLI 覆盖 **可安装 Official**，与 Skills 页 Official 筛选一致。

---

## 6. 实现落点

| 包 | 工作 |
|----|------|
| `packages/core` | 可选 `getSkillDetail()`：catalog 行 + 读 SKILL.md；导出 |
| `packages/mcp` | `tools/get.ts`；server 注册；search/list 增强；README |
| 测试 | get macro-scan body 含 frontmatter；unknown id error；search 空 query+layer |
| 版本 | `openwisdom-mcp` → **0.1.1**（patch）；core 同步若 API 导出变更 |

**不强制**本波次 CLI 新子命令；若顺手可加 `openwisdom show <id>` 为后置。

---

## 7. 验收清单

- [x] `openwisdom_list` 返回 8 official，含 tags/references（有则）  
- [x] `openwisdom_search({ query: "macro" })` 命中 `macro-scan`  
- [x] `openwisdom_search({ query: "", layer: "scenario" })` 仅 3 scenarios  
- [x] `openwisdom_get({ skill: "macro-scan" })` body 含 YAML frontmatter + 工作流标题  
- [x] get 未知 id → isError  
- [x] install 后行为与 0.1.0 一致（既有 install tests）  
- [x] 无 run/analyze 工具  
- [x] Spec 23 工具表已更新；本 SPE 状态 → Implemented  
- [ ] （发布后）`npm view openwisdom-mcp version` ≥ 0.1.1  

---

## 8. 实施波次

| Wave | 内容 | 并行 |
|------|------|------|
| W0 | 本 SPE + Spec 23 增补 + 索引 | 文档 |
| W1 | core `getSkillDetail` + tests | core |
| W2 | mcp get + search/list enrich + server | mcp |
| W3 | README / package version / 冒烟 | 文档+版本 |

---

## 9. 修订

| 日期 | 说明 |
|------|------|
| 2026-07-30 | v1.0 立项：对齐 React Bits 浏览闭环；范围 = Official 可装库 only |
