# 0043 — Shadows are tinted, and `--shadow-color` becomes real

Date: 2026-07-31
Status: accepted
Extends: 0042 (elevation ramp per-theme alpha)

## Context

`--shadow-color` has been declared in both theme blocks since the token sheet
was written. **Nothing referenced it.** Every rung of the ramp hardcoded
`hsl(0 0% 0% / α)`, so the one token whose entire job was to make shadow hue
tunable was inert, and changing it did nothing at all.

Meanwhile every surface in Kernel is a green-tinted neutral — the `--neutral-*`
scale carries roughly 0.002–0.021 chroma at hue 165. A shadow is occluded
ambient light on *that* surface, so it stays in that surface's hue family.
Casting neutral black over a tinted surface reads as a foreign grey smudge laid
on top of the page rather than as the page's own shading.

Deferred from decision 0042, which fixed the ramp's alphas and geometry and
explicitly listed this as considered-and-not-done ("it needs a `--shadow-color`
per theme and a look at every overlay").

## Decision

**1. The ramp derives from the token.** Every rung is now
`color-mix(in oklch, var(--shadow-color) N%, transparent)`, where N is the alpha
0042 established. No literal colours remain in the ramp — changing
`--shadow-color` now actually changes the shadows.

**2. Each theme sets its own.**

| | `--shadow-color` | why |
|---|---|---|
| light | `oklch(0.16 0.022 165)` | a green-tinted near-black; deep enough to read at 4–14% over white |
| dark | `oklch(0.04 0.018 165)` | deeper, because it has to darken a 0.165 rail — the colour must sit below every surface it can fall on |

Hue stays at 165 in both, matching the neutral scale.

## Consequences

- Shadows belong to the surface rather than sitting on top of it. The change is
  subtle by construction — it is a hue shift at low alpha, not a value change.
- **Tinting costs a little depth against pure black.** Measured on the dark
  rail: it darkens by **4.7** 8-bit levels instead of 5.0. That is affordable
  precisely because dark's cast was already established (0042, and the page
  plate work) as *not* the thing carrying elevation in dark — edge contrast and
  gutter do that. Light is where the cast earns its keep, and there it darkens
  by 18.7 levels.
- `--shadow-color` is now load-bearing: anyone retuning shadow hue changes two
  values instead of editing ten rungs.

## Alternatives considered

- **Tint light only, leave dark black.** Dark is where the surfaces are most
  visibly green-tinted, so it is the theme that benefits most from matching —
  even though its cast is faint.
- **Derive `--shadow-color` from `--background` with `oklch(from …)`.** Tidy,
  and it would track any future surface retune automatically. Rejected for now:
  relative colour syntax has thinner support than `color-mix`, and the
  derivation would need clamping to stay below the darkest surface anyway.
- **Raise the alphas to compensate for the 0.3-level loss.** Rejected — 0042's
  alphas were tuned against measured output, and re-tuning them to buy back
  three tenths of one 8-bit level is not worth destabilising a ramp that was
  just fixed.
