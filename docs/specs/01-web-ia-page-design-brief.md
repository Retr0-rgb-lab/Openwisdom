# Openwisdom Web — Information Architecture & Page Design Brief (v1)

> **Status:** Design brief for implementation  
> **Scope:** Skills catalog + product landing (not in-browser AI chat)  
> **Home IA:** Option C — narrative landing + primary nav Skills catalog  
> **Aligned with:** `docs/知识库/01–04` product decisions  
> **Experience bar:** maturity of [impeccable.style](https://impeccable.style/), not its domain  

---

## 1. Research synthesis: comparable sites & page lists

### 1.1 Product-landing skill sites (Impeccable archetype)

| Site | Role | Observed / typical pages |
|------|------|---------------------------|
| [impeccable.style](https://impeccable.style/) | Single skill product + high-finish marketing site | `/` narrative home, `/docs` command index, `/docs/{command}`, `/tutorials/getting-started`, `/designing`, `/changelog`, `/faq`, `/research`, `/detector`, `/slop`, case pages (`/neo-mirai`, `/cases/...`), install CTA blocks (npx / plugin / skills.sh) |
| npm package pages | Install trust + README | Package header (name, version, weekly downloads), tabs (Readme / Code / Dependencies / Versions), sidebar (install cmd, repo, license, keywords) |

**Patterns to absorb**

- One-command install above the fold (`npx …`)
- Multi-harness logo strip (Cursor, Claude Code, Codex, Copilot, Gemini, Grok Build…)
- Capability demos that do **not** require live LLM (before/after, flow diagrams, sample outputs)
- Docs as command/skill reference, not blog-first
- FAQ for harness-specific “where do files go?” pain

**Patterns to reject for Openwisdom**

- Live browser design iteration, Worlds/dice, Pro paywall narrative
- “One skill / many slash commands” as the only IA
- Design-slop visual skin and marketing tone

### 1.2 Skill marketplaces & hubs

| Site | Role | Observed / typical pages |
|------|------|---------------------------|
| [skills.sh](https://www.skills.sh/) | Ecosystem directory + CLI | Home/leaderboard, search, skill detail by `/{owner}/{repo}/{skill}`, agent compatibility pages `/agent/{name}`, trending/hot views |
| [mdskills.ai](https://www.mdskills.ai/) | Broad marketplace | `/`, `/skills` (filters + sort), `/skills/{slug}`, `/plugins`, `/mcp-servers`, `/submit`, `/specs/skill-md`, `/about`, `/learn/*` blog, category query params |
| [awesomeskill.ai](https://awesomeskill.ai/) | Curated SKILL.md browser | `/`, `/search`, `/skill/{id}`, `/category/{slug}`, featured filters |
| [mcpservers.org/agent-skills](https://mcpservers.org/agent-skills) | Curated library | Category sections, official author hubs, `/agent-skills/{author}/{slug}`, official vs community tags |

**Patterns to absorb**

- Catalog-first discovery with search + facets
- Skill card: name, one-line summary, tags, official/featured badge, install/downloads
- Detail: install one-liner, platforms, related items, source link
- Submit/contribute path (for Openwisdom: GitHub PR, not upload backend)

### 1.3 Registry / component catalog (shadcn archetype)

| Site | Role | Patterns |
|------|------|----------|
| [ui.shadcn.com](https://ui.shadcn.com/docs) | Docs + CLI distribution | Sidebar docs tree, CLI copy blocks, registry directory of community sources |
| [registry.directory](https://registry.directory/) | Multi-registry explorer | Search registries, cards, external deep links |

**Patterns to absorb**

- CLI copy as primary CTA (not “Sign up”)
- Namespaced items + machine-readable index for install
- Directory vs single product: Openwisdom is **own catalog of official + community**, not a global skills.sh clone

### 1.4 Bilingual (zh/EN) product + docs sites

Common IA for Chinese/English open-source product sites:

| Pattern | Recommendation for Openwisdom |
|---------|-------------------------------|
| Locale prefix | Prefer `/zh/...` and `/en/...` (or default locale without prefix + alternate) — **recommend prefix both for parity** |
| UI vs content language | UI fully bilingual; skill body language follows contributor (`lang` metadata) |
| Language switcher | Persist preference; swap locale on same logical page (hrefLang) |
| Docs | Shared doc tree; each page has `zh` + `en` UI chrome; doc body translated for core docs only |
| SEO | `hreflang`, canonical per locale, localized titles/descriptions |

### 1.5 Competitor page inventory → Openwisdom mapping

| Common page | Impeccable | Marketplaces | Openwisdom v1 |
|-------------|------------|--------------|---------------|
| Narrative home | ✓ | sometimes | ✓ (default `/`) |
| Full catalog | soft (docs commands) | ✓ | ✓ `/skills` primary nav |
| Item detail | `/docs/{cmd}` | `/skill(s)/{slug}` | `/skills/{slug}` (+ references) |
| Getting started | ✓ | partial | ✓ |
| Specs / authoring | light | ✓ | ✓ skill & reference specs |
| Contribute / submit | GitHub | form/submit | Contribute page → GitHub PR |
| FAQ / Changelog | ✓ | rare | ✓ |
| Blog / research | optional | often | **optional / out of v1 core** |
| Account / chat | no | rare | **out of scope** |

---

## 2. Product IA principles (Openwisdom-specific)

1. **Dual mental model (Decision C)**  
   - Landing = “what is this & why install”  
   - Skills catalog = “library of scenario skills + discipline references”

2. **Layered content model (Decision D)**  
   - **Scenario skills** (macro-scan, personal-anchor, metacognition-audit): runnable workflows  
   - **Discipline references** (psych, socio, history, poli-sci, econ): theory/method cards cited by scenarios  

3. **Trust layers**  
   - `official` vs `community` badges and filters  
   - GitHub as source of truth; site is discovery + install surface  

4. **Install is the conversion**  
   - Primary: CLI (`npx openwisdom …` — final package name TBD)  
   - Secondary: GitHub clone / release zip / per-item download  
   - Never promise in-browser analysis  

5. **Bilingual UI, multilingual content**  
   - Chrome: zh / en  
   - Bodies: tagged by `contentLang`; no hard requirement for dual full text in v1  

6. **Not a global skills marketplace**  
   - Curated Openwisdom universe first; community grows inside repo norms  
   - Avoid leaderboard-of-everything noise unless later scoped  

---

## 3. Complete sitemap (v1)

Locales: every route below exists under `/{locale}/…` where `locale ∈ {zh, en}`.  
Default redirect: `/` → preferred locale (browser / cookie / `Accept-Language`, fallback `zh` or `en` — product choice: **recommend `zh` if CN-first, else detect**).

```
/{locale}/                              # Narrative landing (Home)
/{locale}/skills                        # Skills catalog (library hub)
/{locale}/skills/{slug}                 # Skill or reference detail (unified type)
/{locale}/skills/scenarios              # Optional filtered view (or query only)
/{locale}/skills/references             # Optional filtered view (or query only)
/{locale}/disciplines                   # Discipline hub (5 fields)
/{locale}/disciplines/{discipline}      # Psychology | Sociology | History | PoliSci | Econ

/{locale}/install                       # Install hub (CLI + manual + multi-agent)
/{locale}/download                      # Download hub (zips / releases) — can merge into /install

/{locale}/docs                          # Docs home
/{locale}/docs/getting-started
/{locale}/docs/concepts                 # Scenario vs reference, how analysis runs in your agent
/{locale}/docs/cli                      # CLI reference (search/install/update/list)
/{locale}/docs/agents                   # Harness compatibility matrix
/{locale}/docs/skill-spec               # Authoring: scenario skill
/{locale}/docs/reference-spec           # Authoring: discipline reference
/{locale}/docs/metadata                 # Frontmatter / catalog schema
/{locale}/docs/faq
/{locale}/docs/changelog                # or top-level /changelog

/{locale}/contribute                    # Contribute hub (PR path)
/{locale}/about                         # Mission, non-goals, team/credits (short)
/{locale}/license                       # or link to GitHub LICENSE only

# System / utility
/{locale}/404                           # Localized not found
/sitemap.xml
/robots.txt
/opengraph-image (per key routes)
```

### 3.1 v1 must-ship vs nice-to-have

| Priority | Routes |
|----------|--------|
| **P0 must** | Home, Skills catalog, Skill/reference detail, Install, Docs home + getting-started + FAQ, Contribute, About (short), 404, locale switch |
| **P0 content-backed** | 3 scenario details, ≥1 reference per discipline with real cards, CLI docs skeleton |
| **P1 recommended** | Disciplines hub + discipline pages, CLI full reference, skill/reference specs, changelog, download section |
| **P2 later** | Blog/essays, research pages, author profiles, collections/playlists, in-site comparison tables, global marketplace features |

### 3.2 Explicit non-pages (v1)

- In-app chat / analysis workspace  
- User accounts, favorites cloud sync  
- Web upload + moderation console  
- Pricing / Pro  
- Separate “Plugins” and “MCP” taxonomies (unless a skill legitimately needs a note)

---

## 4. Page-by-page design brief

Conventions used below:

- **Primary CTA** = install path  
- **Secondary CTA** = browse catalog / read docs / contribute  
- **Empty states** designed, not bare text  

---

### 4.1 Home — `/{locale}/`

| | |
|--|--|
| **Purpose** | Convert a stranger in ~60s: what Openwisdom is, why it matters, how to install, what the three scenarios do; hand off to catalog. |
| **Primary user jobs** | Understand product; install official skills; jump to catalog; trust open-source + multi-agent. |
| **Key sections / modules** | 1) **Hero** — one-liner (macro analysis / historical anchor / metacognition) + primary install cmd + “Browse skills” 2) **Harness strip** — agent logos 3) **Three scenarios** — cards with problem → flow teaser → link to detail 4) **Layer model** — scenario skills cite discipline references (diagram) 5) **Disciplines strip** — 5 fields → discipline filters 6) **Install paths** — CLI preferred; GitHub / zip secondary 7) **Official vs community** — trust model 8) **Social proof / principles** — open source, no hosted chat, analysis in your agent 9) **Contribute teaser** 10) **Final CTA** — install + catalog |
| **CTAs** | Primary: copy `npx openwisdom install …` (or “Get started → /install”). Secondary: Skills, Docs, GitHub. |
| **Empty / edge** | If catalog index fails: show static three scenarios + GitHub link; banner “catalog temporarily unavailable”. |
| **SEO** | Title: “Openwisdom — Social-science agent skills for macro analysis, personal anchors & metacognition”. Localized. OG with brand + three pillars. |

**Home content notes (zh/en)**

- Avoid empty AI-SaaS hero (“Unlock your potential”).  
- Visual POV: wisdom / strata / coordinates / anchors — not purple glow SaaS.  

---

### 4.2 Skills catalog — `/{locale}/skills`

| | |
|--|--|
| **Purpose** | Library hub: discover, filter, search, open details. Primary nav destination. |
| **Primary user jobs** | Find a scenario skill; browse references by discipline; filter official; search by name/tag; start install from card. |
| **Key sections / modules** | 1) **Page header** — title, count of results, short blurb 2) **Search** — sticky on desktop 3) **Facet sidebar / chips** — layer, discipline, source, content language, tags 4) **Active filter chips** + clear all 5) **Sort** — featured/official first, name, recently updated 6) **View toggle** — grid (default) / compact list 7) **Results grid** — skill cards 8) **Optional sections above fold** — “Featured scenarios” row when no query 9) **Pagination or infinite** — prefer numbered pages for SEO |
| **Card fields** | Icon/glyph, title, layer badge (Scenario / Reference), official\|community, disciplines, contentLang, 1–2 line summary, tags (max 3+), “Copy install” icon, open detail. |
| **CTAs** | Per card: open detail; quick copy install. Header: Install all official / Getting started. |
| **Empty states** | **No results:** illustration + “Clear filters” + suggest three scenarios + contribute link. **Community empty:** when filter=community and none, explain PR path. **Search zero:** show spelling hint + popular tags. |
| **Loading** | Skeleton cards; keep facets interactive. |
| **Error** | Retry + GitHub raw index link. |
| **SEO** | Indexable list with query-less canonical; faceted URLs either noindex or carefully canonicalized (see §7). Title: “Skills catalog · Openwisdom”. |

**Default query on first visit (optional product choice)**

- Show all, with “Featured: 3 scenarios” pin at top; or default filter `source=official`.  
- **Recommend:** no hard filter; pin featured scenarios; default sort `featured`.

---

### 4.3 Skill / reference detail — `/{locale}/skills/{slug}`

Unified template; layout branches on `layer: scenario | reference`.

| | |
|--|--|
| **Purpose** | Evaluate fit, understand when to use, install/download, see related references/skills. |
| **Primary user jobs** | Decide to install; copy correct CLI; download files; understand workflow or theory; jump to related. |

**Shared modules**

1. Breadcrumb: Skills → [Discipline?] → Title  
2. Header: title, layer badge, official/community, contentLang, version/updated, tags  
3. Sticky **Install bar** (desktop): CLI one-liner + copy; secondary Download / View on GitHub  
4. Summary (metadata description)  
5. Long body (markdown from SKILL.md / reference md)  
6. Metadata panel: id, path in repo, disciplines, related tags, license  
7. Related: scenarios that cite this reference / references cited by this scenario  
8. Contribute correction link (GitHub edit/issue)

**Scenario-specific modules**

- When to use / when not  
- Step flow (numbered)  
- Output structure preview (example report skeleton)  
- Bias / metacognition checkpoints  
- Cited references (cards linking into catalog)

**Reference-specific modules**

- Definition / core claims  
- Applicability boundaries  
- Common misuses  
- Guiding questions  
- “Used by scenarios” list  

| | |
|--|--|
| **CTAs** | Copy install; install via docs deep link; download zip of this item or monorepo path; GitHub. |
| **Empty** | Related empty → hide section. Missing body → show metadata + raw GitHub. |
| **SEO** | Unique title `{Name} · {Scenario\|Reference} · Openwisdom`. JSON-LD `SoftwareApplication` or `TechArticle`. Canonical per locale. |

**URL note:** Prefer single `/skills/{slug}` with type in metadata over separate `/references/{slug}` to simplify CLI and search; optional redirects from `/references/{slug}` if desired.

---

### 4.4 Disciplines hub — `/{locale}/disciplines` (P1)

| | |
|--|--|
| **Purpose** | Orient users who think in fields, not product scenarios. |
| **Jobs** | Pick a discipline → see references + related scenarios. |
| **Sections** | Intro; 5 discipline cards (counts of official references); how references compose with scenarios. |
| **CTAs** | Enter discipline; browse all references. |
| **Empty** | Discipline with zero refs: “Coming soon” + contribute. |
| **SEO** | Strong for zh academic keywords (心理学 理论卡片 等). |

### 4.5 Discipline page — `/{locale}/disciplines/{discipline}`

| | |
|--|--|
| **Purpose** | Filtered library for one field. |
| **Jobs** | Browse references; see which scenarios use this field. |
| **Sections** | Discipline intro (short); reference grid (reuse catalog cards); “Scenarios that use these frameworks”; install discipline pack if CLI supports batch later (v1: multi-select message only). |
| **CTAs** | Open reference; filter catalog pre-filled. |
| **SEO** | `/{locale}/disciplines/psychology` etc.; bilingual slugs policy in §6. |

**Discipline slug map (suggested)**

| slug | en | zh label |
|------|----|----------|
| `psychology` | Psychology | 心理学 |
| `sociology` | Sociology | 社会学 |
| `history` | History | 历史学 |
| `political-science` | Political science | 政治学 |
| `economics` | Economics | 经济学 |

---

### 4.6 Install hub — `/{locale}/install`

| | |
|--|--|
| **Purpose** | Single best place for all install paths (Impeccable “Get started” density). |
| **Jobs** | Install via CLI; choose agents; project vs global; update; manual zip; troubleshoot link to FAQ. |
| **Sections** | 1) Recommended: interactive CLI 2) One-liners for common cases (official scenarios pack) 3) Alternative: `npx skills add …` if published 4) Manual: GitHub clone / release zip / copy folders 5) Harness matrix (where files land) 6) Verify install (what user should see in agent) 7) Update 8) Link FAQ |
| **CTAs** | Copy commands; deep link docs/cli; download release. |
| **Empty / edge** | Unsupported agent: “manual path + contribute provider request issue”. |
| **SEO** | High intent “install openwisdom skill”. |

### 4.7 Download — can be a section of Install or `/{locale}/download`

| | |
|--|--|
| **Purpose** | Users who refuse CLI or offline. |
| **Sections** | Latest release assets; “official scenarios zip”; full monorepo; checksums if available; GitHub Releases link. |
| **Empty** | No release yet → clone instructions. |

---

### 4.8 Docs home — `/{locale}/docs`

| | |
|--|--|
| **Purpose** | Orientation into documentation tree. |
| **Sections** | Search docs (optional v1); cards: Getting started, Concepts, CLI, Agents, Specs, FAQ; last changelog highlight. |
| **Layout** | Docs chrome: left sidebar tree, right TOC on article pages. |
| **SEO** | Docs index. |

### 4.9 Getting started — `/{locale}/docs/getting-started`

| | |
|--|--|
| **Purpose** | 5–10 minute path: install → first scenario → first output in user’s agent. |
| **Jobs** | First success without reading full specs. |
| **Sections** | Prerequisites (Node, an agent); install; pick macro-scan (example); how to invoke in Claude/Cursor/Codex; what good output looks like; next: personal-anchor / metacognition; contribute. |
| **CTAs** | Install; open macro-scan detail; FAQ. |
| **Empty N/A** | |

### 4.10 Concepts — `/{locale}/docs/concepts`

| | |
|--|--|
| **Purpose** | Teach layered model & runtime boundary. |
| **Sections** | Scenario vs reference; official vs community; “analysis runs in your agent”; content language policy; how citations work. |

### 4.11 CLI reference — `/{locale}/docs/cli`

| | |
|--|--|
| **Purpose** | Command reference for package manager. |
| **Sections** | `search`, `install`, `update`, `list`; flags (providers, scope, -y); exit codes; examples; non-goals (no `run`). |
| **SEO** | CLI users from search. |

### 4.12 Agents compatibility — `/{locale}/docs/agents`

| | |
|--|--|
| **Purpose** | Reduce “files not showing up” support load (Impeccable FAQ pattern). |
| **Sections** | Matrix of agents × paths × notes (Cursor nightly, Codex `$skill`, etc.); restart tips. |

### 4.13 Skill spec / Reference spec / Metadata — docs

| | |
|--|--|
| **Purpose** | Contributor quality bar. |
| **Sections** | Required frontmatter; folder layout; examples; review checklist; official vs community bar. |
| **CTAs** | Contribute page; GitHub template. |

### 4.14 FAQ — `/{locale}/docs/faq`

| | |
|--|--|
| **Purpose** | Deep-linkable answers (Impeccable FAQ style). |
| **Topics (seed)** | Is there a web chat? (No.) Does CLI call models? (No.) Where do files go? How to update? Official vs community? Content only in Chinese/English? License? How to uninstall? Why skill not appearing? |
| **SEO** | FAQPage schema optional. |

### 4.15 Changelog — `/{locale}/docs/changelog` or `/{locale}/changelog`

| | |
|--|--|
| **Purpose** | Version narrative for skills + CLI + site. |
| **Sections** | Reverse chrono releases; link GitHub releases. |
| **Empty** | “Initial public release coming soon” with repo commits link. |

---

### 4.16 Contribute — `/{locale}/contribute`

| | |
|--|--|
| **Purpose** | Convert readers into PR authors; no upload backend. |
| **Jobs** | Choose scenario vs reference; follow template; open PR to `community/`. |
| **Sections** | 1) Why contribute 2) Path: fork → template → PR 3) Quality bar 4) Official promotion path (rare) 5) Links: skill-spec, reference-spec, issue/PR templates 6) Code of conduct / license note |
| **CTAs** | “Open skill template”, “Open reference template”, “View open issues”. |
| **Empty N/A** | Community catalog empty: this page is the remedy. |
| **SEO** | “Contribute Openwisdom skills”. |

### 4.17 About — `/{locale}/about`

| | |
|--|--|
| **Purpose** | Mission, non-goals, credibility. |
| **Sections** | One-liner; problem (shallow AI analysis); solution (structured social-science skills); non-goals table; open source; contact/GitHub. |
| **SEO** | Brand queries. |

### 4.18 System: 404

| | |
|--|--|
| **Purpose** | Recover lost users. |
| **Modules** | Message; search skills; links Home / Skills / Install / GitHub. |
| **Tone** | On-brand, bilingual. |

---

## 5. Navigation structure

### 5.1 Header (desktop)

```
[Logo Openwisdom]   Skills   Disciplines   Install   Docs   Contribute     [Search] [ZH|EN] [GitHub]
```

| Item | Target | Notes |
|------|--------|-------|
| Logo | `/{locale}/` | |
| **Skills** | `/{locale}/skills` | Primary; active state on catalog + detail |
| Disciplines | `/{locale}/disciplines` | P1; can be dropdown of 5 disciplines |
| Install | `/{locale}/install` | High conversion |
| Docs | `/{locale}/docs` | Dropdown optional: Getting started, CLI, FAQ |
| Contribute | `/{locale}/contribute` | |
| Search | Opens command palette or focuses catalog search | Global: jump to skill by name |
| Language | Toggle zh/en same path | Persist preference |
| GitHub | External repo | Icon button |

**Header CTA (optional right):** button “Install” → `/install` (duplicate of nav OK if visually primary).

**Mobile header**

- Logo | Search | Lang | Hamburger  
- Drawer: full nav + Install CTA + GitHub  

### 5.2 Footer

```
Openwisdom — short tagline

Product          Resources         Community        Legal
Home             Getting started   GitHub           License
Skills           CLI docs          Contribute       (Privacy if any)
Disciplines      FAQ               Issues           
Install          Changelog         Discussions*     

© year  ·  UI: 中文 | English  ·  Open source
```

\*Discussions only if repo enables them.

Footer should repeat harness/compatibility one-liner and “Analysis runs in your agent — not in this website.”

### 5.3 Docs sub-nav (left sidebar)

```
Getting started
Concepts
CLI
Agents
Authoring
  Skill spec
  Reference spec
  Metadata schema
FAQ
Changelog
```

### 5.4 Secondary / contextual nav

- Skill detail: tabs or anchors — Overview | How to use | Install | Related  
- Catalog: facets as left rail (≥ md); top chips on mobile  

---

## 6. Content types & URL schemes

### 6.1 Content types

| Type | Description | Source of truth | Site representation |
|------|-------------|-----------------|---------------------|
| `scenario_skill` | Runnable multi-step skill | `official/skills/...` or `community/...` | Catalog + detail |
| `reference` | Theory/method card | `official/references/{discipline}/...` | Catalog + detail + discipline pages |
| `discipline` | Taxonomy node | Config enum | Hub pages |
| `doc` | Product documentation | `web` content or `docs/` mdx | Docs tree |
| `release` | Version notes / artifacts | GitHub Releases + changelog md | Changelog / download |
| `ui_string` | Chrome copy | i18n message catalogs | All pages |

### 6.2 Skill / reference metadata (catalog index)

Minimum fields for filters, SEO, install:

```yaml
id: macro-scan                 # stable id
slug: macro-scan               # URL slug
layer: scenario                # scenario | reference
source: official               # official | community
disciplines: []                # for scenario: multi; for reference: one primary
title:                         # display; may be locale-specific keys
  zh: 宏观扫描
  en: Macro Scan
summary:
  zh: ...
  en: ...
contentLang: zh                # primary body language
tags: [macro, systems, bias]
version: 0.1.0
updated: 2026-07-29
repoPath: official/skills/macro-scan
install:
  cli: openwisdom install macro-scan
  # or: npx openwisdom install macro-scan
related: [prospect-theory, elite-theory]
# references only:
# citedByScenarios: [macro-scan]
```

### 6.3 URL scheme

**Recommended (locale-prefixed, flat skills)**

```
/{locale}/skills/{slug}
```

Examples:

- `/zh/skills/macro-scan`  
- `/en/skills/macro-scan`  
- `/zh/skills/prospect-theory`  
- `/en/disciplines/psychology`  

**Query params for catalog (shareable filters)**

```
/{locale}/skills?layer=scenario
/{locale}/skills?layer=reference&discipline=psychology
/{locale}/skills?source=official
/{locale}/skills?q=锚点
/{locale}/skills?lang=zh&sort=updated
```

**Locale strategy**

| Option | Pros | Cons |
|--------|------|------|
| A. Prefix both `/zh` `/en` | Clear, SEO parity | Slightly longer URLs |
| B. Default no prefix + `/en` | Shorter default | Asymmetry |

**Recommend A** for bilingual product clarity.

**Slug language:** use **English kebab-case ids** for stability (`personal-anchor`, `political-science`); titles localize. Avoid duplicate zh/en slugs.

### 6.4 Install command surface (examples; final CLI names TBD)

```bash
npx openwisdom install                  # interactive: pick skills + agents
npx openwisdom install macro-scan
npx openwisdom install --official       # all official scenarios (+ refs?)
npx openwisdom search "metacognition"
npx openwisdom update
npx openwisdom list
```

Detail page always shows the **exact** command for that slug + “Install via UI walkthrough → /install”.

### 6.5 Download artifacts

| Artifact | Use |
|----------|-----|
| Per-skill folder zip | Rare; optional generate |
| Official pack zip | Scenarios + their references |
| Full repo | Power users |
| GitHub Release | Versioned source of download CTAs |

---

## 7. Filter / search UX patterns (catalog)

### 7.1 Facets (v1 required)

| Facet | Values | Control |
|-------|--------|---------|
| Layer | Scenario / Reference | Segmented control or multi checkbox |
| Source | Official / Community | Toggle chips |
| Discipline | 5 fields | Multi-select; refs usually single, scenarios multi-match |
| Content language | zh / en / other | Multi |
| Tags | free + curated | Searchable multi (P1) |

### 7.2 Search behavior

- Fields: title (zh+en), summary, tags, id/slug  
- Debounced instant filter (client) if index small; server if large  
- Highlight matches in cards  
- Keyboard: `/` focuses search (skills.sh / command-palette pattern)  
- Global header search: same index, Enter → catalog with `?q=` or direct navigate if unique slug match  

### 7.3 Sort

| Sort | When |
|------|------|
| Featured (default) | Official scenarios first, then official refs, then community |
| Name A–Z | Localized title for active UI locale |
| Recently updated | `updated` desc |

### 7.4 URL & SEO for facets

- Shareable query strings yes  
- **Canonical:** bare `/{locale}/skills` for main index  
- Optional: materialize important views as real paths (`/skills/scenarios`, `/disciplines/psychology`) that are indexable  
- Avoid infinite facet combinations as separate indexable pages  

### 7.5 Mobile filter UX

- “Filters” button → bottom sheet  
- Show active count badge  
- Apply / Reset  

### 7.6 Performance patterns

- Build-time static index JSON from monorepo (CI)  
- No runtime dependency on GitHub API for main browse path  
- Incremental regeneration on content merge  

### 7.7 Card & density

- Default **comfortable grid** (2–3 cols desktop)  
- Compact list for power users comparing many references  
- Official badge visual weight > community  

### 7.8 Patterns borrowed from comps

| Pattern | Source | Apply as |
|---------|--------|----------|
| Leaderboard / trending | skills.sh | **Not v1** (unless install metrics exist) |
| Category mega-sections | mdskills / mcpservers | Home + disciplines only; catalog uses facets |
| Featured row | mdskills | Pin 3 scenarios on catalog when `q` empty |
| CLI copy on card | shadcn / npm | Icon button; toast “Copied” |
| Registry directory | shadcn directory | Maps to official/community source facet, not multi-registry |

---

## 8. Cross-cutting UX states

| State | Guidance |
|-------|----------|
| Loading | Skeletons matching card/doc layout |
| Empty search | Clear filters + suggest scenarios + contribute |
| Empty community | Explain PR path; show official |
| Offline / index fail | Cached last index if PWA later; else error + GitHub |
| Copy success | Toast / inline checkmark 2s |
| Locale missing string | Fallback to other locale with subtle marker (dev only) or English |
| Long zh titles | Card clamp 2 lines; detail full |
| a11y | Focus rings, skip link, semantic headings, contrast, aria on filters |

---

## 9. SEO & content strategy (v1)

1. **Index:** Home, Skills index, each skill/reference detail, Getting started, Install, major docs, discipline pages.  
2. **hreflang** between zh/en pairs.  
3. **Titles:** `{Page} · Openwisdom` pattern; scenario pages include “agent skill”.  
4. **Descriptions:** from metadata summary.  
5. **Structured data:** Organization; SoftwareSourceCode/SoftwareApplication for project; optional FAQ.  
6. **OG images:** brand template with title + layer badge.  
7. **Do not** thin-door all filter combos.  
8. **Sitemap:** locales × indexable routes; details from catalog index.  

---

## 10. IA wireflow (primary journeys)

### J1 — First-time installer

```
Home → copy install / Install page → Getting started
    → open macro-scan detail → invoke in agent
```

### J2 — Library browser

```
Nav Skills → filter Reference + Psychology → open card
    → see citedBy scenarios → install reference or scenario
```

### J3 — Contributor

```
Contribute → Skill spec → GitHub template PR → appears under community after merge
    → catalog filter community
```

### J4 — Bilingual user

```
Land /zh → switch EN → same skills slug → titles/summaries follow UI locale when available
    → body remains contentLang with badge
```

---

## 11. Component inventory (web, high level)

| Component | Used on |
|-----------|---------|
| SiteHeader / SiteFooter | Global |
| LocaleSwitcher | Global |
| InstallCommand (copy) | Home, Install, Detail, Cards |
| HarnessLogoStrip | Home, Install, About |
| SkillCard | Catalog, Home, Discipline, Related |
| FacetPanel / FilterChips | Catalog |
| SearchInput | Catalog, Header |
| MarkdownBody | Detail, Docs |
| DocsSidebar / TOC | Docs |
| ScenarioFlowDiagram | Home, scenario detail |
| LayerModelDiagram | Home, Concepts |
| EmptyState | Catalog, sections |
| BadgeOfficial / BadgeCommunity / BadgeLayer | Cards, detail |
| DisciplinePill | Cards, filters |

---

## 12. Visual / content POV (constraints from product docs)

- Completion bar: side-by-side with impeccable.style should feel “serious product site,” not template.  
- Theme: social science / wisdom / historical depth / reflection — **not** design-slop detector aesthetic.  
- Avoid: generic purple gradients, empty glassmorphism, hollow growth copy.  
- Motion: restrained, meaningful (filter, copy, scroll section reveals).  
- Empty, loading, error: designed.  

---

## 13. v1 page checklist (implementation order)

1. i18n shell + header/footer + locale routing  
2. Home (narrative C)  
3. Catalog index + facets + search + cards  
4. Detail template (scenario + reference variants)  
5. Install hub  
6. Docs: getting-started, concepts, FAQ  
7. Contribute  
8. About + 404  
9. Disciplines hub/pages  
10. CLI + specs docs + changelog  
11. SEO (sitemap, hreflang, OG) + a11y pass  

---

## 14. Open decisions (do not block IA; resolve in design/impl)

| Topic | Options | Lean |
|-------|---------|------|
| Default locale | zh vs detect | Detect with `zh` fallback if CN-first audience |
| Package name | `openwisdom` vs scoped | Match npm availability |
| Catalog default sort | featured vs official-only filter | Featured, no hard filter |
| References in `/skills` vs `/references` | unified vs split | **Unified `/skills/{slug}`** |
| Download page | standalone vs Install section | Install section first |
| Global search | header palette vs catalog only | Header → catalog `?q=` in v1 |

---

## 15. Appendix — comparable page lists (quick reference)

### Impeccable-style product site
`/`, `/docs`, `/docs/*`, `/tutorials/getting-started`, `/faq`, `/changelog`, install CTAs, optional research/cases

### skills.sh / mdskills-style marketplace
`/`, `/skills`, `/skills/{id}`, categories/tags, submit, specs, agent list, optional blog

### Openwisdom hybrid (this brief)
**Impeccable maturity + install UX** × **marketplace catalog facets** × **own layered scenario/reference model** × **zh/en UI** × **GitHub PR contribute** — without hosted AI chat.

---

*End of brief. Align implementation with `docs/知识库/03-v1交付范围.md` acceptance checklist.*
