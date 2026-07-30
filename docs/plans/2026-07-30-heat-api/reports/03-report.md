# Plan 03 report — Docs 隐私与遥测说明

**Lane:** Heat API / Docs privacy  
**Date:** 2026-07-30  
**Status:** Done (docs lane) · web build blocked by out-of-lane type error  

**Authority:** Spec 29 §4 · Spec 06 §7 · plan `03-docs-privacy.md`

## Deliverables

| # | Item | Result |
|---|------|--------|
| 1 | Docs「隐私与遥测」章节 | **Done** — `#privacy` section on `/docs` |
| 2 | zh/en key parity | **Done** — 95/95 keys, no only-zh / only-en |
| 3 | Install hub link (optional) | **Done** — `/docs#privacy` |
| 4 | `pnpm --filter web build` | **Blocked** — type error in `components/skills/**` (plan 02) |
| 5 | This report | `reports/03-report.md` |

## What changed

### `DocsHome.tsx`

Added a dedicated **Privacy & telemetry** section (`id="privacy"`, `scroll-mt-24` for sticky chrome) between Related links and FAQ:

| Subsection | Content |
|------------|---------|
| Collect | skillId + event type, day buckets, CLI/MCP version, optional session / providers meta |
| Not collect | name/email/login, machine/home paths, user profiles / ad tracking |
| Opt-out | `--no-telemetry` · `OPENWISDOM_NO_TELEMETRY=1` · `CI=true`/`CI=1` · MCP env · URL unset = no report |
| Endpoint | `OPENWISDOM_TELEMETRY_URL=https://<site>/api/telemetry` + same-origin web note |
| Heat ≠ quality | installs(30d) ≠ academic rigor; default sort remains featured |
| Copy not main rank | `web_copy_install` funnel-only; main rank = CLI/MCP success + web download |
| Purpose | catalog ranking + maintainer priority; fail open; no account |

### `InstallHub.tsx`

In “After install”, short note + link:

- zh: 安装热度为匿名旁路信号… → **隐私与遥测**
- en: Install heat is an anonymous… → **Privacy & telemetry**
- href: `/docs#privacy` (locale-aware via `@/i18n/navigation`)

### i18n (`messages/{zh,en}/pages.json`)

New nested keys under `docs.privacy.*` (18 keys, arrays length-matched):

- `heading`, `lede`
- `collectHeading` / `collectItems` (4)
- `notCollectHeading` / `notCollectItems` (3)
- `optOutHeading` / `optOutItems` (5)
- `urlHeading`, `urlBody`, `urlExample`, `urlHint`
- `heatHeading`, `heatBody`
- `copyHeading`, `copyBody`
- `purposeHeading`, `purposeBody`

Install:

- `telemetryNote`, `telemetryLink`

FAQ third answer updated to name concrete flags/env and point to the new section.

## Acceptance (plan 03)

- [x] Docs documents collect / not collect  
- [x] CLI/MCP opt-out flags and env  
- [x] `OPENWISDOM_TELEMETRY_URL=https://<site>/api/telemetry`  
- [x] Heat ≠ academic quality  
- [x] Copy command not on main rank  
- [x] zh/en parity  
- [ ] Full `pnpm --filter web build` green — **blocked outside this lane**  

## Build note (out of lane)

`pnpm --filter web build` **compiled** successfully, then TypeScript failed:

```text
./src/components/skills/SkillCard.tsx:198:40
Type error: Type 'number | undefined' is not assignable to type 'string | number | Date'.
  {t("heat.installs30d", { count: entry.installs30d })}
```

Path is exclusive to plan **02** (`components/skills/**`). Plan 03 must not edit it.

**Suggested 02 fix:** pass only when defined, e.g. `count: entry.installs30d ?? 0`, or narrow after `showHeat` guard so `count` is `number`.

## Files touched (exclusive lane)

```
apps/web/src/components/install/DocsHome.tsx
apps/web/src/components/install/InstallHub.tsx
apps/web/src/messages/zh/pages.json
apps/web/src/messages/en/pages.json
docs/plans/2026-07-30-heat-api/reports/03-report.md
```

## Not touched

- `lib/heat/**`, `app/api/**`, `components/skills/**`, `packages/**`
- Home, shell chrome, git commit
