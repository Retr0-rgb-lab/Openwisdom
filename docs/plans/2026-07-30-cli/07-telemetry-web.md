# Plan 07 — Telemetry client + Web honesty（Wave F）

## Goal

1. CLI: post `cli_install_success` after successful install (Spec 06); fail-open.  
2. Web: keep or refine “CLI not on npm yet” — **do not claim published** until real publish. Optional: add note “CLI in monorepo: pnpm --filter openwisdom …”.  

## Files

```text
packages/cli/src/**/telemetry*
apps/web messages only if adding monorepo dev hint (zh+en parity)
```

## CLI

- Env `OPENWISDOM_NO_TELEMETRY`, flag `--no-telemetry`, `CI=true` → skip  
- Timeout ~1s  
- Default endpoint env `OPENWISDOM_TELEMETRY_URL` or placeholder (no hard fail if unset — skip)

## Done when

- Unit test: mock fetch not called when no-telemetry  
- Web still honest about npm publish state  

## Do not

- Implement stats API server (out of scope unless trivial stub)  
