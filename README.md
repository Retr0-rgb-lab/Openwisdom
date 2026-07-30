# Openwisdom

**Open-source social-science Agent Skills for the agents you already use.**

Openwisdom is **not** a hosted chatbot. It is a library of structured skills—scenario workflows plus discipline reference cards—that install into Claude Code, Cursor, Codex, and similar coding agents. Analysis runs in **your** agent and model budget.

| Surface | What it is |
|---------|------------|
| **This repo** | Skill source of truth (`skills/`), package managers, docs |
| **Website** | Bilingual catalog: discover, filter, install guidance (`apps/web`) |
| **CLI / MCP** | Package managers only: `search` · `install` · `update` · `list` — **no LLM calls** |

**中文说明见下方 [中文](#openwisdom-中文)。**

---

## Why Openwisdom

Knowledge work with AI often drifts into generic summaries. Openwisdom gives agents **repeatable social-science method**:

- **Scenarios** — runnable workflows (e.g. macro scan, personal anchor, metacognition audit)
- **References** — compact theory cards (psychology, sociology, history, political science, economics)
- Scenarios **cite** references so structure and concepts stay separable

Official content today: **3 scenarios + 5 references** under `skills/official/`. Community contributions land in `skills/community/` (directory ready; open for PRs).

---

## Quick start

### 1. Browse skills

- **Web (local):** see [Website](#website-appsweb)
- **Repo:** [`skills/official/`](./skills/official/)

Official skills:

| Skill | Layer | Role |
|-------|--------|------|
| `macro-scan` | scenario | Structure a situation: actors, incentives, constraints, trajectories |
| `personal-anchor` | scenario | Locate yourself in social / historical coordinates |
| `metacognition-audit` | scenario | Surface bias, blind spots, evidence gaps |
| `confirmation-bias` | reference | Psychology |
| `collective-action` | reference | Sociology / political science |
| `path-dependence` | reference | History / institutions |
| `prospect-theory` | reference | Economics / psychology |
| `social-stratification` | reference | Sociology |

### 2. Install into your agent

**Status:** CLI and MCP live in this monorepo. **Public npm publish is not done yet.** Prefer monorepo install or manual copy until packages are on the registry.

#### Option A — Manual (works today)

1. Copy a skill folder from `skills/official/.../<skill-id>/` into your agent’s skills directory, for example:
   - Claude Code: `.claude/skills/<skill-id>/`
   - Cursor: `.cursor/skills/<skill-id>/`
   - Portable / Codex-style project: `.agents/skills/<skill-id>/`
2. Reload the agent and invoke the skill per its `SKILL.md`.

#### Option B — CLI from this monorepo

```bash
# Prerequisites: Node 20+, pnpm 10+
pnpm install
pnpm --filter @openwisdom/schema build
pnpm --filter @openwisdom/providers build
pnpm --filter @openwisdom/core build
pnpm --filter openwisdom build

# Point at the repo skills tree (PowerShell example)
# $env:OPENWISDOM_SKILLS_ROOT = (Resolve-Path skills).Path

pnpm cli -- search macro
pnpm cli -- install macro-scan -y --providers=claude --scope=project
```

Common flags: `--providers claude,cursor,agents` · `--scope project|global` · `-y` · `--no-telemetry`

#### Option C — MCP (agent session tools)

Same install semantics over **stdio**. Not a chat model.

```bash
pnpm --filter openwisdom-mcp build
# Configure your agent MCP to run: node packages/mcp/dist/mcp.js
# Optional: OPENWISDOM_SKILLS_ROOT=/absolute/path/to/skills
```

Tools: `openwisdom_search` · `openwisdom_list` · `openwisdom_install` · `openwisdom_update` · `openwisdom_detect_providers`

### 3. Run analysis in your agent

Open Claude Code / Cursor / etc., trigger the skill (e.g. **macro-scan**), and run a real analysis on **your** material. There is no analysis UI on the Openwisdom site.

---

## Website (`apps/web`)

Bilingual UI (`/zh`, `/en`): Home, Skills catalog & detail, Install hub, Docs, Contribute.

```bash
pnpm install
pnpm dev
# → http://localhost:3000  (defaults to /zh)
```

```bash
pnpm --filter web build
```

Docs include getting started, concepts, CLI/MCP, agents paths, authoring, privacy/telemetry, FAQ.

---

## Repository layout

```text
Openwisdom/
├── skills/                 # Skill source of truth (official + community)
├── packages/
│   ├── schema/             # SKILL.md frontmatter validation
│   ├── providers/          # Harness path table
│   ├── catalog/            # Build catalog.json
│   ├── core/               # Shared install / catalog / telemetry client
│   ├── cli/                # openwisdom CLI
│   └── mcp/                # openwisdom-mcp (stdio)
├── apps/web/               # Next.js catalog site
├── docs/                   # Specs & product knowledge (maintainers)
├── PRODUCT.md              # Product truth
├── DESIGN.md               # Visual system (Overlay Atlas)
└── AGENTS.md               # Guide for coding agents working on this repo
```

---

## Contribute

v1 has **no web upload backend**. Everything goes through GitHub:

1. Fork this repository  
2. Add a skill under `skills/community/<your-skill>/` with `SKILL.md`  
3. Open a PR (scope: `community`; do not self-label as official)

See the site **Contribute** page and in-repo authoring docs when the web app is running.

---

## Privacy & install heat

Install popularity is an optional side channel (web download + successful CLI/MCP install). It never writes into `SKILL.md`. Install still works if telemetry is off.

- CLI: `--no-telemetry` or `OPENWISDOM_NO_TELEMETRY=1`  
- CI: telemetry defaults off when `CI=true`  
- Details: site Docs → Privacy  

---

## What this project is not

- Not a browser AI analysis chat or hosted session product  
- Not a CLI/MCP that calls models or “runs” analysis for you  
- Not a marketplace with accounts, favorites, or paid Pro (v1)  
- Not a claim that every catalog “Curated” card is an installable monorepo package—**Official** skills in `skills/official/` are the installable core  

---

## License

[MIT](./LICENSE)

---

## Links

- Repository: https://github.com/Retr0-rgb-lab/Openwisdom  
- Issues: https://github.com/Retr0-rgb-lab/Openwisdom/issues  

---

# Openwisdom（中文）

**开源社会科学 Agent Skills 库——装进你已有的 Agent，而不是另一个网页聊天。**

Openwisdom **不是**托管分析机器人。它提供结构化 skill（场景工作流 + 学科理论卡），安装到 Claude Code、Cursor、Codex 等编码 Agent 中；**分析在你的 Agent 与模型账单里运行**。

| 表面 | 作用 |
|------|------|
| **本仓库** | skill 真源（`skills/`）、CLI/MCP、文档 |
| **网站** | 中英目录：发现、筛选、安装引导（`apps/web`） |
| **CLI / MCP** | 仅包管理：`search` / `install` / `update` / `list`，**不调用大模型** |

### 当前官方内容

- **3 个场景：** `macro-scan` · `personal-anchor` · `metacognition-audit`  
- **5 张 reference：** 覆盖心理、社会、历史、政治、经济相关理论卡  
- 路径：`skills/official/`  
- `skills/community/` 已就绪，欢迎 PR  

### 今天怎么用（诚实状态）

CLI / MCP 在 monorepo 内可用，**尚未上架公共 npm**。当前推荐：

1. **手动拷贝** skill 目录到 Agent 的 skills 路径（如 `.claude/skills/`）  
2. 或本仓库构建后：`pnpm cli -- install macro-scan -y --providers=claude --scope=project`  
3. 在 Agent 中按 `SKILL.md` 调用并跑通一次真实分析  

本地网站：

```bash
pnpm install
pnpm dev
```

### 非目标

不做网页托管分析、不做 CLI 内 LLM、不做账号与上传审核后台。热度统计可关闭，且从不写入 `SKILL.md`。

### 许可

[MIT](./LICENSE)
