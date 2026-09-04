# Concept archive — Green world, blue actions (2026-07-20)

**Status**: archived concept, never merged; its role assignment was
**inverted** by decision 0069 (2026-09-04) — the cobalt scale lives on as
`--nav-*` with green as the action color and blue as traversal. This
record preserves the v1 concept as designed. Original artifacts: PR #61
(head `03d204f` — full diff, screenshots, and history) and the Netlify
deploy preview `deploy-preview-61--kernel-design-system.netlify.app`.

## The concept in one sentence (v1)

**Green is where you go, blue is what you do**: the Cargill brand green
carries everything you move through and the state you set (chrome, nav,
links, tabs, disclosure chevrons, selection, focus), while buttons — the
things that *do* — never wear green: the lead action of a region is a
cobalt action blue, its supports are white, its quietest siblings are
ghost.

## Why it existed

Before it, one green did both brand and every affordance, so nothing on a
screen distinguished "where am I" from "what can I do." The concept split
the two jobs without diluting the brand — green gained territory
(breadcrumbs and accordion chevrons had been muted gray) — and borrowed
the web's oldest convention for the rest: blue means clickable. (The
inversion, 0069, keeps the split but concludes the convention cuts the
other way: blue *links* are the older half of that convention, and the
brand belongs on the buttons.)

## The cobalt scale (identical values now shipped as `--nav-*`)

Hue 254→267, chroma peaking 0.190 at 500 — the most chromatic blue in
the system (above `--info-*` 0.165 and `--viz-sky-*` 0.135, below
`--error-*` 0.206), 93° from the teal-leaning `--success-*`. Every step
sRGB-gamut-exact.

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

## The v1 rules (as designed)

- **Button ladder**: 1 primary `default` — action-blue fill (light
  `action-600` + white 5.32:1; dark `action-400` + `action-950` 7.17:1),
  one blue lead per region, never two blues side by side · 2 secondary
  `outline` — white, any number · 3 tertiary `ghost`. No-lead clusters
  got no blue at all.
- **Green world**: `--primary`/`--ring` stayed brand green and drove the
  non-button interactive state (tabs, selection controls, focus,
  calendar, progress).
- **Traversal ink**: `brand-700` light / `brand-300` dark on breadcrumb
  links, record links, accordion chevrons; pagination's current page was
  the brand-tinted `secondary` variant.
- **Axes never crossed**: statuses, notifications, and commodities kept
  their own hues.

## The decision trail on the PR #61 branch

0032 (the hue and why success stays at 168) · 0033 (all-blue pulled
back: too much) · 0034 (four-tier ladder, superseded) · 0035 (buttons
are actions: blue/white/ghost) · 0036 (traversal signifiers green).
Prior art: 0016/0017 (orange actions tried and reverted, 2026-07-08).
Gate state at archive time: 76 contrast pairs, 0 AA failures.

## Proof screens

Committed at `docs/archive/2026-07-20-action-blue-concept/` in the PR
#61 tree (`03d204f`): the `/shipments` time-of-shipment table light +
dark, the `/color-roles` doctrine page, the button ladder, the Action
ramp, and the green traversal components. Browsable live at the PR's
Netlify deploy preview.
