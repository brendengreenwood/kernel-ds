# 0037 — Style-fidelity token baseline and drift guard

Date: 2026-07-27
Status: accepted

## Context

The portal is a shadcn-derived surface, and it still carried shadcn's *default*
aesthetic in two ways that made it read as "a shadcn app" rather than "the
Kernel design system":

- **Token baseline.** `--radius` was `0.5rem` and the shadow ramp was the stock
  multi-layer elevation set (deep, tinted, several stacked layers). Both are fine
  defaults, but neither was an *owned* decision — they were inherited, not chosen.
- **Overline drift.** The uppercase-tracked eyebrow label (section headers,
  Do/Don't labels, axis labels, count labels) had been hand-rolled at ~40 call
  sites with at least seven different recipes: `text-xs` vs `text-[11px]`,
  `font-medium` vs `font-semibold`, `tracking-wide` vs `tracking-[0.12em]`, some
  with `/70` opacity and some without. `typeStyles.overline` existed as the
  intended source of truth but almost nothing used it. The same drift showed up
  in radius hardcodes (`rounded-xl` bypassing `--radius`) and one-off font sizes
  (`text-[11px]` where the `text-2xs` token already meant 11px).

Nothing stopped either problem from recurring.

## Decision

**Own the token baseline, route every overline through one source of truth, and
add a drift guard that fails the build on regression.**

- **Token baseline.** `--radius` tightened `0.5rem` → `0.25rem` in both `:root`
  and `.dark`. The shadow ramp was rebuilt as a single-layer, low-opacity set:
  `2xs`/`xs` zeroed to `transparent`; `sm`/`shadow`/`md`/`lg`/`xl` a restrained
  single-layer ramp (`0.04`–`0.10` opacity); `2xl` the one meaningful lift
  (`0.25`). Surfaces read nearly flat and are defined by borders, with elevation
  reserved for the top of the stack. The Foundations page's shadow section
  ("Elevation") now carries an explanatory lead describing the near-flat ramp
  plus the token-value swatches (the demo cards are near-indistinguishable at
  these opacities). `kernel-portal/README.md` has no radius/shadow prose section,
  so nothing was changed there.

- **Overline consolidation.** ~40 hand-rolled eyebrow treatments across the doc
  renderer and portal chrome now use `typeStyles.overline`, with
  `cn(typeStyles.overline, colorOverride)` for the success/error-tinted Do/Don't
  and Use/Don't-use labels. `text-[11px]` overlines became `text-2xs`;
  `rounded-xl` cards became `rounded-lg`.

- **Drift guard.** `scripts/check-style-fidelity.mjs` scans the portal, pages,
  and studio scope for (a) `uppercase tracking-` treatments that are not
  `typeStyles.overline` and (b) radius hardcodes (`rounded-xl`, `rounded-2xl`,
  `rounded-[…]`). It exits non-zero on any offender and carries an explicit
  allowlist for the deliberate one-offs. Red/green proven: an injected violation
  exits 1; reverting exits 0.

## The drift-proofing principle

Same discipline as 0035 (parity gate for doc claims) and 0036 (single-source
section nav), applied to visual style: one source of truth (`typeStyles.overline`
and the `--radius`/`text-2xs` tokens), and a gate that fails when a call site
re-derives it by hand instead of importing it.

## Deliberate one-offs (allowlisted)

- `component-doc-sections.tsx` — inline code `text-[0.85em]` (relative to parent
  prose size, intentionally not a token step).
- `section.tsx` — maturity pill `text-[9.5px]` (a micro-badge below the smallest
  token).
- `app-shell.tsx` — sidebar nav `text-[13px]` (deliberate density between the
  `text-sm`/`text-xs` steps).
- `dashboard.tsx` — metric numbers `text-[27px]` (display size, not a body
  step).
- `flows.tsx` — `text-[17px]` heading (a deliberate between-size).
- `foundations.tsx` — the radius *demo* section, which shows larger radii as
  samples.

## Arc position

0035 (claims are honest) → 0036 (presentation is consistent and navigable) →
**0037 (the visual baseline is owned and enforced)**. Where 0036 kept the page
*structure* from drifting, 0037 keeps the *tokens and typographic roles* from
drifting.

## Deliberately deferred

- **Wiring the guard into CI.** It runs locally and in the ship checklist; a CI
  step is a follow-up.
- **A `typeStyles.overlineColored` helper.** The `cn()` override reads fine at
  four sites; a dedicated helper is only worth it if colored overlines
  proliferate.
