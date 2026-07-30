# Plan — Card elevation vs field (Opaque Atlas Plates)

> User-approved: opaque white cards + line-strong + contact shadow + quieter ShapeGrid + solid section bands.

## Parallel workstreams

| Plan | Files | Deliver |
|------|-------|---------|
| A tokens | `globals.css` | `--ow-line-strong`, utility colors, optional shadow token |
| B scenarios+install | `ScenarioCards.tsx`, `InstallCommand.tsx` | opaque surface, line-strong, contact shadow, solid wells |
| C model+disc+bands | `Model.tsx`, `DisciplineGrid.tsx`, `HarnessRow.tsx`, `FinalCta.tsx`, Hero chips | solid fills, no /70–/92 |
| D grid | `SiteBackdrop.tsx`, `ShapeGrid.tsx` | lower opacity / stroke alpha |

## Forbidden

Purple glow, left bars, heavy SaaS shadows, darkening field off #F8F9FA.

## Status (executed)

- [x] A tokens: `--ow-line-strong` + `border-line-strong`
- [x] B Scenario + Install plates
- [x] C Model / Disc / bands / Hero chips solid
- [x] D ShapeGrid quieter (opacity-50, stroke 0.18)
