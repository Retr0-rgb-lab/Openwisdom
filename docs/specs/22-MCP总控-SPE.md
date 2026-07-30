# Spec 22 — Openwisdom MCP 总控（Spec-Plan-Execute）

> **状态：** Ready  
> **日期：** 2026-07-30  
> **模式：** 技能包管理器 only · 与 CLI **双表面、单核心**  
> **上游：** `PRODUCT.md` · Specs **17–20** · `06-热度与遥测`  
> **子规格：** [23 Tools 与协议](./23-MCP-Tools与协议.md) · [24 monorepo/core/打包](./24-MCP-monorepo-core与打包.md) · [25 调研纪要](./25-MCP调研纪要.md)

---

## 1. 一句话

Openwisdom MCP 是 **本地 stdio 技能包管理器**：把 `search` / `list` / `install` / `update`（及只读探测）暴露为 coding agent 可调用的 **MCP Tools**。  
与 CLI **共享同一套 install/catalog 语义**；**不**调用模型，**不**跑分析，**不是**托管会话产品。

**产品双路径：**

| 路径 | 面向 | 入口 |
|------|------|------|
| **CLI** | 人类终端 | `npx openwisdom install …` |
| **MCP** | Agent 会话内工具调用 | `npx openwisdom-mcp` / `openwisdom mcp` |

---

## 2. 目标与成功标准

| # | 目标 | 验收 |
|---|------|------|
| 1 | Agent 可通过 MCP 搜索 catalog | `openwisdom_search` 返回结构化 skill 列表 |
| 2 | Agent 可非交互安装到指定 harness | `openwisdom_install` 写入 `<provider path>/<id>/SKILL.md` |
| 3 | 与 CLI 同冲突 / force / dryRun / deps / 遥测语义 | 同一 core API；单测共享 fixture |
| 4 | 主流客户端可配置 | Claude Desktop / Cursor / Claude Code 文档与 JSON 样例可用 |
| 5 | stdio 干净 | 禁止业务 `console.log` 污染 stdout（仅协议帧） |
| 6 | 离线可 search | 包内 catalog snapshot；刷新失败 fail-open |

**非目标（v1 硬否决）：**

- Streamable HTTP / SSE 远程多租户 MCP（可日后扩展）
- 任意路径写盘、通用 filesystem 工具
- `run` / 分析 / 模型 API key
- MCP 内交互 prompt（`@clack`）
- 与 CLI 分叉第二套 install 逻辑
- 把热度写进 `SKILL.md`

---

## 3. 铁律（继承 PRODUCT / Spec 17）

| # | 规则 |
|---|------|
| 1 | **Agent-native analysis** — MCP 只包装与安装 |
| 2 | **One content truth** — catalog 来自 `skills/**` → `@openwisdom/catalog` 构建产物 |
| 3 | **Heat side channel** — 成功写入后可上报；`source: "mcp"`；fail-open |
| 4 | **Non-interactive contract** — 写操作必须显式 `providers`（或等价）；禁止挂起等待 stdin |
| 5 | **Catalog-scoped write** — 只写入 Spec 19 路径表；拒绝自由 `dest` |
| 6 | **Stdout 神圣** — 日志 / 进度只走 stderr |

---

## 4. 架构（目标）

```text
skills/**/SKILL.md
       │
       ▼
 packages/schema
 packages/catalog     （构建期 → catalog.json）
 packages/providers
 packages/core        ← NEW：search / list / install / update / telemetry（无 TTY）
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
 packages/cli    packages/mcp    apps/web（文档 / 可选 Install 第三 tab）
 (citty+clack)   (McpServer)     文案诚实
```

**原则：** Skilldex 式 *two interfaces, one core*。CLI 与 MCP 仅是适配层。

细则：Spec **24**。

---

## 5. 技术选型（v1 默认）

| 层 | 选型 | 理由 |
|----|------|------|
| 协议 | MCP tools（stdio） | 本地写盘；Claude / Cursor / CC 一等公民 |
| SDK | **`@modelcontextprotocol/server` v2**（主） | 官方稳定 server 包；`McpServer` + Zod inputSchema |
| 回退 | `@modelcontextprotocol/sdk` v1.x | 若 monorepo zod 大版本冲突且短期难升 |
| Schema | 工具入参 Zod（可 v4，仅 mcp 包） | Agent 可读 `.describe()` |
| 业务 | `@openwisdom/core` | 从现有 `packages/cli/src/*` 抽出 |
| 构建 | tsup → `dist/mcp.js` + shebang | 与 CLI 一致 |
| 发布 | **Option A**：`openwisdom` 双 bin（`openwisdom` + `openwisdom-mcp`）并支持 `openwisdom mcp` | 单包维护；tarball 略增可接受 |
| 测试 | vitest 打 core；MCP 可选 stdio 烟雾 | Windows + Unix |

**明确不采用（v1）：** 生产路径用 `tsx`；把业务写在 `registerTool` 闭包里而不进 core；SSE 默认 transport。

---

## 6. 波次（执行）

| Wave | 内容 | 产出 |
|------|------|------|
| **M0** | Specs 22–25 + plans | 本文档族 · `docs/plans/2026-07-30-mcp/` |
| **M1** | 抽取 `@openwisdom/core`；CLI 改依赖 core | `packages/core` · CLI 行为回归 |
| **M2** | `packages/mcp` stdio server + tools | search/list/install/update + detect |
| **M3** | 双 bin / 构建 / 根 scripts / 测试 | `openwisdom-mcp` 可跑 |
| **M4** | 文档：客户端配置 · AGENTS · 索引 · 可选 Web 文案 | 用户可复制 JSON |

**并行约束：** M1 与 M2 可 worktree 并行，但 M2 合并前须以 M1 的 core 导出为准；M3 依赖 M1+M2。

---

## 7. 与 CLI 对照

| 维度 | CLI | MCP |
|------|-----|-----|
| 交互 | TTY + clack 可选 | **禁止**交互；缺参 → tool error |
| 输出 | 表/TSV + exit code | `content` + 建议 `structuredContent` + `isError` |
| 默认 providers | `-y` 时 detect 或 claude+agents | **必须**传 `providers`（detect 仅只读工具） |
| 默认 scope | project（-y） | project（schema default） |
| cwd | `process.cwd()` | `cwd` 参数 → `CLAUDE_PROJECT_DIR` → `process.cwd()` |
| 遥测 source | `cli` | `mcp` |

---

## 8. 安全（摘要）

1. 仅 catalog id/slug 安装；无任意 URL 写（远程 fetch 与 CLI 同策略，仍落 harness 目录）。  
2. path.resolve + Spec 19 allowlist；拒穿越。  
3. 默认不覆盖异哈希；`force` 显式。  
4. 提供 `dryRun`。  
5. 读工具与写工具分离（annotations）。  
6. 不在 install 时执行 skill 内脚本。

详见 Spec **23** § 安全与错误。

---

## 9. 开放项（勿擅自发明产品行为）

| 项 | 倾向 |
|----|------|
| 是否默认 dryRun | **否**（与 CLI 对齐）；文档鼓励 agent 先 dryRun |
| npm 是否独立包 `@openwisdom/mcp` | v1 否；双 bin 即可 |
| Web Install 第三 tab | P1；不阻塞 M2 |
| 事件名是否拆 `mcp_install_success` | v1 保持 `cli_install_success` 事件名 + `source: "mcp"` 字段（兼容 Spec 06 扩展） |

---

## 10. 验收清单（发布前）

- [ ] `packages/core` 被 cli 与 mcp 共同依赖  
- [ ] `node packages/mcp/dist/mcp.js` 可被 MCP 客户端拉起（或 `openwisdom-mcp`）  
- [ ] 四写读工具 + detect 可用；install 在 temp 目录写出 SKILL.md  
- [ ] stdout 无业务日志（stdio 测试或人工）  
- [ ] `pnpm test`（schema / providers / core / cli / mcp）通过  
- [ ] Specs 索引与 `AGENTS.md` 路由已更新  
- [ ] 无分析类 tool  

---

## 11. 决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 双表面 | CLI + MCP | 用户明确产品路径；对标 Skilldex |
| 共享层 | `packages/core` | 避免 install 语义分叉 |
| Transport | stdio only v1 | 本地写盘；客户端成熟 |
| SDK | server v2 优先 | 官方现状；有 v1 sdk 回退 |
| 交互 | MCP 全非交互 | Agent 无法可靠应答 prompt |

---

*Aligned with repo: CLI packages 已落地；MCP 为增量双表面。*  
