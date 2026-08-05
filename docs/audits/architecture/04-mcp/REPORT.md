# Architecture audit — packages/mcp (`openwisdom-mcp`)

**Claim:** c4 · **Contract:** v001 · **Mode:** read-only (no product code edits)  
**Surfaces reviewed:** `packages/mcp/src/**`, `packages/mcp/package.json`, `tsup.config.ts`, shipped `catalog-snapshot/` + `skills-snapshot/`, tests, README.

---

## Scope

Audit of the **MCP adapter** only: stdio tool surface, registration/schemas, parity with CLI + `@openwisdom/core`, no-LLM boundary, error/result packaging, offline snapshot packaging, and thin-adapter discipline.

**In scope**

| Area | Paths |
|------|--------|
| Entry / transport | `packages/mcp/src/mcp.ts` |
| Tool registration | `packages/mcp/src/server.ts` |
| Handlers | `packages/mcp/src/tools/{search,list,get,install,update,detect-providers,skill-card}.ts` |
| Result / env / root | `packages/mcp/src/lib/{result,env,package-root}.ts` |
| Version / bin | `packages/mcp/src/version.ts`, `package.json`, `tsup.config.ts` |
| Offline packaging | `packages/mcp/catalog-snapshot/**`, `packages/mcp/skills-snapshot/**` |
| Tests | `packages/mcp/src/{get,install}.test.ts` |

**Out of scope (read for parity context only):** deep implementation of `packages/core` install/registry algorithms, CLI UX, website, skill body authorship.

**Product stance (confirmed in code + README):** package manager for agent skills over **stdio** — not a hosted chatbot; analysis runs in the **host agent session**, not via MCP tools.

---

## Findings

### Architecture (healthy)

1. **Thin adapter over one core** — Handlers call `@openwisdom/core` (`searchCatalog`, `loadCatalog`, `ensureRemoteCatalog`, `runInstall`, `listInstalled`, `getSkillDetail`) and `@openwisdom/providers` (`detectProviders`, `parseProvidersFlag`). No reimplementation of install/catalog algorithms in MCP. Paths: `packages/mcp/src/tools/*.ts`.

2. **Six registered tools; package-manager only** — `openwisdom_search`, `openwisdom_list`, `openwisdom_get`, `openwisdom_install`, `openwisdom_update`, `openwisdom_detect_providers` in `packages/mcp/src/server.ts`. Descriptions explicitly forbid recommend/run/analyze and state analysis stays in the agent session.

3. **No-LLM boundary held** — No model SDK, API keys, chat sessions, or `run`/`analyze` tools under `packages/mcp/src`. Grep of handlers shows only core/providers/schema(type) imports. `onLog` on install/update is a no-op so core success noise never hits stdout (`install.ts`, `update.ts`).

4. **stdio protocol hygiene** — Entry uses `StdioServerTransport` (`mcp.ts`); fatal errors use `console.error` only. Handlers return `content` + optional `structuredContent` via `lib/result.ts` and never write business frames to stdout.

5. **Non-interactive contract** — Install requires explicit `providers[]` (and skills and/or `bundle`); update requires providers unless `refreshOnly`. Aligns product rule “MCP: no TTY prompts”. Telemetry uses `telemetrySource: "mcp"` + `clientVersion: MCP_VERSION`.

6. **Offline dual packaging** — npm `files` include `dist`, `catalog-snapshot`, `skills-snapshot`. Root resolved via `getMcpPackageRoot()` → core `getPackageRoot`. Catalog pipeline dual-writes snapshots into CLI and MCP (`packages/catalog` build). Tests cover snapshot install/get when trees exist.

7. **Build model** — `tsup` bundles `@openwisdom/core|schema|providers` into `dist/mcp.js` (`noExternal`); keeps `@modelcontextprotocol/server` and `zod` external. Matches CLI “self-contained bin” pattern; workspace packages live as **devDependencies** intentionally for monorepo build, not as runtime npm deps of published bin.

### Severity-tagged findings

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| F1 | **P1** | **Search/list remote knobs incomplete vs install/update.** Install/update expose `registry` / `noRemote` tool fields; search/list only call `ensureRemoteCatalog({ env, forceRefresh? })` — registry override is env-only (`OPENWISDOM_REGISTRY` / `OPENWISDOM_NO_REMOTE`), not tool args. Agent sessions that pass `registry` on install cannot mirror that on discovery without env. | `tools/search.ts` L49–52; `tools/list.ts` L47–48; contrast `tools/install.ts` L145–169; `server.ts` install/update schemas |
| F2 | **P1** | **Tests soft-skip when snapshots/skills missing.** Several cases `return` early if `skills-snapshot` or monorepo `skills/` absent. Local/CI without a prior catalog build can report green while offline packaging is broken. | `install.test.ts` L117–122, L239–242, L293–296; `get.test.ts` early returns |
| F3 | **P2** | **`MCP_VERSION` duplicated manually** in `src/version.ts` and `package.json` (`0.1.4`). Drift risk for telemetry `clientVersion` and MCP server meta. | `version.ts`; `package.json` L3 |
| F4 | **P2** | **CLI vs MCP published version skew** (`openwisdom` 0.1.3 vs `openwisdom-mcp` 0.1.4). Not wrong, but dual release cadence needs explicit dual-write/snapshot policy so agents don’t assume lockstep. | `packages/cli/package.json`; `packages/mcp/package.json` |
| F5 | **P2** | **`openwisdom_list` reuses `scope` for two domains** — `project\|global` (installed write scope) vs `official\|community` (catalog filter). Documented in schema, still easy for agents to pass the wrong enum value for mode. | `server.ts` L105–110; `list.ts` L18–22, L60–64, L101–105 |
| F6 | **P2** | **Install `idempotentHint: true`** while `force: true` overwrites conflicting `SKILL.md`. Annotation is optimistic for “same args safe to retry”; force path is not purely idempotent in the conflict sense. | `server.ts` L252–257; `install.ts` force → `runInstall` |
| F7 | **P2** | **No stdio transport integration test.** Coverage is pure-handler only; connect/handshake/tool-list wire behavior untested. | `mcp.ts`; tests import handlers only |
| F8 | **P2** | **MCP-only `openwisdom_get`** (CLI has no `get` subcommand). Good agent UX; parity docs must treat get as intentional MCP extension, not a CLI gap. | `tools/get.ts`; CLI `cli.ts` subCommands: search/list/install/update only |
| F9 | **P2** | **Zod major split:** MCP depends on `zod ^4.2` (SDK v2); monorepo schema historically Zod 3. Mitigated by `import type` for `CatalogSkill` and bundling core. Residual risk if a shared runtime zod schema object is imported across versions later. | `package.json` deps; `skill-card.ts` type-only import; README SDK note |
| F10 | **P0** | **None observed** for hard product-boundary break (no analyze/LLM tools, stdout reserved for protocol, install fail-open telemetry pattern delegated to core). Residual P0 would be **outside** this package (core logging to stdout, or a future tool that calls models). | `server.ts`, `mcp.ts`, `result.ts` |

### Parity matrix (MCP vs CLI vs core)

| Capability | Core | CLI | MCP | Notes |
|------------|------|-----|-----|-------|
| search (+ tag/filters) | yes | `search` | `openwisdom_search` | MCP + refresh flag; no tool-level registry/noRemote (F1) |
| list available/installed | yes | `list` | `openwisdom_list` | MCP dual `scope` (F5) |
| get SKILL.md body | `getSkillDetail` | — | `openwisdom_get` | MCP extension (F8) |
| install + bundle | `runInstall` | `install` | `openwisdom_install` | MCP requires providers; CLI may prompt |
| update / refresh-only | yes | `update` | `openwisdom_update` | Parity for refreshOnly + force default false |
| detect providers | providers pkg | interactive | `openwisdom_detect_providers` | MCP explicit tool |
| analyze / run / recommend | n/a | no | no | Boundary OK |

### Snapshot packaging

- `catalog-snapshot/manifest.json`: schemaVersion 1, skillCount 118 (as of audited tree), payload mode `per-skill-tree`, `mcpMinVersion` 0.1.0.
- `skills-snapshot/` mirrors official + community trees for offline install/`get`.
- Integrity depends on catalog package dual-write; MCP does not self-build snapshots at runtime.

---

## Opportunities

1. **Tool-level `registry` / `noRemote` on search & list** — Match install/update so agent workflows can pin registry without mutating process env (closes F1).

2. **CI gate: snapshot presence** — Fail MCP tests when `catalog-snapshot/catalog.json` or core official skills in `skills-snapshot` are missing after `catalog` build in the release job (closes F2 soft-skips).

3. **Generate `MCP_VERSION` from package.json** at build time (or single source import) to eliminate F3 drift.

4. **stdio smoke test** — Spawn `dist/mcp.js`, assert tools/list includes the six names and a dry-run install returns JSON with `ok` (F7).

5. **Split list filters in schema** — e.g. `installScope` vs `catalogScope` (or mode-discriminated zod) to reduce agent mis-calls (F5).

6. **Document MCP-only get + recommended flow** in product knowledge-base MCP topic (already in package README); keep intentional asymmetry vs CLI.

7. **Optional shared snapshot hash assert** — After catalog dual-write, assert CLI and MCP `catalog-snapshot` `contentHash` equal in monorepo CI.

---

## Risks

| Risk | Sev | Why it matters | Mitigation direction |
|------|-----|----------------|----------------------|
| Future “help me analyze” tools | P0 product | Would violate hard rule #1 and MCP README | Keep tool allowlist frozen; reject run/analyze in review |
| Core `console.log` on install path | P0 protocol | Corrupts MCP JSON-RPC on stdout | Core must stay silent when `onLog` supplied / isTty false (already no-op from MCP) |
| Snapshot dual-write drift | P1 | npm MCP offline install differs from CLI/website | Catalog build always writes both packages; CI hash check |
| Soft-skipped tests in CI | P1 | Offline packaging regressions ship unnoticed | F2 gate |
| Large `skills-snapshot` in npm tarball | P2 | Slow `npx -y openwisdom-mcp` cold start | Remote-first + slim snapshot policy (product/catalog claim) |
| Annotation mismatch (idempotent/force) | P2 | Agents over-trust safe retry with force | Adjust hints or docs (F6) |
| Env-only discovery registry | P1 | Wrong catalog source mid-session | F1 tool args |

---

## Recommended next claims

| Priority | Claim (suggested id) | Intent | Primary paths |
|----------|----------------------|--------|---------------|
| **P1** | mcp-search-list-registry-parity | Add optional `registry` / `noRemote` (and document env fallback) on `openwisdom_search` and `openwisdom_list`; wire into `ensureRemoteCatalog` / `loadCatalog` opts | `packages/mcp/src/server.ts`, `tools/search.ts`, `tools/list.ts` |
| **P1** | mcp-test-snapshot-hard-fail | Replace soft `return` skips with CI-aware hard asserts when catalog build artifacts are required; keep local soft only behind env | `packages/mcp/src/*.test.ts`, catalog release job |
| **P2** | mcp-version-single-source | Generate or import version from `package.json` into `version.ts` / banner | `packages/mcp/src/version.ts`, `package.json`, `tsup.config.ts` |
| **P2** | mcp-stdio-smoke | Minimal transport test: list tools + one dry-run install over stdio or SDK in-process server | `packages/mcp/src/` new test, `dist/mcp.js` |
| **P2** | mcp-list-scope-schema-split | Discriminated schemas for available vs installed list args | `packages/mcp/src/server.ts`, `tools/list.ts` |
| **P2** | catalog-dual-snapshot-assert | After dual-write, assert CLI/MCP catalog `contentHash` match | `packages/catalog/**`, CI |
| **P2** | docs-mcp-get-asymmetry | Record intentional MCP `get` vs CLI absence in knowledge-base MCP topic (not product code) | `docs/知识库/*` MCP topic |

**Suggested sequencing:** dual-snapshot CI + hard snapshot tests (release safety) → search/list registry parity (agent UX) → version single-source + stdio smoke → schema polish.

---

*Audit method: static review of `packages/mcp` sources, packaging manifests, and CLI command surface for parity. No product files modified. Report-only claim c4.*
