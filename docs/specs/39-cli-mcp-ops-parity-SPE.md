# SPE 39 — CLI / MCP InstallOps 表面 parity

> **状态：** IMPLEMENTED（主仓合并 · 2026-08-04）  
> **日期：** 2026-08-04  
> **来源：** architecture review · candidate #5  
> **铁律：** 仍为 package manager only；**禁止** run/analyze/recommend/LLM  

---

## 0. 一句话

CLI 与 MCP 作为 **两个 adapter** 映射到 **同一 core Install/Catalog ops 表面**：bundle、registry、noRemote、refresh 在 MCP 可表达；CLI 内重复的 `collectSkillIds` 删除一份。

---

## 1. 问题

| 能力 | CLI | MCP |
|------|-----|-----|
| `--bundle` / bundle install | ✅ | ❌ |
| `--registry` / `OPENWISDOM_REGISTRY` | ✅ | 仅 env 隐式 |
| `--no-remote` | ✅ | 无显式 tool 字段 |
| `update --refresh-only` | ✅ | search `refresh`；update 不完整 |
| `collectSkillIds` | install + update 各一份 | — |

Core `runInstall` **已支持** `bundle` / `registry` / `noRemote`；MCP 适配层未暴露 → shallow adapter 泄漏产品能力差。

---

## 2. 目标 / 非目标

### 2.1 目标

| # | 目标 |
|---|------|
| G1 | MCP `openwisdom_install` 增加可选：`bundle?: string`、`registry?: string`、`noRemote?: boolean`（与 core 对齐） |
| G2 | MCP `openwisdom_update`：支持 `refreshOnly?: boolean`（仅 ensureRemoteCatalog）、`registry`、`noRemote`；技能更新路径仍走 `runInstall` |
| G3 | MCP `openwisdom_search` / `list` 已有 refresh 则保持；文档字符串写明 registry env |
| G4 | CLI：`collectSkillIds` **一处** 工具函数，install/update 共用 |
| G5 | 测试：MCP install 带 `bundle`（mock/offline catalog 含 orientation-handoff）；CLI 无行为回归 |
| G6 | README 一行：MCP 与 CLI 能力表更新（packages/mcp/README.md） |

### 2.2 非目标

| # | 非目标 |
|---|--------|
| N1 | MCP 交互式选 provider（保持显式 providers 数组） |
| N2 | 新 MCP tool 名称（扩展现有 input schema） |
| N3 | 改 telemetry 语义 |
| N4 | SPE 35 重构（可依赖现有 `runInstall` 选项） |

---

## 3. MCP input 增补（权威）

### openwisdom_install

```text
skills: string[]          # 可与 bundle 二选一或并用（与 CLI 一致）
bundle?: string
providers: string[]       # 仍必填（非 TTY）
scope?: project|global
cwd?: string
force?: boolean
dryRun?: boolean
noDeps?: boolean
noTelemetry?: boolean
registry?: string
noRemote?: boolean
```

校验：`skills` 空且无 `bundle` → 错误（同 core UsageError）。

### openwisdom_update

```text
# 现有字段保留
refreshOnly?: boolean     # true → ensureRemoteCatalog only，不写 skills
registry?: string
noRemote?: boolean
```

---

## 4. 文件范围

| 包 | 路径 |
|----|------|
| mcp | `packages/mcp/src/tools/install.ts`、`update.ts`、`search.ts`（若需）、`server.ts` schema、`*.test.ts`、README |
| cli | `packages/cli/src/commands/install.ts`、`update.ts`；可选 `packages/cli/src/lib/args.ts` |
| 不改 | `apps/web`；core 仅当缺字段时补类型（预期已有） |

---

## 5. 验收

- [ ] MCP install schema 含 bundle/registry/noRemote  
- [ ] MCP update schema 含 refreshOnly  
- [ ] `pnpm --filter openwisdom-mcp test` 绿  
- [ ] `pnpm --filter openwisdom test` 绿  
- [ ] CLI 无重复 `collectSkillIds` 函数体  

---

## 6. 完成定义

两 adapter 对 core ops 的 **可表达集合** 对齐（TTY 差异除外）；无第三套 install 语义。
