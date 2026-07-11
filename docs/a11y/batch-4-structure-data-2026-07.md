# a11y review — batch 4: structure & data — 2026-07-11

Per-component accessibility review (campaign batch 4 of 6), methodology from
`tabs-review-2026-07.md`. Harness: campaign proof dir
`harness/review-runner.mjs` + `batch-4.config.mjs`; transcript
`gates/batch-4.txt` (final run: **39 pass / 0 fail**), ring screenshots in
`screenshots/batch-4/`. Served production build on `:4173`.

10 rows: Scroll Area, Resizable, Sidebar, Table, Data Table, Chart, Calendar,
Date Picker, App shell (pattern), Tables (element).

## Where each row was exercised

| Row | Route | Exemplar |
|---|---|---|
| Scroll Area | `/components/scroll-area` | releases list in `ScrollAreaCluster` |
| Resizable | `/components/scroll-area` | two-panel group with handle (shared cluster) |
| Sidebar | `/appshell` | **the portal's own rail** (per its meta note) — trigger, rail links, collapse state |
| Table | `/components/table` | `TableCluster` static table |
| Data Table | `/components/table` | tanstack sortable table (same cluster) |
| Chart | `/charts` | bar + area charts in cards |
| Calendar | `/components/calendar` | single-select month (`CalendarCluster`) |
| Date Picker | `/components/calendar` | popover + calendar composition (same cluster) |
| App shell | `/appshell` | shell + page-header specimens |
| Tables (element) | `/tables` | density/variant/sortable-specimen/expandable tables |

## Verdicts

| Component | Roles/ARIA | Keyboard | Focus ring (light/dark) | Not color-only | Touch targets 390px |
|---|---|---|---|---|---|
| Scroll Area | PASS (root/viewport/scrollbar/thumb slots) | PASS (viewport focusable; ArrowDown scrolls 0→136) | PASS 3px ring on viewport | n/a | PASS 0/0/0/0 |
| Resizable | PASS (`role=separator`, `aria-valuenow`, `tabindex=0`) | PASS (ArrowLeft resizes, valuenow 35→20) | PASS — **vendored 1px ring** (shadcn upstream `ring-1`), visible both modes | n/a | PASS 0/0/0/0 |
| Sidebar | PASS (trigger named "Toggle Sidebar"; 52 rail links all named `<a>`) | PASS (toggle flips `data-state` expanded↔collapsed↔expanded) | PASS 3px ring on trigger | n/a | PASS 0/0/0/0 (`/appshell`) |
| Table | PASS (native table/thead/th/tbody; 4 th, 4 rows) | n/a (static) | n/a | n/a | PASS 0/0/0/0 |
| Data Table | PASS (sort control is a real `<button>`; `aria-sort` reflects state — **fix b4-01**) | PASS (Enter toggles sort, rows reorder) | PASS 3px ring on sort button | sort direction shown by icon + aria-sort | PASS 0/0/0/0 |
| Chart | PASS (2 `ChartContainer`s, titled by card headers) | n/a (non-interactive viz) | n/a | PASS (legend pairs each series color with a text label) | PASS 0/0/0/0 |
| Calendar | PASS (month `role=grid`, 35 gridcells; nav buttons named; `aria-selected` on selected day) | PASS (ArrowRight moves day focus 10→11) | n/a (day buttons use rdp selected/focus styles; nav = Button ghost) | n/a | see disclosed exception below |
| Date Picker | PASS (trigger named with the chosen date) | PASS (Enter opens calendar popover; Escape closes and returns focus to trigger) | PASS 3px ring on trigger | n/a | same route as Calendar |
| App shell | PASS (h2 page title + subheads; all exemplar buttons named; no fake-interactive specimens) | PASS (tab-through of named buttons) | spot-checked via Sidebar trigger on same page | n/a | PASS 0/0/0/0 |
| Tables (element) | PASS (h2 + h4 subheads; 11 named toggle buttons; expand toggle exposes `aria-expanded` — **fix b4-02**) | PASS (expand toggle clickable/focusable button) | inherited from Button/Checkbox (batch 1) | status column uses StatusBadge (dot + text, batch 3) | PASS 0/0/0/0 |

## Mechanical fixes (red/green in proof `fixes/`)

- **b4-01** `gallery-data.tsx` — sortable `<TableHead>` now sets
  `aria-sort` (`ascending`/`descending`, absent when unsorted). Attribute only.
- **b4-02** `tables.tsx` — expandable-row toggle button now sets
  `aria-expanded={isOpen}`. Attribute only.

## Disclosed scope limits & exceptions

- **Calendar day-grid touch targets:** at 390px, day buttons are 27×27px —
  the one hit-area flag on `/components/calendar`. Passes WCAG 2.5.8 AA
  (≥24px); below the project's stricter 44px bar. The decision-0007
  pseudo-element extension is not applicable in a dense grid (it would create
  overlapping targets), and resizing cells is a styling change outside this
  campaign's do-not list. Recorded as a watch item in STATE (alongside the
  switch-rail exception).
- **Resizable handle ring is 1px**, not the 3px control ring — vendored
  shadcn styling (`resizable.tsx` `focus-visible:ring-1`). Visible in both
  modes (screenshots); ring-width harmonization would be a styling change,
  noted in STATE watch item, not a blocker.
- **`/tables` sort headers are visual specimens** — static spans showing the
  sort-indicator styling, no handlers. The working sortable implementation is
  Data Table on `/components/table`, reviewed above.
- **Charts have no `accessibilityLayer`** (recharts keyboard layer) and no
  data-table alternative; series values are reachable via pointer tooltip
  only. Titles + text legends give context. Noted as a follow-up candidate,
  not an AA failure for decorative demo charts.
- **App shell side-nav items are static `<div>` specimens** (no handlers, no
  pointer cursor) — illustration, not fake interactivity (asserted).
- Reduced motion: no bespoke animations in this batch (global
  `prefers-reduced-motion` collapse verified in batch 3).

## Harness corrections this batch (config-only)

- Calendar opens on today's month, but the demo selects Jun 7 2026 — the
  `aria-selected` check now navigates to June before asserting.
- Portal subhead convention is `h4` (`Subhead`), not `h3` — headings check
  corrected.
- Expand-toggle check asserted `false→true` but the first specimen row is
  open by default — now asserts a flip in either direction.
