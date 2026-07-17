# 0026 — Object-centric information architecture

Date: 2026-07-17 · Status: accepted

## Context

The portal's rail has grown by accretion: shadcn primitives on one axis
(components, elements), then pages that were placements, workspaces, or
whole flows lumped under a mixed "Patterns" and "Domain" pair (App shell,
Navigation, Dashboard, Filtering, Advanced filtering, CRUD patterns,
Flows, Origination flow, Pricing worksheet, Modals, Workspace demo, plus
Contract detail and Settlement statement). The rail teaches the shadcn
inventory well but does not teach **the system** — a designer using it
still has to invent the relationship between "a modal" (a placement),
"a dashboard" (a workspace preset), "advanced filtering" (a query aspect
scoped by a container), and "an origination flow" (a slop bag with no
first-class concept in the model).

The user's design brief for this restructure is
`C:\Users\brend\Downloads\ds-library-patterns-restructure.md`. It reframes
the library around **objects** — the durable things the app manipulates
(Contract, Settlement, Ticket, Invoice, …) — with two object-agnostic
containers (Shell, Workspace), two object-bound Read primitives
(Collection, Record), a Write layer, and two cross-cutting aspects
(Query, Traversal). Placements and workspaces stop being top-level
concepts and become values on one of those axes; "flows" and "origination"
dissolve entirely.

## Decision

The portal's top-level rail is reorganized around the object-centric
rubric. A new nav group **Objects** carries eight destinations, in this
order:

1. **Shell** — the object-agnostic app frame (nav, header, side rail, chrome).
2. **Workspace** — object-agnostic multi-pane surface (canvas + rails + chat).
3. **Collection** — object-bound Read primitive over many rows.
4. **Record** — object-bound Read primitive over one row.
5. **Write** — form and in-place edit surfaces for an object.
6. **Query** and **Traversal** — two cross-cutting aspects, presented as
   **two peer entries under an `Aspects` nav label** (a normal top-level
   entry whose `items` are `Query` and `Traversal`; no nested `NavItem`
   variant, no `disabled` state, no `coming soon` affordance). Both entries
   point at real routes that exist the moment they appear in the rail.
7. **Designs** — auto-derived: iterates the object registry and re-uses
   the Collection/Record/Write preview components against each object.

The rubric axes (role, rendering, placement) and the substrate contract
(DOM compose vs canvas boundary) are documented separately in the
segment 02 substrate demo and in decision 0027.

**Build-first, retire-later.** Every existing pattern/domain page keeps
its route, its sidebar entry, and its file until the object-centric rail
absorbs its content. That includes the external `Workspace demo ↗` entry
under Patterns pointing at `/workspace`; the new Workspace object page
routes as `/workspace-obj` and coexists. Deletion is a separate future
plan, made only after the new IA is verified to cover the content.

## Consequences

- `kernel-portal/src/lib/component-meta.ts` `ComponentMeta.group` union
  gains an `"object"` value (see decision 0028).
- `kernel-portal/src/components/portal/app-sidebar.tsx` gains a new
  `Objects` nav group and an `Aspects` nav group carrying Query and
  Traversal as flat peer entries.
- `kernel-portal/src/main.tsx` gains one route per new destination.
- No existing route is removed, renamed, or reordered in this plan.
- `routeForAnchor()` in `kernel-portal/src/lib/routes.ts` is unaffected
  because no legacy `#hash` maps to the new destinations.
- Lifecycle stats in `docs/STATE.md` will grow by one row per new page,
  all `maturity: "ready"` when their pages land.

## Alternatives considered

- **Extend the current rail with more pattern pages.** Rejected. The
  restructure brief explicitly names existing rail entries like
  `Origination flow` and `Pricing worksheet` as slop *because they are
  placements or workspaces, not first-class concepts*. Adding more of
  the same encodes the exact mistake the restructure exists to correct.
- **Rename the current rail groups without changing the model.**
  Rejected. Renaming "Patterns" to "Objects" without introducing the
  object registry, the Collection/Record split, or the Query/Traversal
  aspects would produce a rail with the same taxonomy problems and a
  new set of misleading labels.
- **Ship the object-centric rail *and* delete the legacy pages in one
  pass.** Rejected. Build-first-retire-later separates the risk of the
  IA restructure from the risk of content loss. The two decisions
  deserve independent review; conflating them makes both harder to
  reason about.
