# Spec 21 — CLI 调研纪要

> **状态：** 归档（调研完成）  
> **日期：** 2026-07-30  
> **用途：** 支撑 Specs **17–20**；实现时可复查链接，不必通读全文  
> **方法：** 并行 subagent 调研（Impeccable CLI · monorepo 现状 · Agent Skills 路径 · npm 打包实践）

---

## 1. 结论摘要（给实现者）

| 主题 | 结论 |
|------|------|
| 产品对照 | Openwisdom CLI = **多 skill 注册表包管理器**；Impeccable CLI = **单产品 skill 包安装器 + 设计检测** |
| UX 应抄 | detect → multi-select providers → project/global → 写入；`-y --providers --scope` |
| UX 勿抄死 | Impeccable 手写 TTY、按 provider **编译**不同 skill 树、hooks 合并 |
| 生态第二参考 | Vercel `npx skills`：catalog 多源、默认 symlink、`skills-lock`、@clack、遥测可关 |
| 内容单元 | agentskills.io：`SKILL.md` + `name`/`description` |
| 本仓库 | 仅 `apps/web`；无 `packages/*`、无 `skills/`、命令仅预告 |
| 栈 | citty + @clack/prompts + tsup + 包内 catalog snapshot + GitHub 载荷 |
| 默认写盘 | **copy**（Windows 友好）；link 可选 |
| npm | `openwisdom` 调研时 registry 未见占用；仍以发布前复核为准 |

---

## 2. Impeccable CLI

| 项 | 内容 |
|----|------|
| 源码 | https://github.com/pbakaus/impeccable （`cli/`） |
| npm | `impeccable` |
| 站点 | https://impeccable.style |
| 协议 | Apache-2.0 |
| Node | ≥ 22.12（其现状） |
| 主命令 | `install` / `update` / `check` / `link` / `help`；另有 `detect`（设计反模式扫描，非 PM） |

**安装流：** 检测 harness → 交互选 providers → project|global → 下 universal zip → **copy** 各 provider 编译树 → 可选 hooks。

**非交互：**

```text
npx impeccable install -y --providers=claude,codex,cursor --scope=project
```

**路径（节选，以其 `skills.mjs` 为准）：**

| alias | project | global 注意 |
|-------|---------|-------------|
| claude | `.claude/skills/` | `~/.claude/skills/` |
| cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| codex | `.agents/skills/` | hooks 等与 `.codex` 相关 |
| gemini | `.gemini/skills/` | |
| github/copilot | `.github/skills/` | |
| grok | `.grok/skills/` | |
| opencode | `.opencode/skills/` | 全局 **`$OPENCODE_CONFIG_DIR` 或 `~/.config/opencode/skills`** |
| pi | `.pi/skills/` | **`~/.pi/agent/skills`** |

**对 Openwisdom：** 复用 **交互合同与路径意图**，不 fork 其 monorepo；不引入设计 hooks；我们需要 **search/list 多 skill**，Impeccable 无通用 registry。

---

## 3. Vercel skills / skills.sh

| 项 | 内容 |
|----|------|
| 仓库 | https://github.com/vercel-labs/skills |
| 站点 | https://skills.sh |
| 命令 | `add` / `list` / `find` / `update` / `remove` / `init` / … |
| 交互 | @clack/prompts；`@vercel/detect-agent` |
| 安装 | 默认 symlink canonical → 多 agent；`--copy` 可选 |
| 遥测 | 匿名；`DISABLE_TELEMETRY` / `DO_NOT_TRACK`；CI 关 |

**对 Openwisdom：** 遥测 opt-out 与 fail-open 精神一致；provider 大表可参考但 **v1 收敛 P0**；默认我们选 **copy** 降低 Windows/权限问题。

---

## 4. Agent Skills 标准

| 项 | 内容 |
|----|------|
| 规范 | https://agentskills.io/specification |
| 单元 | 目录 + `SKILL.md` |
| 必需 FM | `name`, `description` |
| `name` | 与目录名一致；kebab-case 约束 |

Openwisdom 扩展字段见 Spec 20；未知 FM 键应被其他 agent 忽略。

**官方文档入口（路径复核用）：**

- Claude Code skills  
- Cursor skills  
- Gemini CLI skills  
- VS Code / Copilot agent skills  
- OpenCode skills  

（具体 URL 随厂商变更；实现前打开最新 docs。）

---

## 5. Provider 路径共识（调研合并）

| Harness | Project | Global | 备注 |
|---------|---------|--------|------|
| Claude | `.claude/skills/<name>/` | `~/.claude/skills/` | 最稳 |
| Cursor | `.cursor/skills/`；亦读 `.agents` / `.claude` | `~/.cursor/skills/` | 交叉读取多 |
| Codex | `.agents/skills/` | `~/.codex/skills/` | 与 AGENTS.md 不同 |
| Copilot | `.github/skills/` 等 | `~/.copilot/skills/` | |
| Gemini | `.gemini/skills/` 或 `.agents` | `~/.gemini/skills/` | |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills` | 勿用死路径 `~/.opencode` |
| Grok | Impeccable: `.grok/skills/` | 同 | 公开规范弱于 P0 → 我们标 P1 |
| Portable | `.agents/skills/` | `~/.agents/skills/` | 多工具共读 |

完整表与写入策略：**Spec 19**。

---

## 6. 本仓库 CLI 就绪度（审计）

| 项 | 状态 |
|----|------|
| `pnpm-workspace` | 仅 `apps/*` |
| `packages/cli` 等 | 不存在 |
| `skills/` | 不存在 |
| Web catalog | `apps/web/src/data/catalog/*` bootstrap |
| 广告命令 | `npx openwisdom install[ <slug>]` |
| 诚实文案 | CLI 未发布 |
| `/registry/*` | 无 |
| 遥测 API | 无 |

**slug 契约已存在：** `macro-scan` · `personal-anchor` · `metacognition-audit` 及 `install.cli` 字段。

---

## 7. npm / 打包实践（采纳）

| 决策 | 采纳 |
|------|------|
| 名 | 优先 unscoped `openwisdom` |
| bin | `openwisdom` → `dist/cli.js` |
| 模块 | ESM only |
| 构建 | tsup bundle CLI；内部包 private |
| 索引 | snapshot + 可选远程 refresh |
| 载荷 | GitHub，不靠 npm 塞全文 |
| 测试 | vitest + tmp + execa |
| 解析器 | citty（Plan B commander） |
| 提示 | @clack/prompts |

**反模式：** tsx 生产 bin、yargs 重依赖、静默覆盖、双源元数据、网络必需 search。

调研时 `registry.npmjs.org/openwisdom` 返回未注册；**发布前必须再查**。

---

## 8. 开放问题 → Spec 拍板对照

| 调研时问题 | Spec 处理 |
|------------|-----------|
| P0 子集 vs 70 agent | **19**：P0 六项 + P1 表 |
| Cursor 双路径 | **19**：主 `.cursor/skills` + portable `agents` |
| 默认 scope | **18**：交互自选；`-y` → project |
| scenario 是否装 references | **18**：默认 with-deps，可 `--no-deps` |
| symlink vs copy | **19/17**：默认 copy |
| 锁文件 | v1 不做 skills-lock；靠 catalog version/hash |
| hooks | v1 不做 |
| npm 名 | **20** 发布前检测 + 备选 scoped |

---

## 9. 参考链接（速查）

- https://github.com/pbakaus/impeccable  
- https://impeccable.style/tutorials/getting-started  
- https://github.com/vercel-labs/skills  
- https://skills.sh  
- https://agentskills.io/specification  
- https://github.com/Retr0-rgb-lab/Openwisdom  
- 仓内：`PRODUCT.md` · `docs/specs/01` · `06` · `15` · `apps/web/src/data/catalog/types.ts`

---

## 10. 调研元数据

| Subagent | 焦点 |
|----------|------|
| Impeccable + skills 生态 | 命令、路径、UX、许可 |
| monorepo 审计 | 现状缺口、Web 契约、文件路径 |
| Agent skill 路径 | 官方路径、Windows、写策略 |
| npm 打包 | bin、snapshot、citty、测试、workspace |

*本纪要非执行权威；冲突时以 Specs **17–20** 与 PRODUCT 为准。*
