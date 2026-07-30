# 实现方案：Home 对齐 Specs（02 / 03 / 04）

> 日期：2026-07-30  
> 状态：**已执行（2026-07-30）** — W1 shadcn · W2 React Bits · W3 Home 复合组件；`pnpm build` 通过  
> 依据（必须遵守，优先级从高到低）：  
> 1. [`docs/specs/02-视觉艺术方向.md`](../specs/02-视觉艺术方向.md)  
> 2. [`docs/specs/04-组件与动效.md`](../specs/04-组件与动效.md)  
> 3. [`docs/specs/03-页面信息架构.md`](../specs/03-页面信息架构.md) §4.1 首页  
> 4. [`PRODUCT.md`](../../PRODUCT.md) · [`DESIGN.md`](../../DESIGN.md)  
> 相关：[`docs/specs/01-架构方案.md`](../specs/01-架构方案.md)（站点栈边界，本阶段不扩 CLI）

---

## 1. 问题陈述

当前 `apps/web` Home 是**快速脚手架 + 手写组件**，**未按 specs 落地**：

| Spec 要求 | 现状 | 缺口 |
|-----------|------|------|
| **02** 方向 B：坐标图集、字阶 ≥1.25、记忆点 Orientation | 有铜/场 token 与简易 SVG，但整体像普通 SaaS 分区列表 | 信息密度、字阶节奏、索引卡语言不足；禁令项需再扫 |
| **04** UI 基座 = **shadcn/ui** | 自研 `Button`/`Badge`，无 shadcn | 未 init shadcn、无 Phase 1 组件 |
| **04** 动效点缀 = **React Bits** Tier A | 无 | 无 Hero 背景（Dot Field / Threads）、BlurText、Noise、Logo Loop、Fade 等 |
| **04** InstallCommand = 命令 + 复制 + **Tabs(CLI\|GitHub\|Manual)** | 仅单命令复制 | Tabs / 多路径缺失 |
| **04** 全局壳：Navigation Menu、Sheet、Toast/Sonner、Tooltip… | 手写 MobileNav | 未用 Sheet/Sonner；无 Kbd 安装暗示 |
| **03** 首页 9 模块 | 模块大致有 | 完成度/气质未达「impeccable 级成熟」；Harness 是文字条非 Logo Loop 气质 |
| **03** Header：Search ⌘K（可后置） | 无 | 本阶段可选 stub |
| 双语 | messages 有 | 切语言勿重跑 Hero 重动画（04 §6） |

**结论：** 不是「再加一两个装饰」，而是 **按 04 重建设计系统层 + 按 02/03 重做 Home 表现层**。

---

## 2. 本阶段范围

### In scope（本 plan）

1. 按 **04 §2** 初始化 **shadcn/ui**（Tailwind v4 + 方向 B CSS 变量映射）。  
2. 引入 **04 Phase 1 中与 Home 相关的组件**（不必一次装全目录用组件）。  
3. 按 **04 §5 Tier A + §6 Hero 配方** 接入 **React Bits**（每页重组件 ≤2–3；移动可静态）。  
4. **重做/加固 Home** 全部 §4.1 模块，视觉与组件栈对齐 02+04。  
5. 自研复合组件对齐 04 §4：`InstallCommand`（Tabs）、`OrientationDiagram`、`HarnessLogoRow`、壳组件改 shadcn。  
6. Toast：复制成功用 **Sonner**（04）。  
7. `prefers-reduced-motion`：装饰动效关闭。  
8. 更新 `DESIGN.md` 中与实现一致的 token/组件说明（若有偏差）。  
9. `pnpm build` 通过；zh/en 可访问。

### Out of scope（本 plan 不做）

- Skills 目录 / 详情完整实现（仅保证链接与可选轻量 placeholder 不崩）  
- CLI 包、`skills/` 内容库、热度 API（06）完整后端  
- Fumadocs 全 docs  
- React Bits Tier C 组件  
- next-intl 迁移（保持现有 messages 方案，除非 shadcn 强制；**04 写 next-intl 为推荐，本阶段不强制替换已有 i18n**）

### 拍板默认（spec 推荐写入执行）

| 项 | 本 plan 锁定 |
|----|----------------|
| 视觉 | 方向 **B** |
| UI 基座 | **shadcn/ui** |
| Hero 背景 | **Dot Field**（低饱和/低透明）；失败则 **Threads** 备选 |
| 卡片 | **发丝线 + 弱 Spotlight 可选**；禁止厚侧条、卡中卡 |
| 技能卡 hover | 弱 Spotlight 或纯静态边框，**不用** Tilted 满屏 |
| 每页 React Bits 重特效上限 | **≤3**（建议：DotField + BlurText + LogoLoop 或 Noise 三选结构） |

---

## 3. Spec → 实现映射

### 3.1 视觉 02 → CSS / 排版

| Spec | 实现动作 |
|------|----------|
| Tokens 表 §5 | 保留/校准 `globals.css` 与 shadcn `theme`：`--primary`→datum，`--background`→field |
| 字体表 | 已有 next/font；校验 `font-serif` 仅用于思辨标题，UI 用 sans，命令用 mono |
| 字阶 ≥1.25 | 定义 `text-display` / `text-title` / `text-body` / `text-meta` utility 或 `@theme` |
| Orientation 记忆点 | 强化 SVG：坐标场 + 三轴 + copper datum 十字；一次 settle 动画 |
| 禁令 §7 | 代码审查清单：无紫渐变字、无 glow、无假指标墙、无 Inter 品牌脸 |
| Noise 3–5% | React Bits Noise 全局或 Hero 层极低透明度 |

### 3.2 组件 04 → 包与文件

| Spec 组件 | 落地 |
|-----------|------|
| shadcn Button, Badge, Card, Separator, Tabs, Sheet, Tooltip, Kbd, Navigation Menu, Dropdown | `components/ui/*` via shadcn CLI |
| Sonner | 复制反馈 |
| InstallCommand | Tabs: CLI / GitHub / Manual + 复制 |
| OrientationDiagram | 保留路径，视觉按 02 升级 |
| HarnessLogoRow | 替换纯文字条；可用 Logo Loop（Bits）+ 文本 fallback |
| SiteHeader | Navigation Menu + Sheet 移动端 + Install CTA |
| SiteFooter | 发丝线分区，沿用 03 footer 列 |
| LocaleSwitcher | Toggle Group 或 Dropdown（shadcn） |
| BlurText | Hero H1 一次 |
| Dot Field | Hero 背景 |
| Fade Content | 区块入场（可选，计重特效名额） |
| Logo Loop | Harness 条 |

### 3.3 页面 03 §4.1 → 模块清单（验收用）

实现后首页必须可指认：

1. Hero：三支柱主张 + Install 主对象 + Orientation  
2. Harness 信任条（Logo Loop 气质）  
3. 三大场景（**非**三块相同图标卡；非对称布局）  
4. 分层示意 scenario → reference  
5. 五学科入口（chip 色 02 规定，非整卡彩虹）  
6. 安装路径（CLI 主，GitHub/手动辅）  
7. Official vs community  
8. 贡献预告  
9. 底 CTA  

Header/Footer 常驻。

---

## 4. 分阶段实施

### Phase A — 设计系统底座（阻塞后续）

1. 在 `apps/web` 执行 `pnpm dlx shadcn@latest init`（对齐现有 Tailwind 4、RSC、cssVariables）。  
2. 把 shadcn 主题色映射到 `--ow-*`（铜 primary、冷 field）。  
3. `pnpm dlx shadcn@latest add`（Home 最小集）：  
   `button badge card separator tabs sheet tooltip kbd navigation-menu dropdown-menu sonner`  
   （有余力再加：`toggle-group skeleton`）  
4. 安装 `lucide-react`、`class-variance-authority`、`clsx`、`tailwind-merge`（shadcn 依赖）。  
5. 删除或降级与 shadcn 冲突的手写 `Button`/`Badge`（改为 re-export shadcn 或全局替换 import）。  
6. 根 layout / locale layout 挂 `Toaster`（Sonner）。

**验收 A：** 任意页可渲染 shadcn Button；主题色为铜/场；`pnpm build` 通过。

### Phase B — React Bits 点缀（严格名额）

1. 以 **TS+Tailwind** 方式引入（shadcn registry URL 或拷贝到 `components/bits/`）：  
   - **DotField**（或 Threads）— Hero 背景  
   - **BlurText** — Hero H1  
   - **Noise** — 低透明纹理  
   - **LogoLoop** — Harness（若过重则 CSS marquee 禁用——spec 禁跑马灯喧宾；LogoLoop 克制速度）  
2. 封装 `components/bits/*` + `prefers-reduced-motion` 时渲染静态 fallback。  
3. **禁止** Tier C 列表中任何组件。

**验收 B：** Home 首屏可见背景点场 + H1 blur 入场一次；关「减少动态效果」后无动画。

### Phase C — 复合组件按 04 重写

| 组件 | 要求 |
|------|------|
| `InstallCommand` | shadcn Tabs：CLI 命令 / GitHub 链 / Manual 说明；复制 → Sonner；`aria-live` |
| `OrientationDiagram` | 02 记忆点；静态优先；可选一次 draw |
| `HarnessLogoRow` | Logo Loop 或精致文本+分隔；非廉价灰字一排 |
| `ScenarioCards` | Card+Badge；非对称；索引卡顶线语言 |
| `LayerDiagram` / `DisciplineGrid` / `InstallPaths` / `Provenance` / `Contribute` / `FinalCta` | 用 Card/Separator/Badge；去除「模板三段文」感 |
| `SiteHeader` / `MobileNav` | Navigation Menu + Sheet |
| `LocaleSwitcher` | shadcn Dropdown 或 ToggleGroup；切语言不重置整页重动画 |

**验收 C：** 组件 API 与 messages 兼容；无假数据指标。

### Phase D — Home 编排与气质

1. `HomePage` 按 03 顺序组装；间距：组内紧、组间松，标题上边距 > 下边距。  
2. Hero 配方严格按 04 §6。  
3. 中英 `messages` 校对，半中半英禁止。  
4. 响应式：移动端 Hero 背景可静态；导航 Sheet。  
5. 可选：轻量 `/[locale]/skills` 等 placeholder，避免死链（最小「即将推出」Empty）。

**验收 D：** 对照 03 §4.1 九模块 checklist 全绿；`pnpm build`；目视对标 02 禁令。

### Phase E — 文档与 agent 对齐

1. 更新 `DESIGN.md` 实现备注（shadcn 路径、Bits 清单）。  
2. 更新根 `AGENTS.md` L2 Web：注明「实现必须以 docs/specs 02/04 为准」。  
3. 本 plan 勾选完成项。

---

## 5. 文件级改动清单（预期）

```text
apps/web/
  components.json                 # shadcn
  src/app/globals.css             # 对齐 shadcn + ow tokens
  src/app/layout.tsx              # Toaster
  src/app/[locale]/page.tsx       # 接线
  src/components/ui/*             # shadcn 生成
  src/components/bits/*           # React Bits 封装 + reduced-motion
  src/components/install/InstallCommand.tsx
  src/components/home/*           # 全面对齐
  src/components/site/*           # shadcn 壳
  src/lib/utils.ts                # cn()
  src/messages/{zh,en}.ts         # Tabs 文案等
DESIGN.md                         # 实现同步
AGENTS.md                         # 指向本 plan / specs 强制
```

---

## 6. Subagent 工作包（并行）

| ID | 包 | 依赖 | 职责 |
|----|-----|------|------|
| **W1** | Foundation shadcn | 无 | Phase A：init shadcn、主题映射、Phase1 Home 组件、utils、Toaster、替换 Button/Badge |
| **W2** | React Bits | 可与 W1 并行，合并时注意 globals | Phase B：DotField/BlurText/Noise/LogoLoop + reduced-motion 封装 |
| **W3** | Home composites | **等 W1 合并后** | Phase C+D：InstallCommand Tabs、各 section 用 shadcn、Header Sheet、Home 气质 |
| **W4** | QA build | W3 后 | build、禁令扫描、messages 双语、缺口列表 |

并行约束：W1/W2 尽量不改同一文件；W3 在 W1 完成后启动（或 W1 完成后 resume）。

---

## 7. 验收清单（Definition of Done）

- [x] `components.json` 存在且 shadcn 组件在 `src/components/ui`  
- [x] Home 使用 shadcn Button/Card/Tabs/Sheet/Badge 等，而非纯 ad-hoc 按钮样式为主  
- [x] Hero：Dot Field（或 Threads）背景 + BlurText H1 + InstallCommand（含 Tabs）+ Orientation  
- [x] Noise 或等价低透明纹理（若性能差可文档说明降级）  
- [x] Harness 为 LogoLoop 或同等「信任条」完成度  
- [x] 复制命令触发 Sonner，非仅按钮文字闪一下  
- [x] 无 Tier C Bits；无紫渐变/玻璃/假指标  
- [x] 03 九模块齐全  
- [x] zh + en 构建与页面 OK  
- [x] `pnpm build` 成功  

### 实现备注

- Bits：`apps/web/src/components/bits/`（含 README）  
- 次级路由：`/skills` `/install` `/docs` `/contribute` 为 placeholder，避免 404  
- 完整 Skills 目录 / 热度 API / CLI 仍属后续 plan

---

## 8. 风险与缓解

| 风险 | 缓解 |
|------|------|
| React Bits 与 RSC | Bits 仅 client components；Hero 拆 client 岛 |
| Dot Field 性能 | 移动端静态；reduced-motion 关 |
| shadcn init 覆盖 globals | 先备份 tokens，init 后手工合并 `--ow-*` |
| Logo 版权 | 用文字标 + 简洁 SVG 几何，不盗用品牌商标图 |

---

## 9. 执行顺序（编排）

1. 写入本 plan（本文件）  
2. 启动 **W1 + W2** 并行  
3. W1/W2 完成后启动 **W3**  
4. **W4** 验收；失败则定点修  
5. 勾选 §7；必要时改 DESIGN/AGENTS  

---

## 10. 给实现 agent 的硬指令

```text
YOU MUST implement against docs/specs/02 and docs/specs/04 first.
Do not invent a parallel design system.
Hand-rolled chrome is a temporary debt to replace with shadcn.
React Bits are accents only (≤3 heavy effects per page).
Home modules and order: docs/specs/03 §4.1.
Product non-goals: PRODUCT.md (no hosted AI chat).
```
