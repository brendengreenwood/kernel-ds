# 0087 — Cream becomes neutral warm, used only for the map

Date: 2026-10-17
Status: accepted

## Context
The light-mode cream ramp (`--cream-50…400`, hue ~84–92) read too yellow and red, and it was painting
page background, muted fills, light sidebar and raised surfaces. Inputs and borders had also drifted onto it.

## Decision
- Rename `--cream-*` to `--neutral-warm-*` and extend it to a full 50–950 ramp at hue 100
  (values hand-tuned by eye; lightness copied from neutral, not derived from contrast targets).
- Neutral warm is for the map theme only: light-mode ground (50) and roads (200).
- Every UI surface uses plain neutral at the same step: `--background`/`--muted` (100),
  `--sidebar` and `--elev-raised-surface` (50), `--sidebar-accent` (200), `--sidebar-border` and
  `--border` (300), `--input` (400). Same lightness, so contrast is unchanged.

## Consequences
- Breaking: `--cream-*` no longer exists (major for @kernel/ui). Forks must rename or map it.
- Figma cream variables (incl. Figma-only `--cream-500`) need the same rename — not done yet.
- Lightness spacing of the ramp is still uneven; even-contrast spacing is open.
