# Form Field plumbing fix — 2026-07-15

## Cause

The `/forms` page used the local `Field` helper to render visible labels, hints, and errors, but it did not programmatically associate those labels with the focusable control. Nested controls inside `InputGroup` and composites such as `NumberStepper`, `PasswordInput`, `CharCountTextarea`, and Base UI `SelectTrigger` could therefore remain unnamed or miss error description linkage.

The batch-5 baseline captured:

- `FAIL [Form elements] inputs labelled (label[for]/aria/placeholder)` — 41 controls, 23 unnamed.
- `FAIL [Form elements] error field exposes aria-describedby + aria-invalid` — error text existed but was not referenced by the control.

## Fix

`Field` now generates stable ids with `useId`, wires the visible `Label` with `htmlFor`, and recursively passes `id`, `aria-describedby`, and `aria-invalid` to the first focusable control. Composite controls read the field control props from context and forward them to their internal `Input` or `Textarea`.

Standalone state/size examples that intentionally do not use `Field` now carry explicit `aria-label` text. Select examples carry labels on their visible trigger; the proof harness excludes Base UI's `aria-hidden` hidden inputs because they are not user-facing controls.

The two mobile-audit findings were resolved in the `/forms` exemplars:

- The compact text input keeps the compact control height but uses 16px text at the mobile breakpoint.
- Switch examples use a 44px minimum touch target while preserving the visible switch affordance.

## Evidence

Red transcript:

- `C:\Users\brend\.mastracode\plans\ds-finish-components.proof\without-forms.txt`

Green transcript:

- `C:\Users\brend\.mastracode\plans\ds-finish-components.proof\with-forms.txt`

Current green result:

```text
PASS  [Form elements] inputs labelled (label[for]/aria/placeholder) — 28 controls, 0 unnamed
PASS  [Form elements] error field exposes aria-describedby + aria-invalid — {"foundError":true,"foundControl":true,"invalid":"true","describedby":"_r_5_-error _r_5_-hint","describedTexts":["Price must be above the floor of $4.50."]}
# TOTAL: 8 pass / 0 fail
```

Mobile audit on `http://localhost:4173/forms`:

```text
horizontal overflow: 0px
clipped content: 0
text controls < 16px: 0
hit areas < 44px (after decision-0007 extensions): 0
```
