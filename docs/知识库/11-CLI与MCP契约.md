# CLI 与 MCP 契约

> 蒸馏自原 Spec 17–20 · 22–24 · 31；现状版本见 [05](./05-系统现状与实现地图.md)。

---

## 1. 一句话

**双表面 · 一核心 · 零 LLM：**

| 表面 | 面向 | 入口 |
|------|------|------|
| **CLI** | 人类终端 | `npx openwisdom …`（`openwisdom@0.1.1`） |
| **MCP** | Agent 会话工具 | `npx -y openwisdom-mcp`（`0.1.2`） |
| **Core** | 共享业务 | `@openwisdom/core` |

两者：search / list / install / update（MCP 另有 get + detect）。  
**禁止：** `run` / analyze / 模型 API key / 托管会话。

---

## 2. 铁律

1. Agent-native analysis — 只包装与安装  
2. One content truth — catalog 来自 `skills/**` 构建物  
3. Heat side channel — 成功后可上报；fail-open；可关  
4. MCP 非交互 — 写操作必须显式 `providers`  
5. Catalog-scoped write — 只写 providers 路径表  
6. MCP stdout 神圣 — 业务日志只走 stderr  

---

## 3. CLI 命令

```text
openwisdom search <query…>   [--layer] [--scope] [--discipline] [--limit] [--tag]
openwisdom list              [--available|--installed] [--providers] [--scope]
openwisdom install [skills…] [--providers] [--scope] [--force] [--dry-run] [--no-deps] [--bundle]
openwisdom update  [skills…] [--refresh-only] [--force] …
```

### 全局 flags / env

| Flag / Env | 作用 |
|------------|------|
| `--lang zh\|en` · `OPENWISDOM_LANG` | 提示语言 |
| `--registry` · `OPENWISDOM_REGISTRY` | 远程索引 |
| `--no-telemetry` · `OPENWISDOM_NO_TELEMETRY=1` | 关遥测 |
| `OPENWISDOM_TELEMETRY_URL` | 上报 URL |
| `OPENWISDOM_SKILLS_ROOT` | 本地 skills 树 |
| `-y` / `--yes` | 非交互默认 |
| `--dry-run` | 只打印计划 |
| `CI=true` | 关遥测 + 禁止阻塞 prompt |

### `-y` 默认

| 缺省 | 行为 |
|------|------|
| skills | **必须** argv 给出；否则 exit 2 |
| providers | 检测结果；无则 `claude` + `agents` |
| scope | **project** |

### install 依赖策略

- **默认：** 展开 scenario 的 `references[]`  
- `--no-deps`：仅显式 id  
- 缺 ref：警告，不整次失败（除非未来 strict）

### 交互流（TTY）

选 skills → 检测 harness → 选 providers → project|global → 确认 → 写盘 → 遥测 → 提示「在 Agent 中调用」。

### Web 承诺最小路径

```bash
npx openwisdom install
npx openwisdom install macro-scan
```

---

## 4. Providers（路径表）

包：`packages/providers`。

### P0（v1 必测）

| id | project skills | global skills |
|----|----------------|---------------|
| `claude` | `.claude/skills` | `~/.claude/skills` |
| `cursor` | `.cursor/skills` | `~/.cursor/skills` |
| `codex` | `.agents/skills` | `~/.codex/skills` |
| `gemini` | `.gemini/skills` | `~/.gemini/skills` |
| `github` / copilot | `.github/skills` | `~/.copilot/skills` |
| `agents`（portable） | `.agents/skills` | `~/.agents/skills` |

无检测时默认：`claude` + `agents`。同路径去重写入。

### P1 示例

`grok` · `opencode` · `pi` · `kiro` · `qoder` · `trae` / `trae-cn` · `windsurf` · `cline` 等（见 `packages/providers` 源表）。

### 写入策略

- 单元 = 整目录（含 `SKILL.md`）  
- 默认 copy：staging → 校验 → rename  
- 冲突：异哈希拒绝，除非 `--force`  
- 可选 `--link`（Windows junction；失败须明确）  
- **不**写 hooks/settings  

---

## 5. MCP 六工具

| 工具 | 意图 | 只读 |
|------|------|------|
| `openwisdom_search` | 关键词 + layer/scope/discipline/tag | ✅ |
| `openwisdom_list` | available 全库或 installed | ✅ |
| `openwisdom_get` | catalog 行 + **SKILL.md 正文** | ✅ |
| `openwisdom_detect_providers` | project/global/recommended | ✅ |
| `openwisdom_install` | 写入 harness；`providers[]` **必填** | 写 |
| `openwisdom_update` | 刷新已装 | 写 |

### 关键输入摘要

**search：** `query?`（无 filter 时必填）· `layer` · `scope` · `discipline` · `limit` 1–50 默认 20 · `detail` card|full · `tag?`（Handoff）

**list：** `mode` available|installed · 过滤字段 · available 默认 limit 盖全库  

**get：** `skill` 必填 · `includeBody` 默认 true · `maxBodyChars` 默认 32000  

**install：** `skills[]` + `providers[]` 必填 · `scope` 默认 project · `cwd?` · `force` · `dryRun` · `noDeps` · `noTelemetry` · 未来 `bundle?`

**cwd 解析：** 参数 `cwd` → `CLAUDE_PROJECT_DIR` → `process.cwd()`

### 推荐 Agent 流

```text
list|search → get → detect_providers → install(dryRun) → install
→ 在 Agent 会话中调用 skill（非 MCP run）
```

### 禁止暴露

`run` / analyze / chat · 自由 write_file/exec · uninstall（对称 CLI v1）· 写热度进 frontmatter  

### 服务元数据

- name: `openwisdom` · version = npm 包版本  
- Transport: **stdio**  
- 遥测事件名仍 `cli_install_success`，`source: "mcp"`  
- 全部 provider 成功才上报；每 skill 计 1 次  

### 错误

缺参 → `isError` + 补参说明；空搜索成功 `skills=[]`；遥测失败忽略；**禁止** handler 内 `process.exit`。

---

## 6. 载荷与 catalog 解析

```text
OPENWISDOM_SKILLS_ROOT → monorepo skills/ → package skills-snapshot/
```

索引：`catalog-snapshot/catalog.json`（与 web registry 同构）。  
`get` **禁止**伪造正文；定位失败 → error。

---

## 7. 客户端配置样例（MCP）

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

可选 env：`OPENWISDOM_TELEMETRY_URL` · `OPENWISDOM_SKILLS_ROOT` · `OPENWISDOM_NO_TELEMETRY`。

---

## 8. Handoff 表面扩展（D1）

| 表面 | 支持 | 不做 |
|------|------|------|
| CLI | `search --tag orientation-pipeline` · `install --bundle=orientation-handoff` | doctor / suggest / pipeline 运行时 |
| MCP | search/list `tag` · 卡片 `pipeline?` | 第 7 工具 recommend/run |
| Core | tag 过滤 · `resolveBundle` · install 解析 bundle∪ids | CLI-only 硬编码 bundle 列表 |

详见 [13-Orientation交接层](./13-Orientation交接层.md)。

---

## 9. 技术选型摘要

| 层 | 选型 |
|----|------|
| CLI 解析 | citty |
| 交互 | @clack/prompts |
| MCP SDK | `@modelcontextprotocol/server` v2 |
| 构建 | tsup 单 bin bundle workspace 依赖 |
| 测试 | vitest + 临时目录 |

---

## 10. 验收速查

- [ ] `npx openwisdom install macro-scan` 写入所选 harness  
- [ ] 离线 search（snapshot）  
- [ ] MCP 六工具可 stdio 握手  
- [ ] get 正文与 snapshot 一致  
- [ ] 无 run/analyze  
- [ ] 遥测 fail-open；`--no-telemetry` 无上报  
