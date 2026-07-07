# 0013 — Commodity color coding: a semantic categorical family

Date: 2026-07-05 · Status: accepted

## Context

The platform tags records by grain commodity (corn, canola, soybeans,
wheat) throughout — lists, badges, chips, chart series. The owner wanted a
fixed color per commodity so those tags are scannable at a glance, the way
`--status-*` makes a lifecycle column scannable.

The existing palettes didn't fit: `--status-*` is persistent *lifecycle*
state and every hue is allocated (decision 0003); notification scales are
*event outcomes* (decision 0004); the `--viz-*` categorical palette is
deliberately *abstract* so a chart series never reads as a status. A
commodity is none of those — it's a stable, meaningful category.

## Decision

**A dedicated `--commodity-*` family** — its own categorical system where
the hue *means* the commodity.

- Four full 50→950 OKLCH scales + `-light`/base/`-dark` aliases (steps
  200 / 500 / 700), same shape as `--viz-*`, in `theme.css` and
  `index.css` (with `@theme inline` maps so `bg-commodity-corn-500` etc.
  are real utilities). Scales are mode-independent (no `.dark` override),
  like viz.
- Hues chosen for mnemonic + scannability:
  - **corn** — gold (~80°)
  - **canola** — brighter, greener yellow (~100°) so it separates from corn
  - **soybeans** — green (~146°) — token stem `--commodity-soy-*`
  - **wheat** — muted tan (~66°, low chroma) so it reads earthy, not as a
    third yellow
- **`<CommodityBadge commodity="corn|canola|soybeans|wheat">`** — a
  `StatusBadge` sibling (dot + soft fill, same anatomy), the primary way to
  render a commodity tag. Preview mirror: `.commodity-tag` +
  `.commodity-<name>` in `portal.css`.
- Charts colour commodity series from the same `--commodity-*` tokens, so
  a tag and its bar match.

## Consequences

- Three distinct color axes now coexist, each with a clear job: **status**
  (lifecycle), **notification** (event outcome), **commodity** (which
  crop) — plus abstract **viz** for non-semantic series. Don't cross them.
- Adding a commodity = one ramp (via the generator) + a `CommodityBadge`
  variant + a `.commodity-*` preview block + a token-reference entry.
- Contrast: the badge soft fills (`text-*-900` on `bg-*-100` light;
  `text-*-100` on `bg-*-900/45` dark) pass AA — added to
  `scripts/contrast-audit.mjs` (70 pairs, 0 failures).
- corn/canola are the closest pair (both warm yellows); separated by
  lightness + chroma + ~20° hue. If a fifth warm commodity is ever added,
  revisit the spacing.
