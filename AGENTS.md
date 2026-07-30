# Openwisdom — Agent Guide

<!-- progressive-disclosure: read only what your task needs -->

## How to use this file (progressive disclosure)

| Layer | When to load | What it is |
|-------|----------------|------------|
| **L0** | **Always** (this whole section + Hard rules) | Identity, non-goals, truth sources map |
| **L1** | After you know the task type | Task router → open **one** deep doc |
| **L2** | Only when implementing that area | Specs / PRODUCT / DESIGN / code paths below |
| **L3** | Rare | Full research notes, long IA briefs |

**Do not** bulk-read `docs/specs/*` and `docs/知识库/*` on every turn.  
**Do** open the single file the router names for your task.

---

## L0 — Always

### What this is

Openwisdom is an **open-source social-science Agent Skills library** with three surfaces:

1. **GitHub** — skills source of truth (`official/` + `community/`, planned)
2. **Bilingual catalog website** — discover / download / contribute guide (`apps/web`)
3. **CLI** — skill package manager only (`search` / `install` / `update` / `list`) — multi-agent install like Impeccable

**Not** a hosted analysis chatbot. **Not** a CLI that calls LLMs. Analysis runs in the **user’s** coding agent.

Primary users: knowledge workers already on Claude Code, Cursor, Codex, Grok, etc.

Remote: https://github.com/Retr0-rgb-lab/Openwisdom  
License: **MIT**

### Hard rules

1. **Agent-native analysis** — Never implement web chat / hosted sessions / `openwisdom run` that calls a model in v1 scope.
2. **One content truth** — Skills live under git `skills/` (when present). Site and CLI share a generated catalog index. **Do not** invent skill metadata only on the website.
3. **Heat is a side channel** — Install telemetry (web download + CLI install success) must not write into `SKILL.md`. Fail open: install works if stats API is down. Copy-command is funnel-only, not primary popularity.
4. **Layered content** — **Scenario skills** (workflows) cite **discipline references** (theory cards). Official vs community is provenance, not a second product.
5. **UI zh/en; skill body language = contributor** — Don’t force bilingual skill bodies.
6. **Design world = Direction B (Atlas Coordinate)** — Cool field `#EEF1F2`, copper datum `#B87333`, no purple AI-SaaS skin, no fake testimonials/metrics. See `DESIGN.md` before visual work.
7. **Don’t fabricate** commercial claims, customers, install counts, or skill text that isn’t in repo.

### Truth sources (open only when needed)

| Need | File |
|------|------|
| Product truth (users, purpose, non-goals) | [`PRODUCT.md`](./PRODUCT.md) |
| Visual system tokens & bans | [`DESIGN.md`](./DESIGN.md) |
| Product decisions log | [`docs/知识库/02-产品决策记录.md`](./docs/知识库/02-产品决策记录.md) |
| v1 scope checklist | [`docs/知识库/03-v1交付范围.md`](./docs/知识库/03-v1交付范围.md) |
| Specs index | [`docs/specs/00-索引.md`](./docs/specs/00-索引.md) |
| Architecture / monorepo / catalog pipeline | [`docs/specs/01-架构方案.md`](./docs/specs/01-架构方案.md) |
| Page IA / routes | [`docs/specs/03-页面信息架构.md`](./docs/specs/03-页面信息架构.md) |
| Components + motion policy | [`docs/specs/04-组件与动效.md`](./docs/specs/04-组件与动效.md) |
| Install heat / telemetry | [`docs/specs/06-热度与遥测.md`](./docs/specs/06-热度与遥测.md) |
| Vision one-pager | [`docs/知识库/01-项目定位与愿景.md`](./docs/知识库/01-项目定位与愿景.md) |

---

## L1 — Task router

Pick the task row; load **only** the linked L2 material.

| Task | Open next | Notes |
|------|-----------|--------|
| **Product / scope / “should we build X?”** | `PRODUCT.md` + `docs/知识库/02` + `03` | Prefer decisions already recorded |
| **Architecture / monorepo / CLI package layout** | `docs/specs/01-架构方案.md` | Index-centric monorepo (Option A) |
| **UI / visual / landing polish** | `DESIGN.md` + `docs/specs/02` + `04` + **active plan** `docs/plans/2026-07-30-home-spec-alignment.md` | **Specs win over current hand-rolled UI**; shadcn + React Bits per 04 |
| **New page / IA / nav** | `docs/specs/03-页面信息架构.md` | Home = Persuade; Skills = Operate+Read; Docs = Read |
| **Home page only** | `apps/web` home components + `PRODUCT`/`DESIGN` | Already implemented (see L2 Web) |
| **Skills catalog / detail / install pages** | `docs/specs/03` then implement under `apps/web` | Routes linked from Home may 404 until built |
| **Author official skills / references** | `docs/specs/01` skill frontmatter + v1 content in `docs/知识库/03` | Three scenarios + five disciplines |
| **CLI install / providers** | `docs/specs/01` § CLI + providers list | No LLM; interactive multi-harness |
| **Telemetry / heat ranking** | `docs/specs/06-热度与遥测.md` | Third tier: web download + CLI success |
| **i18n copy** | `apps/web/src/messages/{zh,en}.ts` | Keep parity between locales |
| **Impeccable design commands** | `PRODUCT.md` / `DESIGN.md` already present | Don’t re-init unless stale |

---

## L2 — Area guides

### Repo layout (current + planned)

```text
Openwisdom/
├── AGENTS.md                 ← you are here
├── PRODUCT.md                ← product truth (Impeccable)
├── DESIGN.md                 ← visual system Direction B
├── apps/web/                 ← Next.js 16 site (Home live)
├── docs/知识库/               ← decisions & vision
├── docs/specs/               ← architecture / IA / components / telemetry
├── skills/                   ← PLANNED: official/ + community/
├── packages/                 ← PLANNED: cli, catalog, schema, providers
└── package.json              ← PLANNED monorepo root (optional today)
```

**Implemented today:** `apps/web` Home at `/zh` and `/en` (nine modules), site shell, placeholder routes for `/skills` `/install` `/docs` `/contribute` `/about`.  
**Not implemented yet:** Real Skills catalog/detail pages, docs content, CLI package, `skills/` tree, stats API.

### Web (`apps/web`)

| Item | Detail |
|------|--------|
| Stack | Next.js 16 App Router, React 19, Tailwind 4, TypeScript, shadcn/ui (base-nova), motion |
| Locales | next-intl v4: `/zh`, `/en`; middleware prefixes missing locale; default `zh` |
| i18n wiring | `src/i18n/{routing,request,navigation}.ts`; internal links via `@/i18n/navigation` only |
| Copy | `src/messages/{zh,en}/shell.json` (chrome) + `{zh,en}/home.json` (home), namespaced `shell`/`home` |
| Design tokens | `src/app/globals.css` (`--ow-*` + shadcn aliases), fonts in `src/lib/fonts.ts` |
| Home | `src/components/home/*` (nine modules) + `src/app/[locale]/page.tsx` |
| Shell | `src/components/site/*`, `src/components/ui/*` (shadcn) |
| Bits (Tier A) | `src/components/bits/*` — DotField, BlurText, Noise, LogoLoop (all restrained) |
| Install snippet | `src/components/install/InstallCommand.tsx` (Tabs CLI \| GitHub \| Manual + Sonner) |

**Commands:**

```bash
cd apps/web
pnpm dev      # http://localhost:3000 → /zh
pnpm build
pnpm lint
```

**When adding a page:** follow `docs/specs/03` route table; reuse `SiteHeader` / `SiteFooter`; add strings to **both** message files; keep copper/field tokens—no new purple gradient brand.

**Secondary routes** (`/skills`, `/install`, `/docs`, `/contribute`) may be linked from Home but empty—prefer implementing stubs over leaving broken UX if you touch nav.

### Skills content (when `skills/` exists)

- Unit: directory with `SKILL.md` (+ optional assets).
- Layers: `scenario` | `reference`; scope: `official` | `community`.
- Official scenarios (v1): `macro-scan`, `personal-anchor`, `metacognition-audit`.
- Disciplines: psychology, sociology, history, political-science, economics.
- Frontmatter validated by planned `packages/schema`; catalog build feeds web + CLI.
- Details: `docs/specs/01-架构方案.md` § skill unit + pipeline.

### CLI (planned)

- Package manager only: install into many harness dirs with interactive multi-select.
- Telemetry after successful write; `--no-telemetry` / CI off.
- Do not add model API keys or analysis runners.

### Design / Impeccable

- World: **Instrument of Orientation / Atlas Coordinate** (`DESIGN.md`).
- Home mode: **Persuade** (+ Read). Catalog: **Operate** + Read.
- Motion: still content; micro-feedback on copy/nav; respect `prefers-reduced-motion`.
- Ban list summary: purple/cyan AI glow, glassmorphism, nested cards, fake social proof, Inter-as-brand face.

---

## L3 — Deep / optional

Only if you must audit history or research trail:

| Doc | Why |
|-----|-----|
| `docs/specs/01-web-ia-page-design-brief.md` | Long English IA research dump |
| `docs/specs/05-调研来源.md` | Research links |
| `docs/知识库/04-对标Impeccable与体验标准.md` | Maturity bar vs impeccable.style |
| `apps/web/.impeccable-home-surface.md` | Home surface brief notes |

---

## Working agreements for agents

1. **Prefer edit over reinvent** — extend existing tokens, messages, and components.
2. **One PR-sized concern** — don’t silently scaffold the entire monorepo unless asked.
3. **Confirm before destructive git / force-push / remote publish.**
4. **Label synthetic data** if you mock catalog stats or skill bodies in UI demos.
5. **After substantial UI** — keep zh/en strings in sync; run `pnpm build` in `apps/web`.
6. **If PRODUCT and a draft spec conflict** — PRODUCT + decision log (`02`) win for product scope; DESIGN wins for visual tokens unless the user reopens direction.

---

## Quick “where do I start?”

| You want to… | Start here |
|--------------|------------|
| Understand the product in 2 minutes | L0 + `PRODUCT.md` |
| Ship the next website page | L1 UI/IA rows + `apps/web` |
| Design / rebrand | Stop → read `DESIGN.md` first |
| Build CLI | `docs/specs/01` + hard rule #1 |
| Add a skill | Wait for / create `skills/` per § Skills + schema in `01` |
| Change install heat | `docs/specs/06` only |

---

*Last aligned with repo state: Home live under `apps/web`; monorepo packages and skills tree still planned. Update this map when major surfaces land.*
