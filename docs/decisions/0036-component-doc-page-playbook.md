# 0036 — Component doc-page playbook

Date: 2026-07-25
Status: accepted

## Context

0035 established the component documentation layer: a DSDS-forked schema, a
parity gate, doc entities, and a portal renderer. What it did *not* establish
was a single reference for how a doc page is structured, laid out, and authored.
The rules lived only in the exemplars and in people's heads, so every change
re-derived them — and some were non-obvious enough to cause real bugs:

- A CSS grid/flex `min-width: auto` blowout let a long unbroken string in the
  Use Cases card force the whole doc column to ~1200px, overflowing the page
  horizontally. The fix (`min-w-0` on grids, grid items, cards, and flex text
  spans) is easy to forget and invisible until content happens to be long.
- Section titles were hardcoded per-section in the renderer, with nothing
  stopping a second consumer (a table of contents, an agent export) from
  re-listing them and drifting.
- Prose quality had a voice bar (Kernel operational voice, decision-0035-era
  work) but it was tribal knowledge, not written down next to the layout rules.

Separately, component doc pages had grown long enough (the Button page is ~4
screens) that readers had no way to navigate within a page.

## Decision

**Adopt a written playbook as the canonical reference for component doc pages,
and add an "On this page" section nav.**

- The playbook lives at `docs/component-doc-page-playbook.md` (living
  reference, revisable in place). It codifies: the moving parts and who owns
  them; the nine-block content structure and its canonical order; the
  conformance ladder; the prose/voice bar; the layout rules (the `min-w-0`
  requirement, section anchors + `scroll-mt-24` clearance, the section-shell
  pattern, page assembly order); the "On this page" nav contract; and an
  add/change checklist. Anyone touching the doc-page code conforms to it
  instead of re-deriving.

- The renderer now exposes the section title as a shared `SECTION_TITLE` map
  (alongside the existing `SECTION_EYEBROW`) and a `docSectionId(kind)` helper,
  and derives its render list through a single `renderedBlocks(doc)` function.
  A companion `docSectionNav(doc)` returns the ordered `{ kind, title, id }`
  list from that same function.

- `OnThisPage` (`src/components/portal/on-this-page.tsx`) consumes
  `docSectionNav` — so it lists exactly the sections that render, in order,
  and can never drift from the page. It scroll-spies with an
  `IntersectionObserver` and hides itself for fewer than two sections. On the
  component page it floats in a sticky rail, out of normal flow
  (`absolute` + `pointer-events-none` track) so it cannot cause overflow, gated
  to `2xl:` so it only appears when there is room beside the `max-w-4xl`
  column.

## The drift-proofing principle

The renderer, the "On this page" nav, and the parity gate all read the **same
doc entity**, and within the renderer the section list is computed **once**
(`renderedBlocks`) and shared. No consumer re-lists sections or re-derives
titles. Adding a block kind touches only the renderer (a `case` plus
`SECTION_TITLE`/`SECTION_EYEBROW` entries); the ToC and page assembly pick it up
for free. This is the same discipline 0035 applied to machine-readable claims,
extended to the page's structure and navigation.

## The `min-w-0` rule, written down

CSS grid and flex items default to `min-width: auto` and refuse to shrink below
their content's intrinsic width. Long unbroken prose then blows the column out
and produces horizontal page overflow. The playbook makes `min-w-0` a
**required** attribute on every grid wrapper, grid item, section Card,
two-column card, and flex row holding prose, with a one-line regression check
(`scrollWidth === clientWidth`). This turns an invisible, content-dependent bug
into a documented rule with a test.

## Arc position

0035 (components document themselves as typed, parity-gated entities) → **0036
(the doc page itself has a written contract: structure, layout, navigation, and
voice, all drift-proofed against a single source)**. Where 0035 kept the
*claims* honest, 0036 keeps the *presentation* consistent and the page
navigable.

## Deliberately deferred

- **A ToC on non-component doc pages** (foundations, patterns). The nav is
  scoped to component pages where the block structure is uniform; generalizing
  it to arbitrary long pages is a follow-up.
- **A skill wrapper.** The recurring rituals (`kernel-feature`, `kernel-ship`)
  already cover the mechanics; a dedicated doc-page skill can be added if the
  playbook proves to need one, but is not required by this decision.
- **Enforcing the layout rules in a linter.** The `min-w-0` rule is documented
  and has a runtime check; a static lint rule for it is possible but out of
  scope.
