# 0093 — The map stays a prototype

Status: accepted
Date: 2026-11-09

## Decision

The origination map (v2 prototype) does not graduate into the portal or the
packages. It remains a prototype surface with two jobs:

1. **Theme exploration.** The map is where the warm-neutral ground, the
   `--map-*` token contract (decision 0089), the hue ledger, and the mark
   grammar get pressure-tested against real geography before they harden.
2. **Sell-side discovery.** Destinations, corridors, and sell routes preview
   the forthcoming sell side of Kernel. That product work is not defined yet,
   so building a canonical surface for it now would be guessing.

## What graduates instead

The map's lessons are already extracted into canonical artifacts, and that is
the pattern going forward:

- Tokens: `--map-*` block in `@kernel/ui` styles (decision 0089).
- Pattern: `pattern.map-grammar` and the `/map-grammar` portal page
  (decision 0088).
- Objects: `object.draw-area`, `object.pair`, `object.corridor`,
  `object.route` in the catalog.
- Data honesty: `prototypes/origination-map-v2/data-source/DATA-REGISTER.md`
  records provenance and ranked gaps.

## Why

The prototype's data layer is the weak link (ADM undercount, centroid
coordinates, unversioned rail input). A canonical surface built on guessed
data would launder guesses into contract. When the sell side becomes real
product work, the map re-enters through the normal pipeline: catalog entity,
portal page, gates.

## Consequences

- `prototypes/origination-map-v2` stays fenced: no portal imports from it,
  no package depends on it.
- Changes to map visual language land in tokens/patterns first, then the
  prototype consumes them — never the reverse.

Note: 0092 is the status-ledger record (PR #107); this record was numbered
while that PR was in flight.
