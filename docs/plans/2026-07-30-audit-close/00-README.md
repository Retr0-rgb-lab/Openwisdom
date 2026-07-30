# Plan — 审计闭合（Audit Close）2026-07-30

> **权威：** [`docs/specs/26-全面功能审计-2026-07-30.md`](../../specs/26-全面功能审计-2026-07-30.md)  
> **目标：** 闭合审计 P0/P1：单真相与诚实 UI、官方 reference 种子、CLI/MCP 载荷与 snapshot、Install/Docs/Contribute 最小产品面、lint。  
> **非目标（本批不做）：** npm 公开发布、完整 Spec 06 stats 存储选型、远程 catalog HTTP 刷新、付费/账号。

## Plans（并行图）

| # | 文件 | Lane | 独占路径 | 依赖 |
|---|------|------|----------|------|
| 01 | [01-web-catalog-honesty.md](./01-web-catalog-honesty.md) | Web catalog | `apps/web/src/data/catalog/*` · `components/skills/*` · `messages/*/skills.json` | — |
| 02 | [02-references-seed.md](./02-references-seed.md) | Content | `skills/official/references/**` · 官方场景 frontmatter `references` | — |
| 03 | [03-cli-mcp-payload.md](./03-cli-mcp-payload.md) | Core/CLI/MCP | `packages/core` · `packages/cli` · `packages/mcp` · `packages/catalog` write targets | — |
| 04 | [04-install-docs-pages.md](./04-install-docs-pages.md) | Web IA | `app/[locale]/{install,docs,contribute}/**` · `components/install/*` · `messages/*/shell.json` · 可选 `home.json` | — |
| 05 | [05-web-lint-search.md](./05-web-lint-search.md) | Web lint | **仅** `apps/web/src/components/site/GlobalSearch.tsx` | — |

```text
01 ──┐
02 ──┼── 并行（路径不重叠）──► 各 lane 自测 ──► 主会话 06-verify（串行）
03 ──┤
04 ──┤
05 ──┘
```

**规则：**

1. 子 agent **只改本 lane 独占路径**；禁止改其他 plan 的文件。  
2. **不 commit / 不 force-push / 不 npm publish**，除非用户另嘱。  
3. 完成后在 `docs/plans/2026-07-30-audit-close/reports/` 写 `0N-report.md`。  
4. 02 完成后须本地 `pnpm catalog:build`（写 registry/snapshots——属 02 验收；01 不依赖新 hash 也能先合种子逻辑）。  
5. 硬边界：无 LLM、无 `openwisdom run`、热度不写 SKILL.md。

## 成功标准（整批）

| # | 标准 |
|---|------|
| S1 | Web catalog 能区分 **installable（机器目录）** vs **discovery（curated）**；诚实横幅可见 |
| S2 | `source`/provenance 筛选不再把 curated 全部伪装成「可贡献 community 空态」 |
| S3 | ≥5 官方 reference SKILL.md（五学科各 ≥1）；`pnpm catalog:build` skillCount ≥ 8 |
| S4 | 仓外/无 monorepo skills 时，CLI/MCP 仍能从 **payload 缓存或 GitHub** 装官方 skill（或明确可测的 fallback 实现） |
| S5 | MCP package 能解析到 catalog-snapshot（offline search） |
| S6 | `/install`、`/docs`、`/contribute` 为实质页面（非 redirect-only / 非空 Placeholder） |
| S7 | `pnpm --filter web lint` 通过 |
| S8 | `pnpm test` 与 `pnpm --filter web build` 不回归 |

## 状态

| Plan | 状态 | Report |
|------|------|--------|
| 01 web catalog honesty | **Done** | [reports/01-report.md](./reports/01-report.md) |
| 02 references seed | **Done** | [reports/02-report.md](./reports/02-report.md) |
| 03 cli/mcp payload | **Done** | [reports/03-report.md](./reports/03-report.md) |
| 04 install/docs/contribute | **Done** | [reports/04-report.md](./reports/04-report.md) |
| 05 GlobalSearch lint | **Done** | [reports/05-report.md](./reports/05-report.md) |
| 06 VERIFY | **Done** | [reports/06-verify-report.md](./reports/06-verify-report.md) |

**Wave result (2026-07-30):** S1–S8 **PASS** · catalog skillCount **8** · `pnpm test` / web lint / web build green.
