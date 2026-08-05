# Architecture audit — `@openwisdom/core`

**Claim:** c2 · **Contract:** v001 · **Scope path:** `packages/core/src/**`  
**Focus:** catalog load, install orchestration, telemetry, payload-resolve, registry, skills-root / path ladders · boundary pressure on CLI/MCP · fail-open telemetry · path-resolution complexity.

---

## Scope

Read-only architecture review of `@openwisdom/core` (`packages/core`), the shared non-interactive install/catalog library consumed by CLI and MCP adapters. Surfaces audited:

| Module | Path | Role |
|--------|------|------|
| Public barrel | `packages/core/src/index.ts` | API surface; declares no citty/clack/`process.exit` |
| PayloadResolve | `packages/core/src/payload-resolve.ts` | Single seam for catalog / body / install path ladders (SPE 35) |
| Catalog helpers | `packages/core/src/catalog.ts` | Re-export load/scan; `searchCatalog` / `resolveBundle` |
| Skills-root alias | `packages/core/src/skills-root.ts` | Thin re-export of body-policy APIs |
| Registry | `packages/core/src/registry.ts` | Remote manifest/catalog/payload + disk cache (SPE 33) |
| Install | `packages/core/src/install.ts` | `runInstall`, providers, listInstalled, Usage/Runtime errors |
| Telemetry | `packages/core/src/telemetry.ts` | Fail-open install-success POST |
| Paths / copy / frontmatter / get-skill | `paths.ts`, `copy-skill.ts`, `frontmatter.ts`, `get-skill.ts` | Roots, staging write, SKILL.md parse, detail read |

**In scope for judgment:** module cohesion, dual-surface fitness (CLI human + MCP stdio), fail-open vs fail-closed places, path-ladder complexity and drift, public API width, stderr/logging hygiene, security guards on remote and local paths.

**Out of scope (this claim):** product code changes; CLI/MCP package implementation edits; web heat API; live network registry health.

**Method:** source + test review under `packages/core/src` only (including `*.test.ts` policy matrix). No peer packages modified; CLI/MCP boundary conclusions inferred from core’s public contracts and comments (e.g. `isTty`, `telemetrySource`, stderr defaults).

---

## Findings

### Strengths (context for severities)

- Clear library charter: no process exit, no TTY prompts by default; CLI is expected to inject `isTty` / providers (`install.ts`, `index.ts`).
- PayloadResolve documents three policy modes (catalog / body / install) with SPE 33 install order and intentional differences (body does not force remote; install prefers remote over stale npm snapshot).
- Registry `ensureRemoteCatalog` / `ensureRemoteSkillDir` return soft results (`ok:false` / `null`) on network failure; catalog load can still use disk cache or snapshots.
- Telemetry `reportInstallSuccess` never rejects; opt-outs for `--no-telemetry`, `OPENWISDOM_NO_TELEMETRY`, `CI`, missing URL; short timeout; install fires with `void` (non-blocking).
- Path traversal guards on skill ids (`locateSkillDir`) and registry `repoPath` / `safeRelFile`; registry base restricted to https (or localhost http).
- Install write uses staging + rename and Unicode-safe recursive copy (Windows non-ASCII monorepo paths).
- Dependencies limited to `@openwisdom/schema` + `@openwisdom/providers` — no LLM, no web framework.

### P0

*None observed in this read-only pass.* Fail-open telemetry and fail-open registry ensure paths are implemented as documented; no silent security bypass (HTTPS, `..` rejection) was found that would warrant immediate production stop. Residual concerns below are P1/P2.

### P1

1. **Silent empty catalog on load failure masks misconfiguration**  
   **Path:** `packages/core/src/install.ts` (`runInstall`, catalog load try/catch → `{ schemaVersion: 1, skills: [] }`).  
   If `loadCatalog` throws (missing snapshot, bad env, corrupt tree), install continues with an empty index. Bundle resolution then fails with “unknown bundle”, and skill resolution falls through local/remote/snapshot with opaque “skill not found” errors. Operators lose the original catalog failure reason. Prefer rethrow as `RuntimeError` or attach `catalogLoadError` to result while still allowing offline partial paths intentionally.

2. **Library stderr via `console.error` pressures MCP / embedded hosts**  
   **Paths:** `packages/core/src/payload-resolve.ts` (invalid snapshot / skip skill), `packages/core/src/registry.ts` (`log` default), `packages/core/src/install.ts` (`log` default), `packages/core/src/telemetry.ts` (`OPENWISDOM_TELEMETRY_DEBUG`).  
   Charter says no `process.exit` and optional `onLog`, but several paths still write stderr when `onLog` is omitted. MCP stdio protocol needs clean stdout (core mostly respects that) and predictable stderr. Uninjected library use can spam agent sessions or CI. Default should be fully silent unless `onLog` is provided, or a shared `Logger` type used everywhere.

3. **Default `telemetrySource: "cli"` mis-attributes MCP installs**  
   **Paths:** `packages/core/src/install.ts` (`reportInstallSuccess` call), `packages/core/src/telemetry.ts` (`buildInstallSuccessPayload` default `source ?? "cli"`).  
   Heat/ranking depends on channel honesty. If MCP adapter forgets `telemetrySource: "mcp"`, installs count as CLI. Event name is always `cli_install_success` even when `source: "mcp"` — schema leak that will confuse analytics consumers.

4. **Path-ladder triple is correct but high cognitive load / drift risk**  
   **Paths:** `packages/core/src/payload-resolve.ts` (body / install / catalog policies), thin aliases `skills-root.ts` + `resolveInstallSourceDir` in `install.ts`, `paths.ts` (`getPackageRoot` / `findMonorepoRoot` / snapshots).  
   Body: env → monorepo → package skills-snapshot (no remote).  
   Install: env/monorepo local → remote cache download → package snapshot.  
   Catalog: explicit path → local monorepo prefer snapshot-or-scan → registry disk cache → package catalog-snapshot → scan.  
   Slightly different snapshot and remote rules are intentional (SPE 33/35) but duplicated root discovery (`OPENWISDOM_SKILLS_ROOT`, mono, packageRoot, `fromUrl`) appears in multiple functions. Future changes easily break one mode without the others. Policy matrix tests help (`payload-resolve.test.ts`) but the module remains a single large file owning types + scan + three ladders.

5. **`getPackageRoot` multi-name walk can bind the wrong snapshot host**  
   **Path:** `packages/core/src/paths.ts` (`PACKAGE_NAMES`: `@openwisdom/core`, `openwisdom`, `openwisdom-mcp`).  
   When resolving from a bundled host `fromUrl`, first matching package.json name wins. Snapshot layout may live only on CLI or only on MCP or only on core depending on publish strategy. Wrong root → empty/missing `catalog-snapshot` / `skills-snapshot` and fallback to scan/remote with surprising behavior. Needs a single documented “payload host package” rule or always inject `packageRoot` from adapters.

6. **Remote skill download is text-only**  
   **Path:** `packages/core/src/registry.ts` (`ensureRemoteSkillDir` → `fetchText` + `writeFileSync(..., "utf8")`).  
   Fine for SKILL.md and markdown/JSON assets; binary skill assets (images, pdf) would corrupt. If official skills stay markdown-only this is acceptable; otherwise need binary-safe fetch.

7. **`runInstall` duplicates ensure+load instead of `ensureCatalogForUse`**  
   **Paths:** `packages/core/src/install.ts` (`ensureRemoteCatalog` then `loadCatalog`), `packages/core/src/payload-resolve.ts` (`ensureCatalogForUse`).  
   Two entry paths for the same policy invite behavioral drift (e.g. `noRemote` env mutation, preferRegistryCache, logging). Prefer one orchestration path for catalog readiness.

### P2

8. **CLI-shaped types live in core**  
   **Path:** `packages/core/src/install.ts` — `UsageError` / `RuntimeError` with `exitCode` 2/1; `isTty`, `interactiveProviders`, `yes`.  
   Justified as shared dual-surface contract, but exit codes and TTY are adapter concerns. Document as intentional “process-friendly errors” or move exit mapping to CLI only and keep typed error classes without exit codes for pure library use.

9. **Skill id first-match walk can hit wrong tree**  
   **Path:** `packages/core/src/payload-resolve.ts` (`walkForSkill` / `locateSkillDir`).  
   Depth-first first directory named `skillId` with SKILL.md wins; no scope preference (official vs community). Colliding ids would silently install the wrong body.

10. **Up-to-date / conflict only hashes SKILL.md**  
    **Path:** `packages/core/src/copy-skill.ts` (`hashSkillMd` / `writeSkillDir`).  
    Sibling asset changes without SKILL.md edit report up-to-date and skip overwrite.

11. **`CORE_VERSION` manual sync**  
    **Paths:** `packages/core/src/version.ts`, `packages/core/package.json`.  
    Telemetry `cliVersion` can drift from published package version.

12. **Minimal frontmatter YAML**  
    **Path:** `packages/core/src/frontmatter.ts` (`parseSimpleYaml`).  
    Adequate for current official shape; nested/complex YAML may parse incorrectly before Zod — fail mode is skip/error at write, not silent success, but catalog scan may skip skills with `console.error`.

13. **Registry cache write races**  
    **Path:** `packages/core/src/registry.ts` (manifest/catalog/skill dir rm+write).  
    Concurrent CLI+MCP installs can interleave. No file lock; fail-open recovery exists but can leave partial skill dirs briefly.

14. **Wide public export surface**  
    **Path:** `packages/core/src/index.ts`.  
    Low-level helpers (`hashSkillMd`, `copyDirRecursive`, path internals, registry cache path builders) are all public. Couples adapters to internals; harder to evolve PayloadResolve without semver noise. Consider `@openwisdom/core/internal` or document “stable vs experimental” export tiers.

15. **Duplicate `toPosix` and dual names**  
    **Paths:** `get-skill.ts`, `payload-resolve.ts`; aliases `resolveSkillsRoot` / `resolveSkillsTreeRoot`, `resolveInstallSourceDir` / `resolveSkillPayloadDir`, `LoadedCatalog` re-export chain via `catalog.ts`.  
    Alias strategy is transitional (SPE 35) and good for migration, but doubles discoverability cost in docs and IDE.

16. **get-skill body path does not call install remote download**  
    **Path:** `packages/core/src/get-skill.ts` (local tree + existing registry cache only).  
    Aligns with body policy “no forced remote”; callers must `ensureRemote*` first. Easy for MCP tools to return RuntimeError for remote-only skills if they only call `getSkillDetail`. Document adapter duty clearly.

---

## Opportunities

1. **Collapse catalog readiness** — Make `runInstall` / `listInstalled` / `getSkillDetail` call `ensureCatalogForUse` (or a thinner shared `prepareCatalog`) so remote refresh + load ladder cannot diverge.
2. **Structured logging only** — Replace bare `console.error` with required/optional `onLog`; default no-op. Adapters map to CLI stderr or MCP logging notifications.
3. **Telemetry schema v2** — Rename event to `install_success` (channel-neutral); require `source` at type level when called from `runInstall` (no default), or infer from a required `InstallOptions.clientSurface: "cli" | "mcp"`.
4. **Payload host contract** — Publish snapshots in one place (`@openwisdom/core` or a dedicated payload package) and always resolve package root from that name; adapters pass `packageRoot` + `fromUrl` consistently in one helper re-exported for CLI/MCP.
5. **Policy table as data** — Encode catalog/body/install ladders as ordered step arrays with named steps for unit tests and docs generation; reduce narrative comments that can drift from code.
6. **Narrow public API** — Export high-level ops (`runInstall`, `loadCatalog`/`ensureCatalogForUse`, `searchCatalog`, `getSkillDetail`, `listInstalled`, telemetry report, error types) as stable; mark path/registry internals as `@internal` or subpath export.
7. **Binary-safe registry fetch** — If skills ever ship non-UTF8 assets, switch to `arrayBuffer` / streaming writes; keep text path for SKILL.md validation.
8. **Conflict hash tree** — Optional content hash of full skill dir (or payload-index file list) for up-to-date checks beyond SKILL.md.
9. **Locate with catalog repoPath** — Prefer `entry.repoPath` under skills root before free walk by id to avoid collisions and speed lookup.
10. **Version inject at build** — Generate `CORE_VERSION` from `package.json` in tsup define to eliminate drift.

---

## Risks

| Risk | Severity | Notes |
|------|----------|--------|
| Catalog load swallow → false “unknown skill” | Operational | P1#1; support burden and false negatives offline |
| MCP heat counted as CLI | Product / metrics | P1#3; heat ranking side channel (Agents.md) becomes biased |
| Stderr noise in agent sessions | UX / protocol | P1#2; does not break JSON-RPC if stdout clean, but pollutes logs |
| Wrong packageRoot after publish layout change | Offline install | P1#5; monorepo dev works, published bin fails |
| Path policy change breaks one consumer | Maintenance | P1#4; CLI and MCP both depend on subtle ladder differences |
| Concurrent cache corruption | Edge | P2#13; rare; force refresh recovers |
| Binary skill assets | Future content | P1#6; only if content model expands |
| YAML subset vs real SKILL.md | Authoring | P2#12; community skills with rich YAML may skip |

Overall residual risk is **moderate-low for v1 markdown-only skills** if adapters always pass `packageRoot`, `telemetrySource`, `onLog`, and providers. Risk rises if core is treated as a “drop-in” without injection, or if publish omits snapshots while NO_REMOTE is set.

---

## Recommended next claims

1. **c2-follow / core-logging** — Remove default `console.error` from library paths; unify on `onLog`; acceptance: tests assert no stderr when sink omitted.  
2. **c2-follow / install-catalog-errors** — Stop swallowing `loadCatalog` failures in `runInstall`; surface `RuntimeError` or structured partial result; keep offline path explicit via flags.  
3. **c2-follow / telemetry-schema** — Neutral event name + required surface on install options; fixture tests for MCP source.  
4. **c2-follow / payload-host** — Single packageRoot resolution policy + adapter helper; document publish layout for catalog-snapshot / skills-snapshot.  
5. **c2-follow / api-surface** — Split stable vs internal exports; deprecate raw path helpers from main entry.  
6. **Peer (not core-only)** — CLI/MCP audit claims: verify they inject `isTty`/`telemetrySource`/`onLog`/`packageRoot` correctly (boundary compliance from the adapter side).  
7. **Optional hardening** — Registry cache file lock; locateSkillDir via `repoPath`; binary fetch if content needs it.

---

*Audit complete for claim c2. No production source under `packages/core` was modified.*
