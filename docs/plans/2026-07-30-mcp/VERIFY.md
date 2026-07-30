# MCP dual-surface — VERIFY

> **日期：** 2026-07-30  
> **规格：** Spec 22 §10 · Plans 01–03

## Spec 22 验收

| # | 项 | 结果 |
|---|----|------|
| 1 | `packages/core` 被 cli 与 mcp 共同依赖 | **PASS** — both workspace deps |
| 2 | `node packages/mcp/dist/mcp.js` / bin 可启动 | **PASS** — build `dist/mcp.js` |
| 3 | 五工具可用；install 写出 SKILL.md | **PASS** — tools registered; mcp install tests 6/6 |
| 4 | stdout 无业务 banner | **PASS** — entry only connects stdio |
| 5 | tests green | **PASS** — core 19 · cli 10 · mcp 6 |
| 6 | Specs 索引 + AGENTS 路由 | **PASS** — 22–25 in index; AGENTS L1/L2 |
| 7 | 无分析类 tool | **PASS** — only search/list/install/update/detect |

## 命令与结果（本机）

```text
pnpm --filter @openwisdom/core test     → 19 passed
pnpm --filter openwisdom test           → 10 passed
pnpm --filter openwisdom-mcp test       → 6 passed
pnpm --filter @openwisdom/core build    → OK
pnpm --filter openwisdom build          → OK
pnpm --filter openwisdom-mcp build      → OK
pnpm catalog:build                      → writes cli + core + web registry
```

## 产物路径

| 路径 | 状态 |
|------|------|
| `packages/core/` | 存在 |
| `packages/mcp/dist/mcp.js` | 存在 |
| `packages/core/catalog-snapshot/` | dual-write |
| `packages/cli/catalog-snapshot/` | dual-write |
| `docs/specs/22`–`25` | Ready / 归档 |
| `packages/mcp/README.md` | 客户端配置 |

## 本地试用

```bash
# MCP stdio server
pnpm mcp
# or
node packages/mcp/dist/mcp.js

# Claude Code
claude mcp add --transport stdio openwisdom -- node E:/学习软件/Openwisdom/packages/mcp/dist/mcp.js
# set OPENWISDOM_SKILLS_ROOT to monorepo skills/ for install
```

## 残留（非阻塞）

1. 远程 catalog refresh / GitHub payload fetch 仍与 CLI 同缺口（dev 靠 `OPENWISDOM_SKILLS_ROOT` / monorepo）。  
2. Web Install 第三 tab「MCP」为 P1，未做。  
3. npm 公开发布（双 bin 进 `openwisdom` tarball）仍 private monorepo。  
4. SDK 为 `@modelcontextprotocol/server` v2 + zod 4（仅 mcp 包）；core/schema 仍可 zod 3。  
