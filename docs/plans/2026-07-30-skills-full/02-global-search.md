# Plan B — Global capsule search + Command palette

## Goal

Header capsule + Ctrl/⌘K palette sitewide. Skills-primary hybrid.

## Tasks

1. Add shadcn-compatible `dialog.tsx` + `command.tsx` (or lightweight Dialog + listbox if cmdk heavy) using Overlay Atlas tokens.
2. `GlobalSearchTrigger` — pill, Search icon, placeholder, Kbd ⌘K/Ctrl+K (md+).
3. `CommandPalette` — open/close, focus trap, groups: Skills / Jump to / Search catalog for q.
4. `useGlobalSearchHotkey` — Ctrl+K / Meta+K toggle; ignore when not appropriate.
5. Wire into `SiteHeader`: max-w-6xl; capsule between nav and utilities.
6. Mobile: compact capsule; also openable from MobileNav optional row.
7. i18n keys under `shell.search` / `shell.command`.
8. Search uses `queryCatalog` / filter on title summary tags slug.
9. Enter skill → `/skills/{slug}`; Search catalog → `/skills?q=` (merge facets if on skills).
10. Prefill q from URL when on skills.

## Done when

- Hotkey works on home and skills
- No purple glow; uses Kbd component
- Empty palette not blank
