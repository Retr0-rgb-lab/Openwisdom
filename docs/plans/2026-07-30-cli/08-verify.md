# Plan 08 — Verify（Wave G-）

## Checklist

- [ ] `pnpm install` at root  
- [ ] `pnpm catalog:build` → 3 skills in snapshot  
- [ ] `pnpm --filter openwisdom build`  
- [ ] `node packages/cli/dist/cli.js search macro` → macro-scan  
- [ ] install e2e into temp with claude provider  
- [ ] `list --installed` sees it  
- [ ] second install same content → up-to-date  
- [ ] no `run` in help  
- [ ] `pnpm --filter web build` still passes (registry json ok)  
- [ ] `npm pack` in packages/cli dry-run lists dist + snapshot  

## Report

Write `docs/plans/2026-07-30-cli/VERIFY.md` with commands + pass/fail.
