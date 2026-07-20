# 0032 — Action blue: actions are blue, traversal stays green

Date: 2026-07-20 · Status: accepted · **Supersedes 0017** (actions are no
longer green; 0017's revert of *orange* stands — this is the fresh start
with a dedicated role that 0017's consequences called for)

## Context

The owner's direction: the Cargill primary green is the **traversal**
color; a new blue is the **action** color. This is the second attempt at
splitting go-somewhere from do-something — decision 0016 tried Cargill
orange for actions and 0017 reverted it, stipulating that any future
action color "starts fresh … with a clear role defined up front (e.g. a
dedicated `--action` token …), not by repurposing `--primary`". The blue
region of the palette was already occupied by three families, and the
success green leans teal, so the new hue had to be placed, not just picked.

## Decision

**Add a dedicated `--action-*` scale (full 50→950 + `-light`/base/`-dark`
aliases) and point the action roles at it; navigation keeps the green.**

### The hue: 261° cobalt, drifting 254→267 across the ramp

The blue region already holds `--viz-sky` (238→253, C≤0.135, chart
series), `--info-*` (245→260, C≤0.165, notification), and `--viz-slate`
(≈250, C≤0.030, near-neutral). The only clean window between cyan-crowding
(≤253) and violet (≥275) is ~255–270. Action sits at its center — base
`oklch(0.620 0.190 261)` — with the same ~15° dark-drift as its sibling
blue families (sky and info both drift 15°).

Separation is carried by **three stacked cues**, not hue alone:

- **Hue**: +9° from info, +18° from sky — the deliberate ladder
  243 (sky) → 252 (info) → 261 (action).
- **Chroma**: a matching ladder — slate 0.030 < sky 0.135 < info 0.165 <
  **action 0.190** — so the action blue is the most vivid blue in the
  system and affordances outrank ambient blues. (Still below error's
  0.206: alarm outranks invitation.)
- **Role/step**: info renders as soft fills (50/100 backgrounds, 700–800
  text) in alerts and the pending StatusBadge; action renders as solid
  600 fills, 600 link text, and rings. The two rarely meet at the same
  step in the same shape.

### What happens to the success green (the teal-leaning emerald)

Considered explicitly, changed nothing. `--success-*` sits at hue 168 —
emerald, leaning teal/blue-ish. The action hue was chosen far enough
clockwise that this lean never becomes ambiguity: 168 → 261 is **93°**, a
different perceptual category (green vs blue), with viz-teal (196) and
viz-sky (243) still interposed between them. Had the action blue been
cyan-leaning (~230–240), success/teal/sky would have crowded — that is
precisely why 261, not a lighter "sky" blue. Success's teal lean is also
protective on its other flank: it keeps success 17.5° away from the brand
green (150.5), so settled-badges never read as brand chrome. Success stays
50→900 at hue 168, unchanged.

### Ramp values (sRGB-gamut-exact)

L follows the brand convention (0.975→0.225); chroma peaks at 500. Blue
holds very little chroma at high lightness in sRGB, so steps 50–300 are
set just under the computed gamut ceiling (e.g. max C at L 0.975/h 254 is
0.0120 → 50 uses 0.011) — every step is displayable unclipped, which the
lighter steps of viz-sky are not.

| step | oklch | hex |
| --- | --- | --- |
| 50 | 0.975 0.011 254 | `#f2f7fe` |
| 100 | 0.945 0.026 255 | `#e2eeff` |
| 200 | 0.895 0.050 256 | `#c7defe` |
| 300 | 0.825 0.086 257 | `#a2c8fe` |
| 400 | 0.730 0.138 259 | `#71a8fe` |
| 500 | 0.620 0.190 261 | `#3e80f6` |
| 600 | 0.536 0.184 262 | `#2c65d6` |
| 700 | 0.450 0.160 263 | `#224dac` |
| 800 | 0.375 0.130 265 | `#1e3a85` |
| 900 | 0.300 0.100 266 | `#16295f` |
| 950 | 0.225 0.072 267 | `#0d183d` |

### Role wiring

- **Light**: `--primary`/`--ring` → `action-600` (white text 5.32:1;
  600-as-link-text on white also 5.32:1 — one step serves both).
- **Dark**: `--primary` → `action-400` with `--primary-foreground` →
  `action-950` (7.17:1); `--ring` → `action-400` (6.41:1 against the dark
  background). The mid-tone 400 keeps the blue vivid where a pale
  200/300 fill would be forced dull by the gamut ceiling.
- **Focus is an action signal everywhere**: `--sidebar-ring` also points
  at action (600/400) — keyboard position reads identically in green
  chrome and white content. (0016 kept the nav ring green; this decision
  deliberately does not.)
- **Navigation stays green**: `--sidebar-*` (except the ring),
  `--secondary`, `--accent`, and the `--brand-*` scale are untouched.

## Consequences

- Blue = act, green = go: primary buttons, links, and focus rings are
  cobalt; the rail, active nav item, and brand chrome remain Cargill green.
- `contrast-audit.mjs`: 62 pairs, 0 AA failures (the primary role pair is
  audited automatically through the repointed tokens).
- `bg-action-500`, `text-action-700`, etc. work via the `@theme` maps;
  `--action`/`-light`/`-dark` aliases exist for parity with sibling ramps.
- If the blue is ever rejected like the orange was, the revert is two role
  blocks + one scale (see 0017 for the shape of a clean revert).
