# 0058 — `kernel-app/` is the Kernel v2 prototype, not a product surface

Date: 2026-07-29
Status: accepted
Renumbered from 0040 (2026-08-03): the prototype track and main both minted 0040; main's kept the number.

## Context

`kernel-app/` began as "Kernel Insider" — an internal product-insider portal
for a low-tech PM: overview, vision, roadmap, what's new, release notes, known
issues, feedback. That framing did not survive contact with the work.

What actually got built is a **prototype of Kernel v2**: real merchant
workflow screens (Overview KPIs, Scenarios, a ranked Producers table with an
open-bids inset) rendered in a different visual register — dark,
premium-analytics, soft-cornered — on top of the live design system.

None of the original Insider content types exist in it. The name persisted
only because the branch and the directory were created before the shift.

Leaving it labelled "Insider" is actively misleading in two directions:

- It reads as an **existing product surface**, so a future reader could take
  its screens as specifications of shipped behaviour. They are not — the
  filter dropdowns are presentational, `/settings` is unbuilt, and the sample
  data is invented.
- It hides what the thing is **for**. Its value is as a pressure test: a
  second real consumer of the DS, which is what surfaced the six DS changes in
  `docs/v2-prototype-drift.md` (four of them latent bugs the portal shared).

## Decision

**`kernel-app/` is the Kernel v2 prototype. It is a design sandbox, not a
product surface, and not part of the single-surface rule in decision 0022.**

Consequences:

- **Decision 0022 still holds.** The portal (`kernel-portal/`) remains the
  design system's only *surface*. The prototype is not a second surface — it is
  a consumer of the system, in the same sense any product app would be.
- **Fixes flow upstream, styling does not.** When the prototype exposes a
  defect in a DS component, it is fixed in `kernel-portal/` and documented.
  When the prototype wants a different look, that stays in its own two layers
  (token override + modification layer) and never leaks into the DS.
- **The prototype is not authoritative.** Its screens, copy, and data do not
  define product behaviour. Nothing should cite it as a spec.
- **Its drift is documented, not assumed.** `docs/v2-prototype-drift.md` is the
  register — every token remapped, every restyle, every DS edit, every
  convention departure — kept current so the prototype can be abandoned without
  losing the parts worth keeping.
- **Naming.** Package `kernel-v2-prototype`, page title "Kernel v2 prototype",
  modification layer `src/v2-layer.css`, opt-in markers `data-v2-*`.

## Deliberately not renamed

- **The directory stays `kernel-app/`.** It is referenced by
  `netlify.toml`, both Vite/TS path configs, and the deploy command; renaming
  buys nothing behavioural and risks breaking the preview.
- **The branch stays `claude/kernel-insider-portal-fvqfq2`.** The
  branch-scoped Netlify context matches it literally — renaming the branch
  silently reverts the deploy preview to building the portal. Both the
  `netlify.toml` comment and the drift register flag the name as historical.

## Verification

After the rename: app `tsc` + build clean, portal build + parity gate
(69 entities / 0 violations) clean, and the renamed opt-in markers verified to
still drive their styling at runtime — `data-v2-kpi` (5 cards, green hover
accent applies), `data-v2-segmented` (filled pill background),
`data-v2-detail` (padding rules land), page title updated, no console errors.

The rename also exposed a latent bug: the detail cell's `padding: 0 !important`
only ever half-applied — the cell always spans every column, so it is both
`:first-child` and `:last-child`, and those higher-specificity edge rules beat
the shorthand's horizontal half. Rewritten as explicit `padding-top`/`-bottom`
with the horizontal inset kept deliberately; rendering verified byte-identical
(`0px 23.04px`).
