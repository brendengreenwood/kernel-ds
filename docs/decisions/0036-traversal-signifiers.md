# 0036 — Traversal signifiers are green: the `--traversal` ink

Date: 2026-07-20 · Status: accepted · Completes 0035's green side

## Context

Decision 0035 settled the blue side (buttons are actions) but the green
side's "go here" affordances were still wearing neutral gray at the
component layer: accordion chevrons were `muted-foreground`, breadcrumb
links were `muted-foreground`, pagination's current page was a plain
white outline. The owner's direction: tabs, accordion icons, and their
kin are traversal — brand "go here" things. The traversal ink existed
only as ad-hoc utility pairs on the demo page.

## Decision

**Wayfinding and disclosure affordances carry the brand green, via a new
`--traversal` ink role token.**

- **Token**: `--traversal` → `brand-700` light / `brand-300` dark
  (7.00:1 on light background/card, 9.28:1+ on dark — gated by a new
  "Traversal ink" audit section). Mapped through `@theme` as
  `text-traversal`. This formalizes the ink that 0032's demo introduced
  as raw utility pairs.
- **Components wired to it**:
  - `ui/accordion.tsx` — trigger chevrons: `text-traversal` (the icon is
    the "this opens" signifier).
  - `ui/breadcrumb.tsx` — `BreadcrumbLink`: `font-medium text-traversal
    hover:underline`; the current page (`BreadcrumbPage`) stays
    foreground.
  - `ui/pagination.tsx` — the active page renders
    `variant="secondary"` (brand-tinted): "you are here" is a toggled
    traversal state, exactly the license 0035 carved out for the
    secondary variant. Prev/next/others stay ghost.
  - `ui/tabs.tsx` — already correct, no change: pill active fills
    `--primary` and underline active borders `--primary`, which stayed
    brand green by 0035's design.
- **Scope rule**: traversal ink marks *where an interaction takes you or
  reveals* — links that navigate, chevrons that disclose, markers of
  current place. It never colors a button fill (0035) and never colors
  state/outcome (0003).

## Consequences

- Disclosure and wayfinding now read as one green family across
  accordion, breadcrumb, pagination, tabs, sidebar, and the traversal
  ink demos — Norman's signifier consistency: green glyph = "go/open".
- New green text-links should reach for `text-traversal` instead of
  hand-picking brand steps; the demo page now dogfoods the token.
- The audit gates the ink on both surfaces (76 pairs, 0 AA failures).
