# MCP 实测与用户体验纪要

> 蒸馏自原 Spec 32（2026-07-30 审计）。  
> 契约权威：[11-CLI与MCP契约](./11-CLI与MCP契约.md)；现状：[05](./05-系统现状与实现地图.md)。

---

## 1. 结论摘要

| 维度 | 分数 | 一句话 |
|------|------|--------|
| **功能齐全性** | **4 / 5** | 六工具主路径可跑通；缺口在 polish（warnings、refresh no-op、Zod 文案） |
| **方便性** | **3.5 / 5** | 学科全量列举可用；自然语言检索与学科别名易踩坑 |
| **真实性** | **4 / 5** | 审计当时 Official 8 源一致；**同日产品决策后** catalog **89** 全可装对齐 |

**总评（审计当时）：** Official-only 8 条与网站发现面不对齐。  
**后续决策：** 网站可见 skill 必须 MCP 可装 → `pnpm catalog:sync-web` 物化 community → **89** 条（见 §8）。

**方法：** 4 隔离 worktree subagent（handlers + stdio smoke + registry 核对 + UX）。  
**构建/测：** core 与 mcp 单测通过；stdio 烟雾临时 cwd。

---

## 2. 工具矩阵（功能）

| 工具 | 结果 | 备注 |
|------|------|------|
| `openwisdom_search` | ✅ | 关键词 / layer / discipline；无 query 且无 filter → isError |
| `openwisdom_list` | ✅ | available 全库；installed 扫 harness |
| `openwisdom_get` | ✅ | catalog 行 + SKILL.md body |
| `openwisdom_detect_providers` | ✅ | project / global / recommended |
| `openwisdom_install` | ✅ | `providers[]` 必填；dryRun / noDeps / 依赖展开 |
| `openwisdom_update` | ✅ | providers 必填；destructiveHint |

**禁止面已守：** 无 run / analyze / chat / 模型 Key。

### 相对契约的缺口（审计时）

| 项 | 状态 |
|----|------|
| 六工具 + Zod describe | 满足 |
| install 缺 providers 说明 | 处理器级 OK；Zod 层偏干 |
| `install.warnings[]` | **缺口** — 常为 `[]`；core warn 经 onLog 易丢 |
| `refresh: true` | **no-op**（reserved） |
| 远程 catalog 自动刷新 | 未实现；包内 snapshot 为准 |

---

## 3. 方便性

### 按学科列全库

**可以。** 推荐：

```json
{ "mode": "available", "discipline": "psychology" }
```

- 匹配：**精确 id · 大小写不敏感**  
- **无别名：** `psych` / `socio` / `poli` → `count: 0`（成功空集，易误解）  
- **list** 默认 limit 宜盖全库；**search** 默认 20、顶 50 — 库大时可能静默截断；宜补 `total`/`hasMore`  

### Agent 旅程摩擦

| 旅程 | 主要摩擦 |
|------|----------|
| 装某学科 skills | 学科别名；providers 必填多一跳 |
| 找宏观分析 | 多词 AND 易 0 命中（如 `"macro analysis"`） |
| 首次配置 | 文档/站点 Prompt 若漏 `get` 会弱化发现路径 |

**推荐闭环：**

```text
list|search → openwisdom_get → detect_providers → install(dryRun) → install
```

`get` 非安装前置，但读正文判断适用性强烈建议。

---

## 4. 真实性（审计日交叉核对）

### 4.1 当时 Official 8

| 表面 | 技能数 |
|------|--------|
| packages/{mcp,cli,core}/catalog-snapshot | 8 同 hash |
| apps/web/public/registry | 8 |
| 线上 openwisdom.vercel.app/registry | 8 |
| npm openwisdom-mcp 内嵌 | 8 |
| monorepo skills/official | 8 |

**8 ids：**  
`macro-scan` · `personal-anchor` · `metacognition-audit` · `path-dependence` · `collective-action` · `social-stratification` · `confirmation-bias` · `prospect-theory`

### 4.2 审计时网站「发现」超集

| 层 | 数量 | MCP 可见？ |
|----|------|------------|
| Official 可安装 | 8 | ✅ |
| curated-external 发现卡 | ~81 | ❌（当时设计） |

含义：站点心理学条目曾多于 MCP `discipline=psychology` 的 3 条。

### 4.3 其它

- 快照随 **publish** 固化；`refresh` 不拉远程  
- 长期：CI 对多路 catalog hash + skills tree ↔ snapshot  

---

## 5. 改进建议（按影响）

1. **站点 / Docs / Home Prompt 对齐六工具**，写清 list|search → get → detect → dryRun → install  
2. **学科 id 机读化：** 枚举或返回 `knownDisciplines`；别名 `psych`/`poli`/`socio`；0 命中提示合法 id  
3. **检索：** 多词弱化严格 AND（soft token）  
4. **分页诚实：** `total` / `hasMore`；全学科浏览优先 list  
5. **install.warnings[]** 承接 core `onLog` warn  
6. 可选 `providers: "recommended"` / `useRecommendedProviders`（仍显式）  
7. **CI：** 四路 catalog SHA 一致 + skills ↔ snapshot 再 publish  
8. UI 文案：可安装 vs 纯外链发现硬区分（在仍存在分层时）  

---

## 6. 验收清单（本审计已完成项）

- [x] 隔离环境 build MCP + stdio 握手  
- [x] 六工具冒烟（含 dryRun install/update）  
- [x] 按学科一次列出该学科 Official skill  
- [x] 与 skills/、线上 registry、npm 交叉核对  
- [x] 记录 curated 超集与 MCP 边界（历史）  
- [x] 清理 subagent worktree / 本地安装残留  

---

## 7. 环境清理（记录）

并行 subagent 使用隔离 worktree（路径已清理，略）。  
主仓清理：`e2e/.agents`、`e2e/.claude`、本地 harness 安装残留。

---

## 8. 产品决策回写：全量可装

**决策：** 用户在网站上能看到的 skill，MCP 也必须能 `list/search/get/install`。

**落地（2026-07-30）：**

| 步骤 | 命令 / 产物 |
|------|-------------|
| 物化 | `pnpm catalog:materialize` → `skills/community/**/SKILL.md` |
| 索引 | `pnpm catalog:build` → CLI/MCP/core snapshot + web registry |
| 一键 | `pnpm catalog:sync-web` |

**结果：** machine catalog **89** = Official 8 + community 物化。  
MCP 可按 `discipline=psychology` / `philosophy` 等列出多条。  
`installMode` 在 registry 命中后为 **cli**。

**注意：** 物化包是可安装本地 skill 卡 + 上游 URL，**不是**上游仓库完整 git 镜像。

---

## 9. 与现网对照

| 项 | 值 |
|----|-----|
| 线上站 | https://openwisdom.vercel.app |
| registry | `/registry/catalog.json` |
| MCP 包 | `openwisdom-mcp`（审计 0.1.1；现状见 package.json，现 **0.1.2**） |
| skillCount | **89**（manifest） |

*本纪要记录证据与产品含义；接口字段以 [11](./11-CLI与MCP契约.md) 为准。改工具面时同步修订本文 §2–§5。*
