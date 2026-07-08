---
name: kernel-visual
description: The visual principles — color, contrast, visual hierarchy, and Gestalt grouping — done well. Use when choosing or reviewing color usage, checking contrast/accessibility, establishing what draws the eye first, or grouping/separating content (proximity, similarity, common region, alignment). Companion to kernel-typesetting (type/rhythm/layout) and kernel-norman (usability). Applied to Kernel's three color axes and WCAG-AA discipline.
user-invocable: true
---

# Color, contrast, hierarchy & Gestalt — done well

The visual layer. Where `kernel-typesetting` sets type and space and
`kernel-norman` makes things usable, this decides what the eye sees first and
how color carries meaning. Principle-first; Kernel is the instantiation.

## Color

- **Color carries meaning — assign it deliberately, spend it sparingly.** Kernel keeps four axes and never crosses them: **status** (lifecycle, `--status-*`), **notification** (event outcome, success/warning/error/info), **commodity** (which grain, `--commodity-*`), and **data-viz** (abstract chart series, `--viz-*`). A hue means one thing. Reusing a status hue for decoration erodes the whole signal.
- **Match the color scheme to the data.** *Categorical* palettes (distinct hues) for unordered categories — they must be mutually distinguishable *and* colorblind-safe. *Sequential* (one hue, ramped lightness) for ordered magnitude. *Diverging* (two hues around a neutral midpoint) for +/- deltas like price change.
- **Never rely on color alone.** ~8% of men can't separate red/green. Pair color with a second channel — text, icon, shape, or position (redundant coding). `<StatusBadge>` does this: colored dot **+** label **+** soft fill, so it survives grayscale and colorblindness.
- **A restrained palette reads as intentional.** Neutrals do most of the work; let one accent draw the eye. Roughly 60% dominant / 30% secondary / 10% accent. Saturated colors advance and grab; muted colors recede — use saturation to rank, not to decorate.
- **Always use semantic tokens**, never raw values (`bg-primary`, `text-muted-foreground`, `bg-commodity-corn-500` — not `bg-[#c8a13a]`), so light/dark and re-theming hold.

## Contrast

- **Contrast is the primary tool of both legibility and hierarchy.** Value contrast makes text readable and creates rank; hue contrast separates categories; size/weight contrast sets levels. Low overall contrast reads as "muddy"; too much everywhere reads as "loud" — reserve the highest contrast for what matters most.
- **Meet WCAG AA:** 4.5:1 for body text, 3:1 for large text (≥24px, or ≥18.66px bold) and for meaningful UI/graphical elements (icons, control borders, chart marks). AAA is 7:1. Every text-on-background pair, in **both** light and dark, must pass — run `kernel-portal/scripts/contrast-audit.mjs` (0 AA failures is the bar; the audit covers soft-fill badges too).
- **Contrast ≠ color alone.** A red/green pair can be "high contrast" in hue yet identical in value — invisible to some users and in grayscale. Ensure a value difference and a non-color cue.
- **Demote with value, not just muting a color.** `text-muted-foreground` lowers a caption's rank while staying legible; don't drop contrast below AA to make something "quiet."

## Visual hierarchy

- **Every screen needs a clear first thing.** The eye should land on the focal point, then follow an obvious path. Build rank with the five levers: **size, weight, value/color, space, and position** — usually two or three at once.
- **One primary action per view.** Give it the strongest signifier; demote secondary actions (ghost/outline) and guard/quiet destructive ones. If everything is bold, nothing is.
- **The squint test.** Blur the screen (or squint): what still stands out should be exactly what's most important. If the whole thing is one even gray, hierarchy is missing.
- **Place key content on the reading path.** Eyes scan F/Z on dense screens; put the primary number, status, and action where they already look, not buried mid-column.

## Gestalt — how the eye groups

Use these to structure a screen *before* reaching for borders and boxes:

- **Proximity** — near things read as a group. Spacing is the grouping signal (this is the shared edge with `kernel-typesetting`'s rhythm).
- **Similarity** — shared color/shape/size reads as a set (a column of `StatusBadge`s, a row of commodity tags).
- **Common region** — a shared container or background fill groups its contents (a Card).
- **Alignment / continuity** — aligned edges form a line the eye follows; a shared left edge groups rows more cleanly than a border.
- **Closure & figure/ground** — the mind completes implied shapes and needs a clear figure against its ground. Protect that separation; don't let background fills fight the content.

Prefer proximity, similarity, and alignment over dividers — a calm, well-grouped layout beats a boxed one. Add a border only when space and alignment can't carry the break.

## Reviewing the visual layer

(1) Squint — is there a clear focal point, and does it match importance? (2) Does each color mean one consistent thing, and is meaning ever carried by color *alone*? (3) Do all text/UI pairs pass AA in light **and** dark? (4) Are groups formed by proximity / similarity / common region rather than boxes? (5) Is the palette restrained — neutrals carrying the load, accent reserved? A "no" points straight at the fix.

Keep example copy in the grain-merchant world (loads, contracts, basis, bushels, settlement).
