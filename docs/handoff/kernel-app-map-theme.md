# Handoff: adopt the Kernel map theme in kernel-app

This is a description of intent with reference files, not code to paste. The
live app's map should read the same named tokens and follow the same grammar
as the prototypes, with everything tile-source-specific isolated in one
binding file.

## References

| What | Where |
| --- | --- |
| The grammar (canonical) | portal `/map-grammar` page (`pattern.map-grammar`, decision 0088) |
| The tokens | `packages/ui/src/styles.css` — `--map-*` block (decision 0089) |
| Working reference impl | `prototypes/origination-map-v2/src/map/kit/` (`theme.ts`, `marker.ts`, `corridors.ts`, `zoom.ts`, `glyphs.ts`) |
| Prototype-specific detail | `prototypes/origination-map/MAP-DESIGN-SYSTEM.md` |

## 1. The tokens are the contract

`@kernel/ui` now ships a semantic map token layer, light and dark:

- Ground re-tint: `--map-ground`, `--map-roads`, `--map-water`
- Corridors: `--map-barge` (sky), `--map-rail` (rust; flow ramps rust 600→400 by volume)
- Hue ledger: `--map-cargill`, `--map-adm`, `--map-bunge`, `--map-ldc`,
  `--map-production`, `--map-feed`, `--map-refinery`, `--map-port`

Marks and corridor styling read these tokens (or the Kernel ramps the grammar
names) — never the basemap's own palette. That is what makes light/dark hold
on any tile source. If the app needs a color the ledger does not have, the
ledger is full: use a second channel (shape, fill, grouping), or stop and add
a decision record — do not invent a hue locally.

## 2. One binding file per tile source

kernel-app's basemap is CARTO Voyager, not the prototypes' OpenFreeMap. The
schemas differ (Voyager source-layers: `landuse, water, boundaries, roads,
buildings, pois, places`). Everything that touches the tile schema lives in
ONE file (suggested: `src/map/binding.carto.ts`):

- Basemap layer ids used for the ground re-tint (water, roads, rail, land)
- Handoff zooms — where basemap rivers/rail yield to our drawn corridors
  (prototype values rivers:8 / rail:9 are OpenFreeMap-tuned; re-tune here)
- Label layers kept, and their recolor to `--muted-foreground`-equivalent

## 3. Record the disabled layers — do not re-derive them

The live app's map theme already has a set of basemap layers deliberately
disabled (POIs, buildings, etc.). Before changing anything, inventory the
current style's hidden/removed layers and record that list in the binding
file with a one-line reason each. That list is part of the theme: a future
restyle must be able to reproduce it, and the next tile-source upgrade must
not silently resurrect them.

## 4. Suggested order

1. Inventory the current map style: layers disabled, colors overridden,
   where those overrides live today.
2. Create the binding file; move the disabled-layer list and any existing
   layer-id references into it.
3. Re-tint the ground from `--map-ground` / `--map-roads` / `--map-water`
   (resolve the CSS variables at style-build time; re-resolve on theme flip).
4. Point marks and corridors at the `--map-*` ledger tokens.
5. Re-tune handoff zooms against Voyager, then verify light and dark, and
   that a theme flip retints without a reload.

## Not in scope

- Prototype data, adapters, or the marker kit itself — port only what the
  app's map actually renders.
- Guessing which layers were disabled: inventory, don't infer.
- New hues or new channels — the grammar on `/map-grammar` wins on conflict.
