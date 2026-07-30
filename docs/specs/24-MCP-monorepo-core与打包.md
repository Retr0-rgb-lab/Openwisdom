# Spec 24 — MCP monorepo · core 抽取 · 打包

> **状态：** Ready  
> **日期：** 2026-07-30  
> **上级：** [22-MCP总控-SPE](./22-MCP总控-SPE.md)  
> **相关：** [20 CLI monorepo/catalog](./20-CLI-monorepo-catalog-发布.md) · [23 Tools](./23-MCP-Tools与协议.md)

---

## 1. 目标

1. 抽出 **`@openwisdom/core`**：无 TTY、无 citty、无 `process.exit` 的共享业务 API。  
2. **`packages/cli`** 变薄：commands 只做 argv / clack → 调 core → 打印。  
3. **`packages/mcp`**：McpServer 适配层 → 调 core → tool 结果。  
4. 发布形态：v1 **单公开包 `openwisdom` 双 bin**，或 mcp 独立 private 包由 openwisdom re-export；monorepo 内以 workspace 为准。

---

## 2. 目标包图

```text
packages/
  schema/       # 不变
  providers/    # 不变
  catalog/      # 构建期不变；产物继续写入 cli snapshot + web registry
  core/         # NEW @openwisdom/core
  cli/          # openwisdom bin（human）
  mcp/          # openwisdom-mcp bin（agent）
```

根 `pnpm-workspace.yaml` 已含 `packages/*`，无需改 glob。

---

## 3. `@openwisdom/core` API（最小稳定面）

### 3.1 模块建议

| 源（今日 CLI） | 迁入 core |
|----------------|-----------|
| `install-core.ts` | `install.ts` — `runInstall`, `listInstalled`, `resolveProviderIds`, `defaultProviderIds`, errors |
| `catalog.ts` | `catalog.ts` — `loadCatalog`, `searchCatalog`, `scanSkillsToCatalog` |
| `copy-skill.ts` | `copy-skill.ts` |
| `skills-root.ts` | `skills-root.ts` |
| `frontmatter.ts` | `frontmatter.ts` |
| `paths.ts` | `paths.ts`（packageRoot 可注入） |
| `telemetry.ts` | `telemetry.ts` — source / version 可注入 |
| `version.ts` | 可选；core 版本独立 `CORE_VERSION` |

**不迁入：** `cli.ts`, `commands/*`, citty, clack。

### 3.2 关键签名调整（相对现状）

| 项 | 要求 |
|----|------|
| `isTty` | 经 `InstallOptions` 注入；**库默认 `false`** |
| 日志 | `onLog?: (level, msg) => void` 或收集 `messages[]`；默认静默或 stderr-only 由调用方决定。**禁止** core 内无条件 `console.log` 污染 MCP stdout |
| 遥测 | `source: "cli" \| "mcp"`；`clientVersion` 可注入 |
| catalog 根 | `packageRoot` / `catalogPath` / `skillsRoot` 可注入；snapshot 随 **core 或 cli 包** 携带并在 load 时解析 |
| `process.exit` | **禁止** |

### 3.3 导出（package.json）

```json
{
  "name": "@openwisdom/core",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  }
}
```

依赖：`@openwisdom/schema`, `@openwisdom/providers`（workspace）。  
不依赖 MCP SDK、不依赖 citty/clack。

### 3.4 catalog snapshot 归属

**决策：**  

- 构建仍由 `@openwisdom/catalog` 写入 `packages/cli/catalog-snapshot/` **且** 复制到 `packages/core/catalog-snapshot/`（或单一权威路径由 core `loadCatalog` 解析）。  
- 避免 MCP 运行时找不到 snapshot：core 的 `getPackageRoot` 必须以 **core 包自身** 或注入路径为准，不能写死 `name === "openwisdom"` 仅适配 CLI。

---

## 4. `packages/mcp` 结构

```text
packages/mcp/
  package.json          # name: openwisdom-mcp 或 private @openwisdom/mcp
  tsup.config.ts
  src/
    mcp.ts              # entry: connect StdioServerTransport
    server.ts           # createServer() + register tools
    tools/
      search.ts
      list.ts
      install.ts
      update.ts
      detect-providers.ts
    lib/
      result.ts         # toToolResult / jsonContent
      env.ts            # cwd 解析
  README.md             # 客户端配置
```

### 4.1 依赖

| 依赖 | 用途 |
|------|------|
| `@modelcontextprotocol/server` | v2 server + stdio |
| `zod` | 工具 inputSchema（允许与 monorepo schema 的 zod3 并存于 mcp 包） |
| `@openwisdom/core` | 业务 |
| `@openwisdom/providers` / `schema` | 类型与枚举（可经 core 再导出） |

若 v2 peer `zod@^4` 与 workspace 冲突：  
**Plan B** — 改用 `@modelcontextprotocol/sdk@^1.30` + 现有 zod3，并在 README 注明。

### 4.2 构建

```ts
// tsup: entry src/mcp.ts → dist/mcp.js, banner shebang, bundle core/providers/schema
```

`bin`: `{ "openwisdom-mcp": "./dist/mcp.js" }`

### 4.3 与 `openwisdom` 包关系（发布）

**v1 推荐：**

1. monorepo 保留 `packages/mcp` 独立包便于开发。  
2. 公开发布时二选一（实现选一种写清）：  
   - **A.** `packages/cli` 增加 second entry / 复制 mcp dist 为 `openwisdom-mcp` bin（单 npm 包）；或  
   - **B.** 发布两个 npm 包：`openwisdom` + `openwisdom-mcp`（都 private=false 时）。  

当前 monorepo 均为 `private: true` 时，先保证 **本地 bin 与 `pnpm mcp` script** 可用。

可选：`packages/cli` 增加 subcommand `mcp` 转发到 mcp entry（UX 糖）。

---

## 5. CLI 改造要点

1. `package.json` 依赖 `@openwisdom/core`。  
2. `commands/*` 改为 import from `@openwisdom/core`。  
3. 保留 clack 交互；将 `interactiveProviders` 传入 `runInstall`。  
4. 遥测 `source: "cli"`。  
5. 现有 vitest 路径更新 import；行为不回归。  
6. tsup `noExternal` 增加 `@openwisdom/core`。

---

## 6. 根 scripts

```json
{
  "build": "… && pnpm --filter @openwisdom/core build && pnpm --filter openwisdom build && pnpm --filter openwisdom-mcp build && …",
  "test": "… && pnpm --filter @openwisdom/core test && pnpm --filter openwisdom-mcp test",
  "mcp": "pnpm --filter openwisdom-mcp exec node ./dist/mcp.js"
}
```

过滤名以实际 `package.json` `name` 为准。

---

## 7. 测试策略

| 层 | 测什么 |
|----|--------|
| core | runInstall temp dir；conflict/force/dryRun；searchCatalog；telemetry payload source |
| cli | 现有 install.test / telemetry.test 仍过（可薄） |
| mcp | tool handler 单测（直接调 register 的 fn 或纯 wrapper）；可选 spawn stdio 烟雾 |

Windows：路径与 `path.join` fixture 必须覆盖。

---

## 8. 文档与产品面

| 文件 | 变更 |
|------|------|
| `docs/specs/00-索引.md` | 增加 22–25 行与 MCP 路由 |
| `AGENTS.md` | L1 路由：MCP → Specs 22–24；L2 CLI 节并列 MCP |
| `packages/mcp/README.md` | 配置样例 |
| Web Install（P1） | 可选第三 tab「MCP」复制 JSON |

---

## 9. 实现顺序（可并行）

| Plan | Owner 边界 | 依赖 |
|------|------------|------|
| **01-core** | 新建 core；迁文件；CLI 改 import；core 测试 | 无 |
| **02-mcp** | 新建 mcp 包与 tools；依赖 core API（可先按本 Spec 签名 mock 再接真） | 理想：01 合并后；可用 worktree |
| **03-wire** | 根 package scripts、双 bin 策略、catalog snapshot 双写、构建顺序 | 01+02 |
| **04-docs** | 索引、AGENTS、mcp README、计划 VERIFY | 可与 02 并行写文档 |

---

## 10. 验收

- [ ] `@openwisdom/core` 无 `@clack` / `citty` / MCP SDK 依赖  
- [ ] CLI `pnpm --filter openwisdom test` 通过  
- [ ] MCP 进程启动后不向 stdout 打印 banner  
- [ ] `pnpm build` 全绿  
- [ ] 从 monorepo 能 `node packages/mcp/dist/mcp.js` 被客户端连接（或等价）  
