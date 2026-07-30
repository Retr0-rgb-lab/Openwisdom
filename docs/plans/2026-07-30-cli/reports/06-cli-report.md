# Plan 06 Report — packages/cli core

**Date:** 2026-07-30  
**Scope:** `packages/cli/**` only (+ this report)  
**Status:** **DONE**

## Summary

Shipped working `openwisdom` bin with citty commands `search` / `list` / `install` / `update`, local skills payload resolution, staging+rename install write, SKILL.md hash conflict handling, interactive provider multiselect (TTY), telemetry stub, bundled catalog snapshot, and vitest acceptance tests.

## What shipped

### Entry & build

| Item | Detail |
|------|--------|
| Bin | `packages/cli/dist/cli.js` (tsup ESM) |
| Shebang | tsup `banner` only — **no** `#!` in `src/` |
| Bundle | `noExternal`: `@openwisdom/schema`, `@openwisdom/providers`, `zod` |
| Package name | `openwisdom` (monorepo root remains `openwisdom-monorepo`) |

### Commands

| Command | Behavior |
|---------|----------|
| `search <query…>` | Filter snapshot/scanned catalog by id/name/description/tags |
| `list` | Available catalog skills (default) |
| `list --installed` | Scan provider skill roots under `--cwd` / home |
| `install [ids…]` | Copy skill trees into providers via `uniqueWriteTargets` |
| `update [ids…]` | Re-copy from local skills root (same write path); `--refresh-only` stub |

### Flags (v1)

`--providers`, `--scope project|global`, `-y/--yes`, `--force`, `--dry-run`, `--no-telemetry`, `--lang`, `--cwd`, `--no-deps`, `--help`, `--version`

### Catalog load order

1. `packages/cli/catalog-snapshot/catalog.json` (via package root from `import.meta.url`)
2. Else synthesize by scanning `OPENWISDOM_SKILLS_ROOT` or monorepo `skills/`

Snapshot includes official scenarios: `macro-scan`, `personal-anchor`, `metacognition-audit`.

### Install payload source

1. `OPENWISDOM_SKILLS_ROOT`
2. Monorepo root containing `skills/official`
3. Else error (GitHub fetch **not** in this wave)

### Write strategy (Spec 19)

- `uniqueWriteTargets` from `@openwisdom/providers`
- Staging dir `.openwisdom-staging-<name>-<token>` → validate → rename
- Conflict: sha256 of `SKILL.md`; different content without `--force` → exit 1
- Same content → `up-to-date` (exit 0)
- **Windows Unicode note:** avoid Node `fs.cpSync` (hard-crashes under non-ASCII paths e.g. monorepo under `学习软件`); use recursive `copyFileSync` instead

### Interactive

- TTY && !`-y` && missing `--providers`: `@clack/prompts` multiselect (P0)
- Non-TTY / CI missing providers: exit 2
- `-y` defaults: detect providers or `claude,agents`; scope `project`

### Telemetry

Stub only (`telemetry.ts`): respect `--no-telemetry` / `OPENWISDOM_NO_TELEMETRY` / `CI`; no network. Plan 07 wires real POST.

## Tests (vitest)

`packages/cli/src/install.test.ts`:

1. **search macro finds macro-scan**
2. **install macro-scan** into package-local tmp with `-y --providers=claude --scope=project` + `OPENWISDOM_SKILLS_ROOT`
3. **same content** → `up-to-date`
4. **conflict without force** → exit 1, local edit preserved

```text
pnpm --filter openwisdom test
 ✓ src/install.test.ts (4 tests)
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

## Verify smoke (manual)

```text
pnpm --filter @openwisdom/providers build  # OK
pnpm --filter @openwisdom/schema build     # OK
pnpm --filter openwisdom build             # OK → dist/cli.js ~164KB

node packages/cli/dist/cli.js search macro
# → macro-scan row (catalog source: snapshot)

node packages/cli/dist/cli.js install macro-scan -y --providers=claude --scope=project --cwd=<tmp>
# with OPENWISDOM_SKILLS_ROOT=<repo>/skills
# → <tmp>/.claude/skills/macro-scan/SKILL.md  SMOKE_INSTALL_OK
```

## Files touched

```text
packages/cli/package.json          (+ zod dep)
packages/cli/tsup.config.ts        (noExternal + zod)
packages/cli/README.md
packages/cli/.gitignore
packages/cli/catalog-snapshot/catalog.json
packages/cli/src/cli.ts
packages/cli/src/version.ts
packages/cli/src/paths.ts
packages/cli/src/frontmatter.ts
packages/cli/src/catalog.ts
packages/cli/src/skills-root.ts
packages/cli/src/copy-skill.ts
packages/cli/src/install-core.ts
packages/cli/src/telemetry.ts
packages/cli/src/commands/{search,list,install,update}.ts
packages/cli/src/install.test.ts
docs/plans/2026-07-30-cli/reports/06-cli-report.md
```

## Residual gaps

| Gap | Notes |
|-----|--------|
| Telemetry HTTP | Stub only — Plan 07 |
| GitHub skill fetch | Explicit error; local root only |
| Interactive skill picker | Install still requires skill ids on argv |
| Catalog remote / user cache | Snapshot + scan only; `update --refresh-only` message |
| `list --installed` heuristics | Any `SKILL.md` under provider roots (not only Openwisdom-marked) |
| i18n strings | English CLI messages; `--lang` reserved |
| Frontmatter parser | Minimal YAML subset (no gray-matter); sufficient for official skills |
| Plan 05 catalog builder | Still placeholder; CLI ships its own snapshot for independence |

## Do not (honored)

- No `run` command  
- No npm publish  
- No commit  
- Did not edit schema / providers / catalog packages / skills / web  
