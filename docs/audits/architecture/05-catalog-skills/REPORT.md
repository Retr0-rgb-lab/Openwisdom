# Architecture audit — catalog build + skills layout (c5b)

**Claim:** `c5b` · **Acceptance:** `acc-c5-report` · **Contract:** `v001`  
**Review mode:** read-only on `packages/catalog/**` and sample `skills/**`; no product source edits.  
**Materialize note:** root `scripts/materialize-web-catalog-skills.mts` is leased by peer claim **c7** — observed only via package/docs references; not opened or edited here.

---

## Scope

This slice audits the **machine catalog pipeline** and **skills tree contract**:

| Area | Paths reviewed |
|------|----------------|
| Catalog package | `packages/catalog/src/build.ts`, `index.ts`, `build.test.ts`, `package.json` |
| Build outputs | `packages/catalog/dist/{catalog,manifest,payload-index}.json` |
| Dual-write consumers | `packages/cli/{catalog,skills}-snapshot/**`, `packages/mcp/{catalog,skills}-snapshot/**`, `apps/web/public/registry/**` |
| Skills layout | `skills/official/{scenarios,references}/**`, `skills/community/{scenarios,references}/**`, `skills/community/README.md` |
| Schema contracts (read via catalog imports) | `@openwisdom/schema` frontmatter, scope/layer, catalog index (referenced from build) |

**In scope questions**

1. How does scan → parse → index → dual-write work?
2. Are official/community and scenario/reference layout conventions enforced?
3. What dual-write / snapshot drift risks exist (cli / mcp / web / catalog dist)?
4. What does the pipeline **not** validate (refs, payload bodies, materialize reverse channel)?

**Out of scope (by lease)**

- Editing catalog/skills/src or materialize scripts
- Web UI catalog UX (claim c6) and monorepo root scripts ownership (c7)
- Heat/telemetry write paths

**Observed tree size (current generated index):** `skillCount: 118` · four-way `contentHash` match  
`sha256-cc6a7428e3c61262550018743eeedee3e1475196c8113eda11dc5e5ab64bc024` (manifests dated `2026-08-04T11:24:40.625Z`).

**Layout truth (on disk)**

```text
skills/
├── official/
│   ├── scenarios/   # triad + handoff (6): macro-scan, personal-anchor, metacognition-audit,
│   │                # responsibility-scope|bridge, analysis-closure
│   └── references/  # 5 theory cards (e.g. confirmation-bias, path-dependence)
└── community/
    ├── scenarios/   # majority of installable packs (many curated-external)
    └── references/  # community theory / style cards
```

---

## Findings

### Pipeline shape (baseline — working)

**P2 — Healthy core path (document as strength)**  
`packages/catalog/src/build.ts` implements a clear one-way flow:

1. Resolve monorepo root (`pnpm-workspace.yaml` or `skills/`)
2. Recursive `findSkillMdFiles(skills/)` for every `SKILL.md`
3. `gray-matter` + `parseSkillFrontmatter` + `assertNameMatchesDir(name, dir)`
4. Path inference via `inferScopeAndLayer(repoPath)` with frontmatter override
5. Duplicate `id` rejection; empty tree hard-fail (`refusing empty catalog`)
6. Emit `catalog.json` + `manifest.json` + `payload-index.json`
7. **Dual-write catalog JSON** to four targets (SPE 36):
   - `packages/catalog/dist`
   - `packages/cli/catalog-snapshot`
   - `packages/mcp/catalog-snapshot`
   - `apps/web/public/registry`
8. **Skills payload mirror** → `packages/cli/skills-snapshot`, `packages/mcp/skills-snapshot` (full `skills/` tree)
9. **Remote registry skills** → `apps/web/public/registry/skills/**` (`stageRegistrySkills`)
10. Official bundle `orientation-handoff` hardcoded in build (`OFFICIAL_BUNDLES`), soft-warn if skill ids missing

**Explicit non-write:** `packages/core/*-snapshot` is **not** a target (SPE 36 landed; core has no snapshot dirs). CLI/MCP `package.json` `files` correctly ship `catalog-snapshot` + `skills-snapshot`.

Unit tests (`packages/catalog/src/build.test.ts`) cover empty tree, single fixture id/scope/layer, path inference when frontmatter omits scope/layer — good SPE 38 surface. They do **not** exercise `main()` fan-out or payload-index.

---

### Dual-write & drift

**P1 — `contentHash` is catalog-metadata-only; payload bodies can drift silently**  
Path: `packages/catalog/src/build.ts` → `contentHash()`  
Hash canonicalizes skill **index fields** (id, name, description, layer, scope, disciplines, language, tags, version, repoPath, references, pipeline, install) and **excludes** `updated`. It does **not** hash:

- SKILL.md body text after frontmatter
- Nested assets (`references/*.md`, scripts, evals)
- `payload-index.json` file lists

Consequence: body-only or asset-only edits leave all four manifests with the same stale `contentHash` while install payloads differ. SPE 36 listed **P1-b** `assert-snapshot-parity` — **not implemented** in-repo (no CI `.github` workflows found either).

**P1 — Triple full-tree copy without single-source packaging**  
Paths: `syncSkillsSnapshot` → `packages/cli/skills-snapshot`, `packages/mcp/skills-snapshot`; `stageRegistrySkills` → `apps/web/public/registry/skills`  
Same monorepo `skills/` is recursively `cpSync`’d three times per build. Publish size and git noise scale with community growth; SPE 36 accepted this for npm pack isolation but noted optional future `@openwisdom/payload`. No dedupe / hardlink strategy.

**P2 — Knowledge-base dual-write matrix still mentions core**  
Path: `docs/知识库/07-架构与 monorepo.md` §4 still diagrams `packages/{cli,core,mcp}/catalog-snapshot` and suggests “四路 contentHash (CLI/core/MCP/web)”.  
Code truth: **three published surfaces + catalog dist** (no core). Risk: future agents re-introduce core snapshots or wrong publish checks. SPE 36 itself said distill to KB 05/07 — distillation incomplete.

**P2 — Current four-way manifests match (good)**  
Compared `manifest.json` under catalog dist, cli, mcp, web registry: identical `contentHash`, `skillCount: 118`, `gitSha`, `generatedAt`. No active multi-target split at audit time — risk is **process**, not current corrupt state.

**P2 — Fan-out untested in vitest**  
`main()` dual-write and `buildPayloadIndex` lack unit coverage; regressions on target list would only show after manual `pnpm catalog:build`.

---

### Scope / layer / identity rules

**P1 — Frontmatter can disagree with path without fail**  
Path: `packages/catalog/src/build.ts` `buildSkillEntry`  
`layer = fm.layer ?? inferred.layer`, `scope = fm.scope ?? inferred.scope`. If both present and **conflict** (e.g. file under `community/scenarios` with `scope: official`), catalog trusts frontmatter. Path is only fallback. This can publish wrong provenance badges and install taxonomy while `repoPath` still points at community.

**P2 — `id` need not equal directory; only `name` must**  
Paths: `packages/schema/src/frontmatter.ts` (id defaults to name), `packages/schema/src/kebab.ts` `assertNameMatchesDir`  
Install CLI strings use **`id`** (`npx openwisdom install ${id}`). A contributor can set `id: other-id` while `name` matches dir — catalog installs by alternate id; discoverability and path conventions diverge. Rare but unguarded.

**P2 — Recursive SKILL.md discovery**  
`findSkillMdFiles` walks entire skill trees. Nested accidental `SKILL.md` under a skill’s assets becomes a second catalog entry (or fails name/dir assert / duplicate id). Community packs with rich trees raise this risk as they grow.

**P2 — `disciplines` are free strings**  
Catalog schema requires non-empty strings, not the product’s seven peer discipline ids. Typos (`political_science` vs `political-science`) fragment filters without build failure.

---

### Bundles, references, official triad/handoff

**P1 — Bundle missing-ids are soft-warn only**  
Path: `packages/catalog/src/build.ts` `resolveBundles`  
`orientation-handoff` is always emitted even if members missing (“partial land”). Today all three handoff skills exist under `skills/official/scenarios/` and appear in catalog — OK. Soft rule can ship a broken bundle if someone deletes a member without noticing warn-only console output.

**P2 — Catalog does not resolve `references[]` to existing skill ids**  
Scenario frontmatter (e.g. `skills/official/scenarios/macro-scan/SKILL.md` → `path-dependence`, `collective-action`) is copied into the index if present, but build never verifies target ids exist. Broken theory edges are install-time / UX issues, not build-time.

**P2 — Official layout matches product intent**  
Official scenarios include orientation triad + D1 handoff three-pack; references are peer theory cards. Bundle id `orientation-handoff` matches pipeline frontmatter on handoff skills. No structural gap found for official core.

---

### Community / materialize / payload integrity

**P1 — Broken symlink stubs in curated community skills (install payload)**  
Example: `skills/community/scenarios/allocating-effort/examples` and `.../scripts` are **files** whose content is the relative path string `../examples` (and similar), not real directories.  
`payload-index.json` lists them as payload files (`"examples"`, `"scripts"`). After dual-write copy, offline/remote install still ships these stubs — agent workflows that `node scripts/calc.js` fail after install. Same pattern likely on sibling decision-making packs (`framing-decisions`, `planning-horizons`, etc.). Root cause likely git-symlink / materialize import on Windows or incomplete upstream materialize.

**P1 — Reverse channel (web → skills) is a second truth surface**  
Documented in `skills/community/README.md` and root scripts: `pnpm catalog:materialize` then `pnpm catalog:build` / `catalog:sync-web`.  
Catalog package assumes **git `skills/` is source of installable truth** (AGENTS hard rule #2). Materialize seeds community from web discovery — if materialize and hand-edited skills diverge, or materialize is skipped after web seed changes, site and installable set drift. **Owned detail leased to c7**; here flagged as architectural dual-write risk only.

**P2 — Community volume dominates catalog**  
~118 skills; official ≈ 11. Index and full-tree snapshots are mostly community curated-external. Quality/frontmatter variance is high (some omit explicit `id`, rely on defaults; many carry `metadata.provenance` not projected into catalog.json).

**P2 — `updated` is SKILL.md mtime only**  
`updatedFromMtime(skillMdPath)` ignores asset mtimes. Catalog “updated” sort on web can understate real content change when only nested files change.

**P2 — License / provenance not in catalog row**  
Frontmatter `license` and `metadata.provenance` / `upstream` parse (passthrough metadata) but catalog skill schema does not emit them — installable index cannot show license or curated-external badge from machine catalog alone (UI may hardcode elsewhere).

---

### Severity rollup

| Sev | Count | Themes |
|-----|-------|--------|
| **P0** | 0 | No empty-catalog ship path; current four-way hash aligned; core fan-out already removed |
| **P1** | 5 | contentHash ≠ payload integrity; FM vs path override; soft bundles; symlink stubs; materialize dual truth |
| **P2** | 9+ | KB stale dual-write table; triple copy cost; weak tests; free disciplines; id≠dir; nested SKILL.md; refs unvalidated |

---

## Opportunities

1. **`assert-snapshot-parity` (SPE 36 P1-b)** — Script comparing `contentHash` (+ optional payload-index checksum) across cli / mcp / web registry; gate on `pnpm catalog:build` and publish. Paths: new under `packages/catalog` or root scripts (c7 lease awareness).
2. **Payload content digest** — Extend manifest with `payloadHash` over sorted `(id, relativePath, sha256(file))` so body/asset edits force rebuild detection without conflating volatile `updated`.
3. **Fail closed on FM/path conflict** — If `fm.scope|layer` present and differs from `inferScopeAndLayer`, throw at build. Path: `packages/catalog/src/build.ts` `buildSkillEntry`.
4. **Hard-validate bundle members + scenario `references[]`** — Missing ids → build error (or config flag for partial land only in CI=false).
5. **Symlink / pointer-file lint** — Reject payload files that are tiny path-pointer stubs or dangling links before dual-write; fix materialize (c7) to materialize real trees.
6. **Emit provenance/license into catalog** (optional schema fields) for honest curated-external UX without scraping SKILL body.
7. **Distill KB 05/07** to SPE 36 truth (drop core dual-write; three published + dist intermediate).
8. **Test fan-out pure function** — Extract `emitCatalogArtifacts` (SPE 36 P1-a) and assert target set + non-empty skills-snapshot filter behavior.
9. **Discipline enum** — Align with seven peer ids in schema refine (or warn list).
10. **Assert `id === name === dir`** (or document intentional alias and test it).

---

## Risks

| Risk | Why it matters | Evidence |
|------|----------------|----------|
| **Stale offline npm bins** | CLI/MCP users with `OPENWISDOM_NO_REMOTE` install old skills after git skills change without rebuild/publish | Dual-write is manual `pnpm catalog:build`; no CI guard |
| **False “in sync” via contentHash** | Hash match across targets but skill bodies differ across commits / partial copies | `contentHash()` ignores bodies |
| **Provenance lie** | Frontmatter `scope: official` under community path surfaces wrong trust tier | `buildSkillEntry` override rule |
| **Broken community tool skills** | Install succeeds; scripts/examples missing | `allocating-effort/examples` file content `../examples` |
| **Materialize ↔ build order** | Web seeds updated without `catalog:sync-web` → site narrative vs installable set | README + root `catalog:sync-web` |
| **Doc-driven rework** | Agents follow KB 07 and re-add core snapshots / wrong publish matrix | KB vs `build.ts` SPE 36 header |
| **Scale** | Full skills tree ×3 inflates repo and npm package size | cli + mcp skills-snapshot + registry/skills |
| **Bundle soft-land** | `install --bundle orientation-handoff` partially empty without fail | `resolveBundles` warn-only |

No evidence of heat written into SKILL.md or catalog (aligned with product rule). Empty skills tree correctly fails build.

---

## Recommended next claims

| Pri | Claim idea | Primary paths | Rationale |
|-----|------------|---------------|-----------|
| **P1** | Snapshot parity + payload digest gate | `packages/catalog/src/build.ts`, optional `packages/catalog/src/parity.ts` or root script | Close dual-write drift class; implement SPE 36 P1-b |
| **P1** | Frontmatter/path consistency + id≡name≡dir | `packages/catalog/src/build.ts`, `packages/schema/**` | Prevent official/community mislabel |
| **P1** | Community symlink/stub audit + materialize fix | `skills/community/scenarios/**` (many decision-making packs), **c7** `scripts/materialize-web-catalog-skills.mts` | Restore real install payloads for scripted skills |
| **P1** | Bundle/reference existence hard fail | `packages/catalog/src/build.ts` | Ship-safe handoff bundle and theory edges |
| **P2** | Distill architecture docs after SPE 36 | `docs/知识库/05-*.md`, `docs/知识库/07-*.md` | Stop agent reintroduction of core dual-write |
| **P2** | Fan-out unit tests + extract emit helper | `packages/catalog/src/build.ts`, `build.test.ts` | Regression guard on target lists |
| **P2** | Catalog schema: license/provenance optional fields | `packages/schema/src/catalog.ts`, catalog build map | Honest curated-external discovery |
| **P2** | Discipline id enum / normalize | `packages/schema`, skills frontmatter cleanup | Stable filter facets |
| **P2** | (Peer) monorepo CI: `catalog:build` + parity on PR | root CI (when claimed), `package.json` scripts | Process integrity |

**Do not open as product claims without freeze:** inventing skills only on web; re-adding `packages/core/*-snapshot`; writing heat into catalog/SKILL.md.

---

### Acceptance checklist (this claim)

- [x] Report path: `docs/audits/architecture/05-catalog-skills/REPORT.md`
- [x] Exact H2s: Scope · Findings · Opportunities · Risks · Recommended next claims
- [x] Severities P0|P1|P2 with path evidence
- [x] Length ≥ 600 characters
- [x] No production source under packages/skills modified
- [x] Evidence: `.homer/evidence/c5b/return.json`
