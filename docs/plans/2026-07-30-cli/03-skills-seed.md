# Plan 03 — skills/ official seed（Wave B Content）

## Goal

Create real content truth for three official scenarios so CLI install has payloads.

## Spec

- Spec 20 skill layout  
- Product: macro-scan, personal-anchor, metacognition-audit  
- Align titles/summaries with `apps/web/src/data/catalog/bootstrap.ts` (read for copy; do not invent heat)

## Files (only)

```text
skills/official/scenarios/macro-scan/SKILL.md
skills/official/scenarios/personal-anchor/SKILL.md
skills/official/scenarios/metacognition-audit/SKILL.md
skills/official/references/.gitkeep   # optional empty tree marker
skills/community/.gitkeep
```

Optional later references: **not required for this plan** if scenario `references: []` or omitted. Prefer **omit references** or empty array until reference cards exist (avoids catalog hanging-ref errors). Spec 18 default with-deps is fine with empty refs.

## SKILL.md template

```markdown
---
name: macro-scan
description: >-
  Break a situation into structure: actors, incentives, constraints, trajectories.
  Use when you need a macro/system read before judging.
id: macro-scan
layer: scenario
scope: official
disciplines:
  - political-science
  - economics
  - sociology
language: zh
tags: [macro, structure, systems]
version: 0.1.0
metadata:
  openwisdom: true
---

# 宏观扫描 / Macro Scan

## When

...

## Steps

1. ...
2. ...
3. ...

## Output

...

## Bias / metacognition checkpoints

...

## Notes

Analysis runs in the user's coding agent, not on Openwisdom servers.
```

Repeat for `personal-anchor` and `metacognition-audit` with bootstrap-aligned zh/en meaning.

## Done when

- Three dirs each contain valid `SKILL.md`  
- `name` matches directory name  
- No fake install counts in body  

## Do not

- Create packages/*  
- Modify web bootstrap (Lead may later)  
