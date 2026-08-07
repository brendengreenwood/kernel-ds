# 0067 — Dark's action hue is lime, deliberately

Date: 2026-08-07
Status: accepted
Resolves the dark-mode green-vs-lime action/navigation hue ambiguity that
decision 0065 recorded as open. Extends: 0064 (lime scale), 0065 (v2 dark
inversion).

## Context

The action roles change hue family between themes. Light points `--primary`,
`--ring`, `--chart-1` and `--sidebar-primary` at brand green (`--brand-600`,
hue 150.6°); dark points the same roles at `--lime-300` (hue 127.8°). The
accent role runs the other way: lime in light, `--brand-900` in dark. The
drift register carried this as an open question — is dark's lime "green
re-rendered for dark legibility," or its own family that took over the action
role?

Contrast does not force the answer. Measured against the shipped dark
surfaces, `--brand-300` as a dark primary would pass every gate: 10.53:1 on
the canvas, 9.01:1 on cards, 11.56:1 with `--neutral-950` button text. A
green dark theme is viable. The choice is semantic.

## Decision

**Lime is the dark action hue, ratified.** It is not a dark rendering of
green; each theme picks the action hue that reads as signal against its own
surfaces. No token changes — this record closes the question the shipped
values already answer.

The structural reason: Kernel's dark neutrals are green-tinted by design
(hue 162–165°, per the register's Part 2 notes). Brand green sits ~12° from
that surface tint — an accent in it leans toward reading as chrome, part of
the furniture. Lime sits ~35° away and reads as signal. Rendered side by side
on the shipped surfaces, the green candidate's deeper chart trace sinks into
the canvas tint and its primary button quiets toward mint; lime's stays
separable at both scale rungs (`--lime-300`/`--lime-500` traces).

Light inverts the geometry: its surfaces are white/near-white with no tint to
fight, and a light accent needs depth to carry white text — `--brand-600` at
4.81:1 does; `--lime-500` at 2.57:1 cannot. So light keeps green for action
and spends lime as the accent wash, exactly as shipped.

## Consequences

- Zero visual change. The decision is the record, not a diff.
- The semantic rule for future tokens: **action hue is theme-tuned, not
  theme-invariant.** A role that means "this is the thing" picks the hue with
  the most chromatic distance from that theme's surface tint.
- Chart series inherit the same rule: dark `--chart-1`/`--chart-2` stay on
  the lime rungs, light on the brand/lime mix, and neither theme's ramp is
  the other's reference.
- The drift register's "green-vs-lime dark ambiguity" open item is closed by
  this record.

## Alternatives considered

- **Unify on green (dark primary → `--brand-300`).** Passes contrast
  (10.53:1) but pulls the accent to within ~12° of the green-tinted dark
  surfaces; measured render shows the accent blending toward chrome and the
  secondary chart trace losing separation. Rejected.
- **Unify on lime (light primary → lime).** `--lime-500` fails AA with white
  text (2.57:1), forcing dark-text buttons in light and reshaping the light
  brand read. Rejected.
