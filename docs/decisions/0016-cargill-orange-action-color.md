# 0016 — Cargill orange is the action color; green is navigation

Date: 2026-07-08 · Status: superseded by 0017

## Context

The platform serves Cargill, whose identity pairs a green shield with a
signature orange. The owner's direction: **green for navigation, orange for
action**. Until now the system had one brand colour (green) doing both —
`--primary` (buttons, links, focus) *and* the nav chrome were the same green,
so nothing distinguished "where am I" from "what can I do".

## Decision

**Add a full Cargill-orange scale and repoint the action role to it; keep
navigation green.**

- New scale `--orange-*`, a full 50→950 OKLCH ramp (+ `-light`/base/`-dark`
  aliases), on both surfaces — the same pipeline as any token (`kernel-token`).
  `500` is the vivid shield orange (~#E9622E, hue ~47).
- **Action role → orange.** `--primary` and `--ring` point at orange in both
  modes: `orange-600` light, `orange-400` dark. So primary buttons, links,
  and focus rings — everything that *acts* — are Cargill orange.
- **Navigation stays green.** The `--sidebar-*` tokens (rail background,
  active item, logo mark, sidebar ring) and `--secondary` / `--accent` keep
  the green brand. `--brand-*` is unchanged and now documented as the
  navigation colour.
- **Contrast:** the action orange used for button backgrounds is tuned to
  `oklch(0.556 0.168 45)` so white `--primary-foreground` clears WCAG AA
  (5.07:1 light, 6.52:1 dark) — a vivid `orange-500` failed at 4.38:1. Dark
  mode pairs a lighter `orange-400` primary with a dark-orange foreground.
  `contrast-audit.mjs`: 0 AA failures.

## Consequences

- The UI now speaks Cargill: orange = do-something, green = go-somewhere.
- `--primary` is no longer the brand green — code/docs that assumed
  "primary = brand" were corrected (the Typography eyebrow, links, and the
  Primary role pair now read orange; the Button page shows orange primaries
  beside green secondaries).
- Adding orange followed the token pipeline: `index.css` + `theme.css`
  scales + `@theme` maps, the HTML `#colors` ramp and `#install` reference,
  the `foundations.tsx` ramp, and the README. Three colour axes plus the two
  brand roles (green nav / orange action) are now explicit.
