# React Bits adaptations (Spec 08)

| Component | Spec tier | Notes |
|-----------|-----------|--------|
| `ShapeGrid` | MUST (HEAVY) | **Global** via `SiteBackdrop` — React Bits canvas Shape Grid `speed=0.32` (https://reactbits.dev/backgrounds/shape-grid); Home drifts, other routes `static`; RM still; light vignette only |
| `DotField` | kept | Available for optional local use; **not** global backdrop |
| `Noise` | MUST texture | Global static SVG 3–7%; not heavy |
| `BlurText` | MUST (HEAVY) | Home H1 once |
| `Reveal` | MUST | Visible one-shot; opacity floor 0.22 |
| `Stagger` | helper | List enter; same floor |
| `SpotlightCard` | MUST weak | Scenario hover; primary/mist ≤14% |
| `LogoLoop` | MUST option | Harness ≥36s; RM/mobile static |
| `ClickSpark` | MAY | Copy success; ≤450ms; RM off |
| `Magnet` | MAY | Official API `magnetStrength` (↑=weaker); cards 14; CTA 7; desktop fine pointer only; clamp ±10px; mobile/RM = plain |
| `TextType` | MAY | One-shot typewriter; RM = full text |

**NEVER:** Hyperspeed, Galaxy, Aurora, Prism, Beams, glitch text, fake CountUp, cursor trails.

**Heavy budget (Home):** ShapeGrid (global) + BlurText + LogoLoop ≤ 3.
