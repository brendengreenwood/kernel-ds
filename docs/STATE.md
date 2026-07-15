# STATE — what is true right now

> Living document. Edited in place on every change. History lives in
> `worklog/`; rationale lives in `decisions/`; retired sections in `archive/`.
> Last touched: 2026-07-14

## What this project is

The **Kernel design system** for a grain-buying merchant platform — a
**merchant strategic pricing tool** (bids, basis, contracts) with an
**origination** experience (offers, producers) and a CRUD core throughout
(loads, farms, bushels, settlement). It ships as a **single surface**
(decision 0022; the hand-maintained static preview was retired 2026-07-10 —
see `archive/2026-07-10-static-preview.md`):

- **`kernel-portal/`** — a runnable Vite 8 + React 19 + TypeScript portal
  using shadcn/ui (Base UI, `base-nova` style — see decision 0005) +
  Tailwind CSS v4 + React Router. Tokens live in
  `kernel-portal/src/index.css`; components in `src/components/ui/`
  (shadcn) and `src/components/portal/` (portal sections); entry
  `src/main.tsx` → `src/pages/portal-layout.tsx` with a route per rail
  item (decision 0011). Deploys to Netlify (`netlify.toml`: build to
  `dist/`, SPA redirect).

The portal is **per-page** (decision 0011): every side-rail item is its
own route, not a section of one long scroll.

## Current state

- **Static preview retired** (decision 0022, 2026-07-10): the four root
  preview files are deleted; the portal is the single surface. The
  mirror/parity rituals are obsolete; preview-specific state is archived
  to `archive/2026-07-10-static-preview.md`.
- **2026-07-10 full project audit** (`docs/audit/2026-07-10-project-audit.md`):
  parity, conventions, a11y gates, build health, and docs freshness re-proved
  after the 47-commit fast-forward to `880a721`. 8 mechanical findings fixed
  inline; 7 non-trivial items added to the backlog (see backlog #5).
- Full token system: two-layer color tokens (50→950 scales + semantic layer;
  notification scales run 50→900 by design — decision 0004),
  12-step type scale, spacing, shadows, radius — defined in
  `kernel-portal/src/index.css`, light + dark.
- Component coverage: shadcn registry components themed with Kernel tokens,
  form-element toolkit (states/sizes/affixes), CRUD patterns, status badges.
- Portal runs on **Base UI** (`@base-ui/react`, style `base-nova`) as of
  2026-07-04 — decision 0005 executed; radix removed. Migration reports in
  `kernel-portal/.migration/`; flagged behavior deltas: menu
  checkbox/radio items don't close on click, nav-menu 50ms hover delay
  (tabs' manual-activation delta was overridden 2026-07-10 — tabs now
  activate automatically on arrow focus, decision 0023).
- **Component lifecycle statuses** (decision 0006): experimental/ready/
  deprecated tracked in `kernel-portal/src/lib/component-meta.ts`, shown as
  Primer-style per-component side-rail entries with maturity pills and a
  Component status overview section. Currently ready 58 /
  experimental 10: the three portal-only elements (Border beam,
  Commodity tags, Animated number), five patterns (Navigation, Advanced
  filtering, Origination flow, Pricing worksheet, Modals), and the two
  domain patterns (Contract detail, Settlement statement). A11y review
  column: **reviewed 66/68** — Tabs (2026-07-10,
  `docs/a11y/tabs-review-2026-07.md`) plus batch 1 form controls
  (2026-07-11, `docs/a11y/batch-1-form-controls-2026-07.md`), batch 2
  overlays & menus minus Drawer (2026-07-11,
  `docs/a11y/batch-2-overlays-menus-2026-07.md`), and batch 3 content &
  display (2026-07-11, `docs/a11y/batch-3-content-display-2026-07.md`), and
  batch 4 structure & data (2026-07-11,
  `docs/a11y/batch-4-structure-data-2026-07.md`), and batch 5 elements &
  foundations minus Form elements (2026-07-11,
  `docs/a11y/batch-5-elements-foundations-2026-07.md`), and batch 6
  patterns & domain (2026-07-11,
  `docs/a11y/batch-6-patterns-domain-2026-07.md`) — campaign complete;
  only Drawer and Form elements stay `pending` (backlogged, see backlog #3).
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
  role-token L nudges landed in the token layer (light muted-foreground to
  0.535 for strict-check headroom); re-run reports 62 pairs, 0 AA failures.
- **Mobile ergonomics** (decision 0007, 2026-07-03): form controls have a
  16px floor on phones so iOS doesn't zoom on focus; compact controls get
  ≥44px effective touch targets on coarse pointers via invisible
  pseudo-element hit extensions; the app-shell demo stacks below
  720px/`md`. Tables scroll in place instead of amputating columns, ramp
  cells no longer overflow (`minmax(0,1fr)` / `min-w-0`), overlays
  verified fitting at 390px. Comfortable touch sizing (decision 0009,
  amends 0007): on coarse pointers primary controls visibly grow to 44px
  min-height (compact 40px); invisible hit extensions remain for
  deliberately-small controls. Repeatable check:
  `kernel-portal/scripts/mobile-audit.mjs` (playwright) — overflow,
  clipped content, sub-16px inputs, effective hit areas; known campaign
  exceptions are named in backlog #3 / watch items rather than treated as
  globally clean. Extended 2026-07-04 to nav rows:
  sidebar menu buttons grow to 44px on coarse pointers, and the
  per-component rail list is now normal menu rows (dot + label), not a
  smaller nested sub-tree — the rail reads as one style.
- **Commodity color coding** (decision 0013, 2026-07-05): a dedicated
  `--commodity-*` categorical family (corn gold, canola yellow, soybean
  green, wheat tan) — four full 50→950 OKLCH scales +
  `<CommodityBadge>` for tags. A semantic sibling to the abstract `--viz-*`
  palette; distinct from status (lifecycle) and notification (events).
  Contrast-audit covers it (70 pairs, 0 AA failures).
- **Border beam effect** (decision 0012, 2026-07-05): third-party
  `border-beam` (MIT) wired as an opt-in `borderBeam` prop on Button,
  Input, Card via a shared `BeamWrap` that only mounts when set; beam
  `theme` follows app light/dark. `/border-beam` route + rail entry +
  demo. Was **portal-only** under the mirror-era carve-out (decision
  0012); moot since decision 0022 — everything is portal-only now.
- **Per-page information architecture** (decision 0011, 2026-07-04):
  every rail destination is its own page. Portal uses React Router nested
  routes under `PortalLayout` (one route per section; `/components` index
  + `/components/:slug` drill-down driven by a `galleryClusters` registry
  split out of the old single gallery). Old `#anchor` bookmarks redirect
  to routes via `routeForAnchor()`.
- **Control density tokens** (decision 0010, 2026-07-04): `--control-h-sm/
  -h/-h-lg` (32/38/44px) drive button/input/select heights; default
  raised 32 → 38px on 2026-07-04. Coarse pointers redefine the tokens
  (40/44/48) — now the primary mechanism of 0009's touch sizing. Table
  density modes remain a separate axis. Follow-up 2026-07-04: swept the
  last call-site hardcoded control heights (filter builder, date presets,
  flows settings select, form-elements size demos, workspace search,
  command palette) onto the tokens, so no control height
  is hardcoded outside the deliberate `xs` button size.
- Netlify deploy configured for `kernel-portal` (build command, publish dir,
  SPA redirect).
- **Portal dogfoods the system** (decision 0014, 2026-07-05, slice 1): the
  portal is treated as a first-class application of the system, not just its
  docs. Named type roles live in one source (`src/lib/type-styles.ts`); the
  portal chrome (`Section`/`Subhead`/`GroupHeader`) and the Typography
  specimen both import it — so docs and app render the same styles, no
  drift. Example screens are held to
  the same bar (commodity-coding + this type pass are the first slices; more
  example-screen rigor is in flight).
- **Mobile documentation-portal patterns** (decision 0015, 2026-07-05):
  a global sequential prev/next `<DocPager>` at the foot of every page
  (order in `src/lib/page-order.ts` = the rail order; component pages after
  the Components index), mounted once in `PortalLayout`; mobile-first cards,
  Overline labels from `typeStyles`. Opens the mobile-doc-pattern area
  (on-this-page, compact header, bottom tab bar are candidates next).
- **Motion system** (decision 0018, 2026-07-08): motion tokens —
  durations (`--duration-fast/-base/-slow` 120/200/320ms) + easings
  (`--ease-out`/`-in-out`/`-spring`) — plus a `prefers-reduced-motion` guard
  that near-zeros animation everywhere (verified: 0.15s → ~0 under reduce).
  Engines are opt-in npm libs. Adopted:
  `@number-flow/react` via `<AnimatedNumber>` (counts up on mount, rolls on
  change, honors reduced-motion) on the dashboard KPIs + settlement net
  payable, and `@formkit/auto-animate` (shared `autoAnimateConfig`) on the
  filter builder rows + applied-filter chips. Candidate next: `motion`.
- **Motion system + foundation page** (decision 0018): timing + easing
  tokens (`--duration-*`/`--ease-*`) with a reduced-motion guard; a
  **Motion** Foundations rail page (`/motion`) documents them with
  replayable track demos, plus a polish showcase. Engines adopted:
  `@number-flow/react` (`<AnimatedNumber>`), `@formkit/
  auto-animate` (`autoAnimateConfig`), `motion` (Framer `AnimatePresence`).
- **Icon library: MDI** (decision 0019, 2026-07-09): icons are
  Material Design Icons. Glyphs import from a shim
  `src/components/ui/icon.tsx` (lucide-named components backed by `@mdi/js`
  paths, lucide-compatible API); all 42 files that imported `lucide-react`
  were redirected to it and `lucide-react` was removed. Prefer `*Outline`
  variants so the filled set stays close to lucide's weight.
- **Adoption = copy-in token layer** (decision 0020, 2026-07-09): the Install &
  usage page tells you to copy Kernel's `:root`/`.dark`/
  `@theme inline` blocks into a shadcn/ui project — not run a tweakcn command
  (which only carried base roles). The portal's step-5 token reference renders
  live from `src/index.css` via `?raw`, so it can't drift.
- **Tabs system** (decision 0021, 2026-07-09): variants **pill** (primary
  active, default) · **underline** · **folder**; sizes **compact/default/
  comfortable** on the `--control-h-*` tokens (same language as table density);
  every tab takes a leading MDI icon, a trailing count badge (`<TabCount>` /
  `.tab-count`), and a notification dot (`<TabDot>` / `.tab-dot`) or inline
  glyph. Strips scroll in place on mobile (0 overflow at 390px). Promoted
  **ready** 2026-07-10 with automatic activation (arrows activate;
  `activateOnFocus` overridable) after the first per-component a11y
  review — decision 0023.
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

- **Kernel Studio** (decision 0024, 2026-07-12): generative
  design-prototyping surface. `kernel-studio-server/` (repo-root package)
  runs a Mastra dev server (`npx mastra dev`, port 4111) hosting
  `kernel-design-agent` (Anthropic Sonnet), which reads the ds-bundle via
  tools and writes contract-validated prototypes (manifest + JSX screens +
  README auto-doc) to `kernel-studio-server/prototypes/`. The portal's
  `/studio` route renders prototypes on an HTML-in-Canvas flow map
  (`drawElementImage`) with pan/zoom and direction lanes; clicking a card
  opens a fully interactive player mode with edge navigation; a chat panel
  streams generations onto the map. **Prerequisites:** Chrome 150+ launched
  with `--enable-features=CanvasDrawElement`, `ANTHROPIC_API_KEY` in
  `kernel-studio-server/.env`, and both dev servers running — the studio is
  **dev-server-only** (`npm run dev` in `kernel-portal/`; the Vite middleware
  serving `ds-bundle/` and `prototypes/` doesn't exist in the built site;
  unflagged browsers get a capability panel with launch instructions).
  Contract: `kernel-studio-server/PROTOTYPE-CONTRACT.md`. Skill:
  `.agents/skills/kernel-studio/`. The committed fixture prototype is
  `fixture-grain-intake`; agent-generated prototypes stay untracked.
- **Agent consolidation** (decision 0025, 2026-07-14):
  `kernel-studio-server/` now hosts **4 agents** in one Mastra instance on
  `@mastra/core` 1.50.x — `kernel-design-agent` plus the ported UX research
  stack (`cognitive-research-agent`, `artifact-agent`, `supervisor-agent`,
  2 workflows, LibSQL stores, RAG, the `ux-research-mcp` MCP server with
  10 tools, brief/artifact/viewer `apiRoutes`, and the standalone Hono API
  via `npm run api`, port 3001). The design agent bridges natively into
  research (`getPersonaTreeTool`, `searchTranscriptsTool`) for
  research-grounded prototypes. Data DBs live gitignored at
  `kernel-studio-server/src/mastra/public/`; runtime needs
  `GOOGLE_GENERATIVE_AI_API_KEY` in `.env` alongside `ANTHROPIC_API_KEY`.
  The merged test suite is 104 tests. The old `mastra-ux-research-agent`
  repo is an archive — source of truth is this package now.

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
  demo) — experimental. Landed 2026-07-09: **Pricing worksheet**
  (bid worksheet: board + basis → cash bid, sell basis − costs → margin · margin
  ladder: the win-bushels-vs-hold-margin trade-off with the posted basis marked ·
  bid board: cash bids by location × delivery, publish) — experimental;
  the desk-facing pattern for the pricing-strategy / sales-execution
  positioning. Candidates next: bulk-edit pattern, saved-view management.

## Backlog (in priority order)

1. ~~Sync audit~~ ✓ done 2026-07-03 (see worklog; surfaces verified mirrored)
2. **UI pattern library** → in flight (decision 0008). Domain lineup
   capped at two worked examples (contract detail, settlement statement);
   load ticket entry and basis & bid board dropped.
3. **Accessibility pass** — part 1 (contrast audit + report) ✓ 2026-07-03;
   part 2 (role-token fixes applied) ✓ 2026-07-04.
   Remaining: focus states, keyboard nav in interactive patterns, and
   per-component reviews to flip the
   `component-meta.ts` a11y column from `pending` to `reviewed`.
   First per-component review done: **Tabs** ✓ 2026-07-10
   (`docs/a11y/tabs-review-2026-07.md`, 20/20 checks).
   Review campaign in flight: batch 1 form controls ✓ 2026-07-11
   (13 components, `docs/a11y/batch-1-form-controls-2026-07.md`);
   batch 2 overlays & menus ✓ 2026-07-11 (12 of 13 reviewed,
   `docs/a11y/batch-2-overlays-menus-2026-07.md`);
   batch 3 content & display ✓ 2026-07-11 (15 components,
   `docs/a11y/batch-3-content-display-2026-07.md`);
   batch 4 structure & data ✓ 2026-07-11 (10 components, 2 mechanical
   fixes: Data Table `aria-sort`, expandable-row `aria-expanded`,
   `docs/a11y/batch-4-structure-data-2026-07.md`);
   batch 5 elements & foundations ✓ 2026-07-11 (4 of 5 reviewed, 1
   mechanical fix: 3 icon-button `aria-label`s on /forms,
   `docs/a11y/batch-5-elements-foundations-2026-07.md`);
   batch 6 patterns & domain ✓ 2026-07-11 (11 of 11 reviewed, mechanical
   fixes: duplicate `<main>` landmark removed portal-wide
   (portal-layout), focus-visible utilities on 3 raw buttons (filters),
   `htmlFor`/`id` label association ×8 (patterns/flows/origination),
   `aria-label`s ×4 (filtering-advanced, patterns),
   `docs/a11y/batch-6-patterns-domain-2026-07.md`) — **reviewed 66/68,
   campaign complete**; remaining `pending`: Drawer (focus trap,
   behavioral) and Form elements (Field id plumbing, structural).
   Watch items from the campaign (disclosed, not blockers): Calendar day-grid
   buttons are 27×27px at 390px — passes WCAG 2.5.8 AA (≥24px) but below
   the project 44px bar; dense grid, decision-0007 extension not
   applicable. Slider's native range input reports h=10px in the mobile
   audit, while the styled track/thumb remain the functional target.
   Resizable handle keeps its vendored 1px focus ring (visible both modes)
   instead of the 3px control ring. `/forms` mobile audit reports one
   sub-16px text control and the known switch-rail h=18px hit-area flag;
   Form elements remains pending/backlogged for the Field/id plumbing.
   Backlogged from batch 2: **Drawer (vaul) does not trap keyboard
   focus** — with the drawer open, Tab reaches page content behind the
   overlay (background is aria-hidden, so SR-side is covered; Escape and
   focus-return work). Behavioral, not mechanical; `a11y` stays
   `pending` until fixed.
   Backlogged from batch 5: **Form elements — `Field` demo helper does
   not associate labels with controls** (`<Label>` without `htmlFor`;
   23 of 41 specimen inputs on /forms have no programmatic name). Needs
   `useId` + id plumbing through the Field/InputGroup composition and
   its ~20 call sites — structural, not mechanical; the Form elements
   row stays `pending` until fixed.
4. **Usage guidance** — do/don't guidance in the portal (when to use which
   component; StatusBadge vs Alert per decision 0003) so it teaches, not
   just shows.
5. **2026-07-10 audit follow-ups** (details in
   `docs/audit/2026-07-10-project-audit.md`): code-split the portal bundle
   (single 1,862 kB JS chunk); decide on navigation-menu’s vendored 350ms
   duration (the preview-CSS motion-literal migration is moot — file retired,
   decision 0022);
   give the 30px filter chip (`filters.tsx`) a home in the size system;
   ~~resolve the `tabsListVariants` fast-refresh warning~~ ✓ done 2026-07-10 (dead export removed on the tabs-promotion branch);
   backfill worklog entries for `8545649` and `bdd3b1d`; portability pass on
   the kernel-verify / kernel-ship skills (Linux paths, theme storageKey,
   environment rules); scrub stale “static preview” prose inside the portal
   itself (`motion-foundation.tsx:156` rendered copy,
   `kernel-portal/README.md:126`, `component-meta.ts` border-beam note) —
   flagged by the 0022 ship review; portal code was deliberately untouched
   in the retirement branch.

## Experiments

- **Workspace shell** (`/workspace` route in kernel-portal, 2026-07-04):
  four-zone AI-era layout — collapsed icon rail · context column
  (menu/list that drives the canvas) · workspace canvas · chat assistant.
  Rail switches areas (Origination/Pricing), list selection drives the
  record; context column and chat become overlays below lg/xl. Linked
  from the docs rail ("Workspace demo ↗"). Route-level experiment only
  until/unless it graduates to a pattern.

## Open questions

*(none currently)*
