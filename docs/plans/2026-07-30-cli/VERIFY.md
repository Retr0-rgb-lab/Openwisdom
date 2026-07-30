# CLI Verify — 2026-07-30 (Plan 08)

**Date:** 2026-07-30  
**Host:** Windows / PowerShell  
**Repo:** `E:\学习软件\Openwisdom`  
**Root package:** `openwisdom-monorepo` · **CLI package:** `openwisdom`  
**Result:** **PASS** (all checklist items below)

---

## Commands run

```powershell
# Builds
pnpm --filter @openwisdom/schema build
pnpm --filter @openwisdom/providers build
pnpm --filter @openwisdom/catalog build
pnpm --filter openwisdom build

# Unit tests
pnpm --filter @openwisdom/schema test
pnpm --filter @openwisdom/providers test
pnpm --filter openwisdom test

# Smoke
node packages/cli/dist/cli.js search macro
node packages/cli/dist/cli.js --help

# Temp install (PowerShell)
$tmp = Join-Path $env:TEMP ("ow-cli-verify-" + [guid]::NewGuid().ToString("n").Substring(0,8))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$env:OPENWISDOM_SKILLS_ROOT = (Resolve-Path skills).Path
node packages/cli/dist/cli.js install macro-scan -y --providers=claude --scope=project --cwd=$tmp --no-telemetry
node packages/cli/dist/cli.js list --installed --cwd=$tmp
node packages/cli/dist/cli.js install macro-scan -y --providers=claude --scope=project --cwd=$tmp --no-telemetry
# second install prints up-to-date
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue

# Pack + web
cd packages/cli; npm pack --dry-run; cd ../..
pnpm --filter web build
```

---

## Pass / fail table

| # | Check | Result | Notes |
|---|--------|--------|-------|
| 1 | `pnpm --filter @openwisdom/schema build` | **PASS** | `tsc` OK |
| 2 | `pnpm --filter @openwisdom/providers build` | **PASS** | `tsc` OK |
| 3 | `pnpm --filter @openwisdom/catalog build` | **PASS** | wrote **3** skills: `macro-scan`, `metacognition-audit`, `personal-anchor` → catalog-snapshot + web registry |
| 4 | `pnpm --filter openwisdom build` | **PASS** | `dist/cli.js` ~167 KB ESM + shebang |
| 5 | `pnpm --filter @openwisdom/schema test` | **PASS** | 21 tests |
| 6 | `pnpm --filter @openwisdom/providers test` | **PASS** | 6 tests |
| 7 | `pnpm --filter openwisdom test` | **PASS** | 15 tests (4 install + 11 telemetry) |
| 8 | `search macro` → macro-scan | **PASS** | snapshot hit; id `macro-scan` |
| 9 | install e2e temp + claude | **PASS** | `installed: macro-scan → …\.claude\skills\macro-scan [claude]`, exit 0 |
| 10 | `list --installed` sees install | **PASS** | row `macro-scan` / `claude` / `project` under temp cwd; **only Openwisdom catalog / `metadata.openwisdom` skills** (not every harness skill on disk) |
| 11 | second install same content → up-to-date | **PASS** | `up-to-date: macro-scan …`, exit 0 |
| 12 | help has **no** `run` command | **PASS** | commands: `search` \| `list` \| `install` \| `update` only |
| 13 | `pnpm --filter web build` | **PASS** | Next.js 16 SSG OK (registry json consumed) |
| 14 | `npm pack --dry-run` in `packages/cli` | **PASS** | includes `dist/cli.js`, `catalog-snapshot/catalog.json`, `README.md` |
| 15 | Telemetry skip without URL / with `--no-telemetry` | **PASS** | unit tests; install smoke used `--no-telemetry` |
| 16 | No `npm publish` | **N/A** | not run (by design) |

---

## Telemetry (Plan 07) acceptance

| Behavior | Result |
|----------|--------|
| POST only when `OPENWISDOM_TELEMETRY_URL` set and not opted out | **PASS** (unit) |
| Skip: `--no-telemetry`, `OPENWISDOM_NO_TELEMETRY=1`, `CI=true` | **PASS** (unit) |
| Payload: schemaVersion 1, `cli_install_success`, skillId, ts ISO, source cli, cliVersion, meta.providers/scope | **PASS** (unit) |
| Fail-open: fetch reject does not throw | **PASS** (unit) |
| Timeout ~1000ms AbortController | **PASS** (implemented) |
| Does not write into `SKILL.md` | **PASS** (side channel only) |

---

## Help snapshot

```text
USAGE openwisdom search|list|install|update

COMMANDS
   search    Search the skill catalog …
     list    List available skills …
  install    Copy skill(s) into selected agent skill directories
   update    Re-copy installed (or named) skills …
```

No `run` / hosted LLM entrypoint.

---

## Known notes (non-blocking)

1. `list --installed` default scope is **all** (project + global home); global third-party skills may appear alongside the project install under `--cwd`.
2. Web home still states CLI is **not on npm yet** (honest; no publish this wave).
3. Catalog `contentHash` / `gitSha` vary with git state; skill count remains 3.

---

*Generated for Plan 08 — do not treat as CI green badge beyond the commands above.*
