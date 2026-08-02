# Kernel v2 prototype — drift register

`kernel-app/` is the **Kernel v2 prototype** (decision 0040): real merchant
workflow screens rendered in a different visual register — dark,
premium-analytics, soft-cornered — on top of the live design system.

It is **where the next version of the design system gets designed** (decision
0056) — the place tokens, components and patterns are pushed past what the
portal currently expresses, with the divergence written down as it happens.

It is still **not a product surface.** Its screens, copy and data do not
define product behaviour: the Producers filter dropdowns are presentational,
`/settings` is unbuilt, and the sample book is invented. Nothing here should
be cited as a spec. *Design* direction promotes upstream; *product* behaviour
does not.

> **Naming.** This started as "Kernel Insider", an internal product-insider
> portal. None of that content survived, and the thing is now a v2 prototype of
> Kernel itself. Two identifiers keep the old name for mechanical reasons and
> must not be "corrected": the directory `kernel-app/` (wired into
> `netlify.toml` and both path configs) and the branch
> `claude/kernel-insider-portal-fvqfq2` (matched literally by the
> branch-scoped Netlify context — rename it and the preview silently reverts to
> building the portal).

This file is the **complete record of how the prototype differs from the design
system** — every token remapped, every component restyled, every DS source
change, and every place it knowingly departs from a project convention.

It is a **promotion queue.** Every entry is drift the DS may eventually want,
so each one carries a status:

| Status | Means |
|---|---|
| **promote** | belongs in the DS; needs the affected consumers' gates run |
| **prototype-only** | real, but specific to this app or its build wiring |
| **undecided** | needs a call — a legitimate resting state |

The register's job is to keep the decision *available*, not to force it
early. Entries move between statuses; nothing is promoted by editing this
file.

That this doubles as a pressure test is a bonus and not the point: being a
second live consumer of the DS is what surfaced the Part 4 changes, four of
them latent bugs the portal shared.

**Nothing here is hidden inside components.** The prototype changes the DS through
exactly three mechanisms, in increasing order of intrusiveness:

| Layer | File | What it can do | Reversible by |
|---|---|---|---|
| 1. Token override | `kernel-app/src/index.css` | Remap semantic role tokens | deleting the `.dark` block |
| 2. Modification layer | `kernel-app/src/v2-layer.css` | Restyle components via `data-slot` | deleting the file |
| 3. DS source edits | `kernel-portal/src/**` | Change the system itself | listed in Part 4 |

Layers 1–2 fork nothing: delete them and the prototype renders stock Kernel.
Layer 3 is the only part that touches the shared system, and it is
deliberately small — six changes, four of them plain bug fixes.

The layers are also what make the drift **consumable**, which is why the
discipline is worth its friction. Each layer is already written in the DS's
own vocabulary: a token override names a role token, a modification-layer
rule names a component part via `data-slot`. Promoting an entry is usually a
matter of moving it down a layer, not translating it.

---

## Summary

| Part | Area | Count | Promotion status |
|---|---|---|---|
| 1 | Attachment / build wiring | 7 | prototype-only — build plumbing |
| 2 | Token drift | 27 tokens + 2 structural inversions | **undecided** — this is the v2 direction, and the largest open question |
| 3 | Modification layer | 22 rule groups (3.1 retired) | **undecided** — component and pattern proposals |
| 4 | **DS source changes** | 6 | **promote** — 4 already landed as fixes |
| 5 | App-level convention departures | 11 | mixed — see each entry |

---

# Part 1 — How the prototype attaches to the DS

The prototype consumes the design system **at source**, not as a copied fork and not
as a published package. This is the single most important structural fact
about the experiment: there is exactly one copy of every component, and
the prototype renders the live one.

| # | Where | What |
|---|---|---|
| 1.1 | `vite.config.ts` | `@` → `../kernel-portal/src`, `@app` → `./src`. So `@/components/ui/table` in the prototype *is* the portal's Table. |
| 1.2 | `vite.config.ts` | `resolve.dedupe: ["react", "react-dom", "recharts"]` — two `node_modules` trees are in play, and React breaks if instantiated twice. |
| 1.3 | `vite.config.ts` | `server.fs.allow` widened to the repo root so Vite may read outside the app dir. |
| 1.4 | `tsconfig.json` | Mirrors the aliases, and **pins `react`/`react-dom` types to the app's own `@types`** — otherwise the two trees produce duplicate-identifier errors. |
| 1.5 | `src/index.css` | `@import` of the portal's `index.css` (all DS tokens) + `@source "../../kernel-portal/src"` so Tailwind v4 scans DS component source and generates their utilities. |

The prototype installs only `react`, `react-dom`, `react-router-dom`, `recharts`.
Everything the DS components need (`@base-ui/react`, `@mdi/js`, …) resolves
from `kernel-portal/node_modules`. **This is why the Netlify build installs
both packages** (1.6).

**1.6 — Deploy routing** (`netlify.toml`, repo root). A branch-scoped context
overrides the build so the preview serves the prototype instead of the portal:

```toml
[context."claude/kernel-insider-portal-fvqfq2"]
  base = "/"                       # build from the repo ROOT, both packages present
  command = "npm --prefix kernel-portal install … && npm --prefix kernel-app install … && npm --prefix kernel-app run build"
  publish = "kernel-app/dist"
```

`main` and every other branch keep building `kernel-portal` untouched. The
root SPA redirect (`/* → /index.html`) already covered deep links, so
the prototype's client routes work on a hard load with no extra config.

> Watch item: this block names the branch literally. Renaming the branch
> silently reverts the preview to the portal.

**1.7 — Pre-paint theme script** (`index.html`). Dark is the prototype's default
identity, so `<html class="dark">` is set in the markup and a small inline
script reconciles it with `localStorage` before first paint; `next-themes`
takes over on mount. Without this the app flashed light on every load.

---

# Part 2 — Token drift

All of it lives in one `.dark` block in `kernel-app/src/index.css`, plus one
`:root` line. **Every override points at a DS *scale* token** (`--neutral-*`,
`--brand-*`, `--error-*`, `--chart-*`) rather than a hand-picked colour, so
the prototype still rides the system's ramps — it just points the semantic roles at
different rungs.

`--chart-1..5` are **deliberately not overridden**: charts, `--primary`,
`--ring` and `--sidebar-primary` all keep the Kernel green ramp.

## 2.1 Two structural inversions

These matter more than any individual value.

**(a) The elevation model is inverted.** Kernel's dark theme *recesses* cards
— they are darker than the canvas. the prototype *raises* them:

| Role | DS dark (L) | Prototype (L) | Direction |
|---|---|---|---|
| `--background` | 0.2605 | `--neutral-900` → 0.213 | canvas darker |
| `--card` / `--popover` | 0.2128 | `--neutral-800` → 0.270 | surface lighter |

The two are almost exactly **swapped**: the prototype's canvas equals the DS's card
lightness, and its card equals the DS's canvas. Cards now float above
the page instead of sinking into it — the single change most responsible for
the "premium analytics" read. `--sidebar` drops further still, to
`--neutral-950` (0.165), so the rail recedes behind the floating inset panel.

**(b) Radius is 3.5× the system default.**

| | DS | Prototype |
|---|---|---|
| `--radius` | `0.25rem` (4px) | `0.875rem` (14px) |

Kernel is a nearly square system; the prototype is a soft-cornered one. This one
line cascades through every card, input, popover and button. It also proved
too round at control heights, which is why the modification layer steps
buttons back down (3.2).

## 2.2 Full token table

`--spacing` is `0.24rem` (3.84px) in Kernel — worth knowing when reading the
`calc()`s in Part 3.

| Token | DS dark | Prototype | Note |
|---|---|---|---|
| `--background` | `oklch(0.2605 …)` | `--neutral-900` | inversion (a) |
| `--foreground` | pure white | `--neutral-50` | softened off pure white |
| `--card`, `--popover` | `oklch(0.2128 …)` | `--neutral-800` | inversion (a) |
| `--card-foreground`, `--popover-foreground` | white | `--neutral-50` | |
| `--primary` | `oklch(0.8722 0.1272 127.8)` | `--chart-1` | **same colour**, re-expressed as a token reference |
| `--primary-foreground` | `oklch(0.2128 …)` | `--neutral-950` | |
| `--secondary` | `oklch(0.3959 …)` | `--neutral-800` | now equal to `--card` |
| `--secondary-foreground` | green | `--neutral-100` | de-greened |
| `--muted` | `oklch(0.3959 …)` | `--neutral-800` | **now equal to `--card`** — see caveat |
| `--muted-foreground` | `oklch(0.7700 …)` | `--neutral-400` | |
| `--accent` | `oklch(0.4373 …)` | `--brand-900` | |
| `--accent-foreground` | green | `--neutral-50` | de-greened |
| `--destructive` | `oklch(0.5900 0.1848 24.1)` | `--error-500` | onto the error scale |
| `--destructive-foreground` | white | `--neutral-50` | |
| `--border` | `oklch(0.3959 …)` | `--neutral-700` (0.370) | slightly darker |
| `--input` | `oklch(0.5620 …)` | `--neutral-700` (0.370) | **noticeably darker** |
| `--ring` | green | `--chart-1` | same colour |
| `--sidebar` | = background | `--neutral-950` | recessed rail |
| `--sidebar-foreground` | white | `--neutral-50` | |
| `--sidebar-primary`, `--sidebar-ring` | green | `--chart-1` | same colour |
| `--sidebar-primary-foreground` | `oklch(0.2128 …)` | `--neutral-950` | |
| `--sidebar-accent` | `oklch(0.4373 …)` | `--neutral-800` | nav selection/hover — **neutral, not green** |
| `--sidebar-accent-foreground` | green | `--neutral-50` | de-greened |
| `--sidebar-border` | `oklch(0.3959 …)` | `--neutral-800` | |

> **Caveat that bit us: `--muted` now equals `--card`.** Anything the DS
> styles with `bg-muted` on a card surface is invisible in the prototype. This is
> exactly why the `Table striped` prop uses a `foreground/5` overlay rather
> than `bg-muted` (4.1) — a `muted`-based stripe would have rendered as
> nothing. Any future DS component leaning on `muted` for separation needs the
> same treatment.

## 2.3 Light mode: the rail drops, the page stays white

Light was originally left stock-plus-radius. That broke the inset content panel:
the DS ships light `--sidebar` **and** `--background` both at pure white
(`oklch(1 0 0)`), so `SidebarInset`'s `m-2` margin and `rounded-xl` corners
existed with zero contrast — the floating-panel effect was invisible in light
while working in dark.

Light gets its contrast from the **rail dropping**, not from tinting the page —
only the frame darkens, and the content panel stays paper-white:

| Role | DS light | Prototype light | Reads as |
|---|---|---|---|
| `--sidebar` | white (1.000) | `--neutral-100` (0.967) | recessed rail, frames the panel |
| `--background` | white (1.000) | *unchanged* | the floating inset panel, paper-white |
| `--card` / `--popover` | white (1.000) | *unchanged* | same sheet as the canvas |
| `--sidebar-border` | 0.8957 | `--neutral-200` (0.922) | hairline sized to the lighter rail |
| `--sidebar-accent` | 0.9758 | `--neutral-200` (0.922) | selected nav chip — neutral |
| `--sidebar-accent-foreground` | green | `--neutral-900` | de-greened |
| `--muted` | 0.9612 | *unchanged* | pill / segmented trough |

**This is deliberately a different structure from dark.** Dark separates the
three surfaces by lightness (950 / 900 / 800, cards raised). Light puts canvas
and card on one white sheet and lets the DS Card's `ring-1 ring-foreground/10`
hairline do the delineating — the conventional light-UI read, and easier on the
eye than greying a whole page just to make cards pop. Verified on the
card-heavy Overview: the KPI cards read clearly on white by their ring alone.

**The rail sits ~3% off white, not 8%.** It was `--neutral-200` (0.922) at
first — roughly Tailwind `gray-200`, which reads as a *slab* competing with the
content rather than a frame. Chrome here only has to frame the panel, helped by
the panel's own `shadow-sm`. `--muted` was overridden to that same 0.922 rung,
which meant a segmented control in the content carried the same visual weight as
the entire sidebar; with the canvas now white the DS value (0.9612) reads fine
on its own, so the override is gone.

Two knock-ons the numbers exposed once the rail lightened:

- **The selected nav item has to be *darker* than the rail.** The DS light
  `--sidebar-accent` is 0.9758 — lighter than a 0.967 rail, so a selected item
  would read as a hole rather than a chip. It takes one rung down,
  `--neutral-200`.

> **Nav selection is neutral in both themes, deliberately.** It was tried as a
> green chip (`--lime-200` light / `--brand-900` dark) and read wrong: the rail is
> chrome, and a coloured selection there competes with the accent doing real work
> in the content — primary buttons, active pills, chart series, bid counts.
> Keeping the rail neutral leaves green to mean "this is the thing", and the only
> colour left in the rail is the brand mark itself. Selection reads by three
> redundant cues instead of colour: the surface step, the DS's
> `data-active:font-medium`, and a marker pill in the gutter *outside* the chip,
> in `--sidebar-primary`. The marker is the one place the rail keeps colour: the
> chip carries the surface neutrally, the accent just says which item you are on.
> It hangs off the **item**, not the button — the DS sets `overflow-hidden` on
> the button, so a gutter marker there gets clipped; the `li` is already
> `relative` with overflow visible, and the group's 7.68px padding leaves exactly
> enough room for a pill at `-left-1.5`. The marker survives the collapse to
> icons, where it earns the most since the labels are gone. Contrast stays high
> (active nav text 13.92:1 light / 14.34:1 dark).
>
> Note the residual chroma if you measure it: Kernel's neutrals are
> **green-tinted by design** (hue ~162–165), so `--neutral-200`/`-800` are not
> hue-zero greys. At 0.017–0.021 chroma they are 4–5× less chromatic than the
> `lime-200`/`brand-900` chips they replaced, and read as neutral.
- **A lighter rail needs a lighter hairline** — the DS `--sidebar-border`
  (0.8957) was tuned against a white rail and reads heavy on this one, so it
  steps to `--neutral-200`.

> **Trap worth remembering: the light block is `:root:not(.dark)`, not `:root`.**
> A bare `:root` has the *same* specificity as the `.dark` block and sits later
> in the file, so it wins in **both** themes — silently flattening dark mode's
> surfaces. This was caught by asserting the resolved values per theme rather
> than eyeballing the light screenshot; the dark canvas, rail and muted had all
> quietly become their light values. The `:not(.dark)` raises specificity and
> states the intent.

Both themes resolve distinct rail/panel pairs — dark 0.165 / 0.213, light
0.967 / 1.000 — with the same 18px radius and 7.68px top/right margin. Contrast
holds in both: table header on card 5.79:1 dark / 5.15:1 light, muted text on
panel 6.76:1 / 5.15:1, all clear of AA.

---

# Part 3 — The modification layer

`kernel-app/src/v2-layer.css`. Restyles live DS components through their
shadcn `data-slot` hooks plus three opt-in markers the app sets itself
(`data-v2-kpi`, `data-v2-segmented`, `data-v2-detail`, `data-v2-dense`). No
component is forked.

Numeric columns in the prototype are **left**-aligned, against the usual
convention: with `tabular-nums` the digits still line up, and these columns hold
same-width signed basis values where right-alignment buys nothing. Action
clusters stay right-aligned — those are controls at the row end, not numbers.

**Mechanism note.** Rules that must beat a Tailwind utility are written
*unlayered with `!important`*; rules that only need to beat component defaults
sit in `@layer components`. This is not stylistic — `@layer components` loses
to `utilities` in the cascade, so a padding override placed there silently
does nothing. All lengths are `--spacing`/`--radius` multiples; no magic
numbers.

| # | Target | Change | Layer |
|---|---|---|---|
| 3.1 | ~~`--card-spacing` 4 → 6~~ | **removed as dead code** — the DS's own `[--card-spacing:--spacing(4)]` arbitrary-property utility (utilities layer) always outranked the `@layer components` rule, so the bump never applied; the approved look is the DS default | — |
| 3.2 | `[data-slot="button"]` | radius → `calc(var(--radius) - var(--spacing))` = **10.16px**, down from 14px | unlayered `!important` |
| 3.3 | `[data-v2-kpi]` | green hover accent via `outline` (not `border`, so the DS hairline ring survives); `--duration-base` / `--ease-out` | components |
| 3.4 | `[data-v2-segmented]` | outline ToggleGroup → filled pill with highlighted active segment | components |
| 3.5 | `[data-slot="table-head"]` | weight 500 → 400, colour → `--muted-foreground` so headers recede behind the data (5.79:1 dark / 5.15:1 light, both AA) | unlayered `!important` |
| 3.6 | table head/cell | horizontal padding → 4 units; vertical → 3 units | unlayered `!important` |
| 3.7 | first/last cell | edge inset → 6 units, so text never sits on the container border | unlayered `!important` |
| 3.8 | `[data-v2-detail]` | padding → 0; the inset panel supplies its own | unlayered `!important` |
| 3.9 | cells inside `[data-v2-detail]` | denser step: 3 units, edges 4 — the panel carries 12 columns | unlayered `!important` |
| 3.10 | `[data-v2-detail]` well | **rebuilt.** Expanded rows read as a recessed well: top/bottom hairlines, a `--primary` bar on the leading edge echoing the rail's active marker, and now a real **fill** (`--v2-well`) two rungs below the darkest zebra stripe — dark `--neutral-950` (RGB 6,17,12), light `--neutral-200` (227,230,228) — plus a four-edge inset shadow. The first version carved with a *foreground* mix, which in dark meant a white glow in a recess; `--v2-well-shade` mixes toward black in dark and toward foreground in light, which is where the light actually comes from in each theme. Muted text resolves one rung darker inside the well (5.65:1 light) — on `--neutral-200` the standard `--muted-foreground` measured 4.09:1, under AA | unlayered |
| 3.11 | `[data-v2-pin]` cells | inside a scrolling table, the actions cell pins `sticky right-0` on a solid `--background` with an inset left shadow — the decision stays on screen while data columns scroll beneath | unlayered |
| 3.12 | `[data-v2-filter]` selects | the Producers filter triggers join the pill family: full-round, `--muted` trough, no hairline, 4% foreground hover | unlayered `!important` |
| 3.13 | `main [data-slot="card"]` | `height: auto` + `flex-shrink: 0` — the DS Card's `h-full` becomes a flex-basis of 100% of a definite-height flex column, and the flex algorithm then shrinks every stacked card proportionally (one clips its footer, a sibling pads out empty). Grids still stretch cards via alignment, which ignores `height` | unlayered `!important` |
| 3.14 | `[data-v2-dense]` tables | condensed step for tables inside a Card or an expanded row: **3 units horizontal, 2.5 vertical, edges 4, 36px header** — one step below the top-level table (4/3, edges 6), not as tight as it goes. It started at 2/1.5: the rows crowded their own text and the frame read as a spreadsheet rather than a panel. Must stay last in the file — equal specificity with 3.9, so source order decides for a dense table nested in a detail row | unlayered `!important` |
| 3.15 | `[data-slot="card"]`, `[data-v2-frame]` | **the elevation pass.** Cards take an opaque `--border` hairline (replacing the DS's `ring-1 ring-foreground/10` — an alpha edge takes its contrast from whatever sits behind it, and at 10% it was the faintest thing on the page; `--border` measures 1.44:1 dark / 1.37:1 light against the card), a 1px top lip so the plate reads as bevelled toward a light source above, and a resting cast from `var(--shadow-lg)`. Frames nested in a card take the lip and a fill one step off the card (`--elev-plate`, measured 1.08:1 dark / 1.06:1 light) but **no** cast — a shadow at both levels reads as upholstery. Text on the new plate re-measured: `--foreground` 13.2 dark / 16.5 light, `--muted-foreground` 5.34 / 4.86, all AA | unlayered `!important` (card), unlayered (frame) |
| 3.16 | `[data-slot="sidebar-inset"]` | **the page plate.** The DS gives the inset `m-2` on three sides and `ml-0` on the fourth, so the app's largest surface was welded to the rail along its whole height — a plate touching its surround on one edge cannot read as floating. Uniform gutter at 4 units, plus the lip, plus `--shadow-2xl`. Its edge is `--elev-edge-page`, **not** `--border`: around the page plate the hairline is the longest line on screen and sits against the darkest surround, so in dark it runs one rung darker (`--neutral-800`, 1.168:1 against the plate vs `--border`'s 1.444:1) — otherwise it reads as a drawn outline rather than an edge. Light keeps `--border` (1.365:1), where the edge is load-bearing: a cast alone cannot define a white plate against a near-white rail. Scoped to `min-width: 48rem`, matching the DS's own `md:` inset styling: below that the panel is full-bleed and a gutter would only cost content width. Verified 0 horizontal overflow at 1440/1024/768/767 and the gutter present on all four sides when scrolled to the page bottom | unlayered `!important` |
| 3.17 | `[data-slot="sidebar-menu-button"] > span:last-child` | **rail label crossfade.** The DS transitions the rail's width and the button's width/height/padding, but the label was only ever clipped by the button's `overflow-hidden` — sliced off by a moving edge rather than leaving. An opacity transition alone was **invisible**, because two other things removed the text first: the span is a flex child with `truncate` (so `min-width` resolves to 0) and was being *compressed* to zero width by ~117ms, and the button — which collapses faster than the rail, being the rail minus three levels of padding — clipped the text's right edge at ~75ms. No fade is perceptible in 75ms. Fixed with three rules: `flex: none` (stop the squeeze), `overflow: visible` on the button (let the rail clip instead, at its slower rate), and `linear` rather than `--ease-out`, which front-loaded 31% of the fade into the first 28ms. Symmetric, matched to the DS's 200ms rail transition. Measured after: text holds 100% visible through opacity 1 → 0.83 → 0.5, first meeting the clip edge at 173ms when already at 0.17. Caveat: with `flex: none` the DS's `truncate` cannot bind, so these rules suit short nav labels only | unlayered |
| 3.18 | `[data-v2-dense] tbody tr:hover` | dense rows need their own hover — the DS's `hover:bg-muted/50` is invisible because this theme resolves `--muted` to the same value as `--card`, the surface these tables sit on. 4% foreground mix, like every other on-card overlay | unlayered |
| 3.19 | `[data-v2-panel]` | **the lit panel.** The expanded row's content — roll-up figures, range tabs, activity table — is one surface: `--card` fill, the 1px lip, and `--elev-cast`, the only lit object in the well. This **deliberately breaks 3.15's "nested frames take no cast"**: 3.15 governs a frame nested on a card, where the card is already lifted; here the surround is a recess, and a plate in a recess without a cast reads as painted on the floor. The tab strip takes the panel fill and its own underline is the only divider between control and data | unlayered |
| 3.20 | `[data-slot="table"]` | **zebra stripes are the default, not a prop.** The DS ships striping as opt-in (`striped`, 4.1), so in practice a table either got it or was forgotten. Every table in the app stripes: `tr:nth-child(even)` at 5% foreground, with `:not(:hover)` so the row hover still reads (the DS hover is a `--muted` overlay of similar weight and the two cancel). Opt out with `data-v2-rowstripe`, which the two object tables set because they stripe by *data* index instead (5.1) | unlayered |
| 3.21 | `[data-slot="table-row"][data-state="selected"]` | **the open row is a selected row.** The parent row of an expanded detail used to paint its own `bg-foreground/5` — the same value as the zebra stripe, so an open row on an even index was indistinguishable from a closed one. It now sets the DS's own `data-state="selected"`; only the *fill* is retuned here, to 9% foreground, because the DS's `data-[state=selected]:bg-muted` is invisible in this theme (`--muted` resolves to `--card`, the surface the table sits on — the same trap `IconChip` works around, and 3.18) | unlayered |
| 3.22 | tables inside `[data-v2-panel]` | the panel's table takes the **top-level** step back (4 units horizontal, 6 at the edges) rather than the detail-row tightening of 3.9 or the dense step of 3.14. Once the panel is the focus of the open row, its rows should not change gear from the object table above them. Equal specificity with 3.9 and 3.14 (0,3,0), so these rules must stay after both — source order is the whole mechanism | unlayered `!important` |

3.2 exists because of the radius inversion in Part 2: 14px suits the prototype's
roomy cards but reads too round on a 38px control. 10.16px also matches the
compact select triggers, so the filter row is coherent.

---

# Part 4 — Changes to the design system itself

**This is the part that matters if the prototype is abandoned.** Six changes, all in
`kernel-portal/`. Four are bug fixes the portal benefits from with no prototype
dependency.

| # | Component | Change | Kind | Standalone? |
|---|---|---|---|---|
| 4.1 | `table.tsx` + doc entity | `striped` prop | feature | yes |
| 4.2 | `table.tsx` | `striped` scoped to own rows | **bug fix** | yes |
| 4.3 | `sidebar.tsx` | `min-w-0` on `SidebarInset` | **bug fix** | yes ← *take regardless* |
| 4.4 | `button.tsx` | optical icon padding actually fires | **bug fix** | yes |
| 4.5 | `tabs.tsx` | no hover styling on the active tab | **bug fix** | yes |
| 4.6 | `icon.tsx` | `Archive`, `Ban` glyphs | additive | yes |

## 4.1 `Table` gains a `striped` prop

`src/components/ui/table.tsx`, `src/lib/component-docs/table.ts`

Zebra-stripes alternating body rows for dense operational tables. Uses a
`bg-foreground/5` overlay rather than `bg-muted` so it reads on any surface
regardless of how a theme relates `--muted` to `--card` — see the Part 2
caveat, where they are the same colour. Sets `data-striped` for styling hooks;
documented as an `api` prop, covered by the parity gate.

**Known limit:** striping is `nth-child`-based, so a table with expandable
detail rows flips parity mid-table. the prototype's Producers table therefore
stripes by data index instead (5.1). A first-class fix would be group-wise
striping (one `<tbody>` per row + detail) — not attempted.

## 4.2 `striped` no longer leaks into nested tables

```diff
-striped && "[&_tbody_tr:nth-child(even)]:bg-foreground/5"
+striped && "[&>tbody>tr:nth-child(even)]:bg-foreground/5"
```

The rule was a *descendant* selector, so any table nested inside a striped
table inherited the striping. Found by putting a bid-detail table inside an
expanded producer row. For a flat table the two selectors are identical —
behaviour-preserving everywhere else.

## 4.3 `SidebarInset` can shrink

```diff
-"relative flex w-full flex-1 flex-col bg-background …"
+"relative flex w-full min-w-0 flex-1 flex-col bg-background …"
```

`SidebarInset` is a `flex-1` child, so `min-width: auto` — it refuses to
shrink below its content's intrinsic width. Any page with content wider than
the viewport pushed **the whole page** sideways past the sidebar instead of
letting inner `overflow-x-auto` containers scroll.

Measured on Producers at 1500px: document `scrollWidth` **1756 → 1500**, and
the table's own scroll container started working. Affects every app using the
sidebar, portal included.

## 4.4 `Button`'s optical icon padding actually fires

The size variants already encoded the right idea — an icon is optically
lighter than a text edge, so its side wants tighter padding — via
`has-data-[icon=inline-start]:pl-2.5`. But that depends on the glyph carrying
`data-icon`, and **only `pagination.tsx` ever set it** (2 call sites). Every
other icon button in the system rendered with even padding.

CSS alone cannot fix this: `:first-child`/`:last-child` ignore text nodes, so
in `<Button><Check /> Accept</Button>` the `<svg>` is *both* first and last
element child. A `has-[>svg:first-child]` attempt tightened both sides
(measured 6px/6px — wrong, caught before shipping).

The component now inspects its children and flags itself:

```tsx
const leadIcon  = hasLabel && React.isValidElement(kids[0])
const trailIcon = hasLabel && React.isValidElement(kids[kids.length - 1])
// → data-lead-icon / data-trail-icon, read by data-lead-icon:pl-2.5 etc.
```

Measured after: leading-icon button is `padding-left: 6px` /
`padding-right: 10px`. Icon-only buttons get neither flag. `data-icon` stays
as the manual escape hatch.

> **This is a visual change to every icon+label button in the portal** —
> small, and in the direction the DS already intended, but not invisible. The
> only entry in Part 4 with a blast radius worth eyeballing before merge.

## 4.5 Tabs: no hover styling on the active tab

Hover is an affordance for somewhere you can *go*; the active tab is already
where you are. Every variant applied its hover style unconditionally — most
visibly, hovering an active **pill** re-coloured its label, and hovering an
active **folder** tab swapped its card-coloured background for `muted/60`,
undoing the effect that makes the tab read as joined to the panel.

Each hover rule is now `not-data-active:`-guarded (pill, underline, folder).
Verified: active pill colour unchanged on hover, inactive pills still respond.

## 4.6 Icon shim additions

`Archive` → `mdiArchiveArrowDownOutline`, `Ban` → `mdiCancel`. One line each,
per the shim convention. Zero risk.

## 4.7 Coarse-pointer hit extensions reach `select-trigger`

`index.css`, the `@media (pointer: coarse)` block. Decisions 0007 + 0009
compose like this: a control either grows visibly to 44px, or it stays compact
and an invisible `::after` extension carries it to a ≥44px *effective* target.
`select-trigger` had only half of that — it grew to 44px at the default size
(and 40px at `size="sm"`), but it was absent from the extension list, so a
compact select's effective target stayed 40px. It is not a
`[data-slot="button"]` (Base UI's Trigger renders its own element), so the
button rule never reached it.

Added `[data-slot="select-trigger"]` to both the `position: relative` list and
the `::after` list. The trigger has no absolutely-positioned children — its
chevron is a flex child — so `position: relative` changes nothing visually.
`mobile-audit` on `/producers` went from **1 sub-44px hit area to 0**; it is
the gate that surfaced this. Any compact select anywhere in the DS gets the
fix, not just the prototype's filter row.

## 4.8 The elevation ramp had no dark mode, and an inverted top rung

Decision 0042, `index.css` both theme blocks + the Elevation foundation page.
The single largest DS find of this branch, and the only one a *user* caught
before the tooling did.

`--shadow-*` was declared once in `:root` and repeated **byte for byte** in
`.dark`. On the dark card (rgb 31,41,36) the light ramp's 4–10% black resolves
to under one 8-bit level of difference — dark mode was shipping an elevation
ramp that could not produce a visible shadow at any rung, and
`/foundations/elevation` rendered eight identical swatches while documenting it
as working. Separately, light `--shadow-2xl` was `0 1px 3px / 0.25` — tighter
than `md`, so the top of the ramp cast the *smallest* shadow in the set.

Fixed by sharing geometry across themes (so `lg` means one thing everywhere)
and scaling alpha ~4–7× in dark, plus continuing the doubling progression to
`0 16px 32px -8px` at `2xl`. Full table and rationale in decision 0042.

**Cherry-pick priority: high, and independent of everything else here.** It is
a pure token fix in `kernel-portal/src/index.css` plus the foundation page's
copy; nothing in the prototype is required for it.

## 4.9 The reduced-motion guard let delays through

`index.css`, the `prefers-reduced-motion: reduce` block. The guard zeroed
`animation-duration` and `transition-duration` but not the matching **delays**,
so a delayed transition under reduced motion still waited out its full delay and
then snapped — a dead pause with no animation to explain it, which reads as a
stutter rather than as reduced motion. That contradicts decision 0018's stated
intent ("near-instant, no bounce"), so this is a bug fix to 0018 rather than a
new decision.

Caught by the rail label above, which uses a 120ms delay on expand. Measured
before: 30ms into the expand the label was still at opacity 0, appearing only
once the delay elapsed. After adding `animation-delay: 0s` and
`transition-delay: 0s`: opacity 1 at 30ms.

**Cherry-pick priority: high.** Two lines, no dependencies, and it affects every
delayed transition in the system — not just this one.

---

# Part 5 — Where the app departs from project convention

Judgment calls inside `kernel-app/`. None are DS changes *yet* —
these are the app-level patterns, and the question for each is whether it
should be promoted into the DS, kept local, or retired. Several (the panel
furniture in 5.5, the rail slot in 5.8) are the strongest promotion
candidates in the register, because they were built twice before they were
extracted.

**5.1 — Producers stripes by data index, not the `striped` prop.** Expanded
detail rows are extra `<tr>`s that flip `nth-child` parity mid-table, so the
DS prop produces visibly wrong output here. The app applies
`i % 2 === 1 && "bg-foreground/5"` instead — same token, different trigger.
Commented in place.

**5.2 — The whole producer row is clickable.** `onClick` on `TableRow` plus
`cursor-pointer`. The chevron remains a real `Button` (focusable, labelled,
`aria-expanded`) and calls `stopPropagation` so it cannot double-toggle. Row
clicks are a pointer convenience layered over a keyboard-accessible control,
not a replacement for one.

**5.3 — Off-scale type in the shell.** `text-[13px]` (sidebar search, org
name) and `text-[11px]` (avatar fallback), plus `size-[18px]` on the logo
glyph. Deliberate, to hit the reference's compact rail — but they are
arbitrary values, which the project otherwise avoids.

**5.4 — One raw `<button>`** in the sidebar footer (the org switcher), styled
by hand rather than using the DS `Button`. It is a composite row (avatar +
label + chevron) that no DS variant covers. Should become a real component if
the pattern survives.

**5.5 — Hand-rolled presentational helpers.** `BidsBadge`, `TwoLine`, `Delta`,
`Kpi`, `OfferInset`, `Sparkline`. All are compositions of DS primitives or
trivial layout, not re-implementations of DS components — but `BidsBadge` (a
circular count) and `TwoLine` (a two-line table cell) are generic enough to be
DS candidates if reused. The panel furniture (`Tile`, `Stat`, `IconChip`, `PanelHeader`,
`PageHeader`, `TableFrame`, `ActivityFlag`, `Empty`, `useVisibleWidth`) *has* been promoted to a shared module,
`src/components/panels.tsx`, once the Overview needed the same pieces as the
Scenarios detail — the app-wide framed-table + tile + flag conventions live
there now.

**5.6 — `Delta` uses notification colour for a measurement.** A KPI's
percentage change renders as `Badge variant="success" | "destructive"`. The
three-axis rule reserves notification colour for *momentary event outcome*; a
trend delta is arguably a measurement, so this stretches the axis. It reads
correctly and is conventional for dashboards, but it is the one place the
prototype bends the colour *rules* rather than the colour *values*.

**5.8 — The collapsed rail is 3.5rem, not the DS's 3rem.** Collapsing was
resizing the rail's contents: the DS forces `size-8!` + `p-2!` on a collapsed
menu button, leaving a 16.6px content box, which forced the app's `size-5`
glyph down to `size-4` and dropped the row height. So icons changed size
mid-animation. The button now keeps its 38.4px and simply becomes square
(padding 2.5 units → a 19.2px content box, exactly the `size-5` glyph), and
`--sidebar-width-icon` widens to 3.5rem so it clears the group's own 2-unit
padding (38.4 + 2×7.68 = 53.8px; 3rem left only 32.6px, which is *why* the DS
shrinks the button). Passed via `SidebarProvider`'s `style` prop, which spreads
after the DS defaults — the seam the DS already provides, not a CSS override.
**Search keeps a rail slot at both widths** (`SearchSlot`): a field when there is
room, a square icon control when there isn't. It used to vanish on collapse,
which dropped ~43px out of the header; with the brand row's 6px of shrink on top
of that, every nav item was yanked **48px** up the page (first item measured
y=134 → y=86). Now the field is `--control-h` (38px) against the nav button's
38.4px — the same slot to within half a pixel — and the brand row is pinned with
`min-h-12` (one slot plus its own `py-1`, since min-height is border-box).
Measured after: first nav item at y=138 in **both** states. Collapsed, clicking
search reopens the rail and focuses the field; focus is deferred to an effect on
the sidebar's `state` because a `display: none` field cannot take focus at click
time.

The brand and theme toggle still hide outright — a wordmark has no 3.5rem form
to shrink into, so a crossfade there would read as a glitch.

**5.9 — Route changes fade in (`PageFade`).** The `<Outlet />` is wrapped in a
div keyed by `pathname`, so React remounts the subtree on every route change and
the enter animation replays. **Enter only** — a true crossfade needs the
outgoing page kept mounted while the incoming one arrives, which is a routing
concern and would put two pages in the layout at once. Opacity alone, no drift:
the rail's label fade set the app's transition language, and a page that slides
as well as fades starts to feel like a slideshow. The wrapper carries
`flex flex-1 flex-col` so it is layout-transparent; verified by measuring
content widths on all four routes with and without it (538 / 1092 / 1092 / 707
both ways — identical). Measured opacity on navigation: 0 → 0.73 → 0.92 → 1
over ~200ms, and 1 on the first frame under `prefers-reduced-motion`.

**5.7 — Panel roll-ups move with panel width.** The app's panel language puts a
figure cluster at the header's trailing edge (`IconChip` + title/description
left, bare `Stat`s right, hairline dividers between) — that is what the
Scenarios detail and the Producers inset do. In a *narrow* panel there is no
room beside the title, and the same cluster just crowds it, so narrow panels
(the Overview's Revenue card) carry the figure in the content instead, directly
above the chart. Same pieces, placement chosen by available width. Not encoded
in `panels.tsx` — `PanelHeader`'s `action` slot simply goes unused.

Updated 2026-08-02: in the Scenarios detail the cluster no longer floats on the
well — it sits at the top of the panel, above the tabs. The figures count the
table directly beneath them, so putting them on a different surface from that
table was the wrong grouping; the well is now recess only, and everything that
is content is on the one plate. The Producers inset (`OfferInset`) still has the
old arrangement — the same object built twice, again (5.5).

**5.11 — Every bid is quoted in basis.** The Producers inset always showed
basis (`+0.03`, `-0.28` — cents over or under the futures month). The Scenarios
board and the Overview book showed flat cash prices (`$4.52`) for the same
quantity, so two screens described one number two ways. The scenario seed data
is now basis, and the single formatter lives in `kernel-app/src/lib/format.ts`
— a positive value keeps its `+`, because the sign is which side of the board
the bid sits on. Nothing about this is DS drift; it is the prototype's domain
language becoming consistent, and it is here because a reader comparing the two
screens would otherwise assume one of them is wrong.

**5.10 — `ScrollTop` needs a block body, and that is not a style
preference.** The route-scroll effect was written
`React.useEffect(() => window.scrollTo(0, 0), [pathname])`. In Chrome 151
`window.scrollTo` returns a scroll-completion Promise, so the concise arrow
body handed that Promise to React as the effect's *cleanup function* and React
threw `TypeError: destroy is not a function` — the tree unmounted and the app
painted a blank page. Fixed by giving the effect a block body, so it returns
`undefined` again.

Two things about it are worth keeping. **It escaped every gate we have.**
StrictMode double-invokes effects, so the crash lands on *mount* in dev — the
dev server was blank from the first paint — while the production build
survives mount and would have thrown on the first *navigation* instead. That
is why `tsc`, `vite build` and all of Part 7 stayed green: the type is
correct, the bundle is fine, and nothing we run drives a route change in a
current browser. **And it is a browser change, not a code change** — the line
was correct when written and became a crash when Chrome shipped scroll
completion promises.

This one is prototype-local: the portal's `ScrollManager`
(`kernel-portal/src/pages/portal-layout.tsx`) and the two other `scrollTo`
call sites already use block bodies, so **Part 4 gains nothing from it**. The
hazard is not local, though — any effect whose concise body calls a DOM method
is one browser release away from the same failure, and the symptom (blank
page, no error boundary, no build failure) points nowhere near the cause.

---

# Part 6 — What the prototype actually is

| Route | Page | Built from |
|---|---|---|
| `/` | Overview — KPI cards, book-wide producer activity, revenue trend, latest orders, cash position | `Card`, `Badge`, `StatusBadge`, `CommodityLabel`, `ToggleGroup`, `Table`, `Button` + recharts |
| `/scenarios` | Scenarios — folder tabs, striped object table | `Tabs` (folder + pill), `Table striped`, `StatusBadge`, `CommodityLabel`, `Button` |
| `/producers` | Producers — ranked prospecting table with an open-bids inset | `Table`, `Tabs`, `Select`, `Input`, `Tooltip`, `Badge`, `CommodityLabel`, `Button` |
| `/settings` | Settings — organization + notification preferences | `Card`, `Input`, `Select`, `Switch`, `Label`, `Button`, panel furniture |

DS components in use: `avatar`, `badge`, `button`, `card`, `commodity-badge`,
`icon`, `input`, `select`, `sidebar`, `status-badge`, `table`, `tabs`,
`toggle-group`, `tooltip` — 14, live from source.

Sample data (`src/data/`) stays in the grain-merchant world: our own elevator
locations, invented rival buyers, basis values in cents. Producers' open bids
are generated deterministically from the producer id, so a row's inset always
holds exactly as many bids as its Bids badge and the numbers do not shuffle
between reloads or screenshots. "Value over top comp" is computed
(`producerMaxBid - topCompBid`) rather than stored, so the column cannot
contradict its own inputs.

---

# Part 7 — Verification status

Gates run against this branch (from `kernel-portal/` unless noted):

- `check-component-docs` — **69 entities, 0 violations**
- portal `tsc` + `vite build` — clean
- app `tsc` + `vite build` — clean
- `contrast-audit` — unchanged (the prototype adds no new colour pairs; it re-points
  roles at existing audited scales)
- `mobile-audit` at 390px on `/`, `/scenarios`, `/producers`, `/settings` —
  **0 horizontal overflow, 0 clipped, 0 sub-16px inputs, 0 sub-44px hit
  areas** on all four. The one sub-44px target that used to remain (a compact
  select trigger at 40px) was *not* sanctioned by decision 0007 after all —
  0007 sanctions a 40px *visible* size only when an extension carries the
  effective target to 44px, and the trigger was missing from the extension
  list. Fixed upstream; see 4.7.

Runtime-verified by hand: active-pill hover inert while inactive still
responds; row click expands with no chevron double-toggle; button radius
10.16px; icon padding 6px/10px; nested detail table not striped by the outer
table's rule.

**Browser:** runtime checks above were made in Chrome 151. Both dev and
production builds render, and `/`, `/scenarios` and `/producers` navigate
clean — which is a check worth naming, because the 5.10 crash fired only on
route change and every static gate passed while the app was unusable.

**Light mode** now carries a deliberate elevation ladder (2.3) and passes the
same audits, but it has still had far less design attention than dark — it is
correct, not tuned. `/settings` is a rail entry with no page.

---

# Part 8 — Promotion path

Per decision 0056 the prototype is the DS's forward track, so the question is
no longer *whether* this comes back but *in what order*.

**Ready now.** Part 4 items **4.2–4.5** are bug fixes, they stand alone, and
they need nothing from the prototype. **4.3 (`SidebarInset min-w-0`) is the
one to take regardless** — it affects every consumer of the sidebar today.
Sanity-check 4.4's blast radius on the portal's icon buttons first; it is the
only visually non-neutral one.

**Next, and cheapest to promote:** the Part 5 patterns that already proved
themselves twice — the panel furniture (5.5) and the rail's collapse
behaviour (5.8). Both are additive to the DS and neither changes an existing
component's default.

**The large open question is Part 2.** The token drift *is* the v2 look, so
promoting it is a question about the design system's direction rather than a
cherry-pick — particularly the two structural inversions (2.1), which change
what the model *means* rather than what any value is. That is a decision to
take deliberately, with `contrast-audit` run across both themes, not by
draining this register entry by entry.

**Still open in the prototype itself:**
- Light mode has the elevation ladder and passes the audits, but it is correct
  rather than tuned — a deliberate pass over its accents and chart colours is
  still open.
- The four Producers filter dropdowns are presentational placeholders, pending
  the more advanced filtering planned.
- `/settings` is unbuilt.
- The Producers inset scrolls horizontally to reach Accept/Reject at 1600px —
  twelve data columns plus two buttons will not fit narrower without dropping
  or collapsing columns.
- 5.3–5.5 (arbitrary type sizes, the raw `<button>`, the generic helpers)
  should either be promoted into the DS or brought back onto the scale.
