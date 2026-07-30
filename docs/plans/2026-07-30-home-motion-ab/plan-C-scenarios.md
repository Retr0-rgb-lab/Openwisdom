# Plan C — Scenario steps motion

## Deliver

`ScenarioCards.tsx` only:

1. Three equal columns remain  
2. Each card’s **steps** list: Stagger children once when card in view (nested stagger under card whileInView)  
3. Step numbers can use slight scale once  
4. Link hover: underline + color transition 150–200ms (structure → primary)  
5. Do **not** reintroduce left accent bars or equal-icon-card AI look  
6. No outer Section Reveal (keep reveal={false})

## Done when

Steps visibly cascade; cards equal height; lint ok.
