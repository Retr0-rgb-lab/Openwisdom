# components/bits — React Bits adaptations

Source: [reactbits.dev](https://reactbits.dev/) components (TS + Tailwind variants), hand-adapted into this directory.

License: MIT + Commons Clause. In-site use is permitted; do not repackage these as a competing component library for sale.

## Direction-B adaptations (specs/02 §6–§7, specs/04 §5)

| Component | Registry default | Our adaptation |
|-----------|------------------|----------------|
| `DotField` | cursor bulge/wave, glow, sparkle | **All cursor interaction and glow/sparkle removed.** Static / ~2px/s drift dot field, low alpha, mobile + reduced-motion render once |
| `BlurText` | replays on every view | **Plays exactly once on mount**; text change (locale switch) swaps glyphs instantly without re-running |
| `Noise` | overlay grain | Static SVG turbulence at 4% opacity, no JS |
| `LogoLoop` | attention-speed marquee | 90s ultra-slow loop, hover-pause, edge fade; static wrapped row on mobile / reduced-motion |

Hard rules preserved here: no looping brand motion, no particle/cursor fields, `prefers-reduced-motion` disables everything decorative.
