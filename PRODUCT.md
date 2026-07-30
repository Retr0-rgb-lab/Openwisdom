# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Knowledge workers who already use AI coding agents (Claude Code, Cursor, Codex, Grok Build, Gemini CLI, GitHub Copilot, and similar harnesses). They want structured social-science frameworks—not another chat product—to run **inside their own agent**: macro analysis of situations and systems, locating themselves in historical/social coordinates (“historical anchor”), and metacognition (exposing bias, blind spots, and evidence gaps).

**Secondary (served, not primary narrative):**
- Open-source contributors who add scenario skills or discipline reference cards via GitHub PR (`community/`).
- Readers who discover the catalog on the bilingual website and install later via CLI, download, or GitHub.

**Situation of use:** Terminal + agent session and/or browser catalog; analysis never requires an Openwisdom-hosted conversation. Install may be project-scoped or global across multiple harnesses on one machine.

## Product Purpose

Openwisdom is an **open-source social-science Agent Skills library** delivered as three coupled surfaces:

1. **GitHub repository** — source of truth for skills (`official/` + `community/`), specs, and contribution.
2. **Bilingual catalog website** — discover, filter, search, detail, download, install guidance, contribute path; product-grade finish (maturity bar inspired by impeccable.style’s craft, not its domain).
3. **Openwisdom CLI** — package manager (`search` / `install` / `update` / `list`) that installs skills into the user’s chosen coding agents interactively (Impeccable-like multi-provider flow). **Does not call models or run analysis.**

**Why it exists:** Give people durable, composable social-science method (psychology, sociology, history, political science, economics) as agent skills so AI-assisted thinking is structured, situated, and self-critical—not generic vibes.

**Success (v1 intuition):**
- A stranger understands the product in about a minute and can start install with one command.
- Official **three scenario skills** (macro-scan, personal-anchor, metacognition-audit) plus **official references across five disciplines** are browsable and installable.
- User completes a real analysis flow **in their own agent**.
- Contributors can PR into `community/` from web-guided GitHub workflow.
- Skill **install heat** (web download + successful CLI install) is visible; default sort remains editorial `featured`.

## Positioning

**Mechanism neighbors cannot truthfully copy as a single claim:** Openwisdom is not a design skill pack, not a general skills marketplace clone, and not a hosted social-science chatbot. It is a **layered social-science skill system**—**scenario workflows** that cite **discipline reference cards**—plus a **multi-agent installer** and a **bilingual open catalog** with official/community provenance, aimed at orientation in social and historical time (macro · anchor · metacognition).

Content language follows the contributor; **UI is zh/en**. Analysis runtime stays on the user’s agent and model budget.

## Operating Context

- **Discovery:** Website (narrative home + Skills library) or GitHub tree/releases.
- **Install:** Prefer `npx openwisdom …` (name subject to npm availability); alternatives: site zip download, manual copy from repo; optional ecosystem tools (e.g. generic skills installers) as secondary paths if layout stays compatible.
- **Run:** User invokes scenario skills inside their harness; references are loaded/cited per skill design—not by Openwisdom servers.
- **Contribute:** Fork → template → PR to `community/` (web Contribute page guides; no upload backend in v1).
- **Heat telemetry:** Anonymous events from successful web downloads and CLI installs; CLI opt-out (`--no-telemetry` / env); copy-install is funnel-only, not primary popularity rank.
- **Artifacts users care about:** `SKILL.md` trees, install commands, catalog filters (layer, discipline, language, official|community), docs (getting started, FAQ, authoring specs).

## Capabilities and Constraints

### Confirmed capabilities (v1 intent)

- Catalog site: home (IA option C), skills grid with facets, skill detail, install hub, docs skeleton, contribute, about; zh/en UI.
- Content model **D:** scenario skills + discipline references; official three scenarios; five disciplines with official reference depth (not empty taxonomy).
- CLI package manager only; multi-provider interactive install; non-interactive flags for scripts.
- Registry/index pipeline: skills git → `catalog.json` → web + CLI; machine-readable `/registry` style index.
- Install heat (third tier): web download + CLI install success; `sort=popular` optional; default `featured`.
- Open source on GitHub: https://github.com/Retr0-rgb-lab/Openwisdom

### Confirmed non-goals (v1)

- No in-browser AI analysis chat or Openwisdom-hosted sessions.
- No CLI LLM `run` / report generation.
- No user accounts, cloud favorites, or web direct-upload moderation backend.
- No forced bilingual body text per skill.
- No paid Pro / commercial paywall as v1 scope.
- Heat system must not require login or block install when telemetry fails.

### Terminology

| Term | Meaning |
|------|---------|
| Scenario skill | Runnable analysis workflow (e.g. macro-scan) |
| Reference | Theory/method card under a discipline |
| Official / community | Provenance and review bar, not a second product |
| Install heat | Aggregated successful installs/downloads (30d + total) |
| Harness / provider | Coding agent skill install target (`.claude`, `.cursor`, …) |

### Open decisions (do not invent)

- Final npm package name if `openwisdom` is unavailable.
- Exact stats store (e.g. Upstash/Vercel KV) implementation choice.
- Whether Disciplines hub pages are P0 or P1 (specs lean P1 strong).
- Docs engine: Fumadocs headless vs thin custom MDX (architecture recommends Fumadocs).
- Quantitative count of official references per discipline (principle fixed: enough to support scenarios).

## Brand Commitments

- **Name:** Openwisdom.
- **License:** **MIT** (confirmed for product record; LICENSE file to ship with repo).
- **Language product commitment:** Website UI Chinese and English; skill body language = contributor’s language; metadata must support discovery by language.
- **Experience bar:** Catalog and marketing craft should feel like a serious product site (impeccable.style-level density and finish as a **maturity bar**), themed for wisdom / social science / orientation—not generic AI-SaaS purple glow, not a clone of Impeccable’s design-slop brand.
- **Voice (strategic, not visual):** Calm, non-hype, evidence-aware; no “supercharge / unlock your potential” marketing voice. Prefer clarity about limits (analysis runs in your agent).
- **No other binding brand assets** yet (no locked logo file, slogan, or trademark pack beyond the name). Visual world is **out of scope for this file** (see design specs under `docs/specs/` as working design intent, not PRODUCT authority).

## Evidence on Hand

| Asset | Path / note |
|-------|-------------|
| Product decisions & vision | `docs/知识库/01–04` |
| Architecture, IA, visual direction, components, telemetry specs | `docs/specs/` (draft design specs; not a substitute for DESIGN.md) |
| Remote repo | https://github.com/Retr0-rgb-lab/Openwisdom (empty of app code at init time) |
| Runnable web app / CLI package | **Absent** at init—greenfield implementation |
| Logos, screenshots, testimonials, real install metrics | **None**—do not fabricate social proof or download numbers |
| Official skill bodies | **Not yet authored** in-repo—planned content, not shippable evidence |

## Product Principles

1. **Agent-native analysis** — Openwisdom ships method and packaging; the user’s agent and model do the thinking.
2. **Layered knowledge** — Scenarios do jobs; references are citable building blocks; official quality bar differs from community growth.
3. **One content truth** — Git skills tree is authoritative; site and CLI share one catalog index; heat is a side channel, never mutates skill source files.
4. **Install is the product handshake** — Multi-harness CLI and clear web install paths beat feature sprawl (chat, accounts, hosted AI).
5. **Orientation over hype** — Macro structure, historical anchor, and metacognition over engagement theater; heat ranks popularity, not truth.

## Accessibility & Inclusion

Public web v1 targets a **reasonable public baseline**, not a formal certification claim:

- Keyboard operable primary paths; visible focus; semantic headings and labels.
- Readable contrast for body and UI chrome on light-first (and dark if shipped) themes.
- Complete zh/en **UI** strings on primary journeys (no half-translated chrome).
- Respect `prefers-reduced-motion` for decorative motion.
- Telemetry and install must remain usable with assistive tech for core actions (copy, download, navigate catalog).

Explicit **WCAG 2.2 AA certification** is not a v1 product commitment unless later upgraded.
