# Architecture audit — monorepo glue (c7)

> **Claim:** c7 · **contract:** v001 · **Date:** 2026-08-05  
> **Read-only:** root scripts / workspace / catalog glue / knowledge-base map. No product code edits.

## Scope

This audit covers **monorepo glue only**: how packages are wired, how root scripts orchestrate builds and catalog fan-out, and whether docs (`docs/知识库/05-系统现状与实现地图.md`, `docs/知识库/07-架构与 monorepo.md`) match disk reality.

| In scope | Out of scope |
|----------|----------------|
| `package.json` (root), `pnpm-workspace.yaml` | App UI / page IA (`apps/web/src` product behavior) |
| `scripts/**` (`catalog:materialize`, `run-if-package`) | Skill body quality / discipline content |
| Workspace package graph & dependency direction | npm publish process execution |
| Catalog dual-write / `catalog:sync-web` contract vs SPE 36 code | Full CI design implementation |
| Doc map drift (05 / 07 vs manifests & package versions) | Homer meta / contracts |

**Workspace as of audit:**

```text
pnpm-workspace: apps/* + packages/*
packages: schema · providers · catalog · core · cli (openwisdom) · mcp (openwisdom-mcp)
apps:     web
skills/:  content truth consumed by @openwisdom/catalog build
```

**Root scripts observed** (`package.json`): `dev`, `build`, `catalog:materialize`, `catalog:build`, `catalog:sync-web`, `lint`, `test`, `cli`, `mcp`, `homer`, `homer-meta`.

## Findings

### F1 — Index-centric monorepo is real and mostly coherent · **P2** (healthy)

**Paths:** `pnpm-workspace.yaml`, `packages/*/package.json`, `packages/catalog/src/build.ts`

- Layout matches knowledge-base **07** §2 (apps/web + packages/* + skills/ + scripts/).
- **Dependency direction is acyclic and intentional:**
  - `@openwisdom/schema` → zod only (leaf).
  - `@openwisdom/providers` → no workspace deps (leaf).
  - `@openwisdom/catalog` → schema.
  - `@openwisdom/core` → providers + schema.
  - `openwisdom` / `openwisdom-mcp` → core/schema/providers as **devDependencies**, bundled via tsup `noExternal` into single bins (`packages/cli/tsup.config.ts`, `packages/mcp/tsup.config.ts`).
  - `web` → `@openwisdom/schema` only (no core/cli/mcp runtime deps).
- No package depends on `apps/web` as a workspace package. **Good:** published surfaces do not import the Next app.

### F2 — Catalog fan-out code ≠ knowledge-base dual-write diagram · **P1**

**Paths:** `packages/catalog/src/build.ts` (header + targets ~431–456), `docs/知识库/07-架构与 monorepo.md` §4, `docs/知识库/05-系统现状与实现地图.md` §2

**Code (authoritative for build):** SPE 36 — dual-write targets are:

| Target | catalog.json / manifest / payload-index | skills-snapshot tree |
|--------|-------------------------------------------|----------------------|
| `packages/catalog/dist` | yes | no |
| `packages/cli/*-snapshot` | yes | yes |
| `packages/mcp/*-snapshot` | yes | yes |
| `apps/web/public/registry` | yes | staged under `registry/skills/**` |
| `packages/core/*-snapshot` | **no** (explicitly dropped) | **no** |

**Docs still say** (or imply) `packages/{cli,core,mcp}/…-snapshot` and, in places, core as a snapshot host (`05` diagram; `07` dual-write list; residual mentions in `14` via grep). Disk confirms **core has no `catalog-snapshot` / `skills-snapshot` directories** — correct for a private library; **docs lag SPE 36**.

**Manifest reality:** `packages/cli/catalog-snapshot/manifest.json` and `apps/web/public/registry/manifest.json` share `skillCount: 118`, same `contentHash`, `generatedAt: 2026-08-04…` — fan-out is working when build runs.

### F3 — `catalog:sync-web` pipeline inverts “content truth” for community · **P1**

**Paths:** `package.json` scripts, `scripts/materialize-web-catalog-skills.mts`, `apps/web/src/data/catalog/index.ts`

```text
pnpm catalog:sync-web
  = catalog:materialize  (web getCatalog() → write skills/community/**/SKILL.md)
  + catalog:build        (skills/** → registry + CLI/MCP snapshots)
```

- Materialize **imports TypeScript from the web app**: `../apps/web/src/data/catalog/index.ts` (seed merge of bootstrap + external/history/philosophy/principle/discipline seeds + registry).
- Root script: `pnpm --filter web exec tsx ../../scripts/materialize-web-catalog-skills.mts` — glue depends on web having `tsx` and a fragile relative path out of the package CWD.
- Product iron law (“sites must not invent installable metadata only on the website”) is **partially restored** only *after* materialize + build; until then, web seeds can describe skills that are discovery-only (`installMode: "link-only"` in seed merge) or not yet on disk.
- **Root `build` runs `@openwisdom/catalog build` but does not run `catalog:materialize`.** Fresh seed-only UI entries will not enter CLI/MCP until someone runs `catalog:sync-web`.

### F4 — Root orchestration is hand-rolled; soft MCP gate is leftover · **P2**

**Paths:** `package.json` `build`/`test`/`mcp`, `scripts/run-if-package.mjs`

- `build` is a **fixed sequential** chain: schema → providers → catalog → core → openwisdom → (optional mcp) → web. No turbo/nx/changesets; no parallel DAG cache.
- `run-if-package.mjs` still guards MCP build/test/run “if package missing.” **`packages/mcp` exists and is published** (`openwisdom-mcp@0.1.4`) — the soft gate is historical scaffolding, not a current need; it can **mask accidental deletion** of mcp package.json with exit 0.
- `lint` = web only. Root `test` = schema + providers + core + cli + mcp — **omits `@openwisdom/catalog` tests** despite `packages/catalog` having `vitest`.
- Web package `build` only rebuilds schema then Next — not full monorepo; correct for Vercel filter, but easy for contributors to ship web without refreshed registry if they skip root/catalog scripts.

### F5 — Knowledge-base 05 staleness on versions & scale · **P2**

**Paths:** `docs/知识库/05-系统现状与实现地图.md`, `packages/cli/package.json`, `packages/mcp/package.json`, registry manifests

| Claim in 05 (2026-07-31) | Disk / package.json |
|--------------------------|---------------------|
| CLI npm `0.1.1` | `openwisdom` **0.1.3** |
| MCP npm `0.1.2` | `openwisdom-mcp` **0.1.4** |
| Machine catalog skillCount **92** | manifest **118** |
| Handoff triad “磁盘未落地” (§7) | official handoff dirs present under `skills/` and both skills-snapshots (verify separately in skills audit) |

Root scripts list in 05 also omits `catalog:materialize` as a named root script detail (command table shows it under §2, root list in §3 incomplete vs actual `package.json`).

### F6 — CI / publish hash gate described but absent · **P1**

**Paths:** `docs/知识库/07-架构与 monorepo.md` §9, repo root (no `.github/`)

- Doc §9 recommends PR validation of skills + build packages/web, and **four-way contentHash consistency before publish**.
- **No `.github/` workflows** observed in the workspace. Consistency today is manual (`pnpm catalog:build` / release checklist under `docs/ops/RELEASE-npm-0.1.3-0.1.4.md`).
- Snapshot trees under `packages/cli/skills-snapshot` and `packages/mcp/skills-snapshot` are large dual copies — drift risk if one is hand-edited or only one package is rebuilt.

### F7 — Minor dependency hygiene · **P2**

**Paths:** `packages/mcp/package.json` (`zod` ^4), `packages/schema/package.json` (`zod` ^3), CLI/MCP workspace as `devDependencies`

- MCP depends on **zod v4** while schema/catalog use **zod v3**. Bins bundle schema via tsup; runtime MCP SDK still pulls zod 4 — dual major versions in the graph increase install size and type confusion for contributors.
- Bundling core into CLI/MCP is the right publish model; monorepo still needs ordered builds so `dist/` exists before tsup resolves workspace packages.

## Opportunities

1. **Doc sync claim (cheap):** Update `05` / `07` (and any residual `14`) dual-write diagrams to SPE 36: **cli + mcp + web registry only**; drop core snapshot language; refresh CLI/MCP versions and skillCount.
2. **Wire catalog tests into root `test`:** `pnpm --filter @openwisdom/catalog test` — protects fan-out regressions.
3. **Harden `catalog:sync-web`:** Run materialize via root `tsx` (or `node --import tsx`) without `--filter web exec` relative paths; document that **seed edits require `catalog:sync-web` before publish**.
4. **CI minimal gate:** On PR: schema/catalog tests + `catalog:build` dry check that cli/mcp/web `contentHash` match; fail if dirty after build.
5. **Remove or invert `run-if-package`:** Direct `pnpm --filter openwisdom-mcp …` now that MCP is first-class.
6. **Optional turbo/pnpm recursive:** Cache package builds; keep explicit catalog side-effects script separate from pure compile.
7. **Longer-term content model:** Move materialize sources out of `apps/web/src/data/catalog/*` into a package or `skills/`-adjacent seed module so web is a consumer, not the generator root (aligns iron law).

## Risks

| Risk | Severity | Notes |
|------|----------|--------|
| **Doc → contributor wrong dual-write** | P1 | Following 05/07 literally expects core snapshots; SPE 36 code will never create them → confusion / false “broken build” reports. |
| **Seed-only skills on site vs install** | P1 | Without `catalog:sync-web`, web overlay can advertise richer catalog than CLI/MCP offline/remote registry. Product decision requires materialize; glue does not enforce on `pnpm build`. |
| **No CI hash gate** | P1 | Publish with stale one-of-N snapshots possible if release steps skipped. |
| **Triple skill tree weight** | P2 | cli snapshot + mcp snapshot + web registry/skills bloats repo & PR noise; accidental partial commits. |
| **Soft MCP skip** | P2 | Silent skip if mcp package.json removed. |
| **Zod 3 vs 4** | P2 | Contributor / type / lockfile complexity. |
| **Build dirties git** | P2 | `catalog build` rewrites snapshots + registry; dirty tree after routine builds without content intent. |

No **P0** production-breakage was proven from glue alone: dependency direction is sound, catalog targets on disk are consistent with last build (118 skills, shared hash), and CLI/MCP bundle pattern is deliberate. Highest urgency is **doc/code contract drift** and **missing automated consistency**, not a wrong package import cycle.

## Recommended next claims

| Priority | Claim idea | Why | Touch paths (suggested) |
|----------|------------|-----|-------------------------|
| **P1** | **Doc map SPE 36 alignment** | Fix dual-write + version/skillCount in 05/07 (and cross-links) so agents stop searching for core snapshots | `docs/知识库/05-系统现状与实现地图.md`, `docs/知识库/07-架构与 monorepo.md`, possibly `14` |
| **P1** | **Catalog consistency CI / script** | Assert cli/mcp/web `manifest.contentHash` equal; optionally fail if skills/ changed without rebuild | `.github/workflows/*` or `scripts/check-catalog-hash.mjs` + root script |
| **P1** | **Enforce materialize in release path** | Document + script: publish checklist must `catalog:sync-web`; optional `prepublishOnly` on cli/mcp | `docs/ops/*`, `packages/cli/package.json`, `packages/mcp/package.json` (product claim) |
| **P2** | **Root test/lint completeness** | Include `@openwisdom/catalog test`; consider packages lint | root `package.json` |
| **P2** | **Drop run-if-package soft gate** | Direct mcp filter; reduce false green | `package.json`, delete or narrow `scripts/run-if-package.mjs` |
| **P2** | **Decouple materialize from apps/web import** | Shared seed module under packages or skills tools | `scripts/materialize-*.mts`, `apps/web/src/data/catalog/**` (larger design) |
| **P2** | **Zod major unify** | Align MCP/schema zod major | `packages/mcp/package.json`, schema consumers |

**Non-claims for this slice:** redesign of skills content, web IA, heat API, or adding LLM/`run` surfaces (hard product non-goals).

---

*Audit method: read root workspace manifests, both glue scripts, all package.json dependency edges, catalog build fan-out implementation, registry/cli manifests, and knowledge-base 05/07. No product source modified.*
