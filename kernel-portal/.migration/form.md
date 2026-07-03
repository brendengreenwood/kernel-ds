# form

2026-07-04, transformation engine (hand-rolled wrapper; `form` is not served by the current registry) — migrated clean.

## Changed

- `src/components/ui/form.tsx` — hand-written react-hook-form wrapper (the
  current shadcn CLI does not emit `form`). Two radix usages removed:
  - `FormLabel` was typed against `LabelPrimitive.Root`; now typed against
    the project's own `Label` component (`React.ComponentProps<typeof Label>`),
    which is itself the base-nova label (native `<label>` — Base UI has no
    Label primitive).
  - `FormControl` used `SlotPrimitive.Slot` to merge id/aria props onto its
    child input; now uses `useRender` + `mergeProps` per the skill's worked
    example. To preserve the standard consumer API
    (`<FormControl><Input/></FormControl>`), a single valid element child is
    mapped to the `render` prop; an explicit `render` prop also works.
    Object literal with `data-*`/`aria-*` keys cast to
    `React.ComponentProps<"div">` per the mergeProps pitfall note.
  Leftover scan clean.

## Left alone

- react-hook-form/zod integration — not a primitive concern.

## Behavior changes

None. DOM output for the standard children pattern is identical (props merged
onto the child element, no extra div).

## Verify by hand

Submit the gallery form empty: error messages appear, `aria-invalid` lands on
the inputs, labels turn destructive; fill and submit: success toast.
