# 0089 — Map theme tokens ship in @kernel/ui

Date: 2026-11-07
Status: accepted

## Context

Decision 0088 made the map grammar canonical on the portal's `/map-grammar`
page, but the token layer the grammar names (`--om-*`) stayed app-local in the
origination-map prototypes. The live kernel-app is building its map on a
different basemap (CARTO Voyager) and needs to adopt the theme; without named
tokens it would have to re-derive the ledger from prose, which is exactly how
drift starts.

## Decision

- `@kernel/ui` ships a semantic map token layer in `styles.css`, following the
  STATUS token pattern (`:root` + `.dark` + `@theme inline` aliases):
  - Ground re-tint: `--map-ground`, `--map-roads`, `--map-water`
  - Corridors: `--map-barge` (sky), `--map-rail` (rust)
  - Hue ledger: `--map-cargill`, `--map-adm`, `--map-bunge`, `--map-ldc`,
    `--map-production`, `--map-feed`, `--map-refinery`, `--map-port`
- Values alias the Kernel ramps the ledger already claims (brand/crop, plum,
  clay, slate, wheat, teal, rust, sky, neutral-warm for light ground). Only
  water and roads carry bespoke values, copied from the prototype.
- The `/map-grammar` ledger swatches read the tokens (`bg-map-*`), so the page
  is live proof the tokens flip with the theme.
- The prototypes keep their `--om-*` aliases for now; they are the reference
  implementation, not the contract. New consumers use `--map-*`.
- Adoption in the live app is described in
  `docs/handoff/kernel-app-map-theme.md`: one binding file per tile source,
  and the app's deliberately-disabled basemap layers are inventoried and
  recorded there, never inferred.

## Consequences

- Token surface grows by 13 names (`--map-*` + `--color-map-*` aliases);
  additive, so a minor `@kernel/ui` changeset.
- The hue ledger now has a single source of truth in code; claiming a new hue
  means editing the token block and the ledger together, with a decision
  record.
- `--map-water` (basemap tint) and `--map-barge` (corridor hue) are distinct
  on purpose — the ledger's "Water" row is the barge corridor.
