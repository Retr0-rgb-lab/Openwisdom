# Architecture audit — `@openwisdom/schema` + `@openwisdom/providers`

**Claim:** c1 · **contract_version:** v001 · **Date:** 2026-08-05  
**Method:** Read-only review of package sources/tests and monorepo consumer import graph (no production edits).

---

## Scope

This audit covers the two foundation packages at the bottom of the index-centric monorepo stack:

| Package | Role | Surface |
|---------|------|---------|
| `@openwisdom/schema` | Shared **zod** contracts for SKILL.md frontmatter + generated `catalog.json` | `packages/schema/src/{index,kebab,frontmatter,catalog,scope-layer}.ts` |
| `@openwisdom/providers` | Harness → skills-path table, detect / parse / resolve / dedupe write targets | `packages/providers/src/index.ts` (single module) |

**In scope:** module boundaries, zod schema design, inter-package coupling, test gaps, duplication, and alignment with the monorepo **index-centric** design (skills truth → catalog build → shared index → CLI/MCP/web consumers).

**Out of scope (referenced only as consumers):** `@openwisdom/catalog` build pipeline, `@openwisdom/core` install/registry, CLI/MCP adapters, web UI. Those packages **import** schema/providers; this claim does not change them.

**Package dependency posture:**

- `schema` depends only on `zod` (no monorepo peers).
- `providers` has **no runtime deps** (only Node builtins `fs` / `path`).
- Neither package imports the other — correct layering: contracts vs install destinations.

**Primary consumers (import graph):**

- **schema** → `packages/catalog` (build), `packages/core` (registry parse, frontmatter, install types), `packages/mcp` (skill-card types).
- **providers** → `packages/core` (install), `packages/cli` (install/list), `packages/mcp` (list/detect-providers).

---

## Findings

### P0 — none observed

No ship-blocking boundary break (e.g. schema pulling in install I/O, or providers inventing catalog fields) was found in the reviewed sources. Both packages match their stated roles for v1.

### P1 — index contract drift risk: dual `SCHEMA_VERSION` constants

- **`packages/schema/src/index.ts`** exports `SCHEMA_VERSION = 1`.
- **`packages/catalog/src/build.ts`** defines a **local** `const SCHEMA_VERSION = 1` and never imports the schema package constant when emitting `catalog.json` / `manifest.json`.

Impact: a future bump of the schema package constant alone will **not** automatically update catalog builders or force a coordinated migration. Index-centric design requires **one** version truth for `catalogIndexSchema` (`schemaVersion: z.literal(1)` in `packages/schema/src/catalog.ts`).

### P1 — incomplete “shared index” schema surface (manifest / payload-index outside schema)

Index-centric architecture emits at least three related artifacts (`catalog.json`, `manifest.json`, `payload-index.json`). Only **catalog root + skill + bundle** shapes live in `@openwisdom/schema`:

- `catalogIndexSchema` / `catalogSkillSchema` / `catalogBundleSchema` — `packages/schema/src/catalog.ts`
- Runtime types for **manifest** and **payload-index** are redefined in **`packages/core/src/registry.ts`** (`RegistryManifest`, `PayloadIndex`) rather than shared zod in schema.

Impact: consumers can diverge on field names/optionality; catalog build and core registry are not forced through one parse path for secondary artifacts. Weakens the “one content/index truth” story for everything adjacent to `catalog.json`.

### P1 — providers test coverage thin relative to public API

`packages/providers/src/index.test.ts` covers:

- `resolveSkillDir` (claude project + opencode global only)
- `uniqueWriteTargets` (codex+agents project dedupe)
- `parseProvidersFlag` (unknown + aliases)
- `getProvider` (one alias)

**Missing or weak:**

- `detectProviders` (project/home markers, experimental exclusion) — core detection path used by MCP tools
- `uniqueWriteTargets` path normalization / multi-provider non-overlap cases
- `resolveSkillDir` global for path-asymmetric providers (pi, windsurf, github, codex)
- empty `--providers` CSV throw
- case-insensitive id/alias normalization edge cases
- integrity of `PROVIDERS` table (unique ids, unique aliases across rows)

Impact: install path regressions (especially shared roots and global quirks documented in `notes`) can ship without red tests.

### P2 — free-form disciplines vs product seven-discipline catalog ids

Product guidance names seven peer discipline ids (psychology, sociology, history, political-science, economics, philosophy, education). Schemas allow any non-empty string:

- Frontmatter: `disciplines: z.array(z.string().min(1)).optional()` — `packages/schema/src/frontmatter.ts`
- Catalog skill: required `disciplines: z.array(z.string().min(1))` — `packages/schema/src/catalog.ts`

Impact: typos and ad-hoc labels pass validation; UI filters and ranking may fragment. Not a runtime crash, but weak catalog hygiene for index-centric discovery.

### P2 — `ProviderId` is unconstrained `string`

`packages/providers/src/index.ts` types `ProviderId = string` and stores a large static `PROVIDERS` array without compile-time union or runtime table validation (duplicate ids/aliases would only surface at call time).

Impact: callers and flags can pass arbitrary strings; failures are late `Unknown provider` throws. Acceptable for a data table, but weaker than schema’s zod discipline for the monorepo’s other shared contracts.

### P2 — `inferScopeAndLayer` layout coverage vs knowledge-base path variants

`packages/schema/src/scope-layer.ts` maps:

- `skills? / {official|community} / {scenarios|references} / …`

It does **not** encode deeper reference layouts sometimes described in docs (e.g. `references/<discipline>/*`). Unknown middle segments yield `layer: undefined`, which is safe-fail but may force catalog build heuristics elsewhere.

Tests in `packages/schema/src/scope-layer.test.ts` cover monorepo-relative and skills-root-relative happy paths and empty fallbacks — good for the implemented contract, silent on discipline subfolders.

### P2 — internal re-export / dual home of pipeline shape

`skillPipelineSchema` is defined in `packages/schema/src/frontmatter.ts` and re-exported from `packages/schema/src/catalog.ts` (`export { skillPipelineSchema }`). Public barrel also exports from frontmatter. Low risk of divergence today; slightly noisy ownership if pipeline rules grow (bundle order vs skill.pipeline.next).

### Positive alignment notes (not defects)

1. **Boundary hygiene:** schema is pure validation/types (+ path inference); providers is pure path/detect helpers with **zero network** and no LLM surface — matches hard product rules.
2. **Index-centric core:** `catalogIndexSchema` with required skills, optional `bundles`, literal `schemaVersion: 1`, and **no heat/install counters** in the skill row aligns with “heat is a side channel.”
3. **Frontmatter ↔ catalog layering:** frontmatter keeps layer/scope/disciplines optional (agentskills minimum); catalog skill requires layer/scope/install — correct place for build-time enrichment.
4. **Shared pipeline shape** between frontmatter and catalog skill entries reduces duplication of Handoff fields.
5. **Providers orthogonality:** install destinations are not mixed into catalog index types — correct separation of “what to install” vs “where to write.”
6. **Schema tests** (`kebab`, `frontmatter`, `catalog`, `scope-layer`) are relatively thorough for happy/reject paths, including pipeline promotion from `metadata.pipeline`.

---

## Opportunities

1. **Single schemaVersion export:** Have catalog build (and any emitters) import `SCHEMA_VERSION` from `@openwisdom/schema` so bumps are compile-visible.
2. **Promote secondary index artifacts to schema:** Add zod for `manifest.json` and `payload-index.json` (or document an explicit “catalog-only” boundary and keep core-local types with a cross-package test that round-trips build output).
3. **Optional discipline enum / refine:** `z.enum([...seven...])` or a soft warning mode in catalog build; keep open community tags if needed via a separate freeform field.
4. **Providers table hardening:** Derive `ProviderId` as a union of table ids; add a unit test that asserts unique `id` and unique normalized aliases; expand detect/resolve matrix tests for every tier-p0 path asymmetry.
5. **Subpath exports (optional):** If web ever needs only types, consider `exports` conditions; today root export of dist is sufficient for CLI/core.
6. **Integrity helpers:** Catalog-side refine for unique skill ids, bundle `skillIds ⊆ skills[].id`, and pipeline `next` existence — either in schema superRefine or catalog build (prefer build for graph rules, schema for shape).

---

## Risks

| Risk | Why it matters | Likelihood |
|------|----------------|------------|
| Schema version fork | Catalog/build and validators disagree after a partial bump → silent reject or false accept of registry JSON | Medium over time |
| Manifest/payload drift | Offline install / CDN path breaks while `catalog.json` still parses | Medium |
| Provider path regression | Wrong global/project dir → user skills land in invisible locations; dedupe first-wins can surprise multi-harness installs | Medium (mitigated by existing codex/agents test) |
| Discipline string chaos | Weak discovery/filter quality on web catalog | Low–medium |
| Spec comments vs knowledge base | Source comments still cite “Spec 19/20/33”; authority is now `docs/知识库` — contributor confusion, not runtime risk | Low |

No evidence of circular deps, LLM coupling, or schema/providers writing heat into skill contracts.

---

## Recommended next claims

1. **cN — Schema version + secondary artifacts**  
   Wire `SCHEMA_VERSION` through catalog build; optionally move `RegistryManifest` / `PayloadIndex` shapes into `@openwisdom/schema` with parse helpers used by core registry.

2. **cN — Providers test matrix + table integrity**  
   Expand `packages/providers/src/index.test.ts` for `detectProviders`, all p0 path pairs, experimental skip, empty CSV; add uniqueness assertions over `PROVIDERS`.

3. **cN — Catalog graph validation (build-time)**  
   Unique skill ids, bundle membership, pipeline `next` references — keep shape in schema, graph rules in `@openwisdom/catalog` with golden fixtures.

4. **cN — Discipline policy**  
   Decide enum-vs-freeform in product decision log; implement refine or catalog lint accordingly.

5. **cN — Consumer audit (core/cli/mcp)**  
   Follow-on architecture claim: verify every parse of remote/snapshot `catalog.json` goes through `catalogIndexSchema` (no hand-rolled partial types for install-critical paths).

---

*End of c1 audit. Write surface limited to this report path + Homer evidence.*
