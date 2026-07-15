# Drawer focus trap fix — 2026-07-15

## Context

Batch 2 left Drawer as the only overlay/menu component with `a11y: "pending"`. The failing check opened the Vaul-backed drawer and pressed Tab eight times; focus escaped to page content behind the open drawer before reaching the drawer actions. Dialog semantics, background hiding, Escape close, and focus return were already passing.

## Cause

`Drawer` was using Vaul modal state and background hiding, and the gallery exemplar did not pass `modal={false}` or otherwise opt out. Vaul did not move keyboard focus into `DrawerContent` on open in this React 19 portal, so the first Tab advanced from the hidden trigger into the page behind the overlay.

## Fix

`DrawerContent` now contains keyboard focus at the wrapper level:

- focuses the first visible tabbable inside the drawer when content mounts, falling back to the content container;
- cycles Tab/Shift+Tab between visible tabbables inside the drawer;
- preserves the existing Vaul Escape close and focus-return behavior.

No dependency bump was used.

## Evidence

Red baseline:

- `.mastracode/plans/ds-finish-components.proof/without-drawer.txt`
- `FAIL  [Drawer] focus trap holds across Tab x8`

Green verification:

- `.mastracode/plans/ds-finish-components.proof/with-drawer.txt`
- `PASS  [Drawer] focus trap holds across Tab x8 — all inside content`
- `PASS  [Drawer] Escape closes and returns focus to trigger`

Mobile audit:

```txt
node scripts/mobile-audit.mjs http://localhost:4173/c-sheet
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0
```
