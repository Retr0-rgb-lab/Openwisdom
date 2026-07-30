# Plan E — Backdrop + Harness

## Deliver

### SiteBackdrop + DotField

1. Pause rAF when `document.hidden`  
2. Listen to `prefers-reduced-motion` changes  
3. Optional: accept `static` prop from parent for non-home — if pathname not home, static field (need client wrapper with usePathname from i18n)

### HarnessRow

1. Keep LogoLoop (user accepts cost)  
2. Ensure a11y: second loop row aria-hidden  
3. Slightly quieter opacity on marquee text

## Done when

No runaway rAF when tab hidden; RM toggles work mid-session.
