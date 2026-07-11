# a11y review — batch 6: Patterns & domain (2026-07-11)

Campaign batch 6 of 6 (final). 11 rows reviewed with the generalized harness
(`review-runner.mjs` + `batch-6.config.mjs`, proof-side). Pattern/domain-page
tier of the checklist: landmarks & headings sanity, named-control scan,
tab-through of interactive exemplars, focus-visible spot-check (light+dark),
not-color-only on status/state indicators, mobile audit per route.

Evidence: `<PROOF>\gates\batch-6.txt` (70 pass / 0 fail + 11 mobile audits),
screenshots in `<PROOF>\screenshots\batch-6\`, red/green in `<PROOF>\fixes\`
(`b6-red-run1.txt` → `b6-01-mechanical-fixes.md`).

## Verdicts

| Component | Route | Landmarks/headings | Controls named | Tab-through | Focus ring (L+D) | Not color-only | Mobile 390px | Verdict |
|---|---|---|---|---|---|---|---|---|
| Navigation | `/navigation` | PASS | PASS | PASS | PASS (module switcher) | PASS (menu opens/Escape returns) | 0/0/0/0 | **reviewed** |
| Dashboard | `/dashboard` | PASS | PASS | PASS | PASS | PASS (delta pills: icon + text) | 0/0/0/0 | **reviewed** |
| Filtering | `/filters` | PASS | PASS | PASS | PASS (chip remove ×) | PASS (chips text-labelled) | 0/0/0/0 | **reviewed** |
| Advanced filtering | `/filtering-advanced` | PASS | PASS | PASS | PASS (select trigger) | PASS (builder comboboxes + named removes) | 0/0/0/0 | **reviewed** |
| CRUD patterns | `/patterns` | PASS | PASS | PASS | PASS | PASS (row-select checkboxes labelled) | 0/0/0/0 | **reviewed** |
| Flows | `/flows` | PASS | PASS | PASS | PASS | PASS (stepper: check icons + numbers + "Step 3 of 4" text) | 0/0/0/0 | **reviewed** |
| Origination flow | `/origination` | PASS | PASS | PASS | PASS | PASS (StatusBadge + CommodityLabel all text-labelled) | 0/0/0/0 | **reviewed** |
| Pricing worksheet | `/pricing` | PASS | PASS | PASS | PASS (worksheet input) | PASS (commodity text; inputs htmlFor-associated) | 0/0/0/0 | **reviewed** |
| Modals | `/modals` | PASS | PASS | PASS | PASS | PASS (dialog: named, modal, Escape returns focus) | 0/0/0/0 | **reviewed** |
| Contract detail | `/contract` | PASS | PASS | PASS | PASS | PASS (table semantics + status text) | 0/0/0/0 | **reviewed** |
| Settlement statement | `/settlement` | PASS | PASS | PASS | PASS | PASS (table + settled text + net-payable AX name) | 0/0/0/0 | **reviewed** |

**11 reviewed, 0 backlogged.**

## Mechanical fixes (red/green in `<PROOF>\fixes\b6-01-mechanical-fixes.md`)

- **Duplicate `<main>` landmark, portal-wide** — `portal-layout.tsx` nested a
  second `<main>` inside `SidebarInset`'s `<main>` (vendored shadcn). Inner one
  is now a `<div>`; every portal page has exactly one main landmark. This fix
  was surfaced by this batch but benefits all routes.
- **Focus-visible utilities** on 3 raw `<button>`s in `filters.tsx` (chip
  remove, Clear all, Save view) — previously no visible focus indicator.
- **Label association** (`htmlFor`/`id`): 5 pairs in `patterns.tsx`, 2 in
  `flows.tsx`, 1 in `origination.tsx` — labels were visible but not announced.
- **aria-labels**: builder value + custom-range inputs in
  `filtering-advanced.tsx` (3); "More actions" icon button in `patterns.tsx`.

## Disclosed scope limits

- **Record tabs on `/navigation` are static `<span>` specimens** (visual
  illustration with a "tab panel" placeholder), verified non-interactive — no
  keyboard/AT trap. The real Tabs primitive is reviewed in
  `tabs-review-2026-07.md`. Same treatment as batch 4's sort-header specimens.
- Heading convention verified as h2 page title → h3 card titles → h4 subheads,
  no h1 on portal pages (portal-wide convention, batch-4 precedent).
- Extra `<nav>` landmarks on `/patterns` and `/flows` come from the Pagination
  component (`role=navigation`, labelled) — correct, not duplication.
- Modality on `/modals` verified via the batch-2 method (Base UI sets
  `aria-hidden` on the app wrapper rather than `aria-modal`).
- AnimatedNumber values on `/dashboard` and `/settlement` verified via the CDP
  accessibility tree (batch-5 method): `role=image` with the numeric value as
  the accessible name.

## Harness notes (methodology fixes, no repo change)

First run 46/23; four harness bugs fixed before verdicts were trusted: Base UI
serialization inputs (aria-hidden, clip-path) wrongly counted as unnamed
controls; record-tab specimens wrongly expected to be a tablist; modality probe
looked at direct body children instead of the trigger's aria-hidden ancestor;
AX-name probe used a malformed CDP call. Details in the fixes record.
