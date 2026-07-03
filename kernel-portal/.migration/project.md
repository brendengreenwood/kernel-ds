# project — whole-project Radix → Base UI migration

2026-07-04, whole-project mode per decision 0005. Branch `base-ui-migration`.

## Dependency swap

- Installed `@base-ui/react@1.6.0` alongside `radix-ui@1.6.1` (preflight).
- Removed `radix-ui` after the last wrapper migrated (−45 packages).
- `@radix-ui/*` individual packages: none were direct dependencies.
- `components.json` style flipped `radix-nova` → `base-nova` (whole-project
  mode, flipped up front). Future `shadcn add` delivers Base variants.

## Wrapper classification and treatment

Classification by provenance: git history shows every `src/components/ui`
file untouched since the initial CLI install, so wrappers are pristine CLI
output except the four with known custom origins.

- **30 pristine radix wrappers** → `shadcn add <c> --overwrite`, one at a
  time, dependency order (button/label/separator first, sidebar last;
  pagination re-added after the button swap broke its `asChild` composition):
  accordion, alert-dialog, aspect-ratio, avatar, breadcrumb, button,
  checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card,
  label, menubar, navigation-menu, pagination, popover, progress,
  radio-group, scroll-area, select, separator, sheet, sidebar, slider,
  switch, tabs, toggle, toggle-group, tooltip.
- **badge** → customized (Kernel notification variants); primitive layer
  replayed onto `useRender`/`mergeProps`, full Kernel cva preserved
  (see badge.md).
- **form** → hand-rolled (registry doesn't serve it); engine transform
  (see form.md).
- **command** → cmdk, hard rule; one-line type cast at the Dialog seam
  (see command.md).
- **Untouched, not radix**: alert, status-badge, card, carousel, chart,
  calendar, drawer (vaul — `DrawerTrigger asChild` call site intentionally
  kept), input, input-group, input-otp, skeleton, sonner, table, textarea,
  resizable (react-resizable-panels).

## App-code sweep (consumer-props.md)

- `asChild` → `render` at 15 call sites: mode-toggle, app-sidebar,
  gallery-misc (popover/date-picker, collapsible), gallery-nav (combobox
  popover, dropdown), gallery-overlays (tooltip, dialog, alert-dialog,
  popover, hover-card, sheet), patterns (row menu dropdown, dialog).
  `DrawerTrigger asChild` kept (vaul).
- Accordion: `type="single" collapsible defaultValue="a1"` →
  `defaultValue={["a1"]}` (gallery-misc.tsx).
- ToggleGroup: `type="single"` dropped, `defaultValue` → arrays
  (gallery-forms.tsx, flows.tsx).
- Checkbox: `checked="indeterminate"` → `indeterminate` (form-elements.tsx).
- Slider: `onValueChange` handler widened for `number | readonly number[]`
  (gallery-forms.tsx).
- Runtime find (not typecheckable): bare `DropdownMenuLabel` crashed —
  Base UI `GroupLabel` requires a `Menu.Group` parent where Radix Label was
  standalone. Wrapped label+items in `DropdownMenuGroup` (gallery-nav.tsx).
  This was the only bare menu/select GroupLabel in the codebase (grep).

## Behavior deltas (flagged, not patched)

1. **Tabs: manual activation by default** (Radix was automatic). Arrow keys
   move focus without switching panels; Enter/Space activates. Opt-in
   near-equivalent: `TabsList activateOnFocus`.
2. **Menu checkbox/radio items don't close on click** (`closeOnClick`
   defaults false). Plain items still close.
3. **NavigationMenu hover delay 200ms → 50ms** — feels more eager.
4. Tooltip provider `delayDuration` → `delay`; skip-delay concept dropped
   (not used here).

## Final verification vs baseline

- Baseline (radix): `tsc -b && vite build` green.
- Final (base): `tsc -b && vite build` green; bundle 1,363 kB → 1,505 kB
  (gzip 397 kB → 451 kB).
- Runtime: portal renders, console clean on load; dropdown menu, dialog
  (focus trap + focus return), accordion (single-open array semantics),
  calendar, select trigger, collapsible all exercised in-browser.
- Mobile: 375px probe — no page-level horizontal overflow
  (scrollWidth == viewport); wide tables scroll inside their own containers.

**0 wrappers remain on Radix** (derived: `grep -rn "radix-ui|@radix-ui" src/components/ui` → empty; `radix-ui` absent from package.json).
