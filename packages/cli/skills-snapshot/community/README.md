# Community + curated installable skills

- **`official/`** — core-maintained scenarios and references.
- **`community/`** — installable packs shared by the website catalog, CLI, and MCP.

Many entries under `community/scenarios/` and `community/references/` are **materialized** from the web discovery catalog (`pnpm catalog:materialize`) so agents can `openwisdom_install` the same skills users browse on the site. Bodies include summary / when / steps when present, plus upstream URL and attribution for curated-external packs.

Rebuild machine indexes after materialize:

```bash
pnpm catalog:sync-web
```
