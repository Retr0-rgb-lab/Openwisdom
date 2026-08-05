# Architecture audit synthesis — wave `w-arch-audit-01`

**Contract:** Homer `v001` · **Meta wave:** closed · **Claims:** c1–c4, c5b, c6, c7 all `gate passed`  
**Mode:** read-only audit (no product code changes in this wave)

## Implementation wave `w-impl-arch-01` (done)

**Contract:** Homer `v002` · **Claims:** i1–i7 all `gate passed` · **Verify:** `pnpm test` + `pnpm catalog:check-hash` + `homer validate` green  
Landed: SPE36 docs, payload-aware contentHash + hard graph fails, core install fail-loud + silent default log + honest telemetry source, MCP search/list registry parity, CLI version + surface tests, web server/client catalog split + in-process heat, catalog hash script + GH workflow.

### Implementation follow-up (wave `w-impl-arch-01`)

- **Hash gate (claim i7):** `scripts/check-catalog-hash.mjs` + root `pnpm catalog:check-hash` assert `contentHash` (and `skillCount` when present) parity across `packages/cli/catalog-snapshot`, `packages/mcp/catalog-snapshot`, and `apps/web/public/registry` manifests. Optional CI: `.github/workflows/catalog-hash.yml`.
- **Release:** always run `pnpm catalog:sync-web` before publish so fan-out snapshots stay aligned; then `pnpm catalog:check-hash`.

## Slice reports

| Claim | Area | Report |
|-------|------|--------|
| c1 | schema + providers | [01-schema-providers/REPORT.md](./01-schema-providers/REPORT.md) |
| c2 | core | [02-core/REPORT.md](./02-core/REPORT.md) |
| c3 | CLI | [03-cli/REPORT.md](./03-cli/REPORT.md) |
| c4 | MCP | [04-mcp/REPORT.md](./04-mcp/REPORT.md) |
| c5b | catalog + skills | [05-catalog-skills/REPORT.md](./05-catalog-skills/REPORT.md) |
| c6 | web | [06-web/REPORT.md](./06-web/REPORT.md) |
| c7 | monorepo glue | [07-monorepo/REPORT.md](./07-monorepo/REPORT.md) |

## Cross-cutting themes (priority for next Homer freeze)

### 1. Catalog / snapshot / contentHash integrity (P1, multi-surface)

- `contentHash` is largely metadata-level; payload/body drift can slip through (c5).
- Dual-write / snapshot shipping couples npm package size to full skill tree (c3/c4/c5).
- Docs still mention core dual-write; code (SPE 36) is cli + mcp + web only (c7).
- Missing automated hash/parity CI (c7, c5) — **addressed in w-impl-arch-01 / i7** via `scripts/check-catalog-hash.mjs`, `pnpm catalog:check-hash`, and `.github/workflows/catalog-hash.yml` (manifest contentHash + skillCount parity only; payload-body integrity still open).

**Next claims (suggested):** `catalog-payload-hash-gate` (deeper than manifest), `doc-spe36-alignment`, `release-path-catalog-sync-web` (process/doc; release still must run `pnpm catalog:sync-web` before publish).

### 2. Core install / path / telemetry seams (P1)

- Silent empty catalog on load failure during install; overlapping path ladders; default log/telemetry source skew (c2).
- MCP search/list lack registry/noRemote tool parity with install (c4).

**Next claims:** `core-install-catalog-fail-loud`, `core-path-ladder-unify`, `mcp-search-list-registry-parity`.

### 3. Web catalog dual-truth + client cost (P1)

- Client imports full catalog merge path; heat RSC self-HTTP; rate-limit memory-only (c6).
- Materialize community from web seeds inverts “git skills truth” for community layer (c5/c7).

**Next claims:** `web-catalog-server-client-split`, `web-heat-inprocess-rsc`, `community-materialize-audit`.

### 4. Adapter thinness is good; version/test gaps (P1–P2)

- CLI/MCP correctly avoid LLM/analyze (hard rule holds).
- Manual version constants + tests that soft-skip or hit core instead of adapter (c1/c3/c4).

**Next claims:** `version-single-source`, `cli-surface-tests`, `mcp-snapshot-tests-hard-fail`.

## What is healthy

- Package DAG acyclic; schema/providers/core/cli/mcp layering mostly clean.
- No P0 product-boundary breach (no hosted analysis, no LLM in CLI/MCP).
- Current multi-target catalog hash alignment (118 skills) observed at audit time.
- Telemetry fail-open pattern present by design.

## Homer process notes (for next wave)

1. L1 `acceptance` is **shared across all claims** — each `return.json` must evidence **every** acceptance id (or redesign L1 to a single wave-level acceptance after all reports land).
2. Prefer path-disjoint write slices under `docs/audits/**` only for pure audits; avoid leasing `scripts/**` + a single script file in parallel.
3. Claim ids are not reusable after `release` (`CLAIM_EXISTS`) — use `c5b`-style ids.
4. PowerShell: pass `--parallel` JSON via `node bin/homer-meta.js` with proper quoting (pnpm/PS strip quotes easily).
5. Implementer `return.json` often fails strict schema (`status`, extra evidence fields) — cold-start should paste the exact schema fields only.

## Suggested next freeze (implementation, not audit)

Order of attack if improving architecture:

1. Doc SPE 36 + catalog hash CI (low risk, high agent-trust) — hash gate landed in **i7** (`catalog:check-hash` + GH workflow); SPE36 docs may still need i1
2. Core install fail-loud + path unify
3. Web catalog server/client split
4. MCP/CLI registry parity + hard snapshot tests
5. contentHash → payload integrity + community stub audit
