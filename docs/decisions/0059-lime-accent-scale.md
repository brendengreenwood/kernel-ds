# 0059 — The accent lime is a scale; role tokens never hold raw colour

Date: 2026-07-30
Status: accepted
Renumbered from 0041 (2026-08-03): the prototype track and main both minted 0041; main's kept the number.

## Context

Kernel's palette is built on the two-layer discipline in decision 0003 and the
README: **scales** are absolute mode-independent ink (`--brand-*`,
`--neutral-*`, the notification scales, `--viz-*`, `--commodity-*`), and **role
tokens** point at a scale step and remap per mode.

The accent lime broke that rule. `oklch(0.8722 0.1272 127.8039)` was written as
a **bare literal, twelve times**, across both themes:

- light — `--accent`, `--chart-3`
- dark — `--primary`, `--ring`, `--chart-1`, `--sidebar-primary`,
  `--secondary-foreground`, `--accent-foreground`, `--sidebar-accent-foreground`
- and `--chart-2` carried a second lime literal, `oklch(0.6884 0.1436 127.9082)`

So the hue most visible in the product — every primary button, focus ring,
active pill, badge and first chart series — was the only significant colour in
the system with **no family behind it**. Consequences: no tints or shades to
reach for, no `bg-lime-*` utilities, nothing on the foundations palette page,
and twelve places to edit to shift the accent by one step.

## Decision

**Add `--lime-*` as a full 50→950 scale, and point every one of those role
tokens at it.**

- **Placement.** A top-level family beside `--brand-*` and `--neutral-*`, not
  under `--viz-*`. Viz hues are deliberately abstract so a chart series cannot
  read as a status; lime is the opposite — it is the accent, carrying meaning
  everywhere it appears. It is the second brand green, so it sits with brand.
- **Name.** `--lime-*`. It shadows Tailwind's default `lime` palette in
  `@theme inline`, which is intended and harmless: nothing in the repo used
  Tailwind's lime, and the DS owns its palette.
- **Ramp shape** follows the sibling convention (L descends 0.985→0.260,
  chroma peaks mid-scale at 500, hue near-constant with a slight +4° drift as it
  darkens), plus the `-light`/base/`-dark` aliases at 200/500/700 that the viz
  and commodity families carry.
- **Two rungs are pinned to the values already shipped** — 300 to the accent
  lime, 500 to `--chart-2`. This is the important part: it makes the migration
  provably a no-op. Both existing limes turned out to sit naturally on a single
  ramp, which is corroboration that this hue family was always implied.

**The rule this sets:** a role token names a scale step. If a colour is worth
using in a role, it is worth a scale — a raw `oklch()` in the role layer is a
missing family, not a shortcut.

## Verification

- Resolved values asserted per theme in the browser after the change:
  `--primary`, `--ring`, `--chart-1`, `--sidebar-primary` (dark) and `--accent`,
  `--chart-3` (light) all resolve to `oklch(87.22% .1272 127.804)` — the pinned
  `--lime-300`; `--chart-2` resolves to `oklch(68.84% .1436 127.908)` — the
  pinned `--lime-500`. Identical to the literals they replaced, so the change is
  visually inert.
- Exactly one literal of each anchor value remains in `index.css`: the scale
  rung itself.
- Portal gates: `tsc -b` + build clean, parity 69/0, coverage 69/0,
  prose-quality, style-fidelity, status-map all pass, **contrast-audit 0
  failures**.
- Ramp shape asserted programmatically: L strictly descending, chroma rising to
  a single peak at 500 then falling, anchors byte-identical.
- Foundations palette page renders the Lime ramp between Brand and Neutral with
  all 11 steps; mobile-audit clean at 390px.

## Deliberately not changed

Two near-miss limes in the light role layer — `--secondary` and
`--sidebar-accent`, both `oklch(0.9758 0.0163 121.7629)` — are *close* to
`--lime-50` but differ in lightness (+0.009) and hue (−6°). Re-pointing them
would alter the shipped portal, so they stay as they are. They are the obvious
follow-up: either nudge them onto `--lime-50` as a deliberate visual change, or
give them their own rung.
