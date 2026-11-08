# 0081 — `prototypes/` holds standalone DS-consuming prototypes; maps use MapLibre

Date: 2026-10-04
Status: accepted
Extends: 0034 (consume the DS at source), 0068 (`kernel-app/` is a prototype surface)

## Context

Two research pages arrived as uploads — a Cargill vs ADM draw-area map (d3 +
an SVG Albers projection) and a US crop tonnage ledger. The request was to
build them out as a prototype in this repo with a *real* map (Mapbox or
MapLibre), not a static projection. `kernel-app/` is the v2 product-shell
prototype with its own drift register; folding unrelated market-research views
into it would muddy that register and its navigation.

## Decision

- **`prototypes/<name>/`** is the home for standalone prototype apps. Each is
  its own Vite + React app (own `package.json` + lockfile, not a root
  workspace) that consumes `packages/ui/src` at source through the `@` alias,
  exactly like `kernel-app/`. Same fence as 0058/0068: not a product surface,
  not a spec, styling stays in the app's own `index.css` with an app prefix
  (`--om-*`), and nothing leaks into `packages/ui`. Each gets a CI build job.
- **Interactive maps use MapLibre GL JS**, with OpenFreeMap vector styles as the
  default basemap (no API key, OSM data) and env-var overrides
  (`VITE_MAP_STYLE_LIGHT/DARK`) for any other MapLibre style. Chosen over
  Mapbox GL because it needs no token or billing account for a prototype,
  is BSD-licensed, and keeps the Mapbox-v1 API shape, so moving to Mapbox later
  touches one component.
- **Map layers are painted from DS tokens** resolved at runtime (canvas
  oklch → rgba, since MapLibre can't parse `oklch()`), and re-installed on theme
  change. A bundled outline fallback keeps the data usable when tiles fail.

## Consequences

- `maplibre-gl` is a dependency of `prototypes/origination-map` only — not of
  `@kernel/ui`. If maps become a DS concern (a `<Map>` component, map tokens),
  that is a separate promotion through the prototype registry (0070).
- Company series on maps/charts use the abstract `--viz-*` axis; competitors
  are never mapped onto status, notification, or commodity colours.
