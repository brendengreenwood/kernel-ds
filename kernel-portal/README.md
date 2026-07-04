# Kernel — shadcn/ui design system

A production-ready design-system portal for the **Kernel** theme, built on
[shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4 + Vite + React Router.

This is a **runnable app** — `npm install && npm run dev` renders the full
system at `/`: a two-layer color token set, a 12-step type scale, every
component in the registry, the form-element toolkit (states / sizes / affixes),
and the CRUD patterns — all themed with Kernel tokens in light + dark.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
```

Two repeatable audits live in `scripts/` (see `docs/a11y/` and decision 0007):

```bash
node scripts/contrast-audit.mjs                 # WCAG ratios for every rendered token pair
node scripts/mobile-audit.mjs <url> [url...]    # 390px scan: overflow, clipped content,
                                                # sub-16px inputs, <44px effective hit areas
                                                # (needs playwright; PW_EXECUTABLE to point
                                                # at an existing chromium)
```

## Stack

- **Vite 8** + React 19 + TypeScript, `@/*` aliased to `src/*`
- **React Router** — the portal mounts at `/` (`src/main.tsx` → `src/pages/portal.tsx`)
- **Tailwind CSS v4** via `@tailwindcss/vite`; all tokens live in `src/index.css`
- **shadcn/ui** components in `src/components/ui/` (**Base UI** primitives,
  `base-nova` style — migrated from Radix 2026-07-04 per decision 0005;
  reports in `.migration/`)
- `next-themes` drives light/dark via the `class` attribute (works outside Next)

## File map

```
index.html                     ← title + font-sans/antialiased on body
src/
  index.css                    ← Kernel theme tokens (scales, roles, statuses)
  main.tsx                     ← ThemeProvider + BrowserRouter + Toaster
  pages/
    portal.tsx                 ← the portal page (all sections)
  lib/utils.ts                 ← cn() helper
  components/
    theme-provider.tsx
    mode-toggle.tsx
    ui/
      alert.tsx                ← + success / warning / info variants (replaces stock)
      badge.tsx                ← + success / warning / info variants (replaces stock)
      status-badge.tsx         ← Kernel-only <StatusBadge> (lifecycle states)
      …                        ← the rest from `npx shadcn add` (button, input, …)
    portal/
      app-sidebar.tsx          ← real shadcn <Sidebar> nav
      foundations.tsx          ← Colors · Typography · Spacing · Elevation
      gallery-forms.tsx        ← Button · Toggle · Inputs · Form · Slider · OTP …
      gallery-data.tsx         ← Card · Table · Data Table · Progress · Skeleton …
      gallery-overlays.tsx     ← Alert · Dialog · Sheet · Drawer · Popover · Sonner …
      gallery-nav.tsx          ← Tabs · Breadcrumb · Pagination · Menubar · Command …
      gallery-misc.tsx         ← Accordion · Calendar · Carousel · Resizable …
      form-elements.tsx        ← Input states · sizes · affixes · file upload …
      tables.tsx               ← Table system: density · variants · sort · sticky · states
      charts.tsx               ← shadcn <ChartContainer> (recharts)
      app-shell.tsx            ← App shell + page-header pattern
      nav-patterns.tsx         ← Navigation: module switcher · grouped rail · record tabs
      dashboard.tsx            ← KPI cards · sparklines · activity feed
      filters.tsx              ← Filter bar · chips · popover · saved views
      filtering-advanced.tsx   ← Filter builder · column controls · date presets
      patterns.tsx             ← CRUD recipes: list view · form · detail · empty
      flows.tsx                ← Multi-step wizard · settings page
      contract-detail.tsx      ← Domain: contract header · terms · fills · activity
      settlement.tsx           ← Domain: settlement statement — loads · deductions · net payable
      section.tsx              ← shared <Section> / <Demo> layout helpers
```

> **Customized components:** `ui/alert.tsx` and `ui/badge.tsx` replace the
> stock shadcn versions — they add first-class `success` / `warning` / `info`
> variants wired to the notification scales (light + dark).
> `ui/status-badge.tsx` is Kernel-only — `<StatusBadge status="…" />` for the
> load/contract lifecycle (draft, pending, booked, in_transit, delivered,
> settled, on_hold, rejected, cancelled, expired), each on a distinct
> `--status-*` hue. Use it for *persistent state*; use `Badge`/`Alert`
> variants for *event outcomes*.
> `ui/command.tsx` diverges from stock in one class: the palette input is
> `text-base md:text-sm` so iOS Safari doesn't zoom on focus (decision 0007).

> **Touch ergonomics (decisions 0007 + 0009):** `src/index.css` ends with
> a `@media (pointer: coarse)` block. Primary controls (button, input,
> input-group, select-trigger slots) visibly grow to 44px min-height
> (compact sizes 40px); compact controls that stay small (toggles,
> pagination, menubar triggers) get a ≥44px effective hit area via an
> invisible `::after`. Checkbox/radio/switch already ship base-nova's
> `after:-inset-*` extensions; `tabs-trigger` is excluded because its
> `::after` draws the active-line indicator.

## Fonts

No web fonts. `--font-sans` and `--font-mono` are native system stacks
(San Francisco / Segoe UI / Roboto for UI; the platform monospace for code),
defined in `src/index.css`. Zero network requests and instant first paint.

---

## Color system

The palette has two layers, both in `src/index.css`:

- **Scales** — absolute, mode-independent ink. `--brand-*` (green) and
  `--neutral-*` ship full 50→950 ramps; the four notification scales
  `--success-*` (emerald), `--warning-*` (wheat), `--error-*` (red),
  `--info-*` (blue) run 50→900. A separate categorical **data-viz** palette — eight hues
  (`--viz-crop`, `--viz-wheat`, `--viz-clay`, `--viz-sky`, `--viz-plum`,
  `--viz-teal`, `--viz-rust`, `--viz-slate`), **each a full 50→950 scale**, with
  `-light` / `-dark` aliases at steps 200 / 700 — keeps chart series from
  reading as a status.
- **Role tokens** — `--primary`, `--background`, `--destructive`, etc. point at
  a scale step and remap between light and dark (e.g. `--primary` =
  `brand-600` in light, `brand-300` in dark).
- **Status tokens** — `--status-*` for the load/contract lifecycle (`draft`,
  `pending`, `booked`, `intransit`, `delivered`, `settled`, `onhold`,
  `rejected`, `cancelled`, `expired`). Each aliases a distinct hue's 500 step so
  a column of statuses stays scannable; the `<StatusBadge>` derives its soft
  fill from the same hue. Use these for *persistent state*, the notification
  scales for *event outcomes*.

All scales are mapped through `@theme inline`, so Tailwind utilities work
directly: `bg-brand-500`, `text-success-700`, `border-warning-300`,
`fill-viz-sky`, `bg-status-settled`, …

---

## Type scale

Native system stacks — `--font-sans` for the interface, `--font-mono` for code
and tabular data. The size ramp is Tailwind's `text-xs`→`text-7xl` plus one
custom step, `text-2xs` (11px / 16px), defined in `src/index.css`.
`foundations.tsx` documents the full ramp, the named semantic styles (Display,
Page title, Card title, Body, Label, Caption, Overline, Numeric, Code), the
four weights, and tabular numerals.

---

## Component coverage (49 / 49)

Accordion · Alert · Alert Dialog · Aspect Ratio · Avatar · Badge · Breadcrumb ·
Button · Calendar · Card · Carousel · Chart · Checkbox · Collapsible · Combobox ·
Command · Context Menu · Data Table · Date Picker · Dialog · Drawer ·
Dropdown Menu · Form · Hover Card · Input · Input OTP · Label · Menubar ·
Navigation Menu · Pagination · Popover · Progress · Radio Group · Resizable ·
Scroll Area · Select · Separator · Sheet · Sidebar · Skeleton · Slider · Sonner ·
Switch · Table · Tabs · Textarea · Toggle · Toggle Group · Tooltip

`combobox`, `data-table`, and `date-picker` are **compositions** (not single
registry items) — the portal builds them from `popover` + `command`,
`table` + `@tanstack/react-table`, and `popover` + `calendar` respectively.

## Porting notes (Next.js → Vite)

The original portal source targeted Next.js App Router. Changes made:

- `app/layout.tsx` → `index.html` + `src/main.tsx` (ThemeProvider, Toaster, router)
- `app/page.tsx` → `src/pages/portal.tsx`
- `app/globals.css` → `src/index.css` (plus `@import "shadcn/tailwind.css"` for
  the current-CLI component variants/utilities)
- Dropped an unused `next/image` import; no other Next APIs were in use
- Newer library APIs: Calendar `initialFocus` → `autoFocus` (react-day-picker v10),
  `ResizablePanelGroup direction` → `orientation` (react-resizable-panels v4),
  lucide has no `Kernel` icon → brand mark uses `Sprout`
- `<StatusBadge>`'s `Status` type now derives from its cva variants so
  `status` props are checked against the real lifecycle union
- A standalone disabled `RadioGroupItem` demo now sits in its own `RadioGroup`
  (radio items throw when rendered outside a group)

## Component status (decision 0006)

Every component/element/pattern carries a lifecycle status —
`experimental` / `ready` / `deprecated` — tracked in
`src/lib/component-meta.ts` and rendered as Primer-style side-rail entries
(maturity pills on non-ready items) plus the **Component status** section
(`#status`). Adding a component means adding a registry entry; signing off
an experimental delta means flipping its entry to `ready` and deleting the
note. A11y review is a separate column, pending the system-wide pass.

## Base UI notes (post-migration)

- Triggers compose via `render={<Button/>}` instead of `asChild` (the vaul
  drawer still uses `asChild`).
- Accordion/ToggleGroup values are arrays; single-open is the default.
- Behavior deltas vs the Radix era, deliberately not patched: tabs activate
  manually (arrow keys move focus, Enter/Space activates), menu
  checkbox/radio items don't close on click, navigation-menu hover delay is
  50ms. Details in `.migration/project.md`.
