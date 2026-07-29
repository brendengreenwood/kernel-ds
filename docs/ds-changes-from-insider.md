# Design-system changes made from Kernel Insider

Branch `claude/kernel-insider-portal-fvqfq2` builds **Kernel Insider**
(`kernel-app/`) on top of the design system. Building a real second consumer
surfaced defects in `kernel-portal/` that were invisible with only the portal
using them.

This file exists because **the branch may never merge**. It is the pick-up
list: each entry is self-contained, says whether it is general-purpose or
Insider-flavoured, and can be cherry-picked on its own.

Everything below is in `kernel-portal/` (the DS). Changes confined to
`kernel-app/` are not listed — that app is the experiment, not the system.

| # | Component | Change | Kind | Cherry-pick alone? |
|---|-----------|--------|------|--------------------|
| 1 | `table.tsx` | `striped` prop (zebra rows) | feature | yes (+ its doc entity) |
| 2 | `table.tsx` | `striped` scoped to own rows | **bug fix** | yes |
| 3 | `sidebar.tsx` | `min-w-0` on `SidebarInset` | **bug fix** | yes |
| 4 | `button.tsx` | optical icon padding actually fires | **bug fix** | yes |
| 5 | `tabs.tsx` | no hover styling on the active tab | **bug fix** | yes |
| 6 | `icon.tsx` | `Archive` + `Ban` glyphs | additive | yes |

---

## 1. `Table` gains a `striped` prop

**Files:** `src/components/ui/table.tsx`, `src/lib/component-docs/table.ts`

Zebra-stripes alternating body rows for dense operational tables. Implemented
as a `bg-foreground/5` overlay (not `bg-muted`) so it reads on any surface no
matter how a theme relates `--muted` to `--card` — in Insider those two are
the same colour, and a `muted`-based stripe would have been invisible. Sets a
`data-striped` attribute for styling hooks, and is documented as an `api`
prop on the Table doc entity (parity gate covers it).

**Caveat for consumers:** striping is `nth-child`-based, so a table with
expandable detail rows will flip parity mid-table. Insider's Producers table
therefore stripes by data index instead. If we want first-class expandable
tables, the DS answer is probably group-wise striping (one `<tbody>` per
row + detail) — not attempted here.

## 2. `striped` no longer leaks into nested tables

**File:** `src/components/ui/table.tsx`

The rule was a **descendant** selector, `[&_tbody_tr:nth-child(even)]`, so any
table nested inside a striped table inherited the striping. Scoped to the
table's own rows:

```diff
-striped && "[&_tbody_tr:nth-child(even)]:bg-foreground/5"
+striped && "[&>tbody>tr:nth-child(even)]:bg-foreground/5"
```

Found by putting a bid-detail table inside an expanded producer row. For a
flat table the two selectors are identical, so this is behaviour-preserving
everywhere else.

## 3. `SidebarInset` can shrink (`min-w-0`)

**File:** `src/components/ui/sidebar.tsx`

`SidebarInset` is a `flex-1` flex child, which means `min-width: auto` — it
refuses to shrink below its content's intrinsic width. Any page with content
wider than the viewport (a wide data table, a chart) therefore pushed **the
whole page** sideways past the sidebar instead of letting inner
`overflow-x-auto` containers scroll.

```diff
-"relative flex w-full flex-1 flex-col bg-background …"
+"relative flex w-full min-w-0 flex-1 flex-col bg-background …"
```

Measured on the Producers page at 1500px: document `scrollWidth` 1756 → 1500,
and the table's own scroll container started working. **This one is worth
taking regardless of Insider's fate** — it affects every app using the
sidebar, portal included.

## 4. `Button`'s optical icon padding actually fires

**File:** `src/components/ui/button.tsx`

The size variants already encoded the right idea — an icon is optically
lighter than a text edge, so the side it sits on wants tighter padding — via
`has-data-[icon=inline-start]:pl-2.5` and friends. But that depends on the
glyph carrying `data-icon`, and **only `pagination.tsx` ever set it** (2 call
sites). Every other icon button in the system rendered with even padding and
looked slightly off-balance.

CSS alone cannot fix this: `:first-child`/`:last-child` ignore text nodes, so
in `<Button><Check /> Accept</Button>` the `<svg>` is *both* the first and the
last element child. A `has-[>svg:first-child]` approach tightens both sides
(measured: 6px/6px — verified wrong before switching approach).

So the component now inspects its children and flags the button itself:

```tsx
const leadIcon  = hasLabel && React.isValidElement(kids[0])
const trailIcon = hasLabel && React.isValidElement(kids[kids.length - 1])
// → data-lead-icon / data-trail-icon on the button
```

with `data-lead-icon:pl-2.5 data-trail-icon:pr-2.5` per size. Measured after:
leading-icon button is `padding-left: 6px` / `padding-right: 10px`. Icon-only
buttons get neither flag (they are square and have no horizontal padding to
correct). `data-icon` remains as a manual escape hatch for glyphs that are not
direct first/last children.

**Note:** this is a visual change to *every* icon+label button in the portal —
small, and in the direction the DS already intended, but not invisible.

## 5. Tabs: no hover styling on the active tab

**File:** `src/components/ui/tabs.tsx`

Hover is an affordance for somewhere you can *go*; the active tab is already
where you are, so hovering it should be inert. Every variant applied its hover
style unconditionally. Most visibly, hovering an active **pill** re-coloured
its label, and hovering an active **folder** tab swapped its card-coloured
background for `muted/60` — undoing the effect that makes the tab read as
joined to the panel.

Each hover rule is now `not-data-active:`-guarded (pill, underline, folder).
Verified: active pill colour is unchanged on hover, inactive pills still
respond.

## 6. Icon shim: `Archive`, `Ban`

**File:** `src/components/ui/icon.tsx`

`Archive` → `mdiArchiveArrowDownOutline`, `Ban` → `mdiCancel`. Additive, one
line each, per the shim convention in `CLAUDE.md`. Zero risk.

---

## What is *not* here (Insider-only, deliberately)

These live in `kernel-app/` and should **not** be lifted into the DS:

- **Token override layer** (`src/index.css`) — remaps semantic role tokens
  onto DS *scale* tokens for the dark-analytics look. `--chart-*` is left
  alone so charts keep the Kernel green ramp.
- **Modification layer** (`src/insider-layer.css`) — `data-slot`-keyed
  restyling: roomier table cells, denser detail-panel cells, KPI hover accent,
  segmented-control pill, and a tighter button radius
  (`calc(var(--radius) - var(--spacing))`, because Insider's 14px `--radius`
  suits its cards but reads too round at control heights). Unlayered +
  `!important` so it beats Tailwind's `utilities` layer.
- Index-based row striping and the clickable-row expander on the Producers
  page — app patterns, not DS API.

If Insider is abandoned, items 2–5 above are the ones worth rescuing: they are
bug fixes the portal benefits from with no Insider dependency.
