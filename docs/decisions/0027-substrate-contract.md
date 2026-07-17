# 0027 — Substrate contract for DOM-composed vs canvas-bounded renderings

Date: 2026-07-17 · Status: accepted

## Context

Decision 0026 reorganizes the portal around objects and their
renderings. Renderings split cleanly into two substrates:

- **DOM compose.** The DS owns the interior — every mark, label, chip,
  and control is a DS-provided React component with a `data-slot`, a
  cva variant, tokens on every color, and a11y semantics. Tables,
  lists, cards, forms, dashboards, drawers, dialogs, and menus all sit
  here. This is where the existing shadcn set lives.
- **Canvas boundary.** The DS cannot own the interior — the rendering
  is drawn imperatively on `<canvas>` (or WebGL, or an offscreen
  surface). Maps, plots, timelines, dependency graphs, and any
  large-N spatial view sit here. The DS still owns the **boundary**:
  what data goes in, how it's encoded to marks, what events come out,
  and how DOM overlays anchor to canvas positions.

Without a contract for the boundary, canvas surfaces devolve into
per-page one-offs that reinvent legends, hover behavior, keyboard
navigation, focus rings, and empty states. The rail can't teach a
system that has no shared vocabulary for its own boundary.

## Decision

For canvas renderings, the DS specifies four things — and only these
four:

1. **Typed data in.** Rows conform to the object model's `ObjectRow`
   shape (see `kernel-portal/src/lib/objects/types.ts`). No canvas
   surface accepts free-form data; every input is a known object type.
2. **Encoding spec.** A declarative map from row fields to visual
   channels (position, color, size, shape). Encodings resolve to
   tokens — colors come from the palette, sizes from the scale — never
   raw hex or px.
3. **Event vocabulary out.** A closed set of events the surface emits:
   `hover(row | null)`, `select(row[])`, `zoom({ x, y, k })`,
   `viewport({ x, y, w, h })`. No canvas surface invents its own event
   shapes.
4. **DOM overlays anchored via projection.** Tooltips, legends,
   selection halos, focus rings, and mark labels are DOM nodes
   positioned by a `project(row) → { x, y }` function the canvas
   surface exposes. This is why the DS owns the boundary — the
   overlays are still first-class DS components.

**In this plan set, no real canvas engine ships.** The substrate
contract is documented here and demonstrated in segment 02 with a
DOM-only mock frame plus four first-class mark components — `Pin`,
`Plot`, `ClusterBadge`, `LegendSwatch` — placed inside a
mock-substrate container that emits the four event types via ordinary
React handlers. The contract is real; the engine is deferred.

## Consequences

- `kernel-portal/src/components/ui/marks/` becomes a new component
  family alongside the existing shadcn set. Marks carry `data-slot`
  attributes, cva variants, and a11y semantics; they are exported and
  registered in `component-meta.ts` the same way any other component
  is.
- Any future canvas engine (deck.gl, custom WebGL, `<canvas>` 2D) that
  the portal adopts must implement the four-point contract above to
  qualify as a DS substrate. Ad-hoc canvas surfaces are not DS.
- Object rows carry a mock spatial coordinate (`coord: { x, y }`) on
  the stub model so the substrate demo has real projection data to
  work with. This is a mock; real spatial data will replace it when a
  real canvas engine ships. Recorded as a follow-up: `coord` becomes
  optional on the row shape once objects without spatial rendering
  exist.

## Alternatives considered

- **Mock everything in JSX with no boundary contract.** Rejected. The
  contract is the point — without it, the mark components are just
  more shadcn primitives with no story about where they fit.
- **Ship a real canvas engine now (deck.gl or custom).** Rejected.
  Out of scope for this plan set; would triple the surface area and
  block the object-centric IA on unrelated engine work.
- **Skip mark components entirely and reference canvas surfaces from
  Designs only.** Rejected. Marks are the DOM overlays the contract
  requires — even without a real engine they are the pieces designers
  will place on canvas surfaces once one exists.
