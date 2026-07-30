# Spec 25 — MCP 调研纪要

> **状态：** 归档  
> **日期：** 2026-07-30  
> **上级：** [22-MCP总控-SPE](./22-MCP总控-SPE.md)  
> **用途：** 实现与评审时溯源；执行以 **22–24** 为准

---

## 1. 调研问题

1. 如何在 TypeScript/Node 实现与 CLI 对等的 MCP 技能包管理表面？  
2. 现有 `packages/cli` 哪些可共享、哪些必须剥离？  
3. 客户端如何配置（Claude Code / Cursor / Desktop）？  
4. 写盘类 tool 的安全与 stdio 约束？

---

## 2. 外部结论摘要

### 2.1 MCP TypeScript SDK（2026）

| 线 | 包名 | 笔记 |
|----|------|------|
| **v2** | `@modelcontextprotocol/server`（npm **2.0.0**） | `McpServer` + `StdioServerTransport`；peer `zod@^4`、`@modelcontextprotocol/core` |
| **v1** | `@modelcontextprotocol/sdk`（**1.30.0**） | 教程仍多；与 zod3 更易共存 |

**决策：** 优先 v2；zod 冲突则回退 v1 sdk（Spec 24 Plan B）。

### 2.2 Transport

- **stdio**：本地工具默认；适合写用户磁盘。  
- Streamable HTTP：远程/多租户；**v1 不做**。  
- SSE：新项目避免。

**stdio 铁律：** 除协议外禁止写 stdout（`console.log` 会破坏 JSON-RPC）。

### 2.3 业界平行：Skilldex

- CLI + MCP 共享 `core/`；MCP 非交互、结构化 JSON。  
- 工具名前缀化；install 与 list/search 分工具。  
- 哲学：**two interfaces, one core** → 直接采纳为 Openwisdom 架构原则。

### 2.4 客户端配置

| 客户端 | 配置 |
|--------|------|
| Claude Code | `claude mcp add --transport stdio … -- npx -y …`；项目 `.mcp.json` |
| Cursor | `.cursor/mcp.json` 或 `~/.cursor/mcp.json` |
| Claude Desktop | `claude_desktop_config.json` → `mcpServers` |

通用：`npx -y <bin>`；本地 dev 用绝对路径 `node …/dist/mcp.js`。  
Windows 注意 `npx` / `cmd /c`。  
Claude Code 可提供 `CLAUDE_PROJECT_DIR`。

### 2.5 安全

- 输入校验 + allowlist 写路径（对接 Spec 19）。  
- 不提供通用 FS tool。  
- `force` / `dryRun` 显式；annotations 仅提示非边界。  
- 不在 install 执行 skill 脚本。

---

## 3. 仓内审计摘要（CLI → core）

### 3.1 可直接共享

- `@openwisdom/providers` 全量  
- `@openwisdom/schema` 全量  
- `copy-skill.ts`, `skills-root.ts`, `frontmatter.ts`  
- `searchCatalog` 纯函数  
- 遥测 payload **构建**（需参数化 source）

### 3.2 可共享但需清洁

- `runInstall` / `listInstalled` / `loadCatalog`：去掉硬编码 `process.stdin.isTTY`、减少裸 `console.log`、注入 packageRoot/snapshot  
- `reportInstallSuccess`：`source: "cli" | "mcp"`

### 3.3 CLI only

- `cli.ts`, `commands/*`, citty, `@clack/prompts`, `process.exit`, TSV 人读表

### 3.4 catalog 包

- **构建期**扫描；运行时读 **snapshot JSON**（今日在 `packages/cli/src/catalog.ts`）

### 3.5 现状可 smoke

显式 `providers` + `yes: true` 即可调用 `runInstall` 绕过 clack；仍不适合作 MCP 长期依赖（stdout/TTY/telemetry source）。

---

## 4. 映射表（固化进 Spec 23）

| CLI | Core | MCP tool |
|-----|------|----------|
| search | loadCatalog + searchCatalog | `openwisdom_search` |
| list | loadCatalog / listInstalled | `openwisdom_list` |
| install | runInstall | `openwisdom_install` |
| update | runInstall (+ listInstalled) | `openwisdom_update` |
| （无） | detectProviders | `openwisdom_detect_providers` |

---

## 5. 风险与缓解

| 风险 | 缓解 |
|------|------|
| CLI/MCP 语义分叉 | 强制 core 单实现；禁止 mcp 内复制 install |
| stdout 污染 | core 默认可静默；mcp 零 console.log |
| zod 主版本 | mcp 独立依赖或回退 sdk v1 |
| snapshot 路径 | core 自带/注入 catalog-snapshot |
| 无 skills root 时 install 失败 | 与 CLI 同；文档强调 OPENWISDOM_SKILLS_ROOT / 后续 GitHub fetch |

---

## 6. 参考链接（调研时点）

- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk  
- Claude Code MCP: https://code.claude.com/docs/en/mcp  
- 仓内：Specs 17–20 · `packages/cli` · `packages/providers`

---

## 7. 结论一句话

**Openwisdom MCP = 本地 stdio 包管理工具面；抽 `packages/core`，CLI 与 MCP 双适配；工具集对齐 search/list/install/update + detect；不引入分析与远程多租户。**  
