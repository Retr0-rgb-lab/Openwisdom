# 落地页 Home Page 构建 — Spec v1.1

> 日期： 2026-07-30
> 依据： `PRODUCT.md`、`DESIGN.md`、`docs/specs/01-架构方案.md`、`02-视觉艺术方向.md`、`03-页面信息架构.md`、`04-组件与动效.md`、`docs/知识库/01–04`
> 基线分支： `master`（**当前 0 commit，全部文件 untracked**）
> 前置依赖： 无（greenfield）
> 取代关系： 本 spec 取代 `docs/plans/2026-07-30-home-spec-alignment.md`（该 plan 标注「已执行」但**仓库中无任何实现文件**，经核实为未落地记录）
> 审查： v1.0 经 oracle 审查（Verdict: REVISE，P0×2 / P1×6 已全部吸收）

---

## 摘要

仓库目前只有文档，没有任何代码。本 spec 从零搭建 `apps/web`（Next.js App Router + Tailwind v4 + shadcn/ui + next-intl），并按 specs 02/03/04 完整实现双语落地页 Home（`/zh`、`/en`），含全局壳与次级路由占位页。执行拆为 4 份 plan、3 个 wave，Wave 2 内两 plan 并行。完成后 `pnpm build` 通过、zh/en 双语可访问、视觉符合方向 B 禁令清单。

## 0. 前置依赖

- 产品决策已全部拍板（`docs/知识库/02` #1–#11）：目录站 + CLI 包管理器、分层内容（scenario/reference）、双语 UI、热度第三档（本 spec 不实现热度，仅不留冲突）。
- 设计方向已拍板：方向 B（Instrument of Orientation），token 与禁令见 `DESIGN.md` 与 `docs/specs/02`。
- 环境已验证：node v24.14.0、pnpm 10.33.0、npm 11.9.0、git 身份已配置、remote `origin` 指向 GitHub 仓库。
- 外部事实（oracle 复核）：next-intl@4.4+ 支持 Next.js 16；React Bits 注册表存在 `DotField-TS-TW` / `BlurText-TS-TW` / `LogoLoop-TS-TW` / `Noise-TS-TW`。
- 旧 plan `2026-07-30-home-spec-alignment.md` 的「spec → 实现映射」与拍板默认表仍然有效，本 spec 继承其技术锁定（见 §2.0）。

## 1. 现状

| 证据 | 事实 |
|------|------|
| `ls apps` → No such file or directory | `apps/` 目录**不存在** |
| `cat package.json` → No such file | 仓库根无 `package.json`，非 pnpm workspace |
| `git log` → "does not have any commits yet" | `master` 分支 0 commit |
| `git status` | 全部 untracked：`AGENTS.md` `DESIGN.md` `PRODUCT.md` `docs/` `node_modules/` `openwisdom-logo-v1.svg` |
| `ls node_modules/` | 仅有 `motion` 一个包 + pnpm 状态文件，系孤儿目录（无对应 package.json），本次不删除，root `pnpm install` 时由 pnpm 自行调和 |
| `docs/plans/2026-07-30-home-spec-alignment.md` 头部 | 自称「已执行、`pnpm build` 通过」——**与文件系统矛盾，为不实记录** |
| `AGENTS.md` L2 / `DESIGN.md` §Implementation | 描述的 `apps/web/src/...` 全部不存在 |

结论：这是**全新实现**，不是对齐/重构。所有「现状有 X」的引用在旧 plan 中均失效；设计约束（token、禁令、模块清单、组件选型）不受影响，继续有效。

## 2. 需要做的工作

### 2.0 锁定决策（继承旧 plan 拍板 + spec 推荐，本 spec 不再重议）

| 项 | 锁定值 | 来源 |
|----|--------|------|
| 视觉方向 | **B 坐标图集**（冷场 `#EEF1F2` + 铜 `#B87333`） | specs/02 §4、DESIGN.md |
| UI 基座 | **shadcn/ui**（Tailwind v4、cssVariables、RSC） | specs/04 §2 |
| i18n | **next-intl**，路由 `/zh` `/en` 双前缀，默认 `zh`（middleware 补前缀） | specs/01 §6/§8；AGENTS.md「default zh」 |
| 主题 | **浅色优先**；dark 仅做 token 结构预留，**本阶段不实现切换** | DESIGN.md「Dark (optional pair)」 |
| Hero 背景 | **Dot Field**（低饱和/低透明），失败则 Threads 备选 | specs/04 §9 推荐默认 |
| React Bits 重特效 | **≤3**：DotField + BlurText + LogoLoop；Noise 低透明不计重。LogoLoop 与 DESIGN.md「no marquees」/02 §7「自动滚动 logo 海」的条文张力以 specs/04 §5 Tier A（明确推荐 Logo Loop 作 Harness 条）为裁判，约束：极慢速度 + hover 暂停 + reduced-motion 静态 | DESIGN.md §Implementation、specs/04 §5 |
| 技能卡 hover | 静态 + hover 边框 / 弱 Spotlight，禁 Tilt 满屏 | specs/04 §9 |
| 安装命令文案 | `npx openwisdom install`（包名以注册为准，UI 照 specs/03 §6 命令表面） | specs/03 §6 |
| Logo | **不使用** 根目录 `openwisdom-logo-v1.svg`（蓝/青色网格，偏离方向 B）；Header 用文字标 + datum 十字小 SVG | PRODUCT.md「No binding brand assets」 |
| 假数据 | 禁止任何伪造安装数/ testimonial；三场景/五学科为**策划内容展示**，非实时目录 | PRODUCT.md Evidence |

### 2.1 Plan A — Monorepo 与 Web 底座（Wave 1）

**问题：** 无任何代码，需可构建的 Next.js 底座，后续 plan 全部依赖其 token、shadcn、i18n 配置。

**工作（按序执行，注意 #3 与 #4 的顺序不可调换）：**

1. 根脚手架（最小，不扩全 monorepo）：`pnpm-workspace.yaml`（仅 `apps/*`）、根 `package.json`（private、dev/build 脚本用 pnpm filter，**不引 Turbo**，保持简单；`"packageManager": "pnpm@10.33.0"` 锁版本）、`.gitignore`（node_modules/.next/out 等）。
2. `apps/web`：手工 scaffold——Next.js（latest stable）+ React + TypeScript + Tailwind v4 + App Router + `src/` + import alias `@/*`。**不用** CNA 交互，手工写 `package.json`/`next.config.ts`/`tsconfig.json`/`postcss.config.mjs` 以保证依赖版本可控。ESLint 必须一并配置（Next 16 已移除 `next lint`）：`eslint.config.mjs` flat config + `eslint`/`eslint-config-next` devDeps + `"lint": "eslint ."` script，否则 §6 的 `pnpm lint` 验收无对象；`next.config.ts` 以 `createNextIntlPlugin('./src/i18n/request.ts')` 包裹。
3. shadcn：`pnpm dlx shadcn@latest init`（`-y -d` 非交互，RSC + cssVariables + TW v4）生成 `components.json` + `src/lib/utils.ts`（cn），再 add Phase 1 中 Home/壳所需组件：`button badge card separator tabs sheet tooltip kbd navigation-menu dropdown-menu sonner skeleton`。
4. `globals.css`（**落盘顺序在 #3 的 shadcn init 之后**——init 会改写 globals 主题变量，先写 token 必被覆盖，旧 plan §8 已记录此坑）：写入方向 B 全套 `--ow-*` token + shadcn 语义变量映射（`--primary`→datum、`--background`→field、`--radius`→0.5rem 等）+ `@theme inline` 字体与字阶 utility（display/title/body/meta，步长 ≥1.25）。
5. 字体：`src/lib/fonts.ts`，next/font/google 加载 Source Serif 4、IBM Plex Sans、IBM Plex Mono、Noto Serif SC、Noto Sans SC，CSS 变量输出，控制 CLS（`display: swap`、fallback 栈）。**前置条件：next/font/google 构建期联网下载字体，离线/受限网络 build 必败**；失败降级为 next/font/local 自托管。
6. next-intl：`src/i18n/routing.ts`（locales `['zh','en']`、defaultLocale `zh`、localePrefix `always`）、`src/i18n/request.ts`、`src/i18n/navigation.ts`（`createNavigation` 导出 locale 感知 `Link`/`useRouter`/`usePathname`，全站内部链接与 LocaleSwitcher 一律用它，禁裸 `next/link` 与整页刷新式切语言）、`middleware.ts`（补 locale 前缀；matcher 排除 `api`/`_next`/含扩展名静态文件，为 `icon.svg`、未来 `/registry/*` 留路）、`src/app/[locale]/layout.tsx`（NextIntlClientProvider + Toaster + 字体变量 + lang/dir；`generateStaticParams` 放此覆盖全部子路由，layout 与各 page 均调 `setRequestLocale`，否则 SSG 退化为动态渲染）。**`[locale]/layout.tsx` 是唯一 layout**（渲染 `<html>`，即 root layout）；**不建** `src/app/page.tsx` 与 `src/app/layout.tsx`——`/`→`/zh` 由 middleware 完成，避免根 page 缺 root layout 的构建错误。
7. messages 按**命名空间分文件**（为 Wave 2 并行消除写冲突）：
   - `src/messages/zh/shell.json` / `en/shell.json` — Plan A 建骨架（仅 `meta` 站点名/标语键），**Plan B 全权扩写**
   - `src/messages/zh/home.json` / `en/home.json` — Plan A 建空对象骨架，**Plan C 全权扩写**
   - request.ts 中 `messages: { shell: {...}, home: {...} }` 深合并，两个 plan 各写各的文件，零冲突。
8. 基线 commit 策略：Task A.0 先提交既有文档（`docs/`、`AGENTS.md`、`PRODUCT.md`、`DESIGN.md`、`.gitignore`、`openwisdom-logo-v1.svg`——存档资产，不用作品牌）作为仓库首个 commit（**先落 `.gitignore` 再 `git add`**，防孤儿 `node_modules/` 误入），后续每 task 一个 commit。

**验收 A：** `cd apps/web && pnpm build && pnpm lint` 通过；`pnpm dev` 下 `/zh` 渲染带铜色 primary 的 shadcn Button 测试页（临时页，Plan C 会替换）；字体变量挂到 html。

### 2.2 Plan B — 全局壳 + 次级路由占位页（Wave 2，与 Plan C 并行）

**问题：** Home 之外，导航链出的 `/skills` `/install` `/docs` `/contribute` `/about` 不能 404（AGENTS.md 工作协议）；Header/Footer 是全站 chrome，Home 编排依赖它。

**工作（文件均与 Plan C 不相交）：**

1. `src/components/site/SiteHeader.tsx`：Logo（文字标 + datum 十字 SVG）+ Navigation Menu（Skills / Install / Docs / Contribute）+ 右侧 LocaleSwitcher + GitHub 链接 + Install 主按钮（shadcn Button 铜色）；sticky + 发丝线底边。
2. `src/components/site/MobileNav.tsx`：Sheet 抽屉，含导航 + Install CTA。
3. `src/components/site/LocaleSwitcher.tsx`：Dropdown Menu（中 | EN），用 `src/i18n/navigation.ts` 的 `useRouter`/`usePathname` 切换保持当前路径，**不整页刷新、不重置页面重动画**（specs/04 §6 路由切换规则）。
4. `src/components/site/SiteFooter.tsx`：按 specs/03 §3 五列（Product / Resources / Community / Legal / Meta），Meta 列含语言切换与标语「分析在你的 Agent 中运行，不在本站」。**链接只允许指向已存在路由**（五个占位页 + 首页 + GitHub）；specs/03 中的 Getting started / CLI / FAQ / Changelog 等未建页面一律收敛到 `/docs` 占位或本阶段不列，否则与 §6「无死链」冲突。
5. `src/app/[locale]/layout.tsx` 接入 SiteHeader/SiteFooter。**交接规则定死：Plan A 在 layout 放内联占位壳 markup（不 import `site/*`，保证验收 A 时 build 绿）；Wave 2 起 layout.tsx 归 B 编辑**改为引用真实组件；C 全程不碰 layout。
6. 占位页 ×5：`src/app/[locale]/{skills,install,docs,contribute,about}/page.tsx`，统一 `PlaceholderSection` 组件（`src/components/site/PlaceholderSection.tsx`）：「即将推出 / Coming soon」+ 回首页链接 + GitHub 链接，发丝线卡，不是裸文本（specs/03 §4 空态要求、知识库/03「空状态有设计」）。
7. 本地化 404：`src/app/[locale]/not-found.tsx`；顺带 `src/app/icon.svg`（复用 datum 十字小 SVG 作 favicon，避免浏览器 404）。
8. `src/messages/{zh,en}/shell.json` 全量文案（导航、footer、占位页、404、switcher）。

**验收 B：** 五个占位路由 zh/en 均 200；Header/Footer 在全部页面渲染；移动端 Sheet 可用；切语言路径不丢、不整页刷新。

### 2.3 Plan C — Home 页面全部模块（Wave 2，与 Plan B 并行）

**问题：** 核心交付物。按 specs/03 §4.1 九模块 + specs/04 §6 Hero 配方 + specs/02 禁令实现。

**工作（文件均与 Plan B 不相交）：**

1. `src/components/bits/`：React Bits TS+TW 拷贝封装 + `prefers-reduced-motion` 静态 fallback：
   - `DotField.tsx`（Hero 背景，低透明，移动端静态。**注册表默认效果含 cursor bulge/glow/sparkle/wave，必须 prop 级关闭光标交互与发光/闪烁**，否则直接违反 DESIGN.md「no full-page cursor effects」与 02 §7 glow/粒子场禁令）
   - `BlurText.tsx`（Hero H1，入场一次，禁循环；registry 依赖 `motion@^12`，shadcn add 自动安装，可接受）
   - `Noise.tsx`（3–5% 透明纹理，Hero 层）
   - `LogoLoop.tsx`（Harness 条，极慢速 + hover 暂停；reduced-motion 时静态排列）
   - `README.md` 注明来源与许可（MIT + Commons Clause）
2. `src/components/install/InstallCommand.tsx`：shadcn Tabs（CLI `npx openwisdom install` | GitHub 仓库链接 | Manual zip/clone 说明）+ 复制按钮 → **Sonner** 反馈（禁 confetti），`aria-live`。
3. `src/components/home/OrientationDiagram.tsx`：首页记忆点——坐标场 + 三价值轴（宏观/锚点/元认知）+ 铜 datum 十字「you are here」；静态 SVG 优先，可选一次 400–600ms settle，禁循环，禁满屏网格墙纸。
4. Home 区块组件（`src/components/home/`）：
   - `Hero.tsx`：eyebrow 静态 + BlurText H1（三支柱主张）+ 副文 + InstallCommand + OrientationDiagram + DotField/Noise 背景
   - `HarnessRow.tsx`：Claude Code / Cursor / Codex / Gemini CLI / GitHub Copilot / Grok 等**文字标**（不盗用商标图形），LogoLoop 或等价精致排列
   - `ScenarioCards.tsx`：macro-scan / personal-anchor / metacognition-audit 三卡，**非对称布局**（禁三块相同图标砖），索引卡顶线语言，Card + Badge
   - `LayerDiagram.tsx`：scenario → reference 分层引用示意
   - `DisciplineGrid.tsx`：五学科入口 chip（心理 `#7D6B8A` / 社会 `#A67C52` / 历史 `#8B4D3B` / 政治 `#3D4F7C` / 经济 `#3F6B4F`，仅描边或 10% 底，禁整卡彩虹）
   - `InstallPaths.tsx`：CLI 主 + GitHub/手动辅三路径
   - `Provenance.tsx`：official vs community 对比（非彩虹徽章）
   - `ContributeTeaser.tsx`：fork → 模板 → PR 预告
   - `FinalCta.tsx`：底部 CTA（复制命令 + Browse Skills + GitHub）
5. `src/app/[locale]/page.tsx`（替换 Plan A 的临时测试页）：按九模块顺序组装；组内紧、组间松，标题上边距 > 下边距；SSG 依赖 Plan A #6 的 layout 级 `generateStaticParams`/`setRequestLocale`，本页保持一致调用；SEO metadata（`generateMetadata` + `getTranslations`，分 locale title/description，OG 含三支柱，根 metadata 配 `metadataBase`）。
6. `src/messages/{zh,en}/home.json` 全量双语文案：语气冷静、非炒作（禁 supercharge/unlock potential），无伪造指标、无 testimonial。
7. 区块入场 Fade（可选，占重特效名额则砍 LogoLoop 速度优先）；切语言不重跑 BlurText（key 不含 locale 或用挂载一次语义）。

**验收 C：** 九模块可逐一点名；`/{zh,en}` 首屏 DotField + BlurText 一次入场；reduced-motion 下全静态；复制命令出 Sonner；无禁令项（紫渐变/玻璃/glow/假指标/Inter/马拉松 logo 海）。

### 2.4 Plan D — QA、构建与文档同步（Wave 3，串行）

**问题：** 并行合并后需要整体验收与修正；仓库文档（AGENTS.md / DESIGN.md / 旧 plan）描述的虚假现状必须校正。

**工作：**

1. `pnpm build` + `pnpm lint` 通过；修复所有 error（warn 记录清单）。
2. 禁令扫描清单（逐条过 specs/02 §7）：色（无紫/青渐变、glow、渐变字）、布局（无卡中卡、厚侧条、满屏网格）、字体（无 Inter）、动效（无循环 hero、无 marquee 喧宾、reduced-motion 生效）、文案（无炒作词、无假数据、无半中半英）。
3. 双语核对：zh/en 键数一致；页面无硬编码字符串。
4. 响应式抽查：移动 Hero 静态背景、Sheet 导航、InstallCommand 可复制。
5. a11y 基线：焦点环可见、图标按钮 sr-only、语义标题层级、对比度（muted 字在 field 上可读）。
6. 文档同步：
   - `AGENTS.md` L2 Web 表改为真实路径（next-intl、messages 分文件结构、实际组件清单）；「Implemented today」段更新。
   - `DESIGN.md` §Implementation 表校正为实际文件。
   - 旧 plan `2026-07-30-home-spec-alignment.md` 头部加「状态：未落地，已被 `2026-07-30-home-page-spec.md` 取代」批注（不删历史）。
   - `docs/知识库/02-产品决策记录.md` 追加修订条目：默认 locale=zh、localePrefix=always（本 spec 锁定，了结 specs/01 §12 与 specs/03 §9 的开放拍板项）。
7. 勾选本 spec §6 验收清单。

**验收 D：** build/lint 绿；九模块 checklist 全绿；文档与代码一致。

## 3. 文件变更清单

| 文件 | 变更 | Plan |
|------|------|------|
| `docs/`、`AGENTS.md`、`PRODUCT.md`、`DESIGN.md`、`.gitignore`、`openwisdom-logo-v1.svg` | 基线 commit | A |
| `pnpm-workspace.yaml`、根 `package.json` | 新建 | A |
| `apps/web/package.json`、`next.config.ts`、`tsconfig.json`、`postcss.config.mjs`、`eslint.config.mjs` 等 | 新建 | A |
| `apps/web/components.json`、`src/lib/utils.ts`、`src/components/ui/*` | 新建（shadcn） | A |
| `apps/web/src/app/globals.css` | 新建（tokens，shadcn init 之后落盘） | A |
| `apps/web/src/lib/fonts.ts` | 新建 | A |
| `apps/web/src/i18n/{routing,request,navigation}.ts`、`apps/web/src/middleware.ts` | 新建 | A |
| `apps/web/src/app/[locale]/layout.tsx`（唯一 layout，渲染 `<html>` 即 root layout；**不建** `src/app/page.tsx` 与 `src/app/layout.tsx`——`/`→`/zh` 由 middleware 完成，避免根 page 缺 root layout 的构建错误） | 新建 | A（Wave 2 起归 B 编辑） |
| `apps/web/src/messages/{zh,en}/shell.json` | 骨架→全量 | A 建 / **B 写** |
| `apps/web/src/messages/{zh,en}/home.json` | 骨架→全量 | A 建 / **C 写** |
| `apps/web/src/components/site/{SiteHeader,MobileNav,LocaleSwitcher,SiteFooter,PlaceholderSection}.tsx` | 新建 | B |
| `apps/web/src/app/[locale]/{skills,install,docs,contribute,about}/page.tsx`、`not-found.tsx`、`src/app/icon.svg` | 新建 | B |
| `apps/web/src/components/bits/*` | 新建 | C |
| `apps/web/src/components/install/InstallCommand.tsx` | 新建 | C |
| `apps/web/src/components/home/*`（10 个区块组件） | 新建 | C |
| `apps/web/src/app/[locale]/page.tsx` | A 建临时测试页 → C 替换为九模块编排 | A / C |
| `AGENTS.md`、`DESIGN.md`、旧 plan 批注、`docs/知识库/02` 修订条目 | 校正 | D |

**写冲突结论：** B 与 C 文件集不相交（messages 已按命名空间拆文件）；B/C 都依赖 A 的 token/shadcn/i18n 配置，故 A 单独先行；D 读全部、串行收尾。

## 4. 架构图

```text
Wave 1 (串行)
  Plan A ──► apps/web 可构建底座
             (tokens + shadcn + next-intl + fonts + layout 内联占位壳)

Wave 2 (并行, 文件不相交)
  ┌─────────────────────────────┐   ┌──────────────────────────────┐
  │ Plan B                      │   │ Plan C                       │
  │ site/* 壳组件               │   │ bits/* (DotField/BlurText/   │
  │ layout 接入真实壳           │   │   Noise/LogoLoop)            │
  │ 5 个占位路由 + 404 + icon   │   │ install/InstallCommand       │
  │ messages/*/shell.json       │   │ home/* 九模块 + page.tsx     │
  └──────────────┬──────────────┘   │ messages/*/home.json         │
                 │                  └──────────────┬───────────────┘
                 ▼ 合并（无冲突）                    ▼
Wave 3 (串行)
  Plan D ──► build/lint 绿 · 禁令扫描 · 双语核对 · 文档同步

用户路径:
  / → middleware → /zh (默认)
  /{locale} ──► SiteHeader/Footer (B) ──► Home 九模块 (C)
  /{locale}/{skills,install,docs,contribute,about} ──► Placeholder (B)
```

## 5. 实施顺序

| Wave | Plan | 内容 | 依赖 | 估时 |
|------|------|------|------|------|
| 1 | A | 底座：monorepo + Next + shadcn + tokens + i18n | 无 | ~1d |
| 2 | B | 壳 + 占位页 + shell 文案 | A | ~1d |
| 2 | C | Home 九模块 + bits + home 文案 | A | ~2d（oracle 建议留 buffer） |
| 3 | D | QA + 文档同步 | B+C | ~0.5d |

- Wave 2 两个 fixer 并行（B、C 文件集不相交）。
- 每 Plan 内按 task 顺序执行，每 task 一个 commit（commit message：`feat(web): ...` / `chore: ...` / `docs: ...`）。
- 全部完成后由编排者验收 §6，再向用户确认 push。

## 6. 验收标准

- [ ] `cd apps/web && pnpm build && pnpm lint` 通过
- [ ] `/zh` 重定向自 `/`；`/zh`、`/en` 首页均完整渲染九模块
- [ ] 九模块 checklist 对照 specs/03 §4.1 逐条可指认
- [ ] Hero：DotField 背景 + BlurText H1（一次）+ InstallCommand（Tabs CLI|GitHub|Manual）+ OrientationDiagram
- [ ] 复制命令触发 Sonner；`aria-live` 存在
- [ ] Harness 条为 LogoLoop 或等价完成度，非廉价灰字一排
- [ ] 学科 chip 五色符合 specs/02，非整卡彩虹
- [ ] `prefers-reduced-motion`：装饰动效全关
- [ ] 五个占位路由 + 本地化 404 均 zh/en 可访问，无死链（footer 链接全部指向已存在路由）
- [ ] 切语言保持路径、不整页刷新、不重跑 Hero 重动画
- [ ] 禁令扫描（specs/02 §7）全过：无紫/青渐变、玻璃、glow、渐变字、卡中卡、满屏网格、Inter、假指标、炒作文案、半中半英
- [ ] messages zh/en 键对齐；无硬编码 UI 字符串
- [ ] AGENTS.md / DESIGN.md 与实现一致；旧 plan 加取代批注；知识库/02 追加 locale 修订条目
- [ ] commit 历史：每 task 一个 commit，message 规范

## 7. 不在范围

- CLI 包、`packages/*`、`skills/` 内容树、catalog 管道、遥测 API（specs/06）
- Skills 目录/详情真实实现（占位页不含筛选/搜索）
- Docs 引擎（Fumadocs）、真实文档内容
- dark 主题切换（仅 token 结构预留）
- `openwisdom-logo-v1.svg` 的品牌定稿与使用
- README、LICENSE、CI workflows、Vercel 部署配置
- sitemap.xml / robots.txt / OG 图片（v1 价值低；metadata 仅做分 locale title/description 与 OG 文案）
- 根目录孤儿 `node_modules/`（含 motion）的清理——留待用户决定
- Turbo / 根级任务编排（保持最小脚手架）

## 8. 版本变更

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-30 | 初版，基于 greenfield 现状核实 |
| v1.1 | 2026-07-30 | oracle 审查（REVISE）后修订：修 P0×2（删根 page.tsx 保唯一 root layout；补 ESLint 配置），吸收 P1×6（navigation.ts、layout 级 generateStaticParams/setRequestLocale、shadcn init 先于 globals、DotField 关交互/glow、footer 无死链约束、layout A→B 交接定死），及 P2 若干（icon.svg、基线 commit 含 logo、知识库/02 修订条目、字体联网前置、LogoLoop 裁判依据、packageManager 锁版本、generateMetadata、C 估时 2d、sitemap/robots/OG 图列入范围外） |
