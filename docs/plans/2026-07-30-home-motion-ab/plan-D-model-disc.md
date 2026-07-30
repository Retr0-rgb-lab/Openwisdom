# Plan D — Model cite line + Disciplines heading

## Deliver

### Model.tsx

1. Replace dual enter on arrow with **SVG path draw once** (stroke-dashoffset) whileInView once  
2. Keep 280ms reference card swap  
3. Selected scenario button already primary-tinted — keep  
4. Remove nested whileInView fade on arrow text if it doubles Section Reveal

### DisciplineGrid.tsx

1. Wrap **SectionHeading only** in Reveal  
2. Keep grid Stagger with reveal={false} on Section  
3. Link hover already ok — ensure 150–200ms

## Out of scope

Hero, Install, bits new files (import only if shared utils).
