# Spec 16 — Skills 全方位整改 SPE（全局搜索 · 目录 · 详情 · 内容填充）

> **状态：** Executed（2026-07-30 · Wave A–E 落地 · build 绿）  
> **日期：** 2026-07-30  
> **父系：** Specs 12–15（v1 bootstrap 已落地）；本 SPE **升级** 全站 Skills 体验  
> **视觉：** Overlay Atlas · Operate + Read  
> **专家输入：** 布局专家 · GitHub 内容侦察 · 详情页专家（会话调研）

---

## 0. 负责人拍板（Open decisions locked）

| ID | 议题 | 决策 |
|----|------|------|
| L1 | 搜索形态 | 全局 **胶囊触发器** → **Command Palette**；**Ctrl+K / ⌘K** 全站；目录页 **移除** 页内搜索框 |
| L2 | Palette 范围 | **Hybrid**：Skills 结果 + Jump-to 静态导航；无假 AI 答案 |
| L3 | `/skills` 上改 `q` | **合并** 现有 facets，只更新 `q` |
| L4 | 预填 | 打开 palette 时若 URL 有 `q` 则预填 |
| L5 | Header 宽度 | **`max-w-6xl`** 与 Skills 内容对齐 |
| L6 | 目录 facets | v1 **顶栏 sticky chips**（非左轨）；≥20 条目后再考虑 Dense Atlas Rail |
| L7 | 外部 skills | **填充** MIT/CC0 为 `curated-external` 元数据 + 上游链接；**CC-BY-NC / BY-SA** 仅 link-only 卡片 |
| L8 | 详情 Install | Desktop sticky 顶栏 Tabs（CLI \| GitHub \| Manual）；**Mobile 底栏 dock** |
| L9 | SKILL.md 正文 | 结构化模块优先；无 in-repo 全文则 **不假装**；外链上游 |
| L10 | 热度 | 仍不伪造 |

---

## 1. 目标与成功标准

### 目标

1. 任意页面 **⌘K / Ctrl+K** 可搜 Skills 并跳转详情或目录  
2. `/skills` 成为 **图书馆控制台**（无营销 Hero、无重复搜索）  
3. `/skills/{slug}` 成为 **评估 → 安装 → 图谱** 决策页  
4. Catalog 从 3 条 bootstrap 扩展为 **官方 3 + 精选外部**（诚实 provenance）

### 成功标准

| # | 标准 |
|---|------|
| S1 | Header 有胶囊搜索；Kbd 提示；点击与快捷键打开 palette |
| S2 | Palette：空态精选三场景 + Jump-to；有 `q` 时 Skills 组 +「在目录搜索」 |
| S3 | `/skills` 无页内 Search Input；筛选 sticky；结果可工作 |
| S4 | Catalog ≥ **12** 条可浏览（3 official + ≥9 curated） |
| S5 | 详情：Attribution（外部）· Install tabs · Scenario/Reference 分支 · Related |
| S6 | zh/en 文案完整；`pnpm build` 通过 |
| S7 | 无假热度、无紫光、无托管聊天 |

---

## 2. 非范围

- Install / Docs 全文重做  
- `packages/catalog` monorepo 管道  
- Stats API / heat  
- 左轨 Dense Atlas（v1.1）  
- 全文站内 Docs 搜索  
- 整包 vendor NC 许可正文进 MIT 树  

---

## 3. 波次计划（执行顺序）

| Wave | 名称 | 交付 | 并行 | 依赖 |
|------|------|------|------|------|
| **A** | Data contract + seed | 扩展 `CatalogEntry`；`external-seed.ts` 填充 | — | 无 |
| **B** | Global search chrome | Capsule + CommandPalette + hotkey；Header | 可与 A 并行 | 无（可先 mock catalog search） |
| **C** | Catalog layout | 去页内搜索；sticky toolbar；count；适配更多卡 | A 后最佳 | A 部分 |
| **D** | Detail redesign | Install tabs/dock；Attribution；layer bodies | A 后 | A |
| **E** | i18n + wire + verify | shell/skills 文案；Home 深链；build + detector | B–D 后 | B C D |

**并行建议：** A ∥ B → C ∥ D → E。

---

## 4. 数据契约增量（相对 Spec 15）

```ts
// 新增 / 扩展字段（均为 optional，UI empty-safe）
provenance?: "official" | "community" | "curated-external";
externalUrl?: string;
license?: string; // SPDX
attribution?: string;
author?: string;
contentAvailability?: "full-body" | "summary-only" | "external-only";
installMode?: "cli" | "git-clone" | "link-only";
// scenario extras
output?: LocalizedString[];
bias?: LocalizedString[];
// reference extras
definition?: LocalizedString;
bounds?: LocalizedString;
misuse?: LocalizedString;
questions?: LocalizedString[];
```

**Seed 策略：**

| 组 | 条目 |
|----|------|
| Official featured | macro-scan · personal-anchor · metacognition-audit |
| MIT/CC0 curated | scientific-critical-thinking · thinking-steel-manning · thinking-first-principles · thinking-socratic · thinking-pre-mortem · thinking-probabilistic · lit-review-assistant · research-ideation · r-econometrics · research-proposal · socrates |
| Link-only (可选 v1) | humanities-writing-companion · academic-research-skills · aers-catalog |

详见 [内容种子表](../plans/2026-07-30-skills-full/01-content-seed.md)。

---

## 5. 布局摘要（Library Console）

### Header

```text
[Logo] Nav…  [🔍 Search skills…  ⌘K]  [中|EN] [GH] [Install]
max-w-6xl · h-14 · capsule rounded-full h-9
```

### Palette

- Groups: Skills · Jump to · (footer) Search catalog for “q”  
- Enter skill → detail；Search catalog → `/skills?q=`（合并 facets）  
- Esc / scrim 关闭  

### Catalog

- Intro 紧凑 · Bootstrap/Curated honesty banner · sticky facets · Featured（无硬筛）· grid  
- **无** body search  

### Detail

- Header meta · Attribution if external · sticky Install (tabs) · body by layer · Related · Provenance  
- Mobile: bottom install dock  

---

## 6. 验收清单（总）

见 §1 成功标准 + Spec 13/14 更新条款 + build 绿。

---

## 7. 关联

| 文档 | 角色 |
|------|------|
| [13](./13-Skills目录页-Operate.md) | 目录（本 SPE 修正：搜索上移） |
| [14](./14-Skills详情页.md) | 详情 |
| [15](./15-Skills数据契约-bootstrap.md) | 数据（本 SPE 扩展外部字段） |
| [plans/2026-07-30-skills-full/](../plans/2026-07-30-skills-full/00-README.md) | 分 Plan 执行说明 |
