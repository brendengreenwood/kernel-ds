# 0083 — Floating pane roles

Date: 2026-10-04

Status: accepted

Extends: 0071–0075 (connected geometry, `PanelShell`/`PanelGroup`/`PanelRegion`)

Numbering note: 0081 and 0082 are reserved by unmerged branches (Figma inherited variant axes, prototypes folder, measured surface ladder).

## Context

Kernel modelled connected panels — regions that share seams inside one rounded shell — but had no model for panels that float over a full-bleed canvas (map, chart, workspace). The origination-map prototype hand-rolled that layout: `absolute` cards with `bg-card/95 backdrop-blur`, hand-tuned `top-[112px]` offsets, a ResizeObserver to push MapLibre controls aside, a filter pill dock whose wrapper swallowed clicks, and a phone fallback. It worked, but none of it was reusable and every new canvas screen would re-derive it, with the same bugs.

## Decision

Floating panes are a new layout role in `@kernel/ui` (`packages/ui/src/components/ui/panes.tsx`), separate from connected panels:

- `PaneCanvas` hosts the canvas, owns the inset (`--pane-inset`, 8px) and gap (`--pane-gap`, 8px), and measures **its own width** — not the window — to choose `floating` or `sheet` layout (`threshold` prop, default 1120px), because app chrome such as a sidebar takes a share.
- `FloatingPane` is the surface: `--radius-floating`, translucent card fill with blur, shadow, built-in `ScrollArea` with the scrollbar inside the padding, and a side-aware enter animation on motion tokens.
- `PaneStack` stacks panes on one edge, newest on top (`usePaneOrder`), and publishes the edge it occupies as `--pane-reserve-left/right` so canvas controls can step aside. The canvas consumer applies the reserve; Kernel does not know about MapLibre.
- `PanePill`/`PanePillBar` and `FilterDock` are the pill triggers; the dock opens one pane at a time above its pill and closes on Escape or outside pointerdown. Wrappers are `pointer-events-none`, panes `pointer-events-auto`.
- `PaneSheet` is the narrow-width fallback: a bottom tab bar with the pane above it.
- Interaction fills for rows inside panes use `--state-hover` / `--state-press` (foreground at 8% / 12%), registered as `bg-state-hover` / `bg-state-press`.

Connected panels never float and floating panes never share seams. `check-pane-usage.mjs` fails a hand-rolled floating panel (absolute + translucent card + backdrop blur, or arbitrary `top-[..]`/`left-[..]` on a card) outside `panes.tsx`, with a ratcheted baseline.

## Consequences

- Any canvas screen gets the inset rhythm, stacking, control step-aside, filter dock and phone fallback by composing primitives.
- The `/panes` portal page demonstrates the system on a plain canvas so the portal takes no map dependency.
- The width threshold differs per canvas; it stays a prop rather than a token.
- The origination-map prototype migrates onto the primitives after this merges; leftover drift is recorded there.
