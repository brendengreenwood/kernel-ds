# 0088 — Map grammar is portal-canonical

Date: 2026-11-07
Status: accepted

## Context
The origination-map prototypes grew a real visual language for maps — three layers
(ground, marks, chrome), one job per visual channel, a hue ledger, named zoom stops —
but it was written down only in `prototypes/origination-map/MAP-DESIGN-SYSTEM.md`.
That doc already drifts (v2's kit cites a doc v2 doesn't have) and is invisible to
anyone outside `prototypes/`. Meanwhile the work app ships its own MapLibre map on a
different basemap (CARTO Voyager vs the prototype's OpenFreeMap), so the grammar must
survive a tile-source swap.

## Decision
- The map grammar is documented canonically in the portal at `/map-grammar`
  (`pattern.map-grammar`, documentation-only entity: `sourceFiles: []`). Prototype
  docs point here; this page wins on conflict.
- The grammar is explicitly split from its tile-source binding. Travels to any
  basemap: channels, hue ledger, layers, lenses, marker recipe, zoom-size curve,
  self-drawn corridors. Re-bound per tile source: basemap layer ids for the ground
  re-tint, handoff zooms, label layers. Per-source bindings live in one file per app.
- The map kit (palette, marker recipe, glyphs, zoom curves) stays in the prototypes.
  `@kernel/ui` takes no MapLibre dependency for one consumer; promotion waits for a
  second real consumer.
- Chrome is not re-specified: it is the floating-pane pattern (0083), composed, not owned.

## Consequences
- A new map surface (any basemap) starts from this page: claim hues in the ledger,
  bind tile layers in one file, keep marks on Kernel tokens.
- The hue ledger is full — a new category takes a second channel, not a new hue.
- `Map` glyph added to the icon shim (`mdiMapOutline`).
- Catalog pins move 99→100 entities, 87→88 doc slugs.
