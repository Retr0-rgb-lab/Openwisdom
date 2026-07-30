# Plans 07 + 08 Report — Telemetry + Verify

**Date:** 2026-07-30  
**Status:** **DONE**  
**Scope:** `packages/cli` telemetry client · verify suite · plan docs  
**Did not:** npm publish · git commit · stats API server · web copy changes

---

## Plan 07 — Telemetry client

### Goal

Wire real fail-open `cli_install_success` POST after successful install (Spec 06), without blocking install.

### What shipped

| File | Change |
|------|--------|
| [`packages/cli/src/telemetry.ts`](../../../../packages/cli/src/telemetry.ts) | Real client: enable gates, payload builder, `fetch` + ~1s abort, never rejects |
| [`packages/cli/src/install-core.ts`](../../../../packages/cli/src/install-core.ts) | Pass `scope`; `void reportInstallSuccess(...)` fire-and-forget |
| [`packages/cli/src/telemetry.test.ts`](../../../../packages/cli/src/telemetry.test.ts) | 11 unit tests (skip gates, payload, mock fetch, fail-open) |
| [`packages/cli/README.md`](../../../../packages/cli/README.md) | Telemetry env/flag table; no longer “stub only” |

### Behavior

**POST when all of:**

- Install of a skill succeeded for all selected providers
- At least one outcome is fresh `installed` (not only up-to-date)
- Not dry-run
- Telemetry enabled

**Skip silently when any of:**

- `--no-telemetry`
- `OPENWISDOM_NO_TELEMETRY=1`
- `CI=true` or `CI=1`
- `OPENWISDOM_TELEMETRY_URL` unset / blank (no hard-coded production URL)

**Payload (Spec 06):**

```json
{
  "schemaVersion": 1,
  "event": "cli_install_success",
  "skillId": "macro-scan",
  "ts": "2026-07-29T12:00:00.000Z",
  "source": "cli",
  "cliVersion": "0.1.0",
  "meta": {
    "providers": ["claude", "cursor"],
    "scope": "project"
  }
}
```

**Fail-open:** network errors, abort, missing `fetch` — swallowed; install exit code unchanged.

**Debug:** `OPENWISDOM_TELEMETRY_DEBUG=1` logs POST target + JSON to stderr.

### Web honesty

Left **as-is**. Home `cliNote` / skills install notes already state CLI is not on npm / command not available yet. Plan allowed optional monorepo hint only if minimal; skipped to avoid risky copy churn. No claim of npm publish.

### Out of scope (unchanged)

- `/api/telemetry` server, stats aggregation, catalog heat UI merge

---

## Plan 08 — Verify

Full table: [`../VERIFY.md`](../VERIFY.md).

### Summary

| Area | Result |
|------|--------|
| schema / providers / catalog / openwisdom build | PASS |
| Unit tests (schema 21 · providers 6 · cli 15) | PASS |
| `search macro` | PASS → macro-scan |
| Temp install + list + up-to-date reinstall | PASS |
| Help commands | search, list, install, update only — **no `run`** |
| `web` build | PASS |
| `npm pack --dry-run` | dist + catalog-snapshot |

### Catalog build output (this run)

```text
[@openwisdom/catalog] wrote 3 skill(s) [macro-scan, metacognition-audit, personal-anchor]
  → packages/catalog/dist/
  → packages/cli/catalog-snapshot/
  → apps/web/public/registry/
```

---

## Wave status

| Plan | Status |
|------|--------|
| 01 scaffold | Executed (prior) |
| 02 schema | Executed (prior) |
| 03 skills-seed | Executed (prior) |
| 04 providers | Executed (prior) |
| 05 catalog | Executed (prior) |
| 06 cli-core | Executed (prior) |
| **07 telemetry** | **Executed** |
| **08 verify** | **Executed** |

---

## Constraints respected

- No commit  
- No npm publish  
- No LLM / `run` command  
- Heat remains side channel (not written into skills git)  
- Monorepo root name `openwisdom-monorepo`; CLI package name `openwisdom`
