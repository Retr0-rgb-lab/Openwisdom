# Spec 32 — MCP 实测与用户体验审计

> **状态：** Audit complete（2026-07-30）  
> **日期：** 2026-07-30  
> **方法：** 4 个隔离 worktree subagent 并行实测（handlers + stdio smoke + 官网/registry 核对）  
> **上级：** [22-MCP总控](./22-MCP总控-SPE.md) · [23-Tools](./23-MCP-Tools与协议.md) · [31-Official 浏览](./31-MCP-Official目录浏览-SPE.md)  
> **范围：** `packages/mcp` v0.1.1 · 包管理 only · 零 LLM

---

## 1. 结论摘要

| 维度 | 分数 | 一句话 |
|------|------|--------|
| **功能齐全性** | **4 / 5** | 六工具齐备，Spec 23/31 主路径可跑通；缺口在 polish（warnings、refresh no-op、Zod 报错文案） |
| **用户/Agent 方便性** | **3.5 / 5** | 学科全量列举可用；自然语言检索与学科别名易踩坑；站点 Prompt 落后 `openwisdom_get` |
| **真实性（可安装 Official）** | **4 / 5** | MCP 快照与 monorepo `skills/`、网站 machine registry、npm 包 **8/8 一致**；网站 UI 另有 81 条 curated 仅发现、不可 MCP 安装 |

**总评（审计当时）：** Official-only 时代 MCP 仅 8 条，与网站发现面不对齐。  
**后续产品决策（同日）：** 网站可见 skill **必须** MCP 可装 → 已用 `pnpm catalog:sync-web` 将发现卡物化为 `skills/community/**`，catalog/MCP 与网站对齐为 **89** 条可安装（见 §10）。

---

## 2. 实测方法

| Subagent | 焦点 | 环境 |
|----------|------|------|
| A · discipline list | `list`/`search` 按学科过滤、别名、分页 | 隔离 worktree · handlers |
| B · full tool smoke | 六工具 + dryRun 写盘 + 单测 | 隔离 worktree · stdio |
| C · catalog truth | 快照 vs `skills/` vs 官网 vs npm | 隔离 worktree · 网络核对 |
| D · UX convenience | 旅程 A/B/C、Prompt 对齐、摩擦 | 隔离 worktree |

构建：`pnpm --filter @openwisdom/{schema,providers,core} build` + `openwisdom-mcp build`  
单测：`@openwisdom/core` 29/29 · `openwisdom-mcp` 19/19  
烟雾：stdio 客户端 → `packages/mcp/dist/mcp.js`（临时 cwd，已清理）

---

## 3. 功能齐全性

### 3.1 工具矩阵

| 工具 | 结果 | 备注 |
|------|------|------|
| `openwisdom_search` | ✅ | 关键词 / layer / discipline；无 query 且无 filter → isError |
| `openwisdom_list` | ✅ | available 全库；installed 扫 harness |
| `openwisdom_get` | ✅ | catalog 行 + SKILL.md body（Spec 31） |
| `openwisdom_detect_providers` | ✅ | project / global / recommended |
| `openwisdom_install` | ✅ | `providers[]` 必填；`dryRun` / `noDeps` / 依赖展开 |
| `openwisdom_update` | ✅ | providers 必填；destructiveHint |

**禁止面：** 无 `run` / analyze / chat / 模型 Key — 符合 PRODUCT 硬规则。

### 3.2 相对 Spec 23 的缺口

| 项 | 状态 |
|----|------|
| 六工具 + Zod describe + 结构化结果 | 满足 |
| install 缺 providers 的**处理器**级说明 | 满足；**Zod 层**报错偏干 |
| `install.warnings[]` | **缺口** — 常为 `[]`；core warn 经 `onLog` 被丢弃 |
| `refresh: true` | **no-op**（文档已写 reserved） |
| 远程 catalog 自动刷新 | 未实现；以包内 snapshot 为准 |

---

## 4. 用户方便性

### 4.1 关键问题：能否列出某一学科的全部 skill？

**可以。** 推荐一次调用：

```json
{
  "mode": "available",
  "discipline": "psychology"
}
```

工具：`openwisdom_list`（优先）或 `openwisdom_search`（`query` 可空 + `discipline`）。

实测（catalog N=8）：

| discipline id | 数量 | skill ids |
|---------------|------|-----------|
| `psychology` | 3 | confirmation-bias, metacognition-audit, prospect-theory |
| `sociology` | 4 | collective-action, macro-scan, personal-anchor, social-stratification |
| `history` | 2 | path-dependence, personal-anchor |
| `economics` | 3 | macro-scan, path-dependence, prospect-theory |
| `political-science` | 2 | collective-action, macro-scan |
| `philosophy` | 0 | 目录可安装集中无此 id（站点 UI 可能有 curated 哲学发现卡） |

- 匹配：**精确 id · 大小写不敏感**  
- **无别名：** `psych` / `socio` / `poli` → `count: 0`（成功空集，易误解为「没有 skill」）  
- **list** 默认 limit **100**（今日可盖全库）  
- **search** 默认 **20**、硬顶 **50** — 库变大时按学科「全列」可能静默截断；响应无 `total`/`hasMore`

### 4.2 Agent 旅程摩擦

| 旅程 | 结果 | 主要摩擦 |
|------|------|----------|
| A · 装心理学 skills | list(discipline=psychology) 一次拿齐 → detect → install | 学科别名；providers 必填多一跳 |
| B · 找宏观分析 | `search("macro")` 可；`search("macro analysis")` **AND 全词** 易 0 命中 | 自然语言检索 |
| C · 首次配置 | Claude/Cursor 文档清晰；Grok 仅通用 JSON | 站点 MCP Prompt 缺 `openwisdom_get` |

**推荐闭环（与 README 一致）：**

```text
list|search → openwisdom_get → detect_providers → install(dryRun) → install
```

`get` **非安装前置条件**，但对读 SKILL 正文、判断是否适用仍建议使用。

### 4.3 站点 / 文档与实装对齐

| 表面 | 问题 |
|------|------|
| 包 README · Spec 31 | 六工具含 `openwisdom_get` — **正确** |
| 站点 docs / home `mcpPrompt` / 部分 LLM 文案 | 仍写五工具，**漏 get** |
| Home 安装 Prompt | 跳到 detect + install，弱化发现路径 |

---

## 5. 真实性（与官网核对）

### 5.1 可安装 Official（机器 catalog）

| 表面 | 技能数 | 一致性 |
|------|--------|--------|
| `packages/mcp/catalog-snapshot/catalog.json` | 8 | 基准 |
| `packages/{cli,core}/catalog-snapshot` | 8 | 与 MCP **同 hash** |
| `apps/web/public/registry/catalog.json` | 8 | **同 hash** |
| 线上 `https://openwisdom.vercel.app/registry/catalog.json` | 8 | **同 hash** |
| npm `openwisdom-mcp@0.1.1` 内嵌 snapshot | 8 | **同 hash** |
| monorepo `skills/official/**` | 8 | id + body 与 skills-snapshot 对齐 |
| `skills/community/` | 0 | 全表面为空 |

**catalog.json SHA256（多源一致）：**  
`6A2EE7E17FFB8FCB9D054E6385934CBD9E96DCBC023B10928DEA8FE2B3D6984C`

**8 ids：**  
`macro-scan` · `personal-anchor` · `metacognition-audit` · `path-dependence` · `collective-action` · `social-stratification` · `confirmation-bias` · `prospect-theory`

学科标签、layer、`install.cli`（`npx openwisdom install <id>`）与详情页抽查（如 `/zh/skills/macro-scan`）一致。  
UI 中文标题（如「宏观扫描」）来自 web bootstrap 展示层；MCP 卡暴露 registry `name`/kebab id — **同一可安装实体**。

### 5.2 网站「发现」超集（产品分层，非 Official 漂移）

| 层 | 数量 | MCP 可见？ |
|----|------|------------|
| Official 可安装 | 8 | ✅ |
| curated-external / link-only 种子 | **81** | ❌（设计如此） |

**含义：** 用户在 `/zh/skills` 看到的心理学条目 **多于** MCP `discipline=psychology` 的 3 条。MCP 只反映 **可安装 Official**；站点可另展示 curated 发现卡。

### 5.3 其它真实性格

- list/search **卡**目前可不带 `install.cli` 字段；安装走 `openwisdom_install` 或约定 CLI 串（catalog 行内仍有 install）。
- 快照随 **publish 时** 固化；`refresh` 不拉远程。当前与官网 registry 同步，长期需 CI 对 hash。

---

## 6. 改进建议（按影响排序）

1. **对齐站点 / Docs / Home AI Prompt 为六工具**，写清 `list|search → get → detect → dryRun → install`。  
2. **学科 id 机读化：** Zod 枚举或响应信封返回 `knownDisciplines`；接受 `psych`/`poli`/`socio` 别名；0 命中时提示合法 id。  
3. **检索：** 多词查询弱化严格 AND（或 soft token），避免 `"macro analysis"` 空结果。  
4. **分页诚实：** list/search 增加 `total` / `hasMore`；search 全学科浏览说明优先用 list。  
5. **install.warnings[]** 承接 core `onLog` warn；依赖展开可在摘要中标明。  
6. **可选** `providers: "recommended"` 或 `useRecommendedProviders`（仍显式、非静默）。  
7. **CI：** 四路 `catalog.json` SHA 一致 + skills tree ↔ skills-snapshot 一致再允许 publish。  
8. **UI 文案：** Official 可安装 vs curated 发现硬区分，降低「网站有、MCP 没有」的预期落差。

---

## 7. 验收清单（本审计）

- [x] 隔离环境可 build MCP 并 stdio 握手  
- [x] 六工具冒烟（含 dryRun install / update）  
- [x] 按学科一次调用列出该学科全部 **Official** skill（N=8 下全覆盖）  
- [x] 与 `skills/`、线上 registry、npm 快照交叉核对  
- [x] 记录网站 curated 超集与 MCP 边界  
- [x] 清理 subagent worktree（见 §8）

---

## 8. 环境清理

并行 subagent 使用 Grok 隔离 worktree：

```text
C:\Users\Lenovo\.grok\worktrees\openwisdom\subagent-019fb35e-24ce-72c2-8903-37815dd56fd5
C:\Users\Lenovo\.grok\worktrees\openwisdom\subagent-019fb35e-24d3-7550-b68d-53ae62f0df5f
C:\Users\Lenovo\.grok\worktrees\openwisdom\subagent-019fb35e-24d9-7bf3-9f53-f6782ee2ad6d
C:\Users\Lenovo\.grok\worktrees\openwisdom\subagent-019fb35e-24df-7023-a831-69f05d24811b
```

审计完成后主会话已删除上述 4 个 worktree 目录，并清理主仓 `e2e/.agents`、`e2e/.claude`、`.agents` 本地安装残留。

---

## 9. 关联

| 文档 | 关系 |
|------|------|
| Spec 22–24 | 契约权威 |
| Spec 31 | get + Official 浏览增强（本审计确认已落地） |
| PRODUCT / 知识库 05 | 双表面 CLI+MCP · 零 LLM |
| 线上站点 | https://openwisdom.vercel.app · registry `/registry/catalog.json` |

---

*本文件为实测审计 SPE：记录证据与产品含义；不替代 23 的接口契约。后续改工具面时同步修订 §3–§6。*

---

## 10. 产品决策回写（全量覆盖发现卡）

**决策：** 用户在网站上能看到的 skill，MCP 也必须能 `list/search/get/install` 使用。

**落地（2026-07-30）：**

| 步骤 | 命令 / 产物 |
|------|-------------|
| 物化 | `pnpm catalog:materialize` → `skills/community/{scenarios,references}/<slug>/SKILL.md`（当时 +81） |
| 索引 | `pnpm catalog:build` → CLI/MCP/core snapshot + `apps/web/public/registry` |
| 一键 | `pnpm catalog:sync-web` |

**结果：** machine catalog **89** = 原 Official 8 + 物化 community 81。  
MCP `loadCatalog` 计数 89；`discipline=psychology` / `philosophy` 可列出多条。  
curated 包含 summary/when/steps（若有）+ upstream URL；`installMode` 在 registry 命中后为 **cli**。

**注意：** 物化包是可安装的本地 skill 卡，不是上游仓库 git 镜像；正文以站点 seed + 上游链接为准，完整上游演进仍以 external URL 为准。
