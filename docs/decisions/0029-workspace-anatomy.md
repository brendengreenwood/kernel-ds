# 0029 — Workspace anatomy: rail → navigator → canvas → dock, composable panels

Date: 2026-07-17 · Status: accepted

## Context

The first-pass Workspace page (segment 03 of the object-centric
restructure, decision 0026) hard-codes three single-purpose
components: `WorkspaceRail` (a flat collection list), `WorkspaceCanvas`
(spatial marks), and `WorkspaceInspector` (a Contract field renderer).
There is no mode switching, no navigation layer between the rail and
the canvas, and the inspector cannot host anything but a record.

Two requirements surfaced in review of that pass:

1. **IDE anatomy.** The workspace should follow the proven
   activity-bar + side-bar shape (VS Code being the canonical
   reference): an icon rail selects a *mode*, and a contextual
   navigator panel swaps its content per mode — a grouped tree for an
   object collection, a saved-query list for the query aspect,
   association links for traversal.
2. **Composability.** The system must not be rigid. There could be
   several inspectors at once, and an inspector could compose multiple
   primitives — a Record *and* a Write against the same selection —
   rather than being a fixed single-record component.

Separately, the stub datasets (8 contracts, 6 settlements) are too
small for a grouped navigator to demonstrate anything: grouping 8 rows
by counterparty yields counts of 1 and 2.

## Decision

### Anatomy

The Workspace page is rebuilt around four anatomical regions, left to
right:

- **Activity rail** — vertical icon-only bar; one button per workspace
  mode (`contract`, `settlement`, `query`, `traversal`). Selecting a
  mode owns everything to its right.
- **Navigator** — mode-owned navigation. Object modes render a grouped
  tree (group by commodity / counterparty / status, with counts);
  aspect modes render their own idiom (query → saved-query list,
  traversal → association links). The navigator is deliberately *not*
  a generic tree component forced onto every mode.
- **Canvas** — the primary panel: spatial or table view of the active
  collection.
- **Dock** — zero or more panels. The default dock is one "Inspector"
  panel hosting Record + Write as tabs against the live selection.

### Composability doctrine

The implementation must have these five properties (they are the
contract the framework is reviewed against):

1. **Views are functions of context.** A view is
   `{ key, label, render(ctx) }` where
   `ctx = { model, rows, selectedId, select(id) }`. No view knows
   where it is mounted.
2. **Panels are anonymous slots.** A `Panel` hosts an ordered list of
   views (a tab strip when more than one). "Inspector", "canvas", and
   "navigator" are roles assigned by the page layout, not component
   types.
3. **The inspector is a panel, not a component.** The default dock is
   one `Panel` with `[recordView, writeView]`.
4. **Multiplicity is allowed.** The dock holds an array of panels; a
   second inspector can be pinned at runtime and closed independently.
5. **The navigator is owned by the active rail mode.** Different
   navigation idioms per mode is the point.

Views are thin adapters over the existing `_previews/` components
(CollectionPreview, RecordPreview, WritePreview, QueryPreview,
TraversalPreview) — preview props do not change, so the Designs page
and every other consumer are untouched.

### Demo dataset

`kernel-portal/src/lib/objects/dataset.ts` generates a deterministic
demo dataset from a fixed-seed PRNG (mulberry32): 60 contracts
(`K-25001`…`K-25060`) and ~34 settlements (`S-92001`…) with
referential integrity (`contractId` always resolves) and statuses
drawn from the existing vocabularies. Deterministic generation keeps
walks and screenshots stable across runs; generation (vs. hand-writing
60 rows) avoids drift.

The demo dataset is **not** registered in `objectRowsRegistry`. The
registry feeds Designs/Collection/Record/etc., which stay on the
hand-written stubs whose IDs (`K-24081`…) are load-bearing in merged
pages and proof assertions. Only the Workspace page binds the demo
dataset.

### Amendment to decision 0026: "retire-later" becomes "adapt-later"

Decision 0026 said legacy pattern/domain pages would be "retired
later." Per explicit user direction, that is superseded: the legacy
pages are **source material to be adapted into the object system**,
never bulk-deleted. Examples of the intended absorptions: Dashboard →
a workspace preset; Advanced filtering → a Query placement;
Origination/Pricing → Write/workspace compositions. Each adaptation is
its own future plan; nothing is deleted as a side effect of building
the object system.

## Consequences

- The Workspace page becomes the demonstration surface for panel/view
  composability; the framework lives in
  `kernel-portal/src/components/portal/objects/workspace/` and is
  consumed only by that page for now.
- The `_previews/` components gain a second consumer (workspace views)
  without any prop change — their generic `({ model, rows|row })`
  shape is now load-bearing in two places.
- The demo dataset generator is a stopgap: when a real domain fixture
  dataset exists, it replaces the generator (follow-up).
- `coord` remains required on `ObjectRow` (decision 0027 consequence);
  the generator emits coords in `[5..95]` so spatial views stay inside
  their padding.
- Legacy pattern/domain pages remain routed and untouched until each
  one's adaptation plan lands.

## Alternatives considered

- **Rewrite the previews as workspace views directly.** Rejected. The
  Designs page iterates `objectRegistry` and consumes the previews
  with their current props; changing them ripples into a merged,
  verified page. Thin adapters put composability where the concern
  actually lives — the workspace layer.
- **Hand-write ~60 more stub rows.** Rejected. Invites drift, bloats
  the stub files whose row IDs are load-bearing, and adds no realism a
  seeded generator doesn't provide deterministically.
- **Register the demo rows in `objectRowsRegistry`.** Rejected. Every
  registry consumer (Designs, Collection, Record, Write, Query,
  Traversal walks) would silently change its rendered data and
  screenshot baselines.
- **A generic dockable-layout engine (drag-to-rearrange, persisted
  layouts).** Rejected for this pass. Panels are add/remove only; a
  layout engine is speculative complexity until a real use case
  (recorded follow-up: use-case-driven composed workspace).
