# 0060 — The elevation ramp gets per-theme alpha and a monotonic top rung

Date: 2026-07-31
Status: accepted
Renumbered from 0042 (2026-08-03): the prototype track and main both minted 0042; main's kept the number.

## Context

`--shadow-*` shipped eight rungs, defined once in `:root` and then **repeated
verbatim** in `.dark` — the same eight declarations, byte for byte.

A shadow is occluded ambient light. On white, 4–10% black is plenty. On the
dark card (`oklch(0.2128 …)`, rgb 31,41,36) the same values resolve to a
difference of **under one 8-bit level** against the surface. Dark mode was
therefore shipping an elevation ramp that could not, arithmetically, produce a
visible shadow at any rung. The `/foundations/elevation` page rendered eight
swatches in dark that were all identical, and documented the ramp as if it
worked.

Separately, the light ramp was not monotonic:

```
sm    0 1px  2px  0px  / 0.04
md    0 2px  4px  -1px / 0.06
lg    0 4px  8px  -2px / 0.08
xl    0 8px  16px -4px / 0.10
2xl   0 1px  3px  0px  / 0.25   ← smaller than md
```

`2xl` — the top of the ramp — cast a **tighter** shadow than every rung above
`sm`. Raising an element from `xl` to `2xl` made its shadow collapse to a 1px
dark hairline. The one thing a ramp has to guarantee is that up means up.

Found while pushing the v2 prototype toward a more tactile panel treatment: the
prototype needed a resting cast, went looking for the DS token, and there wasn't
a working one.

## Decision

**1. Geometry is shared; alpha is per-theme.** Both blocks keep identical
offset / blur / spread at every rung, so `lg` means one thing everywhere and a
component can reference a rung without knowing the theme. Only the alpha
differs — roughly 4–7× in dark:

| rung | geometry | light | dark |
|---|---|---|---|
| `2xs`, `xs` | — | transparent | transparent |
| `sm`, base | `0 1px 2px 0` | 0.04 | 0.28 |
| `md` | `0 2px 4px -1px` | 0.06 | 0.34 |
| `lg` | `0 4px 8px -2px` | 0.08 | 0.40 |
| `xl` | `0 8px 16px -4px` | 0.10 | 0.46 |
| `2xl` | `0 16px 32px -8px` | 0.14 | 0.55 |

**2. The ramp doubles, and must stay monotonic.** From `sm` up, offset and blur
double at each step (1/2 → 2/4 → 4/8 → 8/16 → 16/32) with spread at −blur/4.
`2xl` becomes `0 16px 32px -8px`, which continues the progression instead of
contradicting it. **Every rung must be larger than the one below it on every
axis** — that is the ramp's contract, and the reason `2xl` was wrong.

**3. The two smallest rungs stay transparent.** This is existing, deliberate
design — small surfaces are defined by their border, not by lift — and is
unchanged. It does mean the ramp is effectively six steps, which the foundation
page now says out loud.

## Consequences

- Dark mode has working elevation for the first time. Anything already using
  `shadow-md`/`lg`/`xl` gains a visible cast in dark with no code change — the
  intended lift that was silently absent.
- Light `2xl` changes from a tight dark hairline to a genuine top-of-ramp
  shadow. Any surface that was using `2xl` *for* the hairline look will now
  float; `--shadow-sm` is the replacement for that.
- `/foundations/elevation` states the per-theme alpha rule and the doubling
  contract, so the two blocks are not "corrected" back into agreement later.
- The v2 prototype's panel elevation (`--elev-cast`) is now `var(--shadow-lg)`
  rather than its own literals — the prototype carries no shadow values of its
  own.

## Alternatives considered

- **One ramp, alpha tuned to split the difference.** Any single alpha that
  reads on dark is heavy enough to look like a drop-shadow filter on white.
  Rejected — this is exactly what a per-theme token layer is for.
- **Lighten dark shadows toward the surface hue instead of black.** Physically
  closer to how ambient occlusion works on a tinted surface, and worth
  revisiting, but it needs a `--shadow-color` per theme and a look at every
  overlay. Out of scope for a ramp fix.
- **Leave `2xl` alone as a deliberate "pressed hairline".** It is used as an
  elevation rung by name; a rung that inverts the ramp is a trap regardless of
  whether some surface liked the look.

## Supersedes

Nothing. First decision record covering `--shadow-*`.
