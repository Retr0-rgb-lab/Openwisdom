# Plan 04 — Install hub · Docs · Contribute 最小产品面

**Lane:** Web IA · **Specs:** 03 · 10（Home 不改 beat 数）· PRODUCT 安装/贡献路径  
**独占：**  
- `apps/web/src/app/[locale]/install/**`  
- `apps/web/src/app/[locale]/docs/**`  
- `apps/web/src/app/[locale]/contribute/**`  
- `apps/web/src/components/install/**`（可复用 InstallCommand / InstallPaths / commands.ts）  
- `apps/web/src/messages/{zh,en}/shell.json`（仅 placeholder / nav / 新 docs·install·contribute 文案键）  
- 如需独立 namespace：新建 `messages/{zh,en}/pages.json` 并在 `i18n/request.ts` 注册（**允许**改 `request.ts`）  

**禁止改：** `components/skills/**` · `data/catalog/**` · `GlobalSearch.tsx` · Home 6-beat 组成（`page.tsx` 的 beat 列表）· packages/* · skills/*

## Goal

1. `/install` **不再** redirect-only → 实质 Install hub。  
2. `/docs` 实质入门页（非空洞 PlaceholderSection）。  
3. `/contribute` 实质贡献指南（链到 GitHub PR 路径）。  

## Tasks

### T1 — Install hub

- [ ] 重写 `install/page.tsx`：Server Component + `setRequestLocale` + metadata。  
- [ ] 内容模块（可用现有组件）：  
  - H1 + lede（i18n）  
  - `InstallCommand`（CLI | MCP）  
  - 若存在 `InstallPaths`：挂载为路径教学（CLI / MCP / GitHub / Manual）  
  - 链到 `/skills` 与 GitHub monorepo  
  - **诚实**：CLI/MCP 尚未 npm 发布时保留 status note（与 Home 一致）  
- [ ] monorepo 开发者提示可选：`pnpm cli` / `OPENWISDOM_SKILLS_ROOT`（帮助审计闭合后的真实可用路径）

### T2 — Docs home

- [ ] 重写 `docs/page.tsx`：入门结构  
  - 产品是什么（3 条）  
  - 快速开始：浏览 Skills → 复制 install → 在 Agent 中调用  
  - 链：`/skills` · `/install` · `/contribute` · GitHub  
  - FAQ 最小 3 条：是否托管分析？热度是否强制？如何关闭遥测？  
- [ ] 无假指标、无「AI 聊天」承诺  

### T3 — Contribute

- [ ] 重写 `contribute/page.tsx`：  
  - official vs community  
  - PR 到 `skills/community/`  
  - 需 `SKILL.md` + frontmatter 要点（链 repo 或 docs）  
  - 外链：GitHub issues / fork  

### T4 — i18n + chrome

- [ ] zh/en 键完整对称  
- [ ] 确认 nav 已有 Docs / Contribute；Install 若未在 nav，**页脚或 install 自洽即可**（可不改 SiteHeader 若属 site/ — **若必须加 nav 项**，仅改 `components/site/constants.ts` + shell 文案，report 注明）  
- [ ] 删除或改写过时 `shell.placeholder.install` 依赖  

### T5 — 验收

- [ ] `pnpm --filter web build`  
- [ ] 访问路径不再 redirect 丢内容：`/zh/install` `/zh/docs` `/zh/contribute`  
- [ ] 写 `reports/04-report.md`

## 验收

- [ ] 三页均有真实标题+段落+内链  
- [ ] 无 PlaceholderSection 作为唯一内容  
- [ ] zh/en 键对称  
