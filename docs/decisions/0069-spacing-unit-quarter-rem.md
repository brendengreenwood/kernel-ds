# 0069 — Spacing unit is 0.25rem (drop the 0.24rem rebase)

Date: 2026-09-19
Status: accepted

## Decision

`--spacing` in packages/ui/src/styles.css changes from `0.24rem` to `0.25rem` (Tailwind's default). Every spacing utility now lands on the whole-pixel 4px grid (`p-1` = 4px, `px-3` = 12px) instead of the fractional 3.84px grid.

## Why

The 0.24rem rebase produced fractional pixel values (3.84, 11.52, 13.44…) throughout the rendered UI. This surfaced when importing tokens into Figma as variables: a design tool working in whole pixels against a code grid of ×3.84 makes every measurement awkward and error-prone, and the ~4% density gain was never a load-bearing design property. Whole-pixel spacing keeps Figma measurements, DevTools measurements, and token values identical.

## Consequences

- Everything spacing-driven gets ~4% roomier. The portal builds clean; visual re-verification (mobile + contrast audits) should ride along with the next kernel-verify pass.
- Figma "Kernel Metrics" spacing variables updated to the 4px grid in the same change; docs/figma/tokens-build.json regenerated.
- Control heights (decision 0010) are independent tokens and unchanged.
