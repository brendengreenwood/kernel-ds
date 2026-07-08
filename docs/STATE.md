# STATE — what is true right now

> Living document. Edited in place on every change. History lives in
> `worklog/`; rationale lives in `decisions/`; retired sections in `archive/`.
> Last touched: 2026-07-05

## What this project is

The **Kernel design system** for a grain-buying merchant platform — a
**merchant strategic pricing tool** (bids, basis, contracts) with an
**origination** experience (offers, producers) and a CRUD core throughout
(loads, farms, bushels, settlement). It ships as two mirrored surfaces
that must stay in sync:

1. **Static preview** — `Kernel Design System.html` + `theme.css` +
   `portal.css` + `portal.js` at the repo root. Zero-build, open-in-browser.
2. **Real build** — `kernel-portal/`: a runnable Vite 8 + React 19 +
   TypeScript portal using shadcn/ui (Base UI, `base-nova` style — see
   decision 0005) + Tailwind CSS v4 + React Router. Tokens live in `kernel-portal/src/index.css`; components in
   `src/components/ui/` (shadcn) and `src/components/portal/` (portal
   sections); entry `src/main.tsx` → `src/pages/portal-layout.tsx` with a
   route per rail item (decision 0011). Deploys to Netlify
   (`netlify.toml`: build to `dist/`, SPA redirect).

Both surfaces are **per-page** (decision 0011): every side-rail item is
its own route (portal) / hash-routed page (preview), not a section of one
long scroll.

## Current state

- Both surfaces verified mirrored by the 2026-07-03 sync audit (tokens,
  values, nav, sections, HTML token reference; build passes).
- Full token system: two-layer color tokens (50→950 scales + semantic layer;
  notification scales run 50→900 by design — decision 0004),
  12-step type scale, spacing, shadows, radius — defined in both `theme.css`
  and `kernel-portal/src/index.css`, light + dark.
- Component coverage: shadcn registry components themed with Kernel tokens,
  form-element toolkit (states/sizes/affixes), CRUD patterns, status badges.
- Portal runs on **Base UI** (`@base-ui/react`, style `base-nova`) as of
  2026-07-04 — decision 0005 executed; radix removed. Migration reports in
  `kernel-portal/.migration/`; flagged behavior deltas: tabs manual
  activation, menu checkbox/radio items don't close on click, nav-menu 50ms
  hover delay.
- **Component lifecycle statuses** (decision 0006): experimental/ready/
  deprecated tracked in `kernel-portal/src/lib/component-meta.ts`, shown as
  Primer-style per-component side-rail entries with maturity pills and a
  Component status overview section — both surfaces. Currently
  experimental: the five delta-flagged components + contract-detail. A11y
  review column is `pending` everywhere until backlog #3 runs.
- Fonts: native system stacks only (`--font-sans`, `--font-mono`), no web
  fonts, no serif — see decision 0002.
- Statuses vs notifications are distinct systems — see decision 0003.
- **Contrast audit done** (backlog #3, part 1 — 2026-07-03): repeatable tool
  at `kernel-portal/scripts/contrast-audit.mjs` (`culori` devDependency),
  findings in `docs/a11y/contrast-audit-2026-07.md`. 62 pairs checked light +
  dark; 3 fail AA 4.5:1, all in the role layer (dark
  destructive-foreground/destructive 3.50:1, muted-foreground/muted 3.68:1
  dark and 4.10:1 light). All Badge/Alert/StatusBadge soft fills pass.
- **Contrast fixes applied** (backlog #3, part 2 — 2026-07-04): the three
  role-token L nudges landed on both surfaces (light muted-foreground to
  0.535 for strict-check headroom); re-run reports 62 pairs, 0 AA failures.
- **Mobile ergonomics** (decision 0007, 2026-07-03): preview has a
  hamburger → drawer nav below 880px (was: no nav at all); form controls
  have a 16px floor on phones so iOS doesn't zoom on focus; compact
  controls get ≥44px effective touch targets on coarse pointers via
  invisible pseudo-element hit extensions (both surfaces); the app-shell
  demo stacks below 720px/`md`. Round 2: preview tables scroll in place
  instead of amputating columns (`.table-wrap` overflow-x,
  `.crud-scroll` wrappers), ramp cells no longer overflow
  (`minmax(0,1fr)` / `min-w-0`), overlays verified fitting at 390px.
  Comfortable touch sizing (decision 0009, amends 0007): on coarse
  pointers primary controls visibly grow to 44px min-height (compact 40px)
  on both surfaces; invisible hit extensions remain for deliberately-small
  controls. Repeatable check: `kernel-portal/scripts/mobile-audit.mjs`
  (playwright) — overflow, clipped content, sub-16px inputs, effective hit
  areas; currently preview 0/0/0/0, portal clean except two by-design demo
  internals. Extended 2026-07-04 to nav rows: sidebar menu buttons (portal)
  and the preview drawer's `.nav-link` grow to 44px on coarse pointers,
  and the portal's per-component rail list is now normal menu rows (dot +
  label), not a smaller nested sub-tree — the rail reads as one style.
- **Commodity color coding** (decision 0013, 2026-07-05): a dedicated
  `--commodity-*` categorical family (corn gold, canola yellow, soybean
  green, wheat tan) — four full 50→950 OKLCH scales on both surfaces +
  `<CommodityBadge>` for tags. A semantic sibling to the abstract `--viz-*`
  palette; distinct from status (lifecycle) and notification (events).
  Contrast-audit covers it (70 pairs, 0 AA failures).
- **Border beam effect** (decision 0012, 2026-07-05): third-party
  `border-beam` (MIT) wired as an opt-in `borderBeam` prop on Button,
  Input, Card via a shared `BeamWrap` that only mounts when set; beam
  `theme` follows app light/dark. `/border-beam` route + rail entry +
  demo. **Portal-only** — a deliberate, recorded exception to the mirror
  rule (the static preview can't import a React package).
- **Per-page information architecture** (decision 0011, 2026-07-04):
  every rail destination is its own page. Portal uses React Router nested
  routes under `PortalLayout` (one route per section; `/components` index
  + `/components/:slug` drill-down driven by a `galleryClusters` registry
  split out of the old single gallery). Preview uses a `portal.js` hash
  router showing one `.section.is-active` at a time (sub-anchors resolve
  to their section), gated on a pre-paint `.js` class. Old `#anchor`
  bookmarks redirect to routes via `routeForAnchor()`. The two rails
  mirror at destination level; per-component pages are portal-only by
  design (the preview rail never had per-component entries).
- **Control density tokens** (decision 0010, 2026-07-04): `--control-h-sm/
  -h/-h-lg` (32/38/44px) drive button/input/select heights on both
  surfaces; default raised 32 → 38px on the portal (converging with the
  preview, which was already 38). Coarse pointers redefine the tokens
  (40/44/48) — now the primary mechanism of 0009's touch sizing. Table
  density modes remain a separate axis. Follow-up 2026-07-04: swept the
  last call-site hardcoded control heights (filter builder, date presets,
  flows settings select, form-elements size demos, workspace search,
  command palette, preview `.fb`) onto the tokens, so no control height
  is hardcoded outside the deliberate `xs` button size.
- Netlify deploy configured for `kernel-portal` (build command, publish dir,
  SPA redirect).
- **Portal dogfoods the system** (decision 0014, 2026-07-05, slice 1): the
  portal is treated as a first-class application of the system, not just its
  docs. Named type roles live in one source (`src/lib/type-styles.ts`); the
  portal chrome (`Section`/`Subhead`/`GroupHeader`) and the Typography
  specimen both import it, and the preview chrome CSS mirrors the roles — so
  docs and app render the same styles, no drift. Example screens are held to
  the same bar (commodity-coding + this type pass are the first slices; more
  example-screen rigor is in flight).
- **Mobile documentation-portal patterns** (decision 0015, 2026-07-05):
  a global sequential prev/next `<DocPager>` at the foot of every page
  (order in `src/lib/page-order.ts` = the rail order; component pages after
  the Components index), mounted once in `PortalLayout`; mobile-first cards,
  Overline labels from `typeStyles`. Preview mirrors it via a `#doc-pager`
  populated by `portal.js`. Opens the mobile-doc-pattern area (on-this-page,
  compact header, bottom tab bar are candidates next).
- **Motion system** (decision 0018, 2026-07-08): motion tokens on both
  surfaces — durations (`--duration-fast/-base/-slow` 120/200/320ms) + easings
  (`--ease-out`/`-in-out`/`-spring`) — plus a `prefers-reduced-motion` guard
  that near-zeros animation everywhere (verified: 0.15s → ~0 under reduce).
  Richer engines (`@number-flow/react` for animated numerics, `@formkit/
  auto-animate`, `motion`) are opt-in npm libs, portal-only — not yet adopted.
- Docs system (this directory) in place — see decision 0001.
- **Project skills** (`.agents/skills/`, 2026-07-05): the CLAUDE.md rituals
  are invocable skills — `kernel-token`, `kernel-feature`, `kernel-verify`,
  `kernel-ship` (workflow), plus craft/principles skills `kernel-typesetting`
  (typesetting · vertical rhythm · layout on a 4pt baseline grid),
  `kernel-norman` (Don Norman usability principles), and `kernel-visual`
  (color · contrast · hierarchy · Gestalt). Generic `shadcn` /
  `migrate-radix-to-base` skills also live there.
- CI quality gates: GitHub Actions (`.github/workflows/ci.yml`) runs
  `npm ci` + `tsc -b` + build + lint (oxlint, blocking) for `kernel-portal`
  on every PR and push to `main`. Branch protection requiring the check
  must be enabled by the repo owner in GitHub settings.

## In flight

- **UI pattern library buildout (decision 0008).** Primer-style: each
  pattern is a first-class rail entry with a maturity pill, driven by the
  product's needs (pricing + origination, CRUD core). Landed 2026-07-03:
  **Navigation** (module switcher · grouped rail with nested destinations
  and counts · record underline tabs with overflow) and **Advanced
  filtering** (condition builder · column controls · crop-year date
  presets), and **Origination flow** (offer queue · counter composer ·
  negotiation thread; a counter is an event on a *pending* offer, not a
  lifecycle state — every status hue is allocated, decision 0003 applies),
  and **Modals** (configuration axes, not use cases: xs/sm/md/lg size
  ladder · standard/split/stacked footers · capped scrolling body ·
  dismissable vs must-choose, with a working Escape/outside-click-refusing
  demo) — both surfaces, experimental. Candidates next: bulk-edit pattern,
  pricing worksheet patterns, saved-view management.

## Backlog (in priority order)

1. ~~Sync audit~~ ✓ done 2026-07-03 (see worklog; surfaces verified mirrored)
2. **UI pattern library** → in flight (decision 0008). Domain lineup
   capped at two worked examples (contract detail, settlement statement);
   load ticket entry and basis & bid board dropped.
3. **Accessibility pass** — part 1 (contrast audit + report) ✓ 2026-07-03;
   part 2 (role-token fixes applied, both surfaces) ✓ 2026-07-04.
   Remaining: focus states, keyboard nav in interactive patterns, a
   preview-CSS pairing pass, and per-component reviews to flip the
   `component-meta.ts` a11y column from `pending` to `reviewed`.
4. **Usage guidance** — do/don't guidance in the portal (when to use which
   component; StatusBadge vs Alert per decision 0003) so it teaches, not
   just shows.

## Experiments

- **Workspace shell** (`/workspace` route in kernel-portal, 2026-07-04):
  four-zone AI-era layout — collapsed icon rail · context column
  (menu/list that drives the canvas) · workspace canvas · chat assistant.
  Rail switches areas (Origination/Pricing), list selection drives the
  record; context column and chat become overlays below lg/xl. Linked
  from the docs rail ("Workspace demo ↗"). Route-level experiment only —
  no static-preview mirror until/unless it graduates to a pattern.

## Open questions

*(none currently)*
