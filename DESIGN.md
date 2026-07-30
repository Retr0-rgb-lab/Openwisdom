# Design System — Openwisdom

<!-- Overlay Atlas / logo-aligned tokens (specs/07). Supersedes copper Direction B as primary brand. -->

## Platform

web

## World

**Overlay Atlas** — a multi-perspective measurement panel: cool paper field, blue primary CTA, teal-stone structure, amber signal. Grid and three shapes (circle / square / triangle) are isomorphic with the brand mark. Not copper instruments, not purple AI-SaaS, not cream-library cliché, not chat UI.

**Authority:** root brand art is **`logo.svg`**, shipped at **`apps/web/public/brand/logo.svg`** (Header / MobileNav `/brand/logo.svg`). Spec **07** is the token source of truth; this file is the agent-facing summary.

**Mode by surface:** Home = Persuade + Read; Skills catalog = Operate + Read; Docs = Read.

**Supersession:** Old Direction B “Instrument of Orientation / Atlas Coordinate” (cool field `#EEF1F2`, copper datum `#B87333`) is **retired for brand chrome and primary CTA**. Shared bans (no purple AI skin, no fake metrics/testimonials) still hold.

## Color (logo-aligned — Spec 07)

| Token | Light | Role |
|-------|-------|------|
| field | `#F8F9FA` | Page background (logo canvas) |
| surface | `#FFFFFF` | Cards, elevated panels |
| surface-muted | `#F3F5F7` | Nested muted panels |
| ink | `#0F1724` | Primary text |
| ink-muted | `#5A6570` | Secondary text |
| line | `#D5DCE2` | Hairline borders |
| primary | `#1C4BD1` | Main CTA, links, focus ring (logo circle / sociology) |
| primary-pressed | `#153A9E` | Pressed primary |
| structure | `#2E6975` | Official, structure, secondary emphasis (logo square / economics) |
| signal | `#E69622` | Anchor, critical step, feature accent (logo triangle / psychology) |
| mist | `#88ADC0` | Soft wash, chips, secondary surface tint |
| community | `#5C6B75` | Community provenance (slate, not brown copper) |
| danger | `#B42318` | Epistemic / destructive only |

**UI accent mix (not logo pixel area):** primary blue **~60%** · structure **~25%** · signal **~15%**.

Dark pair (structural reservation only; no v1 theme switch): field `#0B1014`, surface `#141A21`, ink `#E6EBEF`, primary `#5B7FE8`, structure `#5A9AAA`, signal `#F0B04A`. No neon glow.

**Discipline chips** (border or ~10% fill only; logo-同源):

| Discipline | Color |
|------------|-------|
| psychology | `#E69622` |
| sociology | `#1C4BD1` |
| economics | `#2E6975` |
| history | `#5C7A8A` |
| political-science | `#3D4F8C` (low sat; **no bright purple**) |

### Copper retirement

| Old | Treatment |
|-----|-----------|
| `--ow-datum: #B87333` | **Removed as brand primary.** One-release alias: `--ow-datum` → `--ow-signal` in `globals.css` only; **do not use for new code** |
| `text-datum` / `bg-datum` / `border-datum` | Prefer `primary` / `signal` / `structure` utilities |
| Copper Header cross as brand | **Header uses `logo.svg`**; compact coordinate marks may use primary/signal |

Rules: solid text colors; no gradient text; accent restrained; no purple brand family.

## Typography

| Role | Face |
|------|------|
| Display / idea titles | Source Serif 4 + Noto Serif SC |
| UI / nav / body chrome | IBM Plex Sans + Noto Sans SC |
| Code / install | IBM Plex Mono |

Scale: clear ≥1.25 steps; body 16–18px; measure ~65–75ch for prose. Banned as brand defaults: Inter, Geist, Space Grotesk as identity faces.

## Shape & depth (logo grammar)

- **Three-shape semantics:** circle = macro · square = structure · triangle = individual / anchor (scenario micro-icons OK).
- **Grid:** 5×5 only **inside** panels / Orientation — never full-page wallpaper grid.
- Radius: 6–10px cards/inputs (logo-aligned); pills only for small tags.
- Elevation: hairline border + light panel shadow; no border+wide soft shadow combo; no card-in-card.
- No thick multi-color top bars as default card chrome.
- Buttons: solid **primary blue**; outline/ghost secondary; signal sparingly for “critical step.”

## Motion (constitution — Spec 08)

Stack: **shadcn + tw-animate-css** (chrome) · **motion** (product interaction) · **React Bits only MUST/MAY** in `components/bits/`.

| Rule | Meaning |
|------|---------|
| **C1** Still content default | Body, claims, nav structure do not loop-wiggle |
| **C2** One-shot entrance | BlurText, orientation settle, section reveal: once |
| **C3** Tool feedback | Copy, Tab, Sheet: ~150–250ms |
| **C4** Ambient restraint | DotField slow drift or static; quiet visibility |
| **C5** LogoLoop exception | Slow (≥36s), pause on hover, RM/mobile static |
| **C6** No noisy marquees | No high-speed magic marquee / parallel strip chaos |
| **C7** Fail-safe | If JS fails, content opacity must remain 1 |

**Hero recipe (≤3 heavy):** DotField **or** ShapeGrid · static Noise 3–7% · BlurText H1 once · InstallCommand mostly static · harness LogoLoop or static row.

**MUST bits (v1):** DotField, Noise (static SVG), BlurText (H1 once), Reveal or CSS fade-up, weak SpotlightCard, LogoLoop or static harness.

**NEVER:** Hyperspeed / Galaxy / Prism / Aurora / Beams / Lightning / Plasma / cursor trails / glitch text / fake CountUp metrics / >3 heavy effects per page. Silk/Threads/Particles not in v1.

Honor `prefers-reduced-motion: reduce` → static field, full text visible, no Blur/Spark loops.

## Layout motifs

- Logo mark in site chrome; Orientation panel uses grid + three shapes (not copper crosshair HUD).
- Install command block is a primary “object” on Home (Hero once; Final CTA may repeat command without a third path-tutorial band).
- Home Persuade = **≤6 beats** (Spec 10): Hero · Harness · Scenarios · Model · Disciplines · FinalCta.
- Asymmetric scenario modules preferred over three identical icon tiles alone.

## Anti-patterns (hard ban)

Purple/cyan AI gradients · glassmorphism buttons · glow shadows · gradient headings · metric theater · nested cards · Inter-as-brand · fake testimonials · chat-widget hero · copper as primary CTA · full-page grid wallpaper.

## Implementation (2026-07-30 visual rebrand)

| Layer | Location |
|-------|----------|
| Tokens | `apps/web/src/app/globals.css` (`--ow-*` + shadcn aliases; logo-aligned Spec 07) |
| Logo asset | `apps/web/public/brand/logo.svg` |
| shadcn UI | `apps/web/src/components/ui/*` + `components.json` (base-nova) |
| React Bits | `apps/web/src/components/bits/*` — DotField, BlurText, Noise, LogoLoop, Reveal, SpotlightCard |
| Install object | `apps/web/src/components/install/InstallCommand.tsx` (Tabs **CLI \| MCP** + honest not-yet-on-npm status) |
| i18n | next-intl v4; `apps/web/src/messages/{zh,en}/{shell,home}.json` |
| Specs (authority) | `docs/specs/07`–`11` + plans `docs/plans/2026-07-30-visual-rebrand/` |

Home heavy budget: DotField + BlurText + (optional) LogoLoop ≤3; Noise light.

## Sources

- `apps/web/public/brand/logo.svg` (brand authority)
- PRODUCT.md
- docs/specs/07-品牌与Logo对齐视觉系统.md
- docs/specs/08-动效与ReactBits锁定.md
- docs/specs/09–11 Impeccable / Home IA / SPE
- docs/specs/02–04 (historical; copper Direction B superseded for primary brand)
