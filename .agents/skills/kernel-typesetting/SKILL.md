---
name: kernel-typesetting
description: The principles of typesetting, vertical rhythm, and layout — how to do them well, on a 4pt baseline grid. Craft-first (measure, leading, tracking, hierarchy, contrast, alignment, proximity, negative space, optical adjustment), not just a token list. Use when setting or reviewing any UI: type hierarchy, line-height/measure/tracking, spacing rhythm, grid/alignment, composition, or "this feels off / cramped / noisy". Kernel instantiates these in its type scale and --spacing base.
user-invocable: true
---

# Typesetting, rhythm & layout — done well

These are craft principles, not project plumbing. They apply anywhere in the
portal's `.tsx` and CSS. Kernel is the instantiation: a **4pt
baseline grid** (`--spacing: 0.24rem` = 4px), a modular type scale, native font
stacks, tabular numerals. Learn the principle; snap it to the grid.

## The spine: a 4pt baseline grid

Every vertical measurement — line-heights, padding, gaps, element offsets —
resolves to a **multiple of 4px**. 8px is the workhorse major step; 4px is the
fine adjustment. This is what makes unrelated components feel like one system:
their edges land on the same invisible ruler.

- Snap spacing to the scale: 4·8·12·16·24·32·48·64 (`gap-1…gap-16`). An `mt-[13px]` breaks the grid and the eye feels it even when it can't name it.
- Prefer the coarser step. Reach for 8/16/24 before 4/12; use 4 only for tight intra-component nudges (icon↔label, label↔field).
- Line-boxes ride the grid too: pick line-heights that are 4px multiples so text baselines stack predictably down a column.
- One rhythm per context. A form on the 4pt grid never mixes 4px and 5px gaps — choose the step and hold it.

## Typesetting

- **Measure is 45–75 characters (~66 ideal).** Longer and the eye loses the line return; shorter and rhythm stutters. Cap running text (`max-w-[52ch]` for body); never let prose span a wide container.
- **Leading is proportional — and inverse to size.** Big display type wants tight leading (it's already loud); body wants air (`leading-relaxed`); captions sit snug. Leading also grows with measure: a wider column needs more line-height to guide the return.
- **Type sizes come from a scale, not guesses.** Steps should be visibly distinct (a harmonic/modular ramp), so hierarchy reads instantly. If two levels are one hair apart, merge them or push them apart.
- **Tracking scales inversely with size.** Tighten large type (−0.01 to −0.025em); leave body at 0; *open* small all-caps generously (+0.10–0.13em) — caps are illegible at default tracking. Never track lowercase running text, and only set caps as a deliberate "overline," never as body.
- **Hierarchy = contrast of size, weight, color, and space — used sparingly.** Establish a few clear levels; don't make everything bold. Reach for a weight step (`font-medium`) or a color demotion (`text-muted-foreground`) before a size jump; it separates label from value without adding scale noise.
- **Alignment: flush-left, ragged-right for UI.** Avoid justified text on screen (rivers of whitespace). Keep a consistent left edge so the eye has an anchor.
- **Numerals are structural.** Money and any column of figures use lining, **tabular** numerals (equal-width digits) and right-align / decimal-align so columns compare at a glance. This is mandatory for `$/bu`, bushels, positions, settlement.
- **Mind the details of running text:** avoid widows/orphans, keep the rag soft (no hard zig-zag), don't hyphenate UI labels. Native stacks only — no web fonts, no serif.

## Vertical rhythm

- **Rhythm is predictable vertical cadence.** Repeating, grid-aligned spacing lets the reader parse structure pre-consciously. Randomized gaps read as noise even when each element is fine on its own.
- **Proximity encodes relationship.** Less space = more related. Label→control tight (4–6px); field→field a step up (16); group→group bigger (24–32); section→section biggest. Keep the *ratios* consistent — that contrast is the grouping signal.
- **Space with structure, not margins.** Use `flex`/`grid` + `gap`; for stacks `flex flex-col gap-*`. Avoid margin-stacking (and `space-y-*`) that fights the grid and collapses unpredictably.
- **Let whitespace do the separating before borders do.** A calm, well-spaced row beats a boxed one; add a divider only when space alone can't carry the break.

## Layout & composition

- **Align to a grid; share gutters.** Columns and gaps on the same system make a page cohere. Beside a fixed sidebar, use `auto-fit, minmax(0,1fr)` (never a raw `1fr` that can overflow), and always declare the mobile column (`grid-cols-1 … sm:grid-cols-2`) with `min-width:0` on children.
- **Alignment + proximity are the two strongest Gestalt tools.** Line up edges; group by nearness. A hard left edge shared across rows is worth more than any border.
- **One focal point, then a path.** Establish visual hierarchy — the eye should land somewhere first (size/weight/color/space) and then have an obvious route. Scanning tends to F/Z; put the primary action and the key number where the eye already goes.
- **Balance visual weight.** Dense data, bold color, and large type all carry weight; distribute them so the composition doesn't tip. Negative space is active — it's the counterform that gives the content room to be read, not "empty."
- **Repetition & consistency.** Same spacing step, same alignment, same type roles across a screen = a system. Deviations should be intentional and rare.
- **Density fits the task.** A settlement table wants tight, scannable rows; a marketing hero wants air. Set density with the control tokens (`--control-h-*`), not one-off heights.
- **Optical over metric when they disagree.** Trust the eye: nudge for optical alignment (a round icon may need to overshoot a flat edge), balance ragged edges, adjust caps/punctuation that measure "correct" but look off.

## Reviewing "this feels off"

Walk it in order: (1) is every text block a clear level in a small hierarchy, or is it all one gray size? (2) do all gaps land on the 4pt grid **and** encode grouping by their ratios? (3) is the measure ≤ ~72ch and leading proportional? (4) do numbers use tabular figures and align? (5) do edges share alignment, and is there a clear focal point? Most "cramped / noisy / amateur" screens fail (1) or (2).

Keep example copy in the grain-merchant world (loads, contracts, basis, bushels, settlement).
