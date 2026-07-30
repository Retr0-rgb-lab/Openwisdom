# Spec 23 — MCP Tools 与协议

> **状态：** Ready  
> **日期：** 2026-07-30  
> **上级：** [22-MCP总控-SPE](./22-MCP总控-SPE.md)  
> **相关：** [18 CLI 命令与 UX](./18-CLI命令与UX.md) · [19 providers](./19-CLI-providers与安装写入.md) · [06 遥测](./06-热度与遥测.md)

---

## 1. 设计原则

1. **工具少而稳** — v1 控制在 **5–6** 个；命名带 `openwisdom_` 前缀防聚合冲突。  
2. **参数可机读** — 每个字段 Zod + `.describe()`；枚举优于自由字符串。  
3. **读写分离** — 读：`readOnlyHint: true`；写：显式 providers + 可选 dryRun/force。  
4. **错误可重试** — 缺参返回 `isError` 文本，说明应补哪些字段（对齐 Spec 18 非 TTY）。  
5. **结果结构化** — 至少 `content[{type:'text'}]`；优先同时返回 JSON 文本块便于模型解析。  
6. **零 LLM** — 不出现分析、聊天、API key 工具。

---

## 2. 服务元数据

| 项 | 值 |
|----|-----|
| `name` | `openwisdom` |
| `version` | 与 npm 包版本一致（如 `0.1.0`） |
| Transport | **stdio**（`StdioServerTransport`） |
| 日志 | **仅 stderr** |

环境变量（与 CLI 对齐 + MCP 扩展）：

| 变量 | 作用 |
|------|------|
| `OPENWISDOM_NO_TELEMETRY=1` | 关闭遥测 |
| `OPENWISDOM_TELEMETRY_URL` | 上报 URL；未设则不上报 |
| `OPENWISDOM_REGISTRY` | 远程 registry 基址（refresh 用） |
| `OPENWISDOM_SKILLS_ROOT` | 本地 skills 树根（dev / monorepo） |
| `CLAUDE_PROJECT_DIR` | Claude Code 注入；作 project `cwd` 默认候选 |
| `CI` | 视为关闭遥测（与 CLI 一致） |

---

## 3. 工具清单

### 3.1 `openwisdom_search`

| | |
|--|--|
| **意图** | 在 catalog 中搜索可安装 skill |
| **CLI 对应** | `openwisdom search` |
| **Annotations** | `readOnlyHint: true`, `openWorldHint: true`（若 refresh）, `destructiveHint: false` |

**Input：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | 是 | 自由文本 |
| `layer` | `scenario` \| `reference` | 否 | 层过滤 |
| `scope` | `official` \| `community` | 否 | 出处过滤 |
| `discipline` | string | 否 | 学科 id |
| `limit` | int 1–50 | 否 | 默认 20 |
| `refresh` | boolean | 否 | 默认 false；先尝试拉远程索引 |

**Output（语义）：**  
`skills[]`：`id`, `name`, `layer`, `scope`, `disciplines`, `language`, `version`, `description`（截断）  
空结果不算 error。

---

### 3.2 `openwisdom_list`

| | |
|--|--|
| **意图** | 列出 catalog 可用 或 本机已安装 |
| **CLI 对应** | `openwisdom list` / `list --installed` |
| **Annotations** | `readOnlyHint: true` |

**Input：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `mode` | `available` \| `installed` | 否 | 默认 `available` |
| `providers` | string[] | mode=installed 时建议 | 过滤 harness；缺省扫 P0 检测集 |
| `scope` | `project` \| `global` | 否 | 默认 project（installed） |
| `cwd` | string | 否 | project 根 |

**Output：**  
- available：与 search 类似的简表（可无 query，全量或 featured 优先）  
- installed：`skillId`, `provider`, `path`, `scope`

---

### 3.3 `openwisdom_install`

| | |
|--|--|
| **意图** | 将 skill 目录写入所选 harness |
| **CLI 对应** | `openwisdom install` |
| **Annotations** | `readOnlyHint: false`, `destructiveHint: false`（`force:true` 时视为可破坏覆盖）, `idempotentHint: true`（同内容）, `openWorldHint: true` |

**Input：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skills` | string[] | **是** | catalog id/slug，至少 1 |
| `providers` | string[] | **是** | Spec 19 id（如 `claude`, `cursor`）；**禁止**静默猜全集 |
| `scope` | `project` \| `global` | 否 | 默认 `project` |
| `cwd` | string | 否 | 默认见 §2 cwd 解析 |
| `force` | boolean | 否 | 默认 false |
| `dryRun` | boolean | 否 | 默认 false |
| `noDeps` | boolean | 否 | 默认 false；true 时不展开 references |
| `noTelemetry` | boolean | 否 | 默认 false |

**行为（继承 Spec 18/19）：**

1. 解析 catalog → 定位 skill 目录（`OPENWISDOM_SKILLS_ROOT` / monorepo / 与 CLI 相同策略）。  
2. 默认展开 `references[]`（缺 ref 警告不失败）。  
3. `uniqueWriteTargets` 去重路径。  
4. 冲突：异哈希拒绝，除非 `force`。  
5. 全部目标 provider 成功后才遥测（每 skill 一次）；`source: "mcp"`。  
6. `dryRun` 只返回计划路径，不写盘、不上报。

**Output：**  
`ok`, `dryRun`, `results[]`（skillId, provider, path, action: copied|skipped|would_write|conflict|error）, `warnings[]`, `errors[]`

**Error：**  
缺 skills/providers → `isError` + 用法说明。未知 provider id → error。skills root 不可用 → error（与 CLI 同文案级别）。

---

### 3.4 `openwisdom_update`

| | |
|--|--|
| **意图** | 刷新已装 skill（或指定 id）到当前 catalog 内容 |
| **CLI 对应** | `openwisdom update` |
| **Annotations** | 同 install（写） |

**Input：** 同 install，但 `skills` **可选**；缺省 = 当前 scope 下已安装 id 列表。  
**建议默认** `force: true`（与「更新」语义一致）——若与 CLI 当前实现不一致，**以 CLI 现实现为准**，在工具 description 写明。

---

### 3.5 `openwisdom_detect_providers`（只读 · 推荐 v1 带上）

| | |
|--|--|
| **意图** | 探测本机/项目存在哪些 harness，供 agent 填 install.providers |
| **CLI 对应** | 无独立命令；对齐 providers.detect |
| **Annotations** | `readOnlyHint: true` |

**Input：** `cwd?`, `home?`  
**Output：** `project[]`, `global[]`, `recommended[]`（与 CLI `-y` 默认策略一致：有 project 检测则用其；否则 `claude`+`agents`）

---

### 3.6 明确不暴露

| 禁止 | 原因 |
|------|------|
| `openwisdom_run` / analyze / chat | 产品硬规则 |
| 自由 `write_file` / `exec` | 安全 |
| `uninstall` | CLI v1 无；保持对称 |
| 修改 skill 正文 / 写热度进 frontmatter | Spec 06 |

---

## 4. cwd 解析顺序

用于 `scope: project` 的根目录：

1. 工具参数 `cwd`（绝对或可 resolve）  
2. `process.env.CLAUDE_PROJECT_DIR`  
3. `process.cwd()`

`home` 默认 `os.homedir()`；测试可注入。

---

## 5. 结果与错误映射

| Core 结果 | MCP |
|-----------|-----|
| 成功 | `isError` 省略/false；text 摘要 + JSON 块 |
| `UsageError`（缺参/非法） | `isError: true`；说明补参 |
| `RuntimeError` / 写盘失败 | `isError: true`；保留部分 results |
| 空搜索 | 成功，skills=[] |
| 遥测失败 | 忽略；不影响 ok |

**禁止** 在 tool handler 内 `process.exit`。

---

## 6. Annotations 约定（显式设置）

| Tool | readOnly | destructive | openWorld |
|------|----------|-------------|-----------|
| search | true | false | true if refresh else false* |
| list | true | false | false |
| detect_providers | true | false | false |
| install | false | force 时 true 否则 false | true |
| update | false | true（覆盖倾向） | true |

\* 实现可固定 `openWorldHint: true` 简化。

客户端 **不信任** annotations 作为安全边界；服务端仍强制校验。

---

## 7. 客户端配置样例

### 7.1 Claude Code

```bash
claude mcp add --transport stdio openwisdom -- npx -y openwisdom-mcp
```

或项目 `.mcp.json`：

```json
{
  "mcpServers": {
    "openwisdom": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "openwisdom-mcp"],
      "env": {
        "OPENWISDOM_SKILLS_ROOT": "/absolute/path/to/Openwisdom/skills"
      }
    }
  }
}
```

### 7.2 Cursor（`.cursor/mcp.json`）

```json
{
  "mcpServers": {
    "openwisdom": {
      "command": "npx",
      "args": ["-y", "openwisdom-mcp"]
    }
  }
}
```

### 7.3 Claude Desktop

```json
{
  "mcpServers": {
    "openwisdom": {
      "command": "npx",
      "args": ["-y", "openwisdom-mcp"]
    }
  }
}
```

### 7.4 本地 monorepo 开发

```json
{
  "mcpServers": {
    "openwisdom": {
      "command": "node",
      "args": ["E:/学习软件/Openwisdom/packages/mcp/dist/mcp.js"],
      "env": {
        "OPENWISDOM_SKILLS_ROOT": "E:/学习软件/Openwisdom/skills",
        "OPENWISDOM_NO_TELEMETRY": "1"
      }
    }
  }
}
```

**注意：** `npx` 务必带 `-y`；Windows 若 spawn 失败可 `cmd /c npx -y openwisdom-mcp`。业务日志不得写 stdout。

---

## 8. Agent 推荐调用顺序

```text
openwisdom_detect_providers
        → openwisdom_search / openwisdom_list
        → openwisdom_install(dryRun: true)   // 可选
        → openwisdom_install(dryRun: false)
```

工具 description 中应用 1–2 句提示该顺序。

---

## 9. 验收

- [ ] 5 个工具均在 `list_tools` 可见  
- [ ] install 缺 providers → isError  
- [ ] install 成功路径与 CLI 同 fixture 一致  
- [ ] detect 不写盘  
- [ ] 配置样例写入 `packages/mcp/README.md`  
