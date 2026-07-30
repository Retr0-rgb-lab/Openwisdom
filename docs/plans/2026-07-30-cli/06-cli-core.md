# Plan 06 — packages/cli core（Wave D/E）

## Goal

Ship working `openwisdom` bin: `search` `list` `install` `update` with flags; interactive when TTY.

## Spec

18 + 19 write strategy + 20 snapshot resolve.

## Files (only primarily)

```text
packages/cli/**
```

May add workspace deps on `@openwisdom/schema`, `@openwisdom/providers`.

## Commands

| cmd | behavior |
|-----|----------|
| `search <q>` | filter snapshot catalog by id/name/description/tags |
| `list` | default available from catalog |
| `list --installed` | scan provider paths under --cwd / home |
| `install [ids…]` | copy skill trees into providers |
| `update` | refresh: reinstall known installed from local skills root or re-copy |

## Flags (v1 minimum)

`--providers` `--scope` `-y` `--force` `--dry-run` `--no-telemetry` `--lang` `--cwd` `--no-deps`

## Install source resolution (priority)

1. `OPENWISDOM_SKILLS_ROOT` env  
2. Monorepo detect: `<root>/skills` if running from repo  
3. Else: error with message to set `OPENWISDOM_SKILLS_ROOT` or clone repo (**v1 may skip GitHub download** if timeboxed — document TODO; prefer local skills for first green)

**This batch acceptance:** install from local monorepo `skills/` is enough. GitHub fetch can be stubbed with clear error.

## Write

- Use providers `uniqueWriteTargets`  
- Staging + rename copy (Spec 19)  
- Conflict hash on SKILL.md content  
- Create parents  

## Interactive (optional if time)

If TTY && !`-y`: clack multiselect providers; else require flags or defaults (`claude,agents` + `project` on `-y`).

## Tests

- vitest: install into tmp dir with OPENWISDOM_SKILLS_ROOT  
- search hits macro-scan  
- conflict without force fails  

## Done when

```text
node packages/cli/dist/cli.js search macro
node packages/cli/dist/cli.js install macro-scan -y --providers=claude --scope=project --cwd=<tmp>
# → <tmp>/.claude/skills/macro-scan/SKILL.md
```

## Do not

- Add `run`  
- npm publish  
- Change web messages (07)  
