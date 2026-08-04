# Openwisdom — Agent Guide

<!-- progressive-disclosure: read only what your task needs -->

## How to use this file (progressive disclosure)

| Layer | When to load | What it is |
|-------|----------------|------------|
| **L0** | **Always** (this whole section + Hard rules) | Identity, non-goals, truth sources map |
| **L1** | After you know the task type | Task router → `docs/知识库/00-索引.md` then **one** topic file |
| **L2** | Only when implementing that area | PRODUCT / DESIGN / code paths + named knowledge-base topic |
| **L3** | Rare | Plans, archive research, long historical briefs |

**Do not** bulk-read the whole knowledge base or any retired tree on every turn.  
**Do** open `docs/知识库/00-索引.md`, then only the single topic the router names.

---

## L0 — Always

### What this is

Openwisdom is an **open-source social-science Agent Skills library** with three surfaces:

1. **GitHub** — skills source of truth (`official/` + `community/`, planned)
2. **Bilingual catalog website** — discover / download / contribute guide (`apps/web`)
3. **CLI + MCP** — skill package managers only (`search` / `install` / `update` / `list`); CLI for humans, MCP stdio tools for agents — shared core, no LLMs

**Not** a hosted analysis chatbot. **Not** a CLI/MCP that calls LLMs. Analysis runs in the **user’s** coding agent.

Primary users: knowledge workers already on Claude Code, Cursor, Codex, Grok, etc.

Remote: https://github.com/Retr0-rgb-lab/Openwisdom  
License: **MIT**

### Hard rules

1. **Agent-native analysis** — Never implement web chat / hosted sessions / `openwisdom run` that calls a model in v1 scope.
2. **One content truth** — Skills live under git `skills/` (when present). Site and CLI share a generated catalog index. **Do not** invent skill metadata only on the website.
3. **Heat is a side channel** — Install telemetry (web download + CLI/MCP install success) must not write into `SKILL.md`. Fail open: install works if stats API is down. Copy-command is funnel-only, not primary popularity.
4. **Layered content** — **Scenario skills** (workflows) cite **discipline references** (theory cards). Official vs community is provenance, not a second product.
5. **UI zh/en; skill body language = contributor** — Don’t force bilingual skill bodies.
6. **Design world = Overlay Atlas (logo-aligned)** — Field `#F8F9FA`, primary `#1C4BD1`, structure `#2E6975`, signal `#E69622`; logo at `apps/web/public/brand/logo.svg`. **`DESIGN.md`** wins over old copper Direction B. No purple AI-SaaS skin, no fake testimonials/metrics.
7. **Don’t fabricate** commercial claims, customers, install counts, or skill text that isn’t in repo.

### Truth sources (open only when needed)

| Need | File |
|------|------|
| **Doc map / task entry** | [`docs/知识库/00-索引.md`](./docs/知识库/00-索引.md) — **primary router for all deep topics** |
| Product truth (users, purpose, non-goals) | [`PRODUCT.md`](./PRODUCT.md) |
| Visual system tokens & bans | [`DESIGN.md`](./DESIGN.md) (Overlay Atlas; logo tokens) |
| Vision one-pager | [`docs/知识库/01-项目定位与愿景.md`](./docs/知识库/01-项目定位与愿景.md) |
| Product decisions log | [`docs/知识库/02-产品决策记录.md`](./docs/知识库/02-产品决策记录.md) |
| v1 scope checklist | [`docs/知识库/03-v1交付范围.md`](./docs/知识库/03-v1交付范围.md) |
| Experience maturity bar | [`docs/知识库/04-对标Impeccable与体验标准.md`](./docs/知识库/04-对标Impeccable与体验标准.md) |
| Repo status map | [`docs/知识库/05-系统现状与实现地图.md`](./docs/知识库/05-系统现状与实现地图.md) |
| Doc governance | [`docs/知识库/06-文档治理与规格分层.md`](./docs/知识库/06-文档治理与规格分层.md) |
| Architecture · IA · visual · skills · CLI · MCP · heat · handoff | **`docs/知识库/07`–`14`** (topic files; listed in `00-索引`) |

**Note:** `docs/specs/*` is **retired** as a primary authority. Do not treat live/archive specs as the first source of truth. Prefer knowledge-base topics + `PRODUCT.md` / `DESIGN.md` / code. Historical plans may remain under `docs/plans/` for execution trails only.

---

## L1 — Task router

1. Open [`docs/知识库/00-索引.md`](./docs/知识库/00-索引.md).  
2. Pick the task row; load **only** the linked knowledge-base topic (plus code paths when implementing).

| Task | Open next | Notes |
|------|-----------|--------|
| **Product / scope / “should we build X?”** | `PRODUCT.md` + `docs/知识库/02` + `03` | Prefer decisions already recorded (incl. D1 Handoff) |
| **Architecture / monorepo / catalog pipeline** | `00-索引` → topic **`07`–`14`** (arch / catalog) + `05` | Index-centric monorepo; status in `05` |
| **UI / visual / landing polish** | `DESIGN.md` + `00-索引` → visual topic in **`07`–`14`** | Logo-aligned Overlay Atlas; no copper primary |
| **New page / IA / nav** | `00-索引` → IA/routes topic in **`07`–`14`** | Home = Persuade; Skills = Operate+Read; Docs = Read |
| **Home page only** | `apps/web` home components + `PRODUCT` / `DESIGN` | Already implemented (see L2 Web) |
| **Skills catalog / detail / install pages** | `00-索引` → skills/web topic in **`07`–`14`** then `apps/web` | Implement under `apps/web` |
| **Author official skills / references** | `docs/知识库/03` + skills/handoff topics in **`07`–`14`** | Triad core; Handoff layer post-v1/v1.1 (D1) |
| **CLI install / providers** | `00-索引` → CLI topic in **`07`–`14`** + `05` | No LLM; interactive multi-harness; package manager only |
| **MCP install surface / core** | `00-索引` → MCP/core topic in **`07`–`14`** + `05` | Dual surface with CLI; no LLM; stdio tools only |
| **Telemetry / heat ranking** | `00-索引` → heat topic in **`07`–`14`** + `02` #11 | Third tier; fail-open; copy not on main rank |
| **Handoff / orientation pipeline / bundles** | `docs/知识库/02` §18 + handoff topic in **`07`–`14`** | D1: triad core + official handoff; catalog pipeline/bundles optional for discover/install |
| **i18n copy** | `apps/web/src/messages/{zh,en}/` | Keep parity between locales |
| **Impeccable design commands** | `PRODUCT.md` / `DESIGN.md` already present | Don’t re-init unless stale |

---

## L2 — Area guides

### Repo layout (current + planned)

```text
Openwisdom/
├── AGENTS.md                 ← you are here
├── PRODUCT.md                ← product truth (Impeccable)
├── DESIGN.md                 ← visual system Overlay Atlas (logo-aligned)
├── apps/web/                 ← Next.js 16 site (Home live)
├── docs/知识库/               ← primary truth: 00-index + 01–14 topics
├── docs/plans/               ← execution trails only (not product authority)
├── skills/                   ← official/ + community/ (as present in repo)
├── packages/                 ← cli, catalog, schema, providers, core, mcp (as present)
└── package.json              ← monorepo root (as present)
```

**Doc authority:** `docs/知识库/` (+ `PRODUCT.md` / `DESIGN.md`). **`docs/specs/*` is retired** — do not use as primary.  
**Home surface:** `/zh` and `/en` 6-beat Persuade, Overlay Atlas tokens, logo chrome. Status detail: knowledge-base `05`.

### Web (`apps/web`)

| Item | Detail |
|------|--------|
| Stack | Next.js 16 App Router, React 19, Tailwind 4, TypeScript, shadcn/ui (base-nova), motion |
| Locales | next-intl v4: `/zh`, `/en`; middleware prefixes missing locale; default `zh` |
| i18n wiring | `src/i18n/{routing,request,navigation}.ts`; internal links via `@/i18n/navigation` only |
| Copy | `src/messages/{zh,en}/shell.json` (chrome) + `{zh,en}/home.json` (home), namespaced `shell`/`home` |
| Design tokens | `src/app/globals.css` (logo-aligned `--ow-*` + shadcn; `DESIGN.md`), fonts in `src/lib/fonts.ts` |
| Logo | `public/brand/logo.svg` |
| Home | `src/components/home/*` (6 beats) + `src/app/[locale]/page.tsx` |
| Shell | `src/components/site/*`, `src/components/ui/*` (shadcn) |
| Bits (MUST/MAY) | `src/components/bits/*` — DotField, BlurText, Noise, LogoLoop, Reveal, SpotlightCard |
| Install snippet | `src/components/install/InstallCommand.tsx` (Tabs CLI \| GitHub \| Manual + Sonner) |

**Commands:**

```bash
cd apps/web
pnpm dev      # http://localhost:3000 → /zh
pnpm build
pnpm lint
```

**When adding a page:** follow IA topic in `docs/知识库/07`–`14` (via `00-索引`); reuse `SiteHeader` / `SiteFooter`; add strings to **both** message files; keep **logo-aligned** Overlay Atlas tokens (`primary` / `structure` / `signal`)—no copper primary, no purple gradient brand.

**Secondary routes** (`/skills`, `/install`, `/docs`, `/contribute`) may be linked from Home but empty—prefer implementing stubs over leaving broken UX if you touch nav.

### Skills content (when `skills/` exists)

- Unit: directory with `SKILL.md` (+ optional assets).
- Layers: `scenario` | `reference`; scope: `official` | `community`.
- Official orientation core (v1): `macro-scan`, `personal-anchor`, `metacognition-audit`.
- Official Handoff layer (post-v1 / v1.1, D1): `responsibility-scope`, `responsibility-bridge`, `analysis-closure`.
- Disciplines (seven peer UI/catalog ids): psychology, sociology, history, political-science, economics, philosophy, education.
- Frontmatter validated by `packages/schema`; catalog build feeds web + CLI + MCP.
- Details: skills/handoff topics in `docs/知识库/07`–`14` + `02` §18.

### CLI + MCP (install surfaces)

Dual package-manager surfaces (**no LLM**, no analysis runners)—same catalog/install semantics, two adapters:

| Surface | Role | Authority | Package |
|---------|------|-----------|---------|
| **CLI** | Human terminal; interactive multi-harness | Knowledge-base CLI topic (`07`–`14`) + `05` | `packages/cli` |
| **MCP** | Agent session tools over **stdio** | Knowledge-base MCP topic (`07`–`14`) + `05` | `packages/mcp` |
| **Core** | Shared non-interactive search / list / install / update / telemetry | Knowledge-base core/catalog topics + `05` | `packages/core` |

- Skilldex-style *two interfaces, one core*: install/catalog in `packages/core`; CLI and MCP are thin adapters only.
- CLI: multi-provider interactive install; non-interactive flags for scripts; `--no-telemetry` / CI off.
- MCP: non-interactive tools; explicit providers; telemetry `source: "mcp"`; no TTY prompts; stdout reserved for protocol.
- Optional catalog `pipeline` / `bundles` for discover/combine-install only.
- Do not add model API keys, hosted sessions, or `run` / analyze / recommend tools.

### Design / Impeccable

- World: **Overlay Atlas** — logo-aligned tokens (`DESIGN.md` authority for visual work).
- Logo asset: `apps/web/public/brand/logo.svg`.
- Home mode: **Persuade** (+ Read), ≤6 beats. Catalog: **Operate** + Read.
- Motion: still content default; one-shot entrances; tool feedback; respect reduced motion; Bits MUST/MAY only.
- Ban list summary: purple/cyan AI glow, glassmorphism, nested cards, fake social proof, Inter-as-brand face, copper as primary CTA.

---

## L3 — Deep / optional

Only if you must audit history or research trail:

| Doc | Why |
|-----|-----|
| `docs/plans/*` | Dated execution plans/reports (not product authority) |
| `docs/知识库/04-对标Impeccable与体验标准.md` | Maturity bar vs impeccable.style |
| `apps/web/.impeccable-home-surface.md` | Home surface brief notes |
| Retired `docs/specs/*` (if still on disk) | Historical only — **not** primary truth |

---

## Working agreements for agents

1. **Prefer edit over reinvent** — extend existing tokens, messages, and components.
2. **One PR-sized concern** — don’t silently scaffold the entire monorepo unless asked.
3. **Confirm before destructive git / force-push / remote publish.**
4. **Label synthetic data** if you mock catalog stats or skill bodies in UI demos.
5. **After substantial UI** — keep zh/en strings in sync; run `pnpm build` in `apps/web`.
6. **If PRODUCT and another doc conflict** — PRODUCT + decision log (`02`) win for product scope; `DESIGN.md` wins for visual tokens (logo Overlay Atlas over old copper Direction B) unless the user reopens direction. Knowledge-base topics beat retired `docs/specs/*`.

---

## Quick “where do I start?”

| You want to… | Start here |
|--------------|------------|
| Understand the product in 2 minutes | L0 + `PRODUCT.md` |
| Find any deep topic | [`docs/知识库/00-索引.md`](./docs/知识库/00-索引.md) → **`07`–`14`** |
| Ship the next website page | L1 UI/IA rows + `apps/web` |
| Design / rebrand | Stop → `DESIGN.md` + visual topic in **`07`–`14`** |
| Build CLI | L1 CLI row + hard rule #1 + `05` |
| Build MCP / extract core | L1 MCP row + hard rule #1 + `05` |
| Add a skill | `03` + skills/handoff topics in **`07`–`14`**; triad core, Handoff D1 |
| Change install heat | Heat topic in **`07`–`14`** + `02` #11 |

---

*Last aligned: knowledge-base primary (`00` + `01`–`14`); `docs/specs/*` retired as authority; Home 6-beat + Overlay Atlas under `apps/web`; D1 Handoff layer recorded in `02`. Update this map when major surfaces land.*
