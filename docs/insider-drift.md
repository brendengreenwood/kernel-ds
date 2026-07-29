# Kernel Insider — drift register

Branch `claude/kernel-insider-portal-fvqfq2` builds **Kernel Insider**
(`kernel-app/`), a second application on the Kernel design system, styled
toward a dark premium-analytics look.

This file is the **complete record of how Insider differs from the design
system** — every token remapped, every component restyled, every DS source
change, and every place the app knowingly departs from a project convention.

It exists because **the branch may never merge.** Each entry says what
changed, why, and whether it is worth keeping on its own.

**Nothing here is hidden inside components.** Insider changes the DS through
exactly three mechanisms, in increasing order of intrusiveness:

| Layer | File | What it can do | Reversible by |
|---|---|---|---|
| 1. Token override | `kernel-app/src/index.css` | Remap semantic role tokens | deleting the `.dark` block |
| 2. Modification layer | `kernel-app/src/insider-layer.css` | Restyle components via `data-slot` | deleting the file |
| 3. DS source edits | `kernel-portal/src/**` | Change the system itself | listed in Part 4 |

Layers 1–2 fork nothing: delete them and the app renders stock Kernel.
Layer 3 is the only part that touches the shared system, and it is
deliberately small — six changes, four of them plain bug fixes.

---

## Summary

| Part | Area | Count | Merge-worthy on its own? |
|---|---|---|---|
| 1 | Attachment / build wiring | 7 | no — Insider-specific |
| 2 | Token drift | 27 tokens + 2 structural inversions | no — that *is* the look |
| 3 | Modification layer | 8 rule groups | no — Insider-specific |
| 4 | **DS source changes** | 6 | **yes — 4 are bug fixes** |
| 5 | App-level convention departures | 6 | n/a — judgment calls to review |

---

# Part 1 — How Insider attaches to the DS

Insider consumes the design system **at source**, not as a copied fork and not
as a published package. This is the single most important structural fact
about the experiment: there is exactly one copy of every component, and
Insider renders the live one.

| # | Where | What |
|---|---|---|
| 1.1 | `vite.config.ts` | `@` → `../kernel-portal/src`, `@app` → `./src`. So `@/components/ui/table` in Insider *is* the portal's Table. |
| 1.2 | `vite.config.ts` | `resolve.dedupe: ["react", "react-dom", "recharts"]` — two `node_modules` trees are in play, and React breaks if instantiated twice. |
| 1.3 | `vite.config.ts` | `server.fs.allow` widened to the repo root so Vite may read outside the app dir. |
| 1.4 | `tsconfig.json` | Mirrors the aliases, and **pins `react`/`react-dom` types to the app's own `@types`** — otherwise the two trees produce duplicate-identifier errors. |
| 1.5 | `src/index.css` | `@import` of the portal's `index.css` (all DS tokens) + `@source "../../kernel-portal/src"` so Tailwind v4 scans DS component source and generates their utilities. |

Insider installs only `react`, `react-dom`, `react-router-dom`, `recharts`.
Everything the DS components need (`@base-ui/react`, `@mdi/js`, …) resolves
from `kernel-portal/node_modules`. **This is why the Netlify build installs
both packages** (1.6).

**1.6 — Deploy routing** (`netlify.toml`, repo root). A branch-scoped context
overrides the build so the preview serves Insider instead of the portal:

```toml
[context."claude/kernel-insider-portal-fvqfq2"]
  base = "/"                       # build from the repo ROOT, both packages present
  command = "npm --prefix kernel-portal install … && npm --prefix kernel-app install … && npm --prefix kernel-app run build"
  publish = "kernel-app/dist"
```

`main` and every other branch keep building `kernel-portal` untouched. The
root SPA redirect (`/* → /index.html`) already covered deep links, so
Insider's client routes work on a hard load with no extra config.

> Watch item: this block names the branch literally. Renaming the branch
> silently reverts the preview to the portal.

**1.7 — Pre-paint theme script** (`index.html`). Dark is Insider's default
identity, so `<html class="dark">` is set in the markup and a small inline
script reconciles it with `localStorage` before first paint; `next-themes`
takes over on mount. Without this the app flashed light on every load.

---

# Part 2 — Token drift

All of it lives in one `.dark` block in `kernel-app/src/index.css`, plus one
`:root` line. **Every override points at a DS *scale* token** (`--neutral-*`,
`--brand-*`, `--error-*`, `--chart-*`) rather than a hand-picked colour, so
Insider still rides the system's ramps — it just points the semantic roles at
different rungs.

`--chart-1..5` are **deliberately not overridden**: charts, `--primary`,
`--ring` and `--sidebar-primary` all keep the Kernel green ramp.

## 2.1 Two structural inversions

These matter more than any individual value.

**(a) The elevation model is inverted.** Kernel's dark theme *recesses* cards
— they are darker than the canvas. Insider *raises* them:

| Role | DS dark (L) | Insider (L) | Direction |
|---|---|---|---|
| `--background` | 0.2605 | `--neutral-900` → 0.213 | canvas darker |
| `--card` / `--popover` | 0.2128 | `--neutral-800` → 0.270 | surface lighter |

The two are almost exactly **swapped**: Insider's canvas equals the DS's card
lightness, and Insider's card equals the DS's canvas. Cards now float above
the page instead of sinking into it — the single change most responsible for
the "premium analytics" read. `--sidebar` drops further still, to
`--neutral-950` (0.165), so the rail recedes behind the floating inset panel.

**(b) Radius is 3.5× the system default.**

| | DS | Insider |
|---|---|---|
| `--radius` | `0.25rem` (4px) | `0.875rem` (14px) |

Kernel is a nearly square system; Insider is a soft-cornered one. This one
line cascades through every card, input, popover and button. It also proved
too round at control heights, which is why the modification layer steps
buttons back down (3.2).

## 2.2 Full token table

`--spacing` is `0.24rem` (3.84px) in Kernel — worth knowing when reading the
`calc()`s in Part 3.

| Token | DS dark | Insider | Note |
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
| `--sidebar-accent` | `oklch(0.4373 …)` | `--brand-900` | |
| `--sidebar-accent-foreground` | green | `--neutral-50` | de-greened |
| `--sidebar-border` | `oklch(0.3959 …)` | `--neutral-800` | |

> **Caveat that bit us: `--muted` now equals `--card`.** Anything the DS
> styles with `bg-muted` on a card surface is invisible in Insider. This is
> exactly why the `Table striped` prop uses a `foreground/5` overlay rather
> than `bg-muted` (4.1) — a `muted`-based stripe would have rendered as
> nothing. Any future DS component leaning on `muted` for separation needs the
> same treatment.

**Light mode is untouched.** Insider overrides only `.dark`, so light mode is
stock Kernel with the larger radius. That is intentional — dark is the app's
identity — but it does mean the two themes are not equally designed.

---

# Part 3 — The modification layer

`kernel-app/src/insider-layer.css`. Restyles live DS components through their
shadcn `data-slot` hooks plus three opt-in markers the app sets itself
(`data-insider-kpi`, `data-insider-segmented`, `data-insider-detail`). No
component is forked.

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
| 3.3 | `[data-insider-kpi]` | green hover accent via `outline` (not `border`, so the DS hairline ring survives); `--duration-base` / `--ease-out` | components |
| 3.4 | `[data-insider-segmented]` | outline ToggleGroup → filled pill with highlighted active segment | components |
| 3.5 | table head/cell | horizontal padding → 4 units; vertical → 3 units | unlayered `!important` |
| 3.6 | first/last cell | edge inset → 6 units, so text never sits on the container border | unlayered `!important` |
| 3.7 | `[data-insider-detail]` | padding → 0; the inset panel supplies its own | unlayered `!important` |
| 3.8 | cells inside `[data-insider-detail]` | denser step: 3 units, edges 4 — the panel carries 12 columns | unlayered `!important` |

3.2 exists because of the radius inversion in Part 2: 14px suits Insider's
roomy cards but reads too round on a 38px control. 10.16px also matches the
compact select triggers, so the filter row is coherent.

---

# Part 4 — Changes to the design system itself

**This is the part that matters if Insider is abandoned.** Six changes, all in
`kernel-portal/`. Four are bug fixes the portal benefits from with no Insider
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
detail rows flips parity mid-table. Insider's Producers table therefore
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
correctly and is conventional for dashboards, but it is the one place Insider
bends the colour *rules* rather than the colour *values*.

---

# Part 6 — What Insider actually is

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
- `contrast-audit` — unchanged (Insider adds no new colour pairs; it re-points
  roles at existing audited scales)
- `mobile-audit` at 390px on `/`, `/producers`, `/scenarios` — **0 horizontal
  overflow, 0 clipped, 0 sub-16px inputs**. One sub-44px hit area remains: a
  compact select trigger at 40px, which decision-0007 explicitly sanctions
  ("compact sizes 40px").

Runtime-verified by hand: active-pill hover inert while inactive still
responds; row click expands with no chevron double-toggle; button radius
10.16px; icon padding 6px/10px; nested detail table not striped by the outer
table's rule.

**Not verified:** light mode is stock-plus-radius and has had far less
attention than dark. `/settings` is a rail entry with no page.

---

# Part 8 — If we pick this up

**If Insider is abandoned**, take Part 4 items **4.2–4.5**. They are bug
fixes, they stand alone, and they need nothing from Insider. **4.3
(`SidebarInset min-w-0`) is the one to take regardless** — it affects every
consumer of the sidebar today. Sanity-check 4.4's blast radius on the portal's
icon buttons first; it is the only visually non-neutral one.

**If Insider continues**, the open threads are:
- Light mode deserves a real pass, or an explicit decision that Insider is
  dark-only.
- The four Producers filter dropdowns are presentational placeholders, pending
  the more advanced filtering planned.
- `/settings` is unbuilt.
- The Producers inset scrolls horizontally to reach Accept/Reject at 1600px —
  twelve data columns plus two buttons will not fit narrower without dropping
  or collapsing columns.
- 5.3–5.5 (arbitrary type sizes, the raw `<button>`, the generic helpers)
  should either be promoted into the DS or brought back onto the scale.
