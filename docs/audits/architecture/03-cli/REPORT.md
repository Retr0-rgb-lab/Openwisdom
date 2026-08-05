# Architecture audit — packages/cli (openwisdom)

**Claim:** c3 · **Contract:** v001 · **Review surface:** `packages/cli/**` (read-only)  
**Focus:** thin adapter vs core · command structure · interactive install · snapshot coupling · telemetry flags · test coverage

---

## Scope

This audit covers the published **openwisdom** CLI package (`packages/cli`): entrypoint, four citty subcommands, local helpers, shipped snapshots, build/publish shape, and package-local tests. Product code under `packages/cli` was **not** modified.

In scope:

| Area | Paths |
|------|--------|
| Entry / version | `packages/cli/src/cli.ts`, `packages/cli/src/version.ts` |
| Commands | `packages/cli/src/commands/{search,list,install,update}.ts` |
| Adapter helper | `packages/cli/src/lib/collect-skill-ids.ts` |
| Tests | `packages/cli/src/install.test.ts`, `packages/cli/src/telemetry.test.ts` |
| Publish / build | `packages/cli/package.json`, `packages/cli/tsup.config.ts`, `packages/cli/README.md` |
| Offline payload | `packages/cli/catalog-snapshot/**`, `packages/cli/skills-snapshot/**` (presence & coupling only) |

Out of scope for this claim: implementing core/MCP/web fixes; rewriting snapshot generation in `packages/catalog` (only noted as upstream of CLI payload); full monorepo pipeline design (peer claim territory).

Method: static review of adapter code against the intended dual-surface model (CLI + MCP → shared `@openwisdom/core`, no LLM, package-manager only).

---

## Findings

### P1 — Version string duplicated; drift risk between npm and CLI UX

- **Severity:** P1  
- **Paths:** `packages/cli/src/version.ts` (`CLI_VERSION = "0.1.3"`), `packages/cli/package.json` (`"version": "0.1.3"`)  
- **Evidence:** Comment in `version.ts` says “Keep in sync with packages/cli/package.json”, but there is no codegen or test asserting equality. `CLI_VERSION` is wired into citty `meta.version`, early `-V`/`--version` handling in `cli.ts`, and `clientVersion` / telemetry payload via install & update commands.  
- **Why it matters:** A release that bumps only `package.json` ships wrong `--version` and wrong `cliVersion` in heat events, breaking support triage and install analytics attribution.

### P1 — Package tests exercise core, not the CLI adapter surface

- **Severity:** P1  
- **Paths:** `packages/cli/src/install.test.ts`, `packages/cli/src/telemetry.test.ts`  
- **Evidence:** Both files import `runInstall` / `searchCatalog` / `loadCatalog` / telemetry helpers **directly from `@openwisdom/core`**. They do not spawn `dist/cli.js`, do not drive citty `run` handlers, and do not cover `collectSkillIds`, interactive `@clack/prompts` branches, arg validation exit codes (2 vs 1), or multi-id / `--bundle` parsing at the CLI layer.  
- **Why it matters:** `pnpm --filter openwisdom test` can stay green while the thin adapter (flags, rawArgs collection, TTY gates, cancel paths) regresses. Comment in install tests even frames them as “re-runs core install acceptance”.

### P1 — Shipped `skills-snapshot` + `catalog-snapshot` tightly couple npm bin size to full skill tree

- **Severity:** P1  
- **Paths:** `packages/cli/package.json` (`files`: `catalog-snapshot`, `skills-snapshot`), trees under `packages/cli/catalog-snapshot/`, `packages/cli/skills-snapshot/` (mirrored from monorepo skills; manifest shows ~118 skills), generation ownership in `packages/catalog` (upstream of CLI publish)  
- **Evidence:** README documents offline load via package snapshot; install tests prefer CLI package root for catalog; core tests elsewhere treat CLI as the offline snapshot host. The CLI package therefore **embeds** both index and full skill payloads for published installs.  
- **Why it matters:** Every skill body change forces republish weight; dual mirrors (CLI + MCP) risk snapshot skew if catalog build is partial; published tarball size and cache invalidation become product constraints not visible in the small `src/` tree.

### P2 — Adapter is mostly thin; install holds the only substantial CLI-local UX logic (correct placement, incomplete coverage)

- **Severity:** P2 (architecture health note, not a design violation)  
- **Paths:** `packages/cli/src/commands/install.ts`, `packages/cli/src/commands/update.ts`, `packages/cli/src/commands/search.ts`, `packages/cli/src/commands/list.ts`  
- **Evidence:**  
  - **search / list:** thin wrappers around `ensureRemoteCatalog`, `loadCatalog`, `searchCatalog`, `listInstalled`, `parseProvidersFlag`.  
  - **update:** non-interactive path reuses `runInstall` with `telemetrySource: "cli"`; optional `--refresh-only` catalog cache path.  
  - **install:** owns TTY/CI/`-y` policy, `@clack` scope select + provider multiselect (`promptProviders` using `detectProviders` / `PROVIDERS` from `@openwisdom/providers`), then delegates write path entirely to `runInstall`.  
- **Why it matters:** Matches Skilldex-style “two interfaces, one core”. Residual risk is that install’s interactive policy is the only non-trivial adapter code and is untested (see P1 tests).

### P2 — `collectSkillIds` is shared fragile arg parsing without unit tests

- **Severity:** P2  
- **Paths:** `packages/cli/src/lib/collect-skill-ids.ts`, consumers in `install.ts` / `update.ts`  
- **Evidence:** Manual scan of citty `rawArgs` with a fixed `FLAG_VALUE_KEYS` set (`--providers`, `--scope`, `--cwd`, `--lang`, `--registry`, `--bundle`). Unknown value-taking flags would be mis-classified as skill ids; short aliases other than bare `-` skip rely on “starts with `-`”. No dedicated test file.  
- **Why it matters:** Multi-id install/update is a primary UX promise (`install id1 id2`); silent mis-parse produces confusing core errors rather than usage exit 2.

### P2 — Telemetry flags correctly delegated; dual opt-out paths only partially re-tested at CLI package

- **Severity:** P2  
- **Paths:** `packages/cli/src/commands/install.ts` (`--no-telemetry` → `noTelemetry`, `telemetrySource: "cli"`, `clientVersion: CLI_VERSION`), same pattern in `update.ts`, `packages/cli/src/telemetry.test.ts`, README “Telemetry (fail-open)”  
- **Evidence:** CLI does not implement HTTP; it passes flags into core. Package tests cover `isTelemetryEnabled` for `--no-telemetry` and `CI`, and `reportInstallSuccess` fail-open, but not wiring from citty args → `runInstall` options, nor env `OPENWISDOM_NO_TELEMETRY` at the command layer.  
- **Why it matters:** Product rule “fail open; heat not in SKILL.md” is preserved architecturally; regression would more likely be wrong `source` / missing flag plumb than network hard-fail.

### P2 — Reserved / dead flags and uneven non-interactive policy

- **Severity:** P2  
- **Paths:** `packages/cli/src/commands/install.ts` (`lang` reserved, never read after parse), `install.ts` vs `update.ts` TTY/`yes` handling  
- **Evidence:** `--lang` description says “Prompt language zh|en (reserved)” and is only listed in `collect-skill-ids` skip sets. Install requires `--providers` or `-y` when non-TTY/CI; update forces `yes = Boolean(args.yes) || !isTty` then calls `runInstall` (providers may still be required inside core).  
- **Why it matters:** Docs/help surface unfinished i18n; asymmetric interactive policy between install and update can confuse scripting users.

### P2 — Workspace packages bundled into single ESM bin (good ship shape; blurs dependency graph)

- **Severity:** P2  
- **Paths:** `packages/cli/tsup.config.ts` (`noExternal`: core, schema, providers, zod), `packages/cli/package.json` (runtime deps only `@clack/prompts` + `citty`; core/schema/providers as **devDependencies**)  
- **Evidence:** Self-contained `dist/cli.js` for `bin.openwisdom`. Consumers of the npm package do not resolve workspace packages at runtime.  
- **Why it matters:** Correct for a published bin, but means CLI “adapter” binary actually embeds core install semantics; debugging “is this a CLI bug or core bug?” requires source maps / monorepo checkout. Not a v1 blocker.

### Positive (no severity)

- **No LLM / no `run` analysis surface** in command set (`search` / `list` / `install` / `update` only) — aligns with hard product rules.  
- **Exit code conventions** roughly consistent: usage → 2 (`UsageError` / explicit messages), operational failure → 1.  
- **Post-install copy** reminds users analysis runs in their agent, not on Openwisdom servers (`install.ts`).

---

## Opportunities

1. **Single source of version** — generate `version.ts` from `package.json` at build time, or assert equality in a tiny test.  
2. **Adapter-level tests** — vitest cases for `collectSkillIds`; optional smoke spawning `node dist/cli.js …` for usage exit codes (`search` without query, `install` without ids, non-TTY without providers). Mock `@clack/prompts` for cancel / multiselect once.  
3. **Snapshot strategy** — document and automate dual CLI/MCP snapshot parity in catalog build CI; consider optional slim publish (catalog index only + on-demand fetch) if tarball weight becomes a support issue (product decision; not this claim).  
4. **Remove or implement `--lang`** — either drop from help until prompts are localized, or wire clack message locale.  
5. **Align update non-interactive defaults** with install’s explicit missing-`--providers` error path for clearer scripting UX.  
6. **README truth sources** — still points at retired `docs/specs/18–20`; prefer knowledge-base CLI topic when docs are next touched (doc-only; outside code freeze of this audit wave).

---

## Risks

| Risk | Impact if ignored |
|------|-------------------|
| Version / telemetry metadata drift | Mis-attributed heat; support “which CLI?” confusion |
| Adapter untested | Flag regressions ship while core tests pass |
| Snapshot skew (CLI vs MCP vs monorepo skills) | Install from npm differs from GitHub tree; trust erosion |
| Embed-all skills in npm | Slow publish/install; accidental large binary growth as community skills grow |
| Fragile multi-id arg parse | Silent wrong skill list → partial installs or spurious not-found |
| Interactive-only policy bugs | CI/scripts fail opaquely; TTY users get different defaults than docs |

None of the above is framed as an immediate security P0 from this review: no model keys, no network install that bypasses local/registry design, telemetry remains fail-open and opt-out capable.

---

## Recommended next claims

1. **c3-followup / CLI adapter tests** — Unit tests for `collect-skill-ids.ts`; smoke tests for citty usage exits; optional mocked interactive install. Write only under `packages/cli` tests + fixtures.  
2. **Version single-source** — Build-time sync of `CLI_VERSION` ↔ `package.json` (CLI package only).  
3. **Catalog publish hygiene** (likely `packages/catalog` + CI, peer of c5) — Assert CLI/MCP `catalog-snapshot` + `skills-snapshot` content hashes match after build; fail publish on skew.  
4. **CLI/MCP flag matrix doc or table-driven test** — Shared expectation list: `--no-telemetry`, `--no-remote`, `--registry`, bundle/tag behavior, so dual surfaces stay symmetric without peer chat on each change.  
5. **Optional product claim** — Slim offline package strategy (index + remote skill payload) if snapshot weight is confirmed as a user-facing problem; needs product decision beyond architecture note.

---

*Audit only. No production sources under `packages/cli/src` were modified for claim c3.*
