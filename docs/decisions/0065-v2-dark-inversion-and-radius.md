# 0065 — The v2 surface direction: dark inverts its elevation model, radius softens 3.5×

Date: 2026-08-05
Status: accepted
Promotes the v2 prototype's Part 2 token drift (register `docs/v2-prototype-drift.md` on the prototype branch, sections 2.1–2.4); recorded values promoted verbatim.
Extends: 0053 (elevation ramp per-theme alpha), 0064 (lime scale)

## Context

The v2 prototype (decision 0056 on that branch: the prototype is the forward
design track) spent a month pushing the token sheet toward a premium near-black
analytics look. The drift register recorded every departure in DS vocabulary.
This decision lands the register's Part 2 — the v2 look itself — on main.

## Decision

**1. Dark inverts its elevation model.** Dark used to recess cards below the
canvas. Now the canvas is `--neutral-900`, elevated surfaces (`--card`,
`--popover`, `--secondary`, `--muted`) sit at `--neutral-800`, and only the
recessed rail drops to `--neutral-950`. Every dark role token now derives from
a DS scale token rather than a hand-picked `oklch()` literal, so dark rides the
system's ramps.

**2. Radius moves 0.25rem → 0.875rem.** Kernel was a nearly square system; the
promoted look is a soft-cornered one. One token, cascading through every card,
input, popover and button.

**3. Light gets its contrast from the rail, not the canvas.** Light keeps the
white page and white cards (a card exists by its hairline and cast); only the
rail drops to `--neutral-100`, its hairline and selected-item chip step to
`--neutral-200`, and the selected item's ink to `--neutral-900`. Nav selection
is **neutral in both themes, deliberately** — the rail is chrome, and a
coloured chip there competes with the accent doing real work in the content.

**4. The elevation collection becomes tokens.** `--elev-lip` (dark: a 1px
neutral-50 bevel at 7%; light: transparent — light already comes from above),
`--elev-cast` (one `--shadow-lg` rung for every plate, so nesting cannot
compound it), `--elev-plate` (card + 3.5% foreground dark / + 2.5% light — a
step, not a slab), and `--elev-edge-page` (the page plate's hairline, one rung
darker than a card's in dark). Dark and light do not carry depth the same way;
the asymmetry is the design, not a light-mode bug.

## Consequences

- **`--muted` now equals `--card` in dark.** Anything styled `bg-muted` on a
  card surface is invisible; separation on cards uses a foreground overlay
  instead (the Table's striped prop already does this). Recorded as a register
  caveat; future components must not lean on muted-on-card.
- Dark contrast relationships reshape rather than regress: the audit still
  reports 70 pairs with zero below AA, but soft-fill ratios over the (lighter)
  new `--card` run ~1.1–1.6 lower and role-pair ratios over the de-greened
  accents run ~7 higher.
- The dark-mode green-vs-lime action/navigation hue ambiguity is **recorded as
  open, not resolved** — this decision promotes the register's recorded values
  verbatim and defers the hue call.

## Alternatives considered

- **Promote the surfaces but keep the 0.25rem radius.** Rejected: the register
  records the two as one direction — the soft corner is load-bearing for the
  raised-plate reading.
- **Hand-pick dark literals matching the prototype's rendered colours.**
  Rejected: the register's whole point is that every override names a scale
  rung; literals would re-detach dark from the ramps.
