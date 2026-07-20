# 0035 — Buttons are actions: the button ladder is blue · white · ghost

Date: 2026-07-20 · Status: accepted · **Supersedes the green-button tiers
of 0033/0034** (the `--action-*` scale and its hue rationale from 0032
stand unchanged)

## Context

Decisions 0033/0034 kept green as the primary button color and treated
the blue as a one-per-view garnish on top of a green-buttoned system. The
owner's correction: **"buttons are actions."** In the green-traversal /
blue-action mental model, a button is definitionally on the action side —
so a green button is a category error, the same kind 0003 guards against
on the status/notification axes. The earlier "too much blue" feedback
(0033) was about blue leaking into *non-button* surfaces — links, chips,
sort indicators, selection washes, focus — not about blue on buttons.

## Decision

**Green never fills a button. The Button ladder is three tiers, blue-led:**

| Tier | Variant | Rendering | License |
| --- | --- | --- | --- |
| 1 · Primary | `default` | action-blue solid (light `action-600` + white, 5.32:1; dark `action-400` + `action-950`, 7.17:1) | the lead action of a region — one blue per cluster |
| 2 · Secondary | `outline` | white surface (raised translucent in dark) | supporting actions — any number |
| 3 · Tertiary | `ghost` | transparent, text-only | quietest — cancel, dismiss, inline utilities |

- **The default variant fills with the action scale directly** — the
  short-lived `variant="action"` is removed as redundant (it existed only
  on this branch). Blue-tinted focus ring comes with the fill.
- **`--primary` deliberately stays brand green.** It drives the
  traversal-side interactive state that is *not* a button: pill-tab
  active fills, checkbox/radio/switch/slider, calendar selection,
  progress, focus rings, `link`-variant text. This is a documented
  divergence: Button no longer references `--primary`.
- **What stays green** (the "mostly green" feedback still binding): all
  chrome and nav, breadcrumbs and record links (traversal ink
  `brand-700`/`brand-300`), tabs, wizard steps, pagination, selection
  controls and washes, focus rings, filter chips (`--secondary` tint).
- **Composition rules**: one blue lead per region/cluster, never two
  blues side by side; peer clusters with no standout are all white/ghost
  (no blue at all); the brand-tinted `variant="secondary"` remains
  outside the ladder (toned chips/toggled states).
- Scarcity survives by structure instead of decree: a screen shows a few
  blue buttons at most because only cluster leads are blue — the 0033
  "one decisive per view" rule relaxes to "one lead per region."

## Consequences

- Every default `<Button>` portal-wide now renders action blue — the
  gallery, patterns, and domain pages pick it up with no call-site edits.
- The audit's "Button primary (action blue)" section gates the fill's two
  pairings (white/action-600, action-950/action-400).
- The mental model is now axis-clean: **green = where you are and what
  state things are in; blue = the buttons that do things.** If a future
  reviewer sees a green button fill or a blue nav item, either is a
  category error against this record.
