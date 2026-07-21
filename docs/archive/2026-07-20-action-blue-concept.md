# Concept archive — Green world, blue actions (2026-07-20)

**Status**: complete, working, unmerged — archived so the concept survives
regardless of adoption. Everything below is live on branch
`claude/action-blue-color-design-vbdtze` and frozen under the git tag
**`concept/action-blue-2026-07`** (tags outlive branches).

## The concept in one sentence

**Green is where you go, blue is what you do**: the Cargill brand green
carries everything you move through and the state you set (chrome, nav,
links, tabs, disclosure chevrons, selection, focus), while buttons — the
things that *do* — never wear green: the lead action of a region is a
cobalt action blue, its supports are white, its quietest siblings are
ghost.

## Why it exists

Before this, one green did both brand and every affordance, so nothing on
a screen distinguished "where am I" from "what can I do." The concept
splits the two jobs without diluting the brand — green actually gained
territory (breadcrumbs and accordion chevrons used to be muted gray; they
wear the brand now) — and borrows the web's oldest convention for the
rest: blue means clickable.

## The action blue (scale `--action-*`, full 50→950)

Cobalt, hue 254→267, chroma peaking 0.190 at 500 — deliberately the most
chromatic blue in the system (above `--info-*` 0.165 and `--viz-sky-*`
0.135, below `--error-*` 0.206 so alarm outranks invitation), 93° from
the teal-leaning `--success-*` (168) so the emerald never approaches it.
Every step is sRGB-gamut-exact (light steps sit at the blue gamut
ceiling).

| step | oklch | hex |
| --- | --- | --- |
| 50 | 0.975 0.011 254 | `#f2f7fe` |
| 100 | 0.945 0.026 255 | `#e2eeff` |
| 200 | 0.895 0.050 256 | `#c7defe` |
| 300 | 0.825 0.086 257 | `#a2c8fe` |
| 400 | 0.730 0.138 259 | `#71a8fe` |
| 500 | 0.620 0.190 261 | `#3e80f6` |
| 600 | 0.536 0.184 262 | `#2c65d6` |
| 700 | 0.450 0.160 263 | `#224dac` |
| 800 | 0.375 0.130 265 | `#1e3a85` |
| 900 | 0.300 0.100 266 | `#16295f` |
| 950 | 0.225 0.072 267 | `#0d183d` |

## The rules

- **Button ladder** (buttons are actions): 1 primary `default` — action
  blue fill (light `action-600` + white, 5.32:1; dark `action-400` +
  `action-950`, 7.17:1), **one blue lead per region**, never two blues
  side by side · 2 secondary `outline` — white, any number · 3 tertiary
  `ghost` — quietest. Peer clusters with no standout get no blue at all.
- **Green world**: `--primary`/`--ring` stay brand green and drive the
  non-button interactive state (pill-tab actives, checkbox/radio/switch/
  slider, calendar selection, progress, focus rings). Button deliberately
  does not reference `--primary`.
- **Traversal ink** (`--traversal` role token → `brand-700` light /
  `brand-300` dark, `text-traversal`): breadcrumb links, record links,
  accordion chevrons, wayfinding glyphs. Pagination's current page is the
  brand-tinted `variant="secondary"` ("you are here" as a toggled state).
- **Axes never crossed**: statuses (`--status-*`), notifications
  (success/warning/error/info), and commodities keep their own hues; blue
  never colors state, green never colors outcome.

## Proof screens (committed beside this file)

- `shipment-schedule-{light,dark}.png` — the flagship: a dense
  time-of-shipment table where the eye finds the one blue lead instantly.
- `color-in-use-page-light.png` — the `/color-roles` doctrine page.
- `button-ladder-gallery.png` — the Button page with the ladder row.
- `action-ramp-foundations.png` — the Action ramp among the scales.
- `traversal-components.png` — green Breadcrumb + brand-tinted Pagination.

## Where everything lives

- **Tokens**: `kernel-portal/src/index.css` — `--action-*` scale +
  `@theme` maps; `--traversal` role token (light/dark).
- **Components**: `ui/button.tsx` (blue default + ladder comment),
  `ui/accordion.tsx` (green chevrons), `ui/breadcrumb.tsx` (traversal
  links), `ui/pagination.tsx` (secondary active page).
- **Pages**: `/color-roles` (doctrine, annotated merchant screen,
  signifier inventory, action ladder), `/shipments` (first real screen).
- **Gates**: `scripts/contrast-audit.mjs` sections "Button primary
  (action blue)" and "Traversal ink" — 76 pairs, 0 AA failures at
  archive time.
- **Decisions** (the receipts — alternatives were shipped and reversed,
  not skipped): 0032 (the hue, and why success green stays at 168),
  0033 (all-blue pulled back: too much), 0034 (four-tier ladder,
  superseded), 0035 (buttons are actions: blue/white/ghost), 0036
  (traversal signifiers green). Prior art: 0016/0017 (orange action
  tried and reverted, 2026-07-08).
- **Commits** on `claude/action-blue-color-design-vbdtze`: `c10f438`
  (scale) → `89e1814` (color-roles page) → `3a7fb71` (surgical rebalance)
  → `724b9f1` (hierarchy) → `c37ff93` (buttons are actions) → `d246554`
  (traversal ink) → `4db7e89` (shipment schedule).

## How to restore or adopt later

The concept is additive: one scale, one role token, one button variant,
three small component edits. To adopt, merge the branch (or cherry-pick
from the tag). To trial it cheaply, everything reverts in one small
commit — decision 0017 is the template for a clean reversal. If only
part is wanted, the pieces are separable: the traversal ink (0036) stands
alone; the blue button ladder (0035) stands alone; the scale (0032) is
inert without either.

## Pitch notes (for the internal sell)

Lead with the problem (green did two jobs), show the shipment schedule
screen (four-second argument: the blue is findable *because* it's alone),
answer the brand objection with "green gained territory," cite the
decision trail as proof alternatives were tried, and close on cost: all
tokens, one-commit revert, WCAG-clean (76 pairs, 0 failures).
