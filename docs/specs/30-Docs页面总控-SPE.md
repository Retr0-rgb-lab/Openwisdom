# Docs 页面总控 — SPE

> **状态：** Implemented（PEL-128）  
> **日期：** 2026-07-30  
> **Issue：** [PEL-128](https://linear.app/pelec/issue/PEL-128/doc文档)  
> **模式：** **Read**（Impeccable）  
> **视觉：** Overlay Atlas × Notion **布局 DNA**（非 Notion 米色；禁止 purple AI）  
> **依据：** Spec 03 IA · PRODUCT · DESIGN · 调研 stylekit Notion-style · 知识库 05  

---

## 1. 摘要

把公开 `/docs` 从「单页长滚动 intro」升级为 **文档阅读壳（侧栏 + 正文 + 可选 TOC）**：  
Hub 做定向，**Getting started / FAQ / Privacy** 成文，P1 路由诚实 stub。  
不引入 Fumadocs/MDX 全库；文案走 `messages` 双语 JSON；分析运行时仍在用户 Agent。

---

## 2. 产品边界（Docs 必须守住）

| 必须说清 | 禁止暗示 |
|----------|----------|
| 三表面：GitHub · 目录站 · CLI/MCP（不调模型） | 本站托管分析 / 网页聊天 |
| 安装后在 **用户 Agent** 调用 skill | `openwisdom run` 调模型 |
| 热度旁路、fail-open、不写 `SKILL.md` | 假安装量 / 社会证明 |
| UI 中英；skill 正文语言随贡献者 | 强制双语 skill 正文 |

**职责切分：**

| 表面 | 负责 | Docs 不抢 |
|------|------|-----------|
| `/install` | 安装路径密度、命令块、Harness 矩阵 | 不复制整页 Install |
| `/skills` | 目录与详情 | 不嵌套目录浏览 |
| `/contribute` | PR 流程 | Authoring 链过去即可 |
| `/docs` | 边界、首次成功、概念/CLI 文档位、隐私、FAQ | 不 dump `docs/specs/*` 内部 SPE |

---

## 3. 路由表（v1 本轮）

| 路由 | 状态 | 说明 |
|------|------|------|
| `/{locale}/docs` | **Ship** | Hub：边界 + 编号路径 + 指南卡 |
| `/{locale}/docs/getting-started` | **Ship** | 首次成功：安装 → macro-scan → 校验 |
| `/{locale}/docs/faq` | **Ship** | 扩展 FAQ（Spec 03 主题） |
| `/{locale}/docs/privacy` | **Ship** | 隐私与遥测全文；Install 深链改此 |
| `/{locale}/docs/concepts` | **Ship** | 场景 vs reference；运行边界 |
| `/{locale}/docs/cli` | **Ship** | search/install/update/list |
| `/{locale}/docs/agents` | **Ship** | Harness 路径；可链 `/install` |
| `/{locale}/docs/authoring` | **Ship** | 编写规范；主 CTA → `/contribute` |
| `/{locale}/docs/changelog` | **Ship** | 能力波次摘要；可链 GitHub Releases |

兼容：旧 `/docs#privacy` → 页内 redirect 到 `/docs/privacy`（或 Install 直接改链；优先改链）。

---

## 4. 信息架构

### 4.1 侧栏顺序（固定）

```text
Overview
Getting started
Concepts
CLI
Agents
Authoring
Privacy
FAQ
Changelog
```

### 4.2 壳布局（Notion calm × Overlay Atlas）

```text
[SiteHeader — Docs active]
┌ Sidebar ~240–280  ┬  Main ~68ch (hub 可 ~960)  ┬  TOC ~200 lg+ ┐
│ sticky            │  breadcrumb / H1 / body     │  On this page │
│ color-only hover  │  callouts / code            │  scroll-spy   │
│                   │  Prev | Next                │  (文章页)     │
└───────────────────┴─────────────────────────────┴───────────────┘
[SiteFooter — Resources: Docs · Getting started · FAQ]
```

- **Field** `#F8F9FA` · **Primary links** `#1C4BD1` · **Structure** `#2E6975`  
- 圆角 6–10px · 发丝线 · **无** translate/scale 内容动效 · **无** DotField/BlurText  
- 正文 measure **65–75ch**；禁止 nested cards、厚左边条装饰默认  

### 4.3 Hub 模块

1. H1 + lede（边界一句话）  
2. What（3 bullets，可折叠进 lede 下列表）  
3. **编号快速路径** 01 Getting started · 02 Install · 03 FAQ  
4. **指南卡网格**（含 stub 徽章）  
5. 相关产品链：Skills / Install / Contribute / GitHub  

### 4.4 Getting started 脊柱

1. 产品边界 callout  
2. 选安装路径 → 链 `/install`  
3. 装 `macro-scan`（命令示例 + 链详情）  
4. 在 Agent 中调用（Claude Code / Cursor 等；**不**暗示站内 run）  
5. 校验（skill 目录可见 / 跑通一次）  
6. 下一步：Concepts stub · FAQ · Skills  

### 4.5 FAQ 必含主题

- 是否托管分析/网页聊天  
- CLI/MCP 是否调用模型  
- 文件装到哪里  
- 如何更新  
- UI 双语 vs skill 正文语言  
- Agent 看不到 skill 怎么办  
- 热度/遥测/关闭方式（链 Privacy）  

### 4.6 Privacy

保留现有 Spec 29 质量：采集 / 不采集 / 关闭 / URL 示例（**无** ICU 尖括号）/ 热度≠质量 / 复制不进主榜 / 用途。

---

## 5. 组件与文件

| 路径 | 角色 |
|------|------|
| `apps/web/src/app/[locale]/docs/layout.tsx` | Docs 壳 |
| `apps/web/src/app/[locale]/docs/**/page.tsx` | 各路由 |
| `apps/web/src/components/docs/*` | Shell / Sidebar / TOC / Callout / Hub / 文章 / Stub |
| `apps/web/src/components/docs/nav.ts` | 侧栏数据源 |
| `messages/{zh,en}/pages.json` → `docs.*` | 全部文案 |
| `messages/{zh,en}/shell.json` footer resources | GS / FAQ 链 |
| `InstallHub` | privacy → `/docs/privacy` |

**不做本轮：** Fumadocs、MDX 内容库、docs 内全文搜索、changelog 真源同步。

---

## 6. 文案与 i18n

- 全部 UI/正文字符串 **zh + en 对等**  
- next-intl：**禁止**消息内未转义 `<...>`（用 `example.com` 等）  
- 不写假「已服务 N 用户」类指标  

---

## 7. 动效（Read）

- 默认静止；仅工具反馈（复制、Sheet、hover 底色 ~150ms）  
- `prefers-reduced-motion`：零装饰动效  
- 禁止章节 stagger 入场  

---

## 8. 验收

- [x] `/zh/docs` 与 `/en/docs` Hub 可用，侧栏高亮 Overview  
- [x] Getting started / FAQ / Privacy 全文可读，无 `INVALID_MESSAGE`  
- [x] Stub 路由 200 + 诚实「稍后补充」+ 可用深链（Install/Contribute/GitHub）  
- [x] Install「隐私」链到 `/docs/privacy`  
- [x] Footer Resources 含 Docs + Getting started + FAQ  
- [x] Overlay Atlas tokens；无米色主场、无 purple glow  
- [x] `pnpm build`（apps/web）通过（2026-07-30）  
- [x] 无托管分析暗示、无假热度数字  

---

## 9. 实施波次

| Wave | 内容 |
|------|------|
| W0 | 本 SPE + 索引更新 |
| W1 | `components/docs` 壳 + nav + layout |
| W2 | Hub + getting-started + faq + privacy 文案与页 |
| W3 | Stub 页 + footer/Install 链 + build |

---

## 10. 修订

| 日期 | 说明 |
|------|------|
| 2026-07-30 | v1.0 PEL-128 总控：研究 + PM 裁剪 + 实现范围 |
