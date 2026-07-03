# pagination

2026-07-04, golden pair via CLI (`shadcn add <c> --overwrite`, style base-nova) — migrated clean; wrapper delivered by the registry's base variant.

## Changed

- `src/components/ui/pagination.tsx` — replaced wholesale with the base-nova registry variant (wrapper was pristine radix-nova CLI output, verified by git history: untouched since initial install). Leftover scan clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returns nothing for this file.

Consumer sweep notes (shared across this run): all `asChild` call sites in portal code converted to `render` props; accordion `type="single" collapsible` -> array `defaultValue`; toggle-group `type="single"` -> array `defaultValue`; checkbox `checked="indeterminate"` -> `indeterminate`; slider `onValueChange` handler widened to `number | readonly number[]`; bare `DropdownMenuLabel` wrapped in `DropdownMenuGroup` (Base UI GroupLabel requires a Group parent).

## Left alone

- Non-radix wrappers (command/cmdk, drawer/vaul, sonner, input-otp, calendar/react-day-picker, chart/recharts) — hard rule, not radix.

## Behavior changes

None observed beyond the family-level deltas noted in project.md.

## Verify by hand

Scroll area shows custom scrollbar while scrolling; separator renders 1px line in both orientations; aspect-ratio box keeps ratio on resize; avatar falls back to initials.
