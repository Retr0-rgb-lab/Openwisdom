# Plan: Openwisdom MCP（双表面）

> **日期：** 2026-07-30  
> **权威规格：** Specs **22** · **23** · **24**（调研 **25**）  
> **目标：** CLI 已有 → 抽 core → 落地 MCP stdio server，产品具备 **CLI + MCP** 两种用法。

## Plans

| # | 文件 | 内容 | 并行 |
|---|------|------|------|
| 01 | [01-core.md](./01-core.md) | 新建 `@openwisdom/core`，CLI 改依赖 | 先跑 / 与 02 worktree |
| 02 | [02-mcp.md](./02-mcp.md) | `packages/mcp` + tools | 依赖 core API |
| 03 | [03-wire-docs.md](./03-wire-docs.md) | 根 scripts、AGENTS、索引、README、VERIFY | 可后置或与 02 后半并行 |

## 成功标准

- `pnpm --filter @openwisdom/core test` 通过  
- CLI 现有测试不回归  
- `openwisdom-mcp` / `node packages/mcp/dist/mcp.js` 可启动  
- 五工具可用；install 能写入 temp harness 目录  
- Specs 索引与 AGENTS 已指到 22–24  

## 非目标

- 远程 HTTP MCP、分析 tools、npm 公开发布流程完善  
