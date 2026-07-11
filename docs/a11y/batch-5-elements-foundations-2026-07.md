# a11y review — batch 5: Elements & foundations — 2026-07-11

Fifth batch of the per-component a11y review campaign (methodology: `tabs-review-2026-07.md`,
generalized harness). 5 rows: Form elements, Charts (element), Border beam, Commodity tags,
Animated number. **4 reviewed, 1 backlogged.**

Evidence: harness transcript `gates\batch-5-final.txt` (23 pass / 1 fail), focus-ring screenshots
(light+dark), mobile audits at 390px on all 5 routes — proof bundle
`kernel-ds-github-button-a11y-campaign.proof\` (gates\, screenshots\batch-5\, fixes\).

## Where each row was exercised

| Row | Route | Exemplars |
|---|---|---|
| Form elements | `/forms` | Field anatomy, input groups, steppers, password, selection-control states |
| Charts (element) | `/charts` | Weekly deployments (bar) + Active users (area) — same exemplars batch 4 used for the Chart *component*; this row reviews the page-level context (titles, ticks, legend) |
| Border beam | `/border-beam` | beamed Button/Input/Card demos + animate toggle |
| Commodity tags | `/colors` | 4 `<CommodityBadge>` (corn/canola/soybeans/wheat); `<CommodityLabel>` has no exemplar on `/colors` (verified 0 present — used in table cells elsewhere; same dot+text anatomy) |
| Animated number | `/dashboard` | 4 KPI `<AnimatedNumber>` instances (482k · 128 · −0.12 · $2.41M) |

## Verdicts

| Component | Check | Verdict | Evidence |
|---|---|---|---|
| Form elements | Headings sanity (h2 + h4 subheads) | PASS | h2=1 h4=7 |
| Form elements | Inputs programmatically labelled | **FAIL → backlog** | 23 of 41 controls unnamed — `Field` helper renders `<Label>` without `htmlFor` (form-elements.tsx:56); visual adjacency only |
| Form elements | All buttons named | PASS (after fix b5-01) | 13 buttons, 0 unnamed — 3 icon buttons gained `aria-label` (red/green in fixes\b5-01) |
| Form elements | Tab-through exemplars | PASS | 12 stops, all visible |
| Form elements | Focus-visible ring | PASS | light+dark, `0 0 0 3px` ring (screenshots) |
| Form elements | Password toggle state label | PASS | `aria-label` Show/Hide password |
| Charts | Headings + containers | PASS | h2=1, 2 chart containers |
| Charts | Charts titled by card header | PASS | "Weekly deployments", "Active users" |
| Charts | accessibilityLayer | PASS | both SVGs `role=application` `tabindex=0` (keyboard-navigable) |
| Charts | Axis ticks are text | PASS | 14 `<text>` ticks (Mon…) — values not color-only |
| Charts | Legend series named | PASS | Production / Preview text labels |
| Border beam | Beamed button keeps name | PASS | "Get quote" |
| Border beam | Demo switch labelled | PASS | `role=switch` accessible name via `Label htmlFor` (resolves through Base UI hidden input) |
| Border beam | Beam layers decorative | PASS | animated layers: `pointer-events:none`, no text, unfocusable |
| Border beam | Beamed button focus ring | PASS | light+dark (screenshots) |
| Border beam | Reduced motion | PASS | 0 elements animating under `prefers-reduced-motion` (package ships its own `animation: none !important` rule; global 0.01ms rule also applies) |
| Commodity tags | Text labels (not color-only) | PASS | all 4 badges carry commodity name as text; hue is redundant coding (decision 0013) |
| Commodity tags | Semantics | PASS | plain `<span>` host, no bogus role, decorative dot empty |
| Commodity tags | Contrast | PASS (global) | commodity pairs are in the repo `contrast-audit.mjs` (section d, 70-pair run — 0 below AA) |
| Animated number | AT exposure | PASS | `role=image`, name = formatted value (482k · 128 · −0.12 · $2.41M) via ElementInternals (number-flow lite.mjs:92,105) — read from the real AX tree via CDP, since internals-ARIA never reflects to DOM attributes |
| Animated number | Reduced motion | PASS | `respectMotionPreference` default true; AX name final+stable 250ms after load under emulated reduce (decision 0018) |
| Animated number | Digit encapsulation | PASS | digits live in shadow DOM; AT gets a single labelled image node, not digit soup |
| all 5 routes | Mobile audit @390px | PASS* | `/charts` `/border-beam` `/colors` `/dashboard` 0/0/0/0; `/forms` reports one sub-16px text control plus the switch rail h=18px. Because Form elements is backlogged/pending, these are disclosed with that row rather than treated as clean. |

## Backlogged (row stays `pending`)

- **Form elements** — the `Field` demo helper doesn't associate labels with controls
  (`<Label>` without `htmlFor`/`id`; 23 of 41 controls have no programmatic name). Not
  mechanical: needs `useId` + id plumbing through the `Field`/`InputGroup` composition and
  its ~20 call sites. Tracked in STATE backlog. The reference page currently demonstrates
  an anti-pattern, so the row stays `pending` until the helper is fixed.

## Scope limits, disclosed

- Charts row shares exemplars with batch 4's Chart component row — this pass reviewed the
  page context (titles/ticks/legend), not the wrapper internals again.
- `CommodityLabel` (quiet form) has no exemplar on `/colors`; anatomy is identical
  (dot + text) and its variants share the badge's audited hues.
- Border beam is decorative by contract ("purely decorative" per its own demo lead);
  review scope was "does it harm a11y" (name preservation, focus, motion), not AT value.
- Harness methodology fixes this batch (config-side only): recharts tick selector, Base UI
  switch hidden-input id indirection, CSS-valid selector for `focusRingCheck`, and CDP
  AX-tree reads for ElementInternals ARIA.
