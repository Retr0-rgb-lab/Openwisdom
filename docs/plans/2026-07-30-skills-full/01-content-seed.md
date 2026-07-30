# Plan A — Content seed + schema

## Goal

Extend catalog types; seed official 3 + curated external skills (MIT/CC0 primary). No fake heat.

## Tasks

1. Extend `CatalogEntry` in `types.ts` (provenance, externalUrl, license, attribution, author, contentAvailability, installMode, output/bias, reference fields).
2. Keep `BOOTSTRAP_CATALOG` official three; set `provenance: "official"`.
3. Add `external-seed.ts` with ≥9 curated entries from scout table (slugs below).
4. Merge in `getCatalog()` = official + external; featured sort still official scenarios first.
5. Honesty: catalog banner distinguishes bootstrap official + curated-external sources.
6. `getSkillBySlug` works for all.

## Seed list (minimum)

Official: macro-scan, personal-anchor, metacognition-audit  

Curated MIT/CC0:
- scientific-critical-thinking (MIT, K-Dense)
- thinking-steel-manning, thinking-first-principles, thinking-socratic, thinking-pre-mortem, thinking-probabilistic (MIT, cc-thinking-skills)
- lit-review-assistant, research-ideation, r-econometrics (CC0, awesome-econ-ai-stuff)
- research-proposal (MIT, luwill)
- socrates (MIT, bevibing)

Optional link-only:
- humanities-writing-companion (CC-BY-NC)
- aers-catalog (CC-BY-SA hub)

## Done when

- `getCatalog().length >= 12`
- Each external has externalUrl + license + provenance curated-external
- No installs30d invented
