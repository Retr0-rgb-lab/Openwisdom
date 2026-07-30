# React Bits adaptations (Spec 08)

| Component | Spec tier | Notes |
|-----------|-----------|--------|
| `DotField` | MUST (HEAVY) | Global via `SiteBackdrop`; primary/structure/mist; no cursor bulge; RM = one frame |
| `Noise` | MUST texture | Global static SVG 3–7%; not heavy |
| `BlurText` | MUST (HEAVY) | Home H1 once |
| `Reveal` | MUST | Visible one-shot; opacity floor 0.22 |
| `Stagger` | helper | List enter; same floor |
| `SpotlightCard` | MUST weak | Scenario hover; primary/mist ≤14% |
| `LogoLoop` | MUST option | Harness ≥36s; RM/mobile static |
| `ClickSpark` | MAY | Copy success only |

**NEVER:** Hyperspeed, Galaxy, Aurora, Prism, Beams, glitch text, fake CountUp, cursor trails.

**Heavy budget (Home):** DotField (global) + BlurText + LogoLoop ≤ 3.
