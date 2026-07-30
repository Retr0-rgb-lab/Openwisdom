# Plan A — New Bits primitives

## Deliver

1. `apps/web/src/components/bits/ShapeGrid.tsx`  
   - CSS/SVG 5×5 or sparse grid, colors structure/mist/line  
   - Optional slow opacity pulse once or static; RM = static  
   - Props: `className`, `static?`

2. `apps/web/src/components/bits/Magnet.tsx`  
   - Desktop only; weak pull via motion values or CSS; RM / mobile = children only  
   - Wrap copy button later (Hero/Install)

3. `apps/web/src/components/bits/TextType.tsx`  
   - One-shot typewriter for a string; `loop={false}`; RM = full text immediate  
   - Used for CLI command display

4. `ClickSpark.tsx`  
   - Slightly stronger once spark; keep duration ≤450ms

5. Update `bits/README.md` tier table

## Out of scope

Do not edit home/* except if README only.

## Done when

Components export clean, lint ok, no purple defaults.
