# Plan 04 report — Install · Docs · Contribute

**Lane:** Web IA  
**Date:** 2026-07-30  
**Status:** Done

## Deliverables

| # | Item | Result |
|---|------|--------|
| 1 | Real `/install` hub (no redirect-only) | **Done** — `install/page.tsx` renders `InstallHub` |
| 2 | Real `/docs` intro + FAQ | **Done** — `docs/page.tsx` renders `DocsHome` |
| 3 | Real `/contribute` guide | **Done** — `contribute/page.tsx` renders `ContributeGuide` |
| 4 | `pnpm --filter web build` | **Passes** (see note on catalog import path) |
| 5 | This report | `reports/04-report.md` |

## What changed

### Routes

- `apps/web/src/app/[locale]/install/page.tsx` — was permanent redirect to `/skills`; now Server Component + metadata + hub content.
- `apps/web/src/app/[locale]/docs/page.tsx` — was `PlaceholderSection`; now intro + quick start + links + FAQ.
- `apps/web/src/app/[locale]/contribute/page.tsx` — was `PlaceholderSection`; now official vs community, PR steps, frontmatter checklist, GitHub links.

### Components (`components/install/**`)

| File | Role |
|------|------|
| `InstallHub.tsx` | Install page body: honest npm status, `InstallCommand` (CLI \| MCP), four paths, manual steps, monorepo dev notes (`pnpm cli`, `OPENWISDOM_SKILLS_ROOT`), next links |
| `DocsHome.tsx` | Docs intro: 3 product facts, 3-step quick start, related links, 3 FAQs |
| `ContributeGuide.tsx` | Contribute guide: provenance cards, 3 steps to `skills/community/`, frontmatter checklist, GitHub issues/repo |
| `InstallCommand.tsx` / `commands.ts` | Reused unchanged |

### i18n

- **New namespace** `pages` via `messages/{zh,en}/pages.json` (full zh/en parity).
- Registered in `apps/web/src/i18n/request.ts` (`shell` / `home` / `skills` / `pages`).
- `shell.json` placeholder.install/docs/contribute copy updated to point at live routes (About still placeholder).

### Nav / chrome

- **Did not** add Install to `SiteHeader` / `NAV_ITEMS` / footer (site chrome outside critical need; Install hub is self-linked from Docs and internal CTAs).
- Docs + Contribute remain in existing nav.

## Honesty / design

- CLI/MCP **not on npm** status callout on Install (aligned with Home `home.install` copy).
- No hosted chat / `openwisdom run` / fake metrics.
- Overlay Atlas tokens only (`primary`, `structure`, `field`/`surface`, `line`, serif titles).
- Hard rule: package-manager surfaces only.

## Acceptance checklist

- [x] Three pages have real titles + paragraphs + internal links  
- [x] No `PlaceholderSection` as sole content on these routes  
- [x] zh/en keys symmetric under `pages.*`  
- [x] `/zh/install`, `/zh/docs`, `/zh/contribute` are content pages (SSG listed in build)  
- [x] `pnpm --filter web build` succeeds  

## Build note (out of lane)

`apps/web/src/data/catalog/load-registry.ts` imports:

```ts
import registryJson from "../../../../public/registry/catalog.json";
```

From `src/data/catalog/` that resolves to **`apps/public/registry/catalog.json`**, not `apps/web/public/registry/catalog.json` (off-by-one `../`). Plan 01 exclusive path — not edited here.

**Workaround left in tree for green build:** copies at:

- `apps/public/registry/catalog.json`
- `apps/public/registry/manifest.json`

**Recommended plan 01 (or VERIFY) fix:** change import to `../../../public/registry/catalog.json` and delete `apps/public/`.

## Files touched (exclusive lane)

```
apps/web/src/app/[locale]/install/page.tsx
apps/web/src/app/[locale]/docs/page.tsx
apps/web/src/app/[locale]/contribute/page.tsx
apps/web/src/components/install/InstallHub.tsx
apps/web/src/components/install/DocsHome.tsx
apps/web/src/components/install/ContributeGuide.tsx
apps/web/src/messages/zh/pages.json          (new)
apps/web/src/messages/en/pages.json          (new)
apps/web/src/messages/zh/shell.json
apps/web/src/messages/en/shell.json
apps/web/src/i18n/request.ts
docs/plans/2026-07-30-audit-close/reports/04-report.md
```

Side-effect for build: `apps/public/registry/*` (see above).

## Not done (out of scope)

- Install in primary nav / footer  
- Fumadocs multi-page docs tree (`/docs/getting-started`, etc.)  
- npm publish of CLI/MCP  
- Home 6-beat changes  
