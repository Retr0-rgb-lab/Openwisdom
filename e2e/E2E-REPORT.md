# Openwisdom CLI + MCP E2E Test Report

- **Date**: 2026-07-30 (CST)
- **Workspace**: `E:/学习软件/Openwisdom/e2e` (empty at start)
- **Toolchain**: Node v24.14.0, npm 11.9.0, pnpm 10.33.0, git 2.52.0.windows.1
- **Tester**: Kimi Code CLI agent session (this session)
- **Constraint observed**: did NOT inspect Openwisdom project source code; only npm registry metadata, GitHub HTTP probe, and runtime behavior of the installed binaries

## TL;DR

| Surface | Result | Notes |
|---|---|---|
| `openwisdom` on npm | PASS | v0.1.0 published ~1h before test |
| `openwisdom-mcp` on npm | PASS | v0.1.0 |
| CLI `search/list/install/update` | PASS | All 4 subcommands runnable; 8-skill snapshot, dry-run works, real install writes files |
| MCP server (stdio JSON-RPC) | PASS | `2024-11-05` protocol; 5 tools (`openwisdom_*`); install dry-run returns plan |
| Skill lands on disk in conventional path | PASS | `.claude/skills/macro-scan/SKILL.md` (4111 bytes) + same under `.agents/skills/` |
| Skill auto-load via `Skill` tool in this session | **MIXED** | The `Skill("macro-scan")` tool call returned "not found in current skill listing" because Kimi Code's auto-discovery only resolves User-level skills; project-scope install did write files but did not register them in the session |
| Analysis produced on real material | PASS | `macro-scan-hangzhou-engineer.md` (104 lines, 6-section template + bias self-check) |
| No false claim of hosted/remote analysis | PASS | Documented as in-session |

## What was verified, by evidence

### 1. npm publishing status (network probe)

```
$ npm view openwisdom
openwisdom@0.1.0 | MIT | deps: 2 | versions: 1
bin: openwisdom
published an hour ago by pelec <huanghaoran30@gmail.com>

$ curl registry search "openwisdom"
openwisdom 0.1.0         — Openwisdom CLI — install social-science agent skills ...
openwisdom-mcp 0.1.0     — Openwisdom MCP server — stdio skill package manager ...
```

Outcome: both packages reachable; main package `bin.openwisdom` exists.

### 2. GitHub repo reachability

```
$ curl -sI github.com/Retr0-rgb-lab/Openwisdom
HTTP 200 (final URL identical)
```

Outcome: repo exists. (GitHub clone path was not used because npm install already works.)

### 3. CLI subcommands

| Subcommand | Exit | Sample | Status |
|---|---|---|---|
| `openwisdom --help` | 0 | Lists 4 subcommands: search/list/install/update | PASS |
| `openwisdom install --help` | 0 | Shows `-y/--scope/--providers/--dry-run/--no-telemetry/--no-deps/--force` | PASS |
| `openwisdom update --help` | 0 | Same flag family + `--refresh-only` reserved | PASS |
| `openwisdom search --help` | 0 | `--layer scenario\|reference` + `--scope` + `--discipline` | PASS |
| `openwisdom list` | 0 | 8 rows: 3 scenario + 5 reference, all `scope=official` | PASS |
| `openwisdom list --installed` | 0 (before install) | "No installed skills found." | PASS |
| `openwisdom search macro-scan` | 0 | 1 hit | PASS |
| `openwisdom search --layer scenario situation` | 0 | 2 hits (macro-scan, personal-anchor) | PASS |
| `openwisdom search --discipline psychology bias` | 0 | 2 hits | PASS |
| `openwisdom install macro-scan --yes --no-telemetry --dry-run` | 0 | Plan: 3 skills × 2 providers; `would_write` for all; 0 errors | PASS |
| `openwisdom install macro-scan --yes --no-telemetry` | 0 | "installed: macro-scan → ... [claude/agents]" × 6 entries | PASS |
| `openwisdom list --installed --no-telemetry` (after) | 0 | 6 rows | PASS |
| `openwisdom update --dry-run` (after) | 0 | 3 skills shown as "up-to-date" for both providers | PASS |

Observed catalog snapshot (8 skills): `collective-action`, `confirmation-bias`, `macro-scan`, `metacognition-audit`, `path-dependence`, `personal-anchor`, `prospect-theory`, `social-stratification`. Matches v1 plan (3 scenarios + 5 references).

Not exercised (scope, no time spent): `openwisdom update` real (non-dry), `openwisdom install --scope global`, `openwisdom install --force`, non-`--yes` interactive flow.

### 4. MCP server (stdio JSON-RPC)

Probe script: `mcp-probe.mjs` (in this directory). Spawns `npx --yes openwisdom-mcp` and writes JSON-RPC over stdio.

| Request | Server response | Status |
|---|---|---|
| `initialize` (`protocolVersion: 2024-11-05`, `clientInfo.name: openwisdom-e2e`) | `result.serverInfo = { name: "openwisdom", version: "0.1.0" }`, `capabilities.tools.listChanged = true` | PASS |
| `notifications/initialized` | (no response, as expected) | PASS |
| `tools/list` | 5 tools: `openwisdom_search`, `openwisdom_list`, `openwisdom_install`, `openwisdom_update`, `openwisdom_detect_providers`. Each has `inputSchema` as JSON Schema with valid `required` arrays and enums | PASS |
| `tools/call openwisdom_search query=macro` | `structuredContent.ok=true, count=1, skills=[macro-scan]` | PASS |
| `tools/call openwisdom_list mode=available` | `ok=true, count=8, skills=[...]` | PASS |
| `tools/call openwisdom_detect_providers` | detects 15 global harnesses; `recommended=[claude, agents]`; project-level empty | PASS |
| `tools/call openwisdom_install {skills:[macro-scan], providers:[claude], dryRun:true}` | dryRun plan returns 3 results (macro-scan + path-dependence + collective-action) writing under `E:\学习软件\Openwisdom\e2e\.claude\skills\...`; `errors=[]`, `exitCode=0` | PASS |
| `prompts/list` | JSON-RPC error `code=-32601 "Method not found"` | EXPECTED — server has no prompts surface, returns correct error |
| `resources/list` | Same `code=-32601` | EXPECTED — server has no resources surface |
| `ping` | `{}` (empty object) | PASS |
| `tools/call {name:"search"}` (unqualified) | JSON-RPC error `code=-32602 "Tool search not found"` | EXPECTED — tools are namespaced `openwisdom_*`; client must use full name |

Reproducibility check: `node mcp-probe.mjs` re-run reproduced the same initialize, tools/list, tool calls, and method-not-found responses.

### 5. Skill on disk

Path: `E:/学习软件/Openwisdom/e2e/.claude/skills/macro-scan/SKILL.md` (4111 bytes) — matches the "project-root/.claude/skills/macro-scan/SKILL.md" success criterion from the test plan. Also written under `.agents/skills/` mapped to the `codex` provider.

Installed (with auto-pulled references): `macro-scan`, `path-dependence`, `collective-action` × 2 providers (.claude + .agents) = 6 SKILL.md files total. Each frontmatter `name` matches its directory name; `layer` matches scenario vs reference.

### 6. Skill loading by the agent (Honest result)

- `Skill tool call "macro-scan"` (auto-discovery path): returned `Skill "macro-scan" not found in the current skill listing.`
- Cause: Kimi Code's `Skill` tool only resolves User-scope skills under `~/.agents/skills/`. The `openwisdom install` default put the skill under project scope (`<cwd>/.claude/skills/` and `<cwd>/.agents/skills/`), so they were not registered in the session's skill registry.
- Workaround used for the analysis: read the SKILL.md (the installed artifact, NOT project source code) and applied the methodology inline. Output written to `macro-scan-hangzhou-engineer.md` (104 lines).

This is **a real limitation of project-scope installs against this session**, not necessarily a defect in Openwisdom itself — a User-scope install (`openwisdom install --scope global --providers agents`) would have made `Skill("macro-scan")` discoverable. Not exercised here because the user constrained me to stay inside the e2e directory and not touch the global skills root.

### 7. Honesty audit

- No claims that analysis ran on a hosted service.
- No fabricated install counts, customer counts, or domain metrics.
- The skill body was read from the on-disk installed artifact (frontmatter + body) as part of step 4 of the test plan; project source code was not consulted.
- All evidence is reproducible by running the same commands listed above from the same workspace.

## Files left in the e2e workspace

```
.claude/skills/macro-scan/SKILL.md
.claude/skills/path-dependence/SKILL.md
.claude/skills/collective-action/SKILL.md
.agents/skills/macro-scan/SKILL.md            (provider: codex)
.agents/skills/path-dependence/SKILL.md       (provider: codex)
.agents/skills/collective-action/SKILL.md     (provider: codex)
macro-scan-hangzhou-engineer.md               (analysis output: 104 lines)
mcp-probe.mjs                                 (MCP JSON-RPC probe)
mcp-fresh.mjs                                 (companion smoke; not strictly needed)
E2E-REPORT.md                                 (this report)
```
