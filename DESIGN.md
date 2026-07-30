# Design System — Openwisdom

<!-- Established with Home landing; Direction B: Instrument of Orientation / Atlas Coordinate -->

## Platform

web

## World

**Instrument of Orientation** — a precise social-science atlas: cool field, copper datum, serif for ideas / sans for tools. Marks *where you stand* in structure and time. Not AI-SaaS purple, not cream-library cliché, not chat UI.

**Mode by surface:** Home = Persuade + Read; Skills catalog = Operate + Read; Docs = Read.

## Color

| Token | Light | Role |
|-------|-------|------|
| field | `#EEF1F2` | Page background (cool, not cream) |
| surface | `#FAFBFC` | Cards, elevated panels |
| ink | `#0E141B` | Primary text |
| ink-muted | `#4A5560` | Secondary text |
| line | `#C5CDD4` | Hairline borders |
| datum | `#B87333` | Primary accent / CTA |
| datum-pressed | `#8E5520` | Pressed primary |
| insight | `#2F6F6A` | Links, official, success-of-insight |
| community | `#6B5B4F` | Community provenance |
| danger | `#9B2C2C` | Epistemic warning only |

Dark (optional pair): field `#0B1014`, surface `#141A21`, ink `#E6EBEF`, datum `#D4894A`, insight `#4FA39C`. No neon glow.

**Discipline chips** (border or 10% fill only): psych `#7D6B8A`, socio `#A67C52`, history `#8B4D3B`, poli `#3D4F7C`, econ `#3F6B4F`.

Rules: solid text colors; no gradient text; accent ≤ ~5% of viewport; no purple brand family.

## Typography

| Role | Face |
|------|------|
| Display / idea titles | Source Serif 4 + Noto Serif SC |
| UI / nav / body chrome | IBM Plex Sans + Noto Sans SC |
| Code / install | IBM Plex Mono |

Scale: clear ≥1.25 steps; body 16–18px; measure ~65–75ch for prose. Banned as brand defaults: Inter, Geist, Space Grotesk as identity faces.

## Shape & depth

- Radius: 8–10px cards/inputs; pills only for small tags.
- Elevation: hairline border preferred; no border+wide soft shadow combo; no card-in-card.
- No thick side-tab accent borders on rounded cards.
- Buttons: solid copper primary; ink outline secondary/ghost.

## Motion

- Still content; micro feedback on tool actions (copy, nav).
- Optional one-shot hero datum settle; honor `prefers-reduced-motion`.
- No bounce, marquees, ambient particles, full-page cursor effects.

## Layout motifs

- **Datum cross/pin** for orientation metaphor (not ship anchor).
- Structural grid only on orientation diagram — never full-page wallpaper grid.
- Install command block is a primary “object” on Home.
- Asymmetric scenario modules preferred over 3 identical icon tiles as sole structure.

## Anti-patterns (hard ban)

Purple/cyan AI gradients · glassmorphism · glow shadows · gradient headings · metric theater · nested cards · Inter-as-brand · fake testimonials · chat-widget hero.

## Implementation (2026-07-30)

| Layer | Location |
|-------|----------|
| Tokens | `apps/web/src/app/globals.css` (`--ow-*` + shadcn semantic aliases) |
| shadcn UI | `apps/web/src/components/ui/*` + `components.json` |
| React Bits (Tier A) | `apps/web/src/components/bits/*` — DotField, BlurText, Noise, LogoLoop |
| Install object | `InstallCommand` Tabs CLI \| GitHub \| Manual + Sonner |
| Plan | `docs/plans/2026-07-30-home-spec-alignment.md` |

Home accents budget: DotField + BlurText + LogoLoop (≤3 heavy); Noise light.

## Sources

- PRODUCT.md
- docs/specs/02-视觉艺术方向.md (Direction B)
- docs/specs/03–04 page & component specs
- docs/plans/2026-07-30-home-spec-alignment.md
