# openwisdom (CLI)

Package manager for **Openwisdom** social-science agent skills.

```bash
npx openwisdom search macro
npx openwisdom list
npx openwisdom install macro-scan -y --providers=claude --scope=project
npx openwisdom update macro-scan -y --providers=claude
```

Does **not** call models. Analysis runs in your coding agent (Claude Code, Cursor, Codex, …).

## Commands

| Command | Purpose |
|---------|---------|
| `search <query>` | Filter bundled / scanned catalog by id, name, description, tags |
| `list` | Available skills from catalog |
| `list --installed` | Skills found under known provider paths |
| `install [ids…]` | Copy skill directories into harness skill roots |
| `update [ids…]` | Re-copy from local skills root (same write path as install) |

## Common flags

| Flag | Meaning |
|------|---------|
| `--providers <ids>` | Comma-separated: `claude`, `cursor`, `agents`, … |
| `--scope project\|global` | Write under `--cwd` or home |
| `-y` / `--yes` | Non-interactive; default providers = detect or `claude,agents`; scope = `project` |
| `--force` | Overwrite different `SKILL.md` content |
| `--dry-run` | Print plan only |
| `--cwd <path>` | Project root for project scope |
| `--no-deps` | Skip catalog `references[]` |
| `--no-telemetry` | Disable install telemetry for this run |
| `--help` / `--version` | Self-explanatory |

## Dev: monorepo skills source

Install copies from a **local skills tree** (GitHub fetch not required in this wave):

1. `OPENWISDOM_SKILLS_ROOT` → absolute path to `skills/`
2. Else detect monorepo root with `skills/official`
3. Else error asking you to set `OPENWISDOM_SKILLS_ROOT`

```bash
# from monorepo root
pnpm --filter @openwisdom/providers build
pnpm --filter @openwisdom/schema build
pnpm --filter openwisdom build

node packages/cli/dist/cli.js search macro

# install smoke
$env:OPENWISDOM_SKILLS_ROOT = (Resolve-Path skills).Path   # PowerShell
node packages/cli/dist/cli.js install macro-scan -y --providers=claude --scope=project --cwd=$env:TEMP\ow-test
```

## Telemetry (fail-open)

After a successful install (all selected providers wrote OK, at least one fresh install), the CLI may POST an anonymous `cli_install_success` event. Install **never** fails because of telemetry.

| Gate | Effect |
|------|--------|
| `--no-telemetry` | Skip |
| `OPENWISDOM_NO_TELEMETRY=1` | Skip |
| `CI=true` / `CI=1` | Skip |
| `OPENWISDOM_TELEMETRY_URL` unset | Skip (no default endpoint) |
| Network / timeout (~1s) | Silent ignore |

## Catalog

Runtime index load order:

1. Package `catalog-snapshot/catalog.json`
2. Scan `OPENWISDOM_SKILLS_ROOT` / monorepo `skills/` if snapshot missing

## Specs

- `docs/specs/17-CLI总控-SPE.md`
- `docs/specs/18-CLI命令与UX.md`
- `docs/specs/19-CLI-providers与安装写入.md`
- `docs/specs/20-CLI-monorepo-catalog-发布.md`

## License

MIT (see monorepo).
