# Openwisdom

**Open-source social-science Agent Skills for the agents you already use.**

Many skills library are available all over the internet right now. But few of them touches the spiritual needs of humanity. Openwisdom is not a library storing coding skills. It only helps people to understand the world better: Your role, the time , the history and human-being. Wisdom is different from knowledge and techne. Wisdom is far more than that.

| Surface | What it is |
|---------|------------|
| **This repo** | Skill source of truth (`skills/`), package managers, docs |
| **Website** | Bilingual catalog: discover, filter, install guidance — **[openwisdom.vercel.app](https://openwisdom.vercel.app)** |
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

- **Live site:** [https://openwisdom.vercel.app](https://openwisdom.vercel.app) (default locale `/zh`; English at `/en`)
- **Repo:** [`skills/official/`](./skills/official/)
- **Local web:** see [Website](#website-appsweb)

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

**CLI and MCP are on npm** as `openwisdom` and `openwisdom-mcp` (0.1.0+). Analysis still runs in **your** agent—not on this site.

```bash
npx openwisdom list
npx openwisdom install macro-scan -y --providers=claude --scope=project
npx -y openwisdom-mcp
```

Common CLI flags: `--providers claude,cursor,agents` · `--scope project|global` · `-y` · `--no-telemetry`

**MCP** is the same package-manager core over **stdio** (not a chat model). Configure your agent with `npx -y openwisdom-mcp`. Tools: `openwisdom_search` · `openwisdom_list` · `openwisdom_install` · `openwisdom_update` · `openwisdom_detect_providers`.

#### Option B — Manual copy

1. Copy a skill folder from `skills/official/.../<skill-id>/` into your agent’s skills directory, for example:
   - Claude Code: `.claude/skills/<skill-id>/`
   - Cursor: `.cursor/skills/<skill-id>/`
   - Portable / Codex-style project: `.agents/skills/<skill-id>/`
2. Reload the agent and invoke the skill per its `SKILL.md`.

#### Develop from source (monorepo)

For contributors building packages locally:

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

pnpm --filter openwisdom-mcp build
# Configure your agent MCP to run: node packages/mcp/dist/mcp.js
# Optional: OPENWISDOM_SKILLS_ROOT=/absolute/path/to/skills
```

### 3. Run analysis in your agent

Open Claude Code / Cursor / etc., trigger the skill (e.g. **macro-scan**), and run a real analysis on **your** material. There is no analysis UI on the Openwisdom site.

---

## Website (`apps/web`)

**Production:** [https://openwisdom.vercel.app](https://openwisdom.vercel.app)  
(Vercel project `openwisdom`, root directory `apps/web`. No custom domain configured.)

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

- **Website:** https://openwisdom.vercel.app  
- Repository: https://github.com/Retr0-rgb-lab/Openwisdom  
- Issues: https://github.com/Retr0-rgb-lab/Openwisdom/issues  

---

# Openwisdom（中文）

**开源社会科学 Agent Skills 库——装进你已有的 Agent，而不是另一个网页聊天。**

Openwisdom **不是**托管分析机器人。它提供结构化 skill（场景工作流 + 学科理论卡），安装到 Claude Code、Cursor、Codex 等编码 Agent 中；**分析在你的 Agent 与模型账单里运行**。

| 表面 | 作用 |
|------|------|
| **本仓库** | skill 真源（`skills/`）、CLI/MCP、文档 |
| **网站** | 中英目录：发现、筛选、安装引导 — **[openwisdom.vercel.app](https://openwisdom.vercel.app)** |
| **CLI / MCP** | 仅包管理：`search` / `install` / `update` / `list`，**不调用大模型** |

### 当前官方内容

- **3 个场景：** `macro-scan` · `personal-anchor` · `metacognition-audit`  
- **5 张 reference：** 覆盖心理、社会、历史、政治、经济相关理论卡  
- 路径：`skills/official/`  
- `skills/community/` 已就绪，欢迎 PR  

### 今天怎么用

**CLI / MCP 已上架 npm**（`openwisdom` · `openwisdom-mcp`，0.1.0+）。分析仍在**你的 Agent** 中运行，不在本站。

```bash
npx openwisdom list
npx openwisdom install macro-scan -y --providers=claude --scope=project
npx -y openwisdom-mcp
```

备选：手动拷贝 skill 目录到 Agent 的 skills 路径（如 `.claude/skills/`），或见上方 **Develop from source** 从 monorepo 构建。

装好后在 Agent 中按 `SKILL.md` 调用并跑通一次真实分析。

**线上站点：** [https://openwisdom.vercel.app](https://openwisdom.vercel.app)（默认 `/zh`，英文 `/en`）

本地开发网站：

```bash
pnpm install
pnpm dev
```

### 非目标

不做网页托管分析、不做 CLI 内 LLM、不做账号与上传审核后台。热度统计可关闭，且从不写入 `SKILL.md`。

### 许可

[MIT](./LICENSE)
