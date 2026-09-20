# 0064 — The accent lime is a scale; role tokens never hold raw colour

Date: 2026-08-05
Status: accepted
Also recorded on the v2 prototype branch as 0059; this is the record for the change as it lands on main.

## Context

The accent lime `oklch(0.8722 0.1272 127.8039)` was written as a bare literal,
twelve times, across both theme blocks: light `--accent` and `--chart-3`; dark
`--primary`, `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`,
`--secondary-foreground`, `--accent-foreground`, and
`--sidebar-accent-foreground`. `--chart-2` carried a second lime literal,
`oklch(0.6884 0.1436 127.9082)`, in both themes.

Every other colour a role token points at belongs to a family — `--brand-*`,
`--neutral-*`, the status and viz scales. The single most meaningful hue in the
system was the only one without a name.

This scale was built on the v2 prototype branch and deliberately backed out of
PR #83 (it was tangled through `styles.css` with the shadow fixes — a direction
call, not a defect). It lands now as part of the v2 token promotion.

## Decision

**Add `--lime-*` as a full 50→950 scale, and point every one of those role
tokens at it.**

- **Placement:** a top-level family beside `--brand-*` and `--neutral-*`, not
  under `--viz-*`. The viz hues are deliberately abstract so a chart series
  cannot read as a status; lime is the opposite — it is the accent, and it
  carries meaning everywhere it appears.
- **Name:** `--lime-*`. It shadows Tailwind's default `lime` palette in
  `@theme inline`, which is intended and harmless — inside this system, `lime`
  means Kernel's lime.
- **Ramp shape** follows the sibling convention: lightness descends 0.985 →
  0.260, chroma peaks mid-scale at 500, hue near-constant with a slight +4°
  drift as it darkens. `--lime-light`/`--lime`/`--lime-dark` aliases sit at
  200/500/700 like the other families.
- **Two rungs are pinned to the values already shipped:** 300 to the accent
  lime, 500 to `--chart-2`'s literal. This is the important part — it makes
  the migration provably a no-op. Both existing limes sit naturally on a
  single ramp, which is corroboration that this hue family was always implied.

The rule this sets: **a role token names a scale step.** If a colour is worth
using in a role, it is worth a family — a raw `oklch()` in the role layer is a
missing scale, not a shortcut.

## Verification

The contrast audit ran identical before and after the repoint: 70 pairs, zero
below AA, no ratio moved. The repoint is a pure re-expression.

## Deliberately not changed

Two near-miss limes in the light role layer — `--secondary` and
`--sidebar-accent`, both `oklch(0.9758 0.0163 121.7629)` — are close to
`--lime-50` but differ in lightness (+0.009) and hue (−6°). Re-pointing them
would alter the shipped portal, so they stay as they are.

Note: three of the twelve dark repoints (`--secondary-foreground`,
`--accent-foreground`, `--sidebar-accent-foreground`) are immediately
superseded in the same promotion by decision 0065's dark retune, which
de-greens them to neutral rungs per the drift register's recorded values.
