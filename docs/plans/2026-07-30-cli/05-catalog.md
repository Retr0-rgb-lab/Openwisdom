# Plan 05 — packages/catalog（Wave C）

## Goal

Scan `skills/**/SKILL.md` → `catalog.json` + `manifest.json`; copy into CLI snapshot + web public/registry.

## Depends

- `@openwisdom/schema` built  
- `skills/official/scenarios/*` exist  

## Files

```text
packages/catalog/**
apps/web/public/registry/catalog.json   # generated
apps/web/public/registry/manifest.json
packages/cli/catalog-snapshot/catalog.json
packages/cli/catalog-snapshot/manifest.json
```

(CLI package dir may already exist from 01.)

## Build CLI

```text
pnpm --filter @openwisdom/catalog build
# or node packages/catalog/dist/build.js
```

Behavior:

1. Resolve monorepo root (walk up for `pnpm-workspace.yaml` or `skills/`)  
2. Glob `skills/**/SKILL.md`  
3. Parse gray-matter / regex frontmatter + zod  
4. Infer scope/layer from path if missing  
5. Set `repoPath` relative posix from repo root  
6. Set `install.cli` = `npx openwisdom install ${id}`  
7. Write catalog + manifest (`gitSha` via `git rev-parse HEAD` or `"unknown"`)  
8. Copy to web registry + cli snapshot  

Empty skills tree → **exit 1**.

## Dependencies

- `gray-matter` or minimal FM parser  
- `@openwisdom/schema` workspace:*  
- `zod`  

## Done when

- catalog contains 3 scenarios  
- `contentHash` stable for same inputs  
- CLI snapshot files exist  

## Do not

- Implement openwisdom user commands  
- Embed full skill bodies in catalog  
