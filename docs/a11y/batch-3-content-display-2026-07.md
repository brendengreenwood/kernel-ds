# a11y review — batch 3: Content & display (2026-07-11)

Per-component accessibility review, batch 3 of 6 (campaign plan:
`kernel-ds-github-button-a11y-campaign`). Method and harness identical to
batches 1–2: Playwright checks against the served production build
(`vite preview`, port 4173), per-check PASS/FAIL transcript, focus-ring
screenshots light+dark, mobile audit at 390px per route.

**Result: 15 reviewed, 0 backlogged.** Harness transcript: proof bundle
`gates/batch-3.txt` (40 pass / 0 fail + 10 route mobile audits).
Screenshots: `screenshots/batch-3/` (10 files).

## Where each component was exercised

Aliased anchors disclosed per plan: several rows share a demo page.

| Component | Route exercised | Anchor note |
|---|---|---|
| Accordion | `/components/accordion` | own anchor |
| Collapsible | `/components/accordion` | aliased → `c-accordion` |
| Alert | `/components/alert` | own anchor |
| Badge | `/components/badge` | own anchor |
| Avatar | `/components/badge` | aliased → `c-badge` |
| Card | `/components/card` | own anchor |
| Carousel | `/components/carousel` | own anchor |
| Separator | `/components/separator` | own anchor |
| Aspect Ratio | `/components/separator` | aliased → `c-separator` |
| Progress | `/components/progress` | own anchor |
| Skeleton | `/components/progress` | aliased → `c-progress` |
| Sonner | `/components/sonner` | own anchor |
| Status Badge | `/components/status-badge` | own anchor |
| Breadcrumb | `/components/breadcrumb` | own anchor |
| Pagination | `/components/breadcrumb` | aliased → `c-breadcrumb` |

## Verdicts

All evidence lines below quote `gates/batch-3.txt`; screenshots in
`screenshots/batch-3/`. Mobile audit (touch targets / overflow / clipping /
text size at 390px): **all 10 routes 0/0/0/0** — covers every row below.
Contrast: all token pairs used by these components are inside the repo
`contrast-audit.mjs` 70-pair audit (0 below AA, Phase 0 transcript).

| Component | Check | Verdict | Evidence |
|---|---|---|---|
| Accordion | Roles/ARIA (3 button triggers, `aria-expanded`, `aria-controls` → visible panel) | PASS | transcript |
| Accordion | Keyboard (Enter toggles; Tab moves between triggers) | PASS | transcript; see methodology note 1 |
| Accordion | Focus ring light+dark | PASS | `accordion-ring-{light,dark}.png` |
| Collapsible | Roles/ARIA (`aria-expanded` wiring, content visibility) | PASS | transcript |
| Collapsible | Keyboard (Enter collapses/expands) | PASS | transcript |
| Collapsible | Focus ring light+dark | PASS | `collapsible-ring-{light,dark}.png` |
| Alert | Roles/ARIA (4 exemplars, `role=alert`) | PASS | transcript |
| Alert | Not color-only (icon + title + description on all variants) | PASS | transcript |
| Badge | Not color-only (every variant carries its own text label) | PASS | transcript |
| Badge | Semantics (static `span`, no spurious role/tabindex) | PASS | transcript |
| Avatar | Text alternative (initials fallback text on all 4 exemplars) | PASS | transcript |
| Card | Structure (title/description/content/footer slots) | PASS | transcript |
| Card | Interactive children named + focus ring | PASS | `card-button-ring-{light,dark}.png` |
| Carousel | Roles/ARIA (region + `aria-roledescription=carousel`, slides `group`+`slide`, named prev/next) | PASS | transcript |
| Carousel | Keyboard (prev disabled at start; ArrowRight scrolls; prev enables) | PASS | transcript |
| Carousel | Focus ring light+dark | PASS | `carousel-next-ring-{light,dark}.png` |
| Carousel | Reduced motion (decision 0018 global rule → durations 1e-05s) | PASS | transcript |
| Separator | Roles/ARIA (`role=separator`, both orientations) | PASS | transcript |
| Aspect Ratio | Layout-only wrapper (16:9 box, readable content) | PASS | transcript |
| Progress | Roles/ARIA (`role=progressbar`, valuenow/min/max on both exemplars) | PASS | transcript |
| Progress | Not color-only (visible % label beside each bar) | PASS | transcript |
| Skeleton | Decorative (no role, no text, not focusable) | PASS | transcript |
| Skeleton | Reduced motion (pulse collapses to 1e-05s) | PASS | transcript |
| Sonner | Roles/ARIA (named notifications region, `aria-live=polite` toast, named action) | PASS | transcript |
| Sonner | Auto-dismiss (toast clears after default timeout) | PASS | transcript |
| Sonner | Reduced motion (toast durations 0s under emulation) | PASS | transcript |
| Status Badge | Not color-only (10 states, each with distinct visible text + dot) | PASS | transcript |
| Status Badge | Contrast (10 light + 10 dark pairs) | PASS | repo `contrast-audit.mjs` statusVariants block, 70-pair audit |
| Breadcrumb | Roles/ARIA (nav landmark `aria-label=breadcrumb`, `aria-current=page`, separators `aria-hidden`) | PASS | transcript |
| Breadcrumb | Focus indicator (default browser outline on links, light+dark) | PASS | transcript; see methodology note 2 |
| Pagination | Roles/ARIA (nav landmark, named prev/next, `aria-current` on active) | PASS | transcript |
| Pagination | Focus ring light+dark | PASS | `pagination-link-ring-{light,dark}.png` |

## Methodology notes

1. **Accordion arrow keys:** the initial check asserted ArrowDown moves focus
   between triggers (old APG accordion pattern). Arrow-key roving focus was
   **removed from the APG accordion pattern** (w3c/aria-practices #3434) and
   Base UI deprecated `loopFocus`/arrow navigation accordingly
   (`AccordionRoot.d.ts:68-71` in the installed version). Tab/Shift+Tab is the
   spec-conformant navigation; the check was corrected to assert Tab order and
   passes. Harness expectation fix, not a component change.
2. **Breadcrumb links** intentionally keep the browser default `:focus-visible`
   outline (`outline: auto 1px` observed light+dark) rather than the 3px
   box-shadow ring used by button-shaped controls — a visible focus indicator
   either way; the harness accepts outline OR ring for plain links.
3. **Sonner reduced-motion probe** initially failed because sonner unmounts its
   toast list when it empties; the corrected check triggers a fresh toast under
   `prefers-reduced-motion: reduce` emulation and reads the live toast node.
   Harness fix, not a component change.

## Disclosed scope limits

- Carousel drag/swipe behavior (pointer-based) not exercised; keyboard and
  button paths are.
- Sonner reviewed via the default `toast()` demo path; promise/loading toast
  variants not separately exercised.
- Avatar image loading states not exercised (demo uses fallback-only avatars);
  the fallback path is the accessibility-relevant one.
- Contrast verdicts cite the repo-wide token audit rather than per-instance
  sampling, consistent with batches 1–2.
