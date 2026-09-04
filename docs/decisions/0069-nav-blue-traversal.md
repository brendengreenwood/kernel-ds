# 0069 — Green acts, blue navigates: the nav-blue traversal color

Date: 2026-09-04 · Status: accepted · Extends 0067 (green/lime is the
action hue); revives the cobalt scale from the unmerged PR #61 concept
(decisions 0032–0036 on that branch) with its roles **inverted**

## Context

The action-blue concept (July 2026, PR #61, never merged) split
"where am I" from "what can I do" by making buttons blue and traversal
green. Main evolved independently and ratified the opposite half:
decision 0067 fixed **green (lime in dark) as the action hue** for
`--primary`/`--ring`. The owner's conclusion after sitting with both:
the split itself is right, the assignment was backwards — **Cargill
green must remain the action color; the blue belongs to
navigation/traversal.** That is also the web's oldest convention: blue
has meant "this takes you somewhere" since links were invented, and a
brand-green CTA is the most natural button a green company can ship.

## Decision

**Add the cobalt scale as `--nav-*` and give traversal signifiers the
blue; actions stay exactly as 0067 shipped them.**

- **`--nav-*` scale** (full 50→950 + `-light`/base/`-dark` aliases):
  the PR #61 ramp unchanged — hue 254→267, chroma peaking 0.190 at 500,
  every step sRGB-gamut-exact. Placement rationale from decision 0032
  on that branch still holds: +9° from info (252), +18° from viz-sky
  (243), 93° from the teal-leaning success green, chroma above both
  ambient blues.
- **`--traversal` ink role token**: `nav-600` light / `nav-400` dark
  (5.32:1 on light surfaces; 7.27:1 canvas / 6.22:1 card on the v2 dark
  surfaces). Mapped through `@theme` as `text-traversal` /
  `border-traversal` / `bg-traversal`.
- **Signifiers wired to it** (in `@kernel/ui`):
  - Breadcrumb links: `font-medium text-traversal hover:underline`
    (current page stays foreground).
  - Accordion trigger chevrons: `text-traversal` — disclosure is a
    "go/open" signifier.
  - Tabs actives: pill fills `bg-traversal` (white text light,
    `nav-950` text dark — 5.32:1 / 7.17:1); underline borders
    `border-traversal`. Tabs no longer ride `--primary`.
  - Pagination current page: a soft nav chip (`nav-100`/`nav-800`
    light 8.94:1; `nav-900/60`/`nav-200` dark 10.59:1).
  - Sidebar selection: light `--sidebar-accent` → `nav-100` with
    `nav-800` ink; dark keeps the raised `neutral-800` chip (elevation
    logic, 0065) and signals with a `nav-300` label. This deliberately
    revisits the register note that made rail selection neutral — that
    note guarded against a *second green* competing with the accent;
    the blue is a different family and gives navigation its own
    identity instead.
- **Scope rule**: nav blue marks where an interaction takes you or
  reveals — never a button fill, never state (checkboxes, switches,
  progress, focus stay green/lime per 0067), never the semantic axes
  (0003/0013). Info (245→260) remains the notification blue; context,
  step usage, and the chroma gap keep them apart as 0032 argued.

## Consequences

- The mental model lands as **green does, blue goes** — with the brand
  on the side of it that users act on.
- Audit grows a "Traversal (nav blue)" section (ink on both surfaces,
  tab fills, pagination chips, sidebar pairs): 80 pairs, 0 AA failures.
- The v1 concept (blue actions) remains archived:
  `docs/archive/2026-07-20-action-blue-concept.md` (restored to this
  tree), PR #61's history at `03d204f`, and the Netlify deploy preview
  `deploy-preview-61--kernel-design-system.netlify.app`.
- If blue ever creeps into a button fill or green into a link, either
  is a category error against this record and 0067.
