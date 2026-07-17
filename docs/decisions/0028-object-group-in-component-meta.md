# 0028 — Widen `ComponentMeta.group` to include `"object"`

Date: 2026-07-17 · Status: accepted

## Context

`kernel-portal/src/lib/component-meta.ts:18` currently defines:

```ts
group: "component" | "element" | "pattern" | "domain";
```

Decision 0026 introduces object-centric pages (Shell, Workspace,
Collection, Record, Write, Query, Traversal, Designs). None of the
existing group values fit:

- `"component"` / `"element"` mean shadcn primitives.
- `"pattern"` means shadcn compositions (Modal patterns, Nav patterns).
- `"domain"` means specific domain screens (Contract detail, Settlement
  statement).

The object-centric pages are neither primitives, compositions, nor
domain screens — they are **object-level** system pieces. Squeezing
them into `"pattern"` re-encodes the exact mistake decision 0026
corrects.

## Decision

Extend the union to add `"object"`:

```ts
group: "component" | "element" | "pattern" | "domain" | "object";
```

The **sole consumer** of `ComponentMeta.group` is
`kernel-portal/src/components/portal/status-page.tsx`, via the
`const groupLabel = { component: "Component", element: "Element", pattern: "Pattern", domain: "Domain" } as const`
record at lines 36–41. Add an `object: "Object"` entry to that record
in the same commit as the union widen. Without the added key,
`groupLabel[c.group]` fails at the indexed access under `tsc --strict`.

Two other files import from `@/lib/component-meta`
(`component-page.tsx` and `components-index.tsx`), but neither reads
`ComponentMeta.group` — they read `componentMeta[]` and `Maturity`, and
use `GalleryCluster.group` (a distinct type at
`kernel-portal/src/lib/gallery-types.ts`) elsewhere. No changes to
those two files are required by this decision.

## Consequences

- Segment 02 onward may add `ComponentMeta` entries with
  `group: "object"` for the new object-centric pages and for the mark
  components (`Pin`, `Plot`, `ClusterBadge`, `LegendSwatch`).
- The status page will render a new "Object" grouping when any such
  entries exist. Until segment 02 lands entries, the group renders
  empty — expected during this segment.
- No runtime behavior change until the first `group: "object"` entry
  ships in segment 02.

## Alternatives considered

- **Reuse `"pattern"` for object-centric pages.** Rejected. The word
  "pattern" already means "shadcn composition demo" throughout the
  portal and the worklog. Overloading it makes the taxonomy
  discussions harder, not easier, and re-encodes the ambiguity
  decision 0026 exists to correct.
- **Add a parallel `objectMeta` registry.** Rejected. Duplicates
  lifecycle infrastructure (maturity, a11y, notes) with no
  compensating benefit; every consumer that reads `componentMeta`
  would have to grow a matching object-side branch.
- **Rename the union to a broader type (e.g. `"page-kind"`).**
  Rejected. Renaming ripples through every consumer and every
  `componentMeta` entry; widening the existing union is a
  one-character diff plus one label entry.
