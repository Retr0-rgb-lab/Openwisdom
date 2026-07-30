# Plan D — Skill detail redesign

## Goal

Evaluate → Install → Graph decision page.

## Tasks

1. Split SkillDetail into header / install / body / related.
2. `SkillInstallBar` with Tabs: CLI | GitHub | Manual; honest CLI note.
3. Mobile `SkillInstallDock` bottom sticky.
4. `SkillAttribution` for curated-external / community.
5. ScenarioBody: when, steps, output?, bias?, cited refs (link if in catalog).
6. ReferenceBody: definition, bounds, misuse, questions, used-by (when fields exist).
7. Related ≤3 with live slugs only.
8. Provenance footer: license, externalUrl, repoPath.
9. Metadata SEO unchanged pattern.

## Done when

- Official + external details render without crash
- Unknown slug 404
- Copy install works
