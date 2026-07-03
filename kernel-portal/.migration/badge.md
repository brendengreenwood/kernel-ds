# badge

2026-07-04, three-way replay (customized wrapper) — Kernel customizations preserved; primitive layer swapped.

## Changed

- `src/components/ui/badge.tsx` — the wrapper is a Kernel customization of a
  pre-nova shadcn badge (doc comment, soft `destructive`, added
  `success`/`warning`/`info` variants on the notification scales, and the
  approved base classes: `rounded-md`, `leading-none`,
  `transition-[color,box-shadow]`). Because the customization predates the
  current registry look, a mechanical three-way merge against the radix-nova
  golden would have restyled it (h-5, rounded-4xl, ghost/link variants), so
  the replay preserved the user's ENTIRE cva (base + variants) and swapped
  only the primitive layer: `Slot`/`asChild` (from `@radix-ui/react-slot`) →
  `useRender` + `mergeProps` (`@base-ui/react/use-render`,
  `@base-ui/react/merge-props`), matching the base-nova golden's shape
  (`state: { slot: "badge", variant }` emits the same `data-slot` hook).
  Leftover scan clean.

## Left alone

- The Kernel cva variant set and base classes — the point of the merge.
- `status-badge.tsx` — Kernel-only, no primitives, no migration needed.
- `alert.tsx` — customized but imports no radix; untouched.

## Behavior changes

Callers that passed `asChild` would break (none exist — verified by grep).
`data-variant` attribute from the current radix-nova golden was never in this
wrapper and was not added.

## Verify by hand

Render each variant next to its Alert counterpart (success/warning/info) —
soft fills should match; badge used as a link (`render={<a/>}`) keeps the
pill styling and hover state.
