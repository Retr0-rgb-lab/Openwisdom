# Architecture audit — apps/web (claim c6)

**Contract:** v001 · **Claim:** c6 · **Surface:** Next.js catalog site (`apps/web`)  
**Read scope:** `apps/web/src/**`, `apps/web/package.json`, `apps/web/scripts/**`  
**Write scope:** this report only (no product source edits)

---

## Scope

Read-only architecture review of the Openwisdom **bilingual catalog website** under `apps/web`:

| Area | Paths examined |
|------|----------------|
| App Router IA | `src/app/layout.tsx`, `src/app/[locale]/**`, `src/app/api/**`, `src/middleware.ts` |
| Catalog data layer | `src/data/catalog/**` (+ static import of `public/registry/catalog.json`) |
| i18n | `src/i18n/*`, `src/messages/{zh,en}/*`, next-intl middleware/plugin |
| Component layering | `src/components/{site,home,bits,ui,skills,docs,install}/**` |
| Heat APIs | `src/lib/heat/**`, `src/app/api/{stats,telemetry,skills/.../download}/route.ts` |
| Registry coupling | `registry-source.ts`, `load-registry.ts`, `lib/heat/skill-ids.ts` |
| Tooling | `package.json`, `scripts/*`, `next.config.ts` |

Out of scope: monorepo packages (except web’s soft dependency on `@openwisdom/schema`), skills tree authority beyond what web ships under `public/registry`, product-code changes.

Goal: map maintainability / performance / truth-source risks so later claims can refactor with evidence, without inventing new product scope.

---

## Findings

### Positive structure (baseline)

1. **Locale-first App Router** — All chrome and pages live under `src/app/[locale]/` with `localePrefix: "always"` (`src/i18n/routing.ts`). Middleware skips `api`, `_next`, and dotted static paths (`src/middleware.ts`), so heat APIs and `/registry/*` stay unprefixed. Locale layout owns shell (`SiteHeader` / `SiteFooter` / `SiteBackdrop` / Toaster) and injects full message namespaces via `NextIntlClientProvider` (`src/app/[locale]/layout.tsx`).

2. **Namespaced i18n messages** — `src/i18n/request.ts` loads `shell` / `home` / `skills` / `pages` in parallel from `messages/{locale}/*.json`. Internal links use `@/i18n/navigation` (not bare `next/link`) — correct next-intl pattern.

3. **Documented catalog merge order** — `src/data/catalog/index.ts` freezes SPE 37 steps: registry → bootstrap overlay → curated seeds → optional heat. Heat is a side channel only (`merge-heat.ts` never invents zeros). Soft schema gate in `load-registry.ts` fails open to lenient parse.

4. **Single registry JSON import** — Only `registry-source.ts` static-imports `public/registry/catalog.json`. Heat whitelist reuses `loadRegistrySkillsLenient` (`lib/heat/skill-ids.ts`) instead of a second import path.

5. **Heat product rules encoded** — Types separate installs* vs copies*; telemetry validates event/source/skillId (`validate.ts`); download + telemetry fail-open on store errors; copy CTA reports funnel-only `web_copy_install` from the browser client.

6. **Component taxonomy is mostly clear** — `ui/` = shadcn primitives; `bits/` = motion/texture with MUST/MAY table (`components/bits/README.md`); `site/` = chrome; `home/` / `skills/` / `docs/` / `install/` = surface domains.

---

### Findings by severity

#### P0 — critical correctness / product-rule breakage

_No P0 architecture defects found in the read slice._ Heat does not write skill bodies; install/stats fail open; site is not a hosted LLM analysis surface. Residual risks below are maintainability, performance, and operational correctness under scale.

#### P1 — high (drift, client cost, ops correctness)

| ID | Finding | Evidence paths |
|----|---------|----------------|
| **F1** | **Dual catalog truth inside the web app.** Machine install truth is `public/registry/catalog.json`; rich bilingual UI and many discovery rows live in large TypeScript seeds (`bootstrap.ts`, `REFERENCE_BOOTSTRAP`, `discipline-seed.ts` (~export at L679), `principle-seed`, `history-seed`, `philosophy-seed`, `external-seed`). Merge is careful but any seed/registry id skew produces silent UI vs install divergence. | `src/data/catalog/index.ts`, `registry-source.ts`, `bootstrap.ts`, `discipline-seed.ts`, `public/registry/catalog.json` |
| **F2** | **Full catalog merge graph is client-importable.** `"use client"` surfaces import `getCatalog` / `attachHeat` / filter helpers from `@/data/catalog`, which transitively pull static registry JSON + all seeds into the browser graph. `SkillsCatalog` still falls back to `getCatalog()` when `entries` is omitted; `GlobalSearch` always calls `getCatalog()`; `SkillDetail` calls `getSkillBySlug(ref)` for references. | `components/skills/SkillsCatalog.tsx` (~L523), `components/site/GlobalSearch.tsx` (~L217), `components/skills/SkillDetail.tsx` (~L22, ~L635), `data/catalog/index.ts` |
| **F3** | **SSR heat via self-HTTP, not in-process store.** `fetchStats()` resolves `OPENWISDOM_STATS_URL` / public site URL / `VERCEL_URL` / `http://127.0.0.1:3000/api/stats` and `fetch`es JSON. List/detail pages therefore depend on a network round-trip to their own API (and fail open to no heat at build/dev if the server is unreachable). Correct product behavior (no fake zeros) but weak architecture for co-located Node runtime. | `lib/heat/fetch-stats.ts`, `app/[locale]/skills/page.tsx`, `app/[locale]/skills/[slug]/page.tsx` |
| **F4** | **Rate limit is process-local memory only.** Telemetry uses Upstash when env is set, but `checkRateLimit` is always an in-memory sliding window (`globalThis.__owHeatRateLimit`). On multi-instance serverless this under-protects POST `/api/telemetry`. Comment acknowledges imperfect multi-instance behavior. | `lib/heat/rate-limit.ts`, `app/api/telemetry/route.ts`, `lib/heat/store.ts` |
| **F5** | **`getCatalog()` is pure recompute with no memo.** Detail page builds catalog twice (`getSkillBySlugWithHeat` + `getCatalogWithHeat`); client search rebuilds full merge on open/stats change. Cost grows with seed+registry size and static params (`generateStaticParams` already maps every slug × locale). | `data/catalog/index.ts` (`getCatalog`, `getSkillBySlug*`), `app/[locale]/skills/[slug]/page.tsx` |
| **F6** | **Registry → UI localization gap for non-overlaid skills.** `mapRegistryToEntry` sets `title`/`summary` to the same `name`/`description` string for both `zh` and `en`. Only bootstrap/seed overlays supply true bilingual fields. Community-heavy registry rows will look “translated” only by coincidence. | `data/catalog/registry-source.ts` (`mapRegistryToEntry`), overlay in `index.ts` |

#### P2 — medium / polish / layering debt

| ID | Finding | Evidence paths |
|----|---------|----------------|
| **F7** | **Root document `lang` is hardcoded `zh`.** Locale is resolved under `[locale]`, but `app/layout.tsx` always renders `<html lang="zh">`. English routes inherit wrong `lang` for a11y/SEO/hyphenation. | `src/app/layout.tsx` |
| **F8** | **Layering inversion: skills → home.** `SkillCard` / `SkillDetail` import `ScenarioShape` from `components/home/`. Shape glyphs are product-shared UI, not Home-only. | `components/skills/SkillCard.tsx`, `SkillDetail.tsx`, `components/home/ScenarioShape.tsx` |
| **F9** | **Orphan Home beats still shipped.** Home composition is six beats (`page.tsx` comment), but `InstallPaths`, `ContributeTeaser`, `LayerDiagram`, `Provenance`, `OrientationDiagram` remain under `components/home/` for “subpages” — easy to re-link or diverge from IA. | `app/[locale]/page.tsx`, `components/home/*` |
| **F10** | **Misplaced install re-export.** `components/install/DocsHome.tsx` is a deprecated re-export of docs hub — wrong domain folder. | `components/install/DocsHome.tsx` |
| **F11** | **Dual `attachHeat` surface.** Identical alias exists in `lib/heat/merge-heat.ts` and `data/catalog/index.ts`; catalog re-exports heat merge while GlobalSearch imports attachHeat from catalog. Mild confusion for new contributors. | `lib/heat/merge-heat.ts`, `data/catalog/index.ts`, `GlobalSearch.tsx` |
| **F12** | **Global heavy backdrop on every route.** Locale layout always mounts `SiteBackdrop` → ShapeGrid (bits MUST HEAVY). Non-home Operate/Read pages pay motion canvas cost by design; reduced-motion is handled but JS still loads. | `app/[locale]/layout.tsx`, `components/site/SiteBackdrop.tsx`, `bits/README.md` |
| **F13** | **IA: Install/About are second-class.** `NAV_ITEMS` intentionally omits `/install` (CTAs on Home/Skills); `/about` is still a placeholder. Routes exist for deep links but chrome does not advertise them. | `components/site/constants.ts`, `app/[locale]/install/page.tsx`, `about/page.tsx` |
| **F14** | **Quality scripts not in `package.json` test pipeline.** `scripts/audit-catalog-truth.mjs`, `heat-smoke.mjs`, card/toolbar checks, and `lib/heat/heat-smoke.test.ts` exist, but package scripts only expose `dev` / `build` / `start` / `lint`. Architecture quality gates are manual. | `apps/web/package.json`, `apps/web/scripts/*`, `src/lib/heat/heat-smoke.test.ts` |
| **F15** | **Download path probes many filesystem layouts.** Skill download tries env root, monorepo relatives, and packages snapshots before GitHub 302. Flexible for deploy shapes; fragile if cwd/deploy root changes (still fail-open to GitHub). | `app/api/skills/[skillId]/download/route.ts` |

---

### Architecture map (concise)

```text
Browser
  ├─ [locale] shell (site + bits backdrop)
  ├─ Home (client home/* + install snippet)
  ├─ Skills list/detail (client skills/*; server fetchStats → entries prop)
  ├─ GlobalSearch (client getCatalog + /api/stats)
  └─ reportWebHeat → POST /api/telemetry
Server
  ├─ getCatalog(): registry JSON + seeds (sync)
  ├─ GET /api/stats → HeatStore aggregates (dynamic)
  ├─ POST /api/telemetry → validate + rate limit + record
  └─ GET /api/skills/:id/download → fs or 302 GitHub + web_download
```

**Stack (from `package.json`):** Next `^16.2.12`, React 19, next-intl 4, Tailwind 4, motion, shadcn/base-ui, workspace `@openwisdom/schema`. Build runs schema package build first.

---

## Opportunities

1. **Server-only catalog module** — Mark merge/seed/registry loaders with `server-only` (or split `data/catalog/client-types.ts` vs `server.ts`). Pass serialized entries (or a slim search index) into client catalog/search/detail. Removes F2 client weight and accidental seed leakage.

2. **In-process stats for RSC** — Add `getStatsInProcess()` that calls `getHeatStore().getAggregates()` directly from skills pages; keep HTTP `/api/stats` for browser (GlobalSearch) and external CLI consumers. Eliminates self-fetch URL config pitfalls (F3).

3. **Memoize `getCatalog()`** — Module-level cache invalidated only if registry import is static (build-time constant). Detail/related/list share one array per process (F5).

4. **Shared shape/discipline tokens** — Move `ScenarioShape` + shared discipline CSS into `components/skills/` or `components/catalog/` so Home imports skills, not the reverse (F8).

5. **Upstash-backed rate limit (or edge config)** — Align abuse control with the same Redis already used for heat when env is present (F4).

6. **Locale-aware `<html lang>`** — Either nest html in locale layout (next-intl docs pattern) or set `lang` from params (F7).

7. **Catalog pipeline ownership** — Longer-term: generate bilingual catalog index at monorepo `catalog:build` time so web drops hand-maintained seeds (ties to monorepo/catalog claims; reduces F1/F6).

8. **Wire smoke scripts** — Add `pnpm test:heat` / `pnpm audit:catalog` to `apps/web` scripts for CI (F14).

9. **Route-level backdrop policy** — Static/noise-only on `/skills` and `/docs`; full ShapeGrid drift only on Home (bits budget already documented).

10. **Prune or re-home orphan home components** — Either promote to install/docs pages or archive to reduce cognitive load (F9).

---

## Risks

| Risk | Severity | Notes |
|------|----------|-------|
| **Seed/registry drift** | P1 | Contributors edit seeds or `catalog.json` independently; UI honesty banners help but do not prevent wrong install CLI for discovery rows after partial materialization. |
| **Client JS size growth** | P1 | Every new seed/registry row inflates client bundles that import `@/data/catalog`. GlobalSearch is on every page via header → global tax. |
| **Heat invisible in static/build** | P1 | Without live stats URL, `popular` sort falls back to featured (`sortCatalog`); deploy previews may mislead QA on heat ranking. Fail-open is correct; observability is weak. |
| **Telemetry abuse / spam** | P1 | Memory rate limit + anonymous events; Upstash increments are cheap to spam across instances (F4). Does not corrupt skill content but can poison popularity. |
| **Wrong `lang` on `/en`** | P2 | SEO/a11y debt; low user-facing breakage. |
| **Layering entropy** | P2 | skills↔home imports, install/DocsHome re-export, dual attachHeat — slows onboarding more than runtime. |
| **Download filesystem coupling** | P2 | Hosted deploys without monorepo skills tree always 302 to GitHub (acceptable); misconfigured `OPENWISDOM_SKILLS_ROOT` could serve unexpected paths if set poorly. |
| **Schema soft-gate silence in production** | P2 | Failed `catalogIndexSchema` only `console.warn`s in non-production; prod uses lenient parse quietly — broken index fields may ship until noticed. |

**Risk acceptance note:** Product hard rules (no hosted LLM, heat fail-open, one install truth channel) are architecturally respected. Primary residual risk is **maintainability of dual content truth + client-side catalog weight**, not wrong product posture.

---

## Recommended next claims

Prioritized follow-on work (implementation claims; not done in c6):

| Priority | Claim sketch | Why |
|----------|--------------|-----|
| **P1** | **Web catalog server/client split** — `server-only` merge module; slim client types + props/index JSON for search | Fixes F2/F5; largest maintainability/perf win |
| **P1** | **In-process heat for RSC + keep HTTP stats for clients** | Fixes F3; simpler local/build behavior |
| **P1** | **Shared rate-limit backend when Upstash present** | Fixes F4 operational hole |
| **P1** | **Catalog bilingual projection from pipeline** (or document “registry monolingual until overlay”) | Fixes F6 honesty for community rows |
| **P2** | **Locale `html lang` + document metadata polish** | F7 |
| **P2** | **Extract `ScenarioShape` / shared catalog chrome; prune orphan home beats** | F8/F9 |
| **P2** | **Wire heat-smoke + catalog-truth scripts into package scripts / CI** | F14 |
| **P2** | **Route-aware SiteBackdrop budget** | F12 |

Suggested claim ids for a later freeze wave (illustrative): `c6a-web-catalog-boundary`, `c6b-heat-inprocess`, `c6c-rate-limit-redis`, `c6d-html-lang`.

---

*Audit method: static read of allowed web paths only; no production source modifications; acceptance is report structure + length gate (`acc-c6-report`).*
