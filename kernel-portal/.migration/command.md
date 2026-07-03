# command

2026-07-04, seam fix only (cmdk wrapper — hard rule: not migrated).

## Changed

- `src/components/ui/command.tsx:62` — `{children}` → `{children as React.ReactNode}`
  inside `CommandDialog`. cmdk's Dialog props type children as
  `ReactNode | PayloadChildRenderFunction`, which the (now Base UI) `DialogContent`
  rejects. Cast at the composition seam only; cmdk behavior untouched.

## Left alone

- Everything else in the file: cmdk is not radix (hard rule). The wrapper
  composes the migrated Dialog, which is why the seam needed the cast.

## Behavior changes

None.

## Verify by hand

Open the combobox demo, type to filter, arrow keys + Enter select; the
command palette inside CommandDialog opens centered with the search input
focused.
