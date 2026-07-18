# 0030 — Composition contract: the rules are data

- **Date:** 2026-07-18
- **Status:** accepted

## Decision

The composition rules of the object system — which primitives exist, what
the workspace regions are, and the doctrine that governs how they compose —
now exist as **machine-readable data**:

- `kernel-portal/src/lib/objects/composition.ts` is the **source of truth**:
  a typed manifest (data only, zero component imports) exporting
  `primitives`, `regions`, and `rules`.
- `kernel-portal/scripts/emit-composition.mjs` serializes it to
  `kernel-portal/public/composition.json` — a committed artifact the portal
  serves, so an agent can `fetch("/composition.json")` instead of
  re-deriving conventions from prose. The emit script fails loudly if any
  rule cites a source record that does not exist.
- The prose decision records in `docs/decisions/` remain the **why**; the
  manifest is the **what**. When doctrine changes, the manifest changes in
  the same turn as the decision record that motivates it.
- The Designs page renders the rule list from the manifest, so humans see
  the same rules agents do.

## Rule ids

| id | source |
| --- | --- |
| `views-are-functions-of-context` | decision-0029 |
| `panels-are-anonymous-slots` | decision-0029 |
| `inspector-is-a-panel` | decision-0029 |
| `multiplicity-allowed` | decision-0029 |
| `regions-resizable` | decision-0029 |
| `status-via-model-tones` | amendment-A4 |
| `single-tone-map-source` | decision-0030 (this record) |
| `lib-never-imports-components` | decision-0030 (this record) |
| `registration-only-via-registerObject` | decision-0030 (this record) |

The three rules sourced here were operating conventions of the July plan
runs (the single tone-map invariant is enforced by
`scripts/check-status-map.mjs`; the lib/components boundary and
registerObject-only registration were established in the dynamic-objects
work); this record makes them doctrine.

## Context: the generative-UI epic reorder (data-first)

The board epic ("Objects: generative UI arc") originally sequenced
Counterparty — a third hand-authored TSX object — before the dynamic
registry. That order was reversed. User direction, 2026-07-18:

> "maybe you are getting stuck trying to automate my slop examples… that
> isnt the goal"

The grain domain is a test fixture, not the product. A hand-authored
Counterparty would only find grain-shaped gaps; a JSON-defined alien object
hits every assumption Counterparty would have hit *plus* the
compile-time-constant assumptions that actually block `defineObject`. So:
**data-first** — dynamic registry, generic status path, Zod schema, and
this composition contract land first; Counterparty is demoted from
prerequisite to optional fixture.

## Notes

- The preview primitives declare canonical `data-slot` names in the
  manifest (`object-collection`, `object-record`, …) but do not yet emit
  them in the DOM (`emitted: false`); only the workspace regions emit
  slots today. Emission is a follow-up, tracked on the board — locators
  must not target the un-emitted names yet.
- The canvas region has no dedicated `data-slot`; per the
  panels-are-anonymous-slots rule it hosts an anonymous `workspace-panel`,
  located as the panel outside `workspace-dock`.
- This record supersedes nothing; decisions 0026–0029 stand. It gives
  their doctrine a machine-readable surface.
