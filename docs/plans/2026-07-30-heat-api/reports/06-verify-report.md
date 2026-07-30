# Heat API VERIFY

| Check | Result |
|-------|--------|
| `tsx --test src/lib/heat/heat-smoke.test.ts` | **8/8 pass** |
| `node scripts/heat-smoke.mjs` | **pass** · copy ∉ installs* |
| `pnpm --filter web build` | **pass** · API routes listed |
| SkillCard TS heat count | fixed (narrow/cast) |

## Routes live

- `POST /api/telemetry`
- `GET /api/stats`
- `GET /api/skills/[skillId]/download`
