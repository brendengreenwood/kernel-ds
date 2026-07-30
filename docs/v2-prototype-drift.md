# Kernel v2 prototype — drift register

`kernel-app/` is the **Kernel v2 prototype** (decision 0040): real merchant
workflow screens rendered in a different visual register — dark,
premium-analytics, soft-cornered — on top of the live design system.

It is a **design sandbox, not a product surface.** Its screens, copy and data
do not define product behaviour: the Producers filter dropdowns are
presentational, `/settings` is unbuilt, and the sample book is invented.
Nothing here should be cited as a spec.

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

It exists because **the branch may never merge.** Each entry says what
changed, why, and whether it is worth keeping on its own. Its real value is as
a pressure test: being a second live consumer of the DS is what surfaced the
six changes in Part 4, four of them latent bugs the portal shared.

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

---

## Summary

| Part | Area | Count | Merge-worthy on its own? |
|---|---|---|---|
| 1 | Attachment / build wiring | 7 | no — prototype-specific |
| 2 | Token drift | 27 tokens + 2 structural inversions | no — that *is* the look |
| 3 | Modification layer | 9 rule groups | no — prototype-specific |
| 4 | **DS source changes** | 6 | **yes — 4 are bug fixes** |
| 5 | App-level convention departures | 6 | n/a — judgment calls to review |

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
(`data-v2-kpi`, `data-v2-segmented`, `data-v2-detail`). No
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
| 3.1 | `[data-slot="card"]` | `--card-spacing` 4 → 6 units (15.4px → 23px) | components |
| 3.2 | `[data-slot="button"]` | radius → `calc(var(--radius) - var(--spacing))` = **10.16px**, down from 14px | unlayered `!important` |
| 3.3 | `[data-v2-kpi]` | green hover accent via `outline` (not `border`, so the DS hairline ring survives); `--duration-base` / `--ease-out` | components |
| 3.4 | `[data-v2-segmented]` | outline ToggleGroup → filled pill with highlighted active segment | components |
| 3.5 | `[data-slot="table-head"]` | weight 500 → 400, colour → `--muted-foreground` so headers recede behind the data (5.79:1 dark / 5.15:1 light, both AA) | unlayered `!important` |
| 3.6 | table head/cell | horizontal padding → 4 units; vertical → 3 units | unlayered `!important` |
| 3.7 | first/last cell | edge inset → 6 units, so text never sits on the container border | unlayered `!important` |
| 3.8 | `[data-v2-detail]` | padding → 0; the inset panel supplies its own | unlayered `!important` |
| 3.9 | cells inside `[data-v2-detail]` | denser step: 3 units, edges 4 — the panel carries 12 columns | unlayered `!important` |

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

---

# Part 5 — Where the app departs from project convention

Judgment calls inside `kernel-app/`. None are DS changes; all are places a
reviewer might reasonably push back.

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
DS candidates if reused.

**5.6 — `Delta` uses notification colour for a measurement.** A KPI's
percentage change renders as `Badge variant="success" | "destructive"`. The
three-axis rule reserves notification colour for *momentary event outcome*; a
trend delta is arguably a measurement, so this stretches the axis. It reads
correctly and is conventional for dashboards, but it is the one place the
prototype bends the colour *rules* rather than the colour *values*.

---

# Part 6 — What the prototype actually is

| Route | Page | Built from |
|---|---|---|
| `/` | Overview — KPI cards, sparklines, latest orders | `Card`, `Badge`, `StatusBadge`, `ToggleGroup`, `Button` + recharts |
| `/scenarios` | Scenarios — folder tabs, striped object table | `Tabs` (folder + pill), `Table striped`, `StatusBadge`, `CommodityLabel`, `Button` |
| `/producers` | Producers — ranked prospecting table with an open-bids inset | `Table`, `Tabs`, `Select`, `Input`, `Tooltip`, `Badge`, `CommodityLabel`, `Button` |
| `/settings` | rail entry only — not built | — |

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
- `mobile-audit` at 390px on `/`, `/producers`, `/scenarios` — **0 horizontal
  overflow, 0 clipped, 0 sub-16px inputs**. One sub-44px hit area remains: a
  compact select trigger at 40px, which decision-0007 explicitly sanctions
  ("compact sizes 40px").

Runtime-verified by hand: active-pill hover inert while inactive still
responds; row click expands with no chevron double-toggle; button radius
10.16px; icon padding 6px/10px; nested detail table not striped by the outer
table's rule.

**Light mode** now carries a deliberate elevation ladder (2.3) and passes the
same audits, but it has still had far less design attention than dark — it is
correct, not tuned. `/settings` is a rail entry with no page.

---

# Part 8 — If we pick this up

**If the prototype is abandoned**, take Part 4 items **4.2–4.5**. They are bug
fixes, they stand alone, and they need nothing from the prototype. **4.3
(`SidebarInset min-w-0`) is the one to take regardless** — it affects every
consumer of the sidebar today. Sanity-check 4.4's blast radius on the portal's
icon buttons first; it is the only visually non-neutral one.

**If the prototype continues**, the open threads are:
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
