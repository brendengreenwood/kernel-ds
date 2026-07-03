# 0004 — Notification scales run 50→900 (no 950 step)

Date: 2026-07-03 (recorded during the first sync audit; in force since initial build) · Status: accepted

## Context

Brand, neutral, and all eight data-viz families ship full 50→950 ramps. The
four notification scales (`--success-*`, `--warning-*`, `--error-*`,
`--info-*`) stop at 900 — consistently, on both surfaces: `theme.css` and
`kernel-portal/src/index.css` define no 950 step, and `foundations.tsx`
renders them with a deliberate `STEPS_10` constant alongside `STEPS_11`.
Prose in `CLAUDE.md`, the READMEs, and both Color-section leads nevertheless
claimed "every family is 50→950".

## Decision

Keep the notification scales at 50→900. They exist to color momentary event
outcomes (alerts, badges, toasts — see decision 0003), which never need a
near-black ink step; the 950s exist on brand/neutral/viz for dense text and
chart use. The prose was corrected to match the code rather than adding four
unused tokens.

## Consequences

- `STEPS_10` in `foundations.tsx` and the 10-step notification ramps in the
  preview are correct as-is.
- New *notification*-type hues follow the 50→900 ramp; new brand/viz-type
  hues follow 50→950 (CLAUDE.md convention updated to say so).
- If a real need for `--error-950` etc. ever appears, supersede this record
  and add the step to every surface listed in the CLAUDE.md token sync rules.
