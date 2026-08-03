# Landing log — fetch-skill manual run

**Date:** 2026-08-03 (session)  
**Action:** Human-approved import into `skills/community/scenarios/`

## Imported

| Source | Openwisdom slugs | License | Notes |
|--------|------------------|---------|-------|
| romainsimon/skills-for-decision-making | `allocating-effort`, `framing-decisions`, `learning-from-outcomes`, `planning-horizons`, `reading-rivals`, `stress-testing-plans`, `tracking-beliefs`, `valuing-information` | MIT | Full pack + assets |
| GarethManning/education-agent-skills | 10× historical-thinking + 4× SRL (no `study-strategy-selector`) | CC-BY-SA-4.0 | Share-alike |
| DishantPal/deep-research-skill | `dishant-deep-research` | MIT | Distinct from `daymade-deep-research` |
| safety-quotient-lab/psychology-agent | `knock`, `session-retrospect` | Apache-2.0 | Extract-only; retrospect portable adaptation |
| D4ilyHub/objective-analysis | `objective-analysis` | MIT | Ideology gate in body + metadata |

## Pipeline

```bash
node docs/ops/fetch-skill/runs/manual/import-approved.mjs
pnpm catalog:build
```

Catalog skill count after build: **118**.

## Not imported (this batch)

- cookiy user-research (needs API strip)
- altmbr claude-research (lower priority)
- llm-council (needs DeepDive)
- HyperResearch / Book Intelligence (watchlist)
