# STATE — what is true right now

> Living document. Edited in place on every change. History lives in
> `worklog/`; rationale lives in `decisions/`; retired sections in `archive/`.
> Last touched: 2026-07-22

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
  `kernel-portal/src/index.css`, light + dark. As of 2026-07-22 the
  foundation pages document the **complete** token surface: the Color page
  shows the full shadcn semantic layer (interactive pairs, surface pairs,
  border/input/ring, sidebar family, `--chart-1…5`) **and** all three
  color axes including the ten `--status-*` hue cards; Spacing & radius
  shows the full radius ladder (incl. `xl`) and a Control density block
  rendering the `--control-h-*` tokens live (decision 0010). Verified
  complete already: Motion, Elevation, Typography.
- **Icons + Accessibility foundation pages** (2026-07-22): `/icons` is a
  searchable click-to-copy grid enumerated from the MDI shim's runtime
  exports (decision 0019; 97 glyphs) with the never-lucide-react rule and
  add-a-glyph recipe; `/accessibility` states the audited contract
  user-facing — 44px touch doctrine (both mechanisms, visualized), focus
  ring convention, AA contrast + audit, 16px input floor, reduced motion,
  and the 68/68 review process. Layout page gained a Stacking note (no
  z-index scale by design); Overview gained a Voice & content card
  (grain-world copy, no lorem). Foundations rail is now: Color ·
  Typography · Spacing & radius · Layout · Elevation · Motion · Icons ·
  Accessibility. Empty-state pattern filed as issue #63 (board, DS
  Library).
- **Charts page covers the full shadcn set** (2026-07-22): bar, area,
  line, donut (center label), radar, radial (center label) — all via
  `ChartContainer`, all in grain-domain copy, with per-chart color
  choices demonstrating the axis doctrine (--chart-* single-hue, --viz-*
  multi-hue abstract, --commodity-* commodity splits). recharts 3.8.0
  already shipped every primitive; no dependency change.
- **Layout foundation** (decision 0033, 2026-07-22): a `/layout` page
  documents the fluid-layout doctrine — **no fixed column grid**, by
  design. Stock Tailwind breakpoints (with a live viewport indicator on
  the page), the four grid rules (explicit mobile column, `minmax(0,1fr)`,
  auto-fit beside the sidebar, overflow-x-auto for atomic rows) now
  user-facing rather than CLAUDE.md-only, an auto-fit demo, and the
  `max-w-2xl` prose measure. The mobile audit remains the enforcement
  mechanism; a future fixed grid would supersede 0033.
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
  Component status overview section. Currently **ready 66 / experimental 2 /
  deprecated 0**. The 2026-07 component-completeness pass closed the two
  remaining a11y-pending rows (Drawer and Form elements) and resolved the
  10-row experimental sweep: 8 promoted to ready; Contract detail and
  Settlement statement remain experimental until contract, settlement,
  ticket, and invoice pages share one complete domain lineup. A11y review
  column: **reviewed 68/68** — Tabs (2026-07-10,
  `docs/a11y/tabs-review-2026-07.md`) plus batches 1–6
  (`docs/a11y/batch-*-2026-07.md`), with follow-up resolutions in
  `docs/a11y/drawer-focus-trap-fix-2026-07.md`,
  `docs/a11y/form-field-plumbing-fix-2026-07.md`, and
  `docs/a11y/promotion-sweep-2026-07.md`.

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
- **Component documentation entities** (decision 0035, 2026-07-24 -> 2026-07-25,
  both segments landed). Components now document themselves as typed entities. A
  DSDS-forked Zod schema (`src/lib/component-docs/schema.ts`) defines a
  `ComponentDoc` with eight typed doc-block kinds (guidelines, api, variants,
  anatomy, states, accessibility, useCases, decisions) and three conformance
  levels. A parity gate (`scripts/check-component-docs.mjs`) cross-checks
  documented variants/slots/prop-names against the component source and fails
  CI on drift (exit 1 + offender enumeration); `--coverage` mode is now a
  standing gate asserting every `ready` componentMeta entry has a doc entity.
  **69 entities** live under `src/lib/component-docs/` covering all `ready`
  entries (43 components, 6 elements, 10 patterns, 4 object marks); pattern
  entities are documentation-only (`sourceFiles: []`, no parity blocks) and the
  gate rejects unverifiable variants/anatomy/api on them. `ComponentDocSections`
  renders entities on the component page with graceful fallback for undocumented
  components, and ds-bundle prompt-guidance is generated from the same entities
  (49/52 structured; Input/Icon/InputGroup minimal or non-entity). Parity 69/0,
  coverage 69/0.
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

## Backlog

**The canonical backlog is the GitHub Project board:**
<https://github.com/users/brendengreenwood/projects/1> (Area field:
DS Library / Portal / Studio / Infra). As of 2026-07-17 it carries all
tracked work — including the generative-UI arc (Counterparty → dynamic
registry → workspace presets → studio `defineObject` tool), the
decision-0029 legacy adaptations, and the consolidated tech-debt follow-ups
from the July object-centric restructure (PRs #51–56) and workspace-anatomy
(PR #57) runs. New follow-ups go on the board, not in this file.

The retired numbered backlog that previously lived here is preserved at
`docs/archive/2026-07-17-numbered-backlog.md`.

**A11y watch items** (from the completed 68/68 accessibility campaign —
disclosed, not blockers): Calendar day-grid buttons are 27×27px at 390px —
passes WCAG 2.5.8 AA (≥24px) but below the project 44px bar (dense grid;
decision-0007 extension not applicable). Slider's native range input reports
h=10px in the mobile audit, while the styled track/thumb remain the
functional target. Resizable handle keeps its vendored 1px focus ring
(visible both modes) instead of the 3px control ring.

## Experiments

- **Definition files + studio define tools** (branch feat/ds-define-tool,
  2026-07-21, decision 0034): agent-authored tools are now **persistent** -
  the portal boots by loading public/definitions/manifest.json and
  registering every listed object/workspace JSON document
  (lib/objects/definitions-loader.ts: per-document failure isolation;
  SPA-redirect tolerance - non-OK/non-JSON/parse-failure resolve to zero
  definitions because netlify.toml serves HTML-with-200). The shipped
  manifest is empty, so default rendered state is unchanged (all five
  harnesses pass unmodified, hash-verified). Validation is single-sourced:
  kernel-portal/scripts/validate-definition.mjs (strip-types,
  cwd-independent) returns schema verdicts from the portal's own zod
  schemas; kernel-studio-server/src/lib/definitions.ts (node: builtins
  only, dependency-injected) spawns it via process.execPath and refuses
  to write an invalid document (throws with verdict errors - enforced by
  named vitest cases). Studio exposes read-composition-contract /
  validate-definition / write-definition tools plus a stateless toolsmith
  agent (contract order: read contract, draft, validate until ok, write
  object then workspace). Deterministic e2e proof (drive-defined-tool.mjs
  5/5): a library-book object + library-ops workspace written through the
  real module derive a working workspace surviving two reloads; cleanup
  restores the empty manifest. Deferred (decision 0034): live-LLM
  toolsmith evaluation (board item), definition edit/delete UX,
  multi-workspace switching UX.
- **Workspace presets as data** (branch feat/ds-workspace-presets,
  2026-07-19, decision 0032): workspace configurations are now
  **validated JSON** - workspacePresetSchema (zod) +
  parseWorkspacePreset in lib/objects/workspace-preset.ts. A preset
  declares rail modes (objectKey, navigator idiom, canvas view keys,
  default dock panels); /workspace-obj derives rail/navigator/canvas/
  dock entirely from preset data, with the current four modes
  expressed as the default preset JSON (pixel-parity: unmodified
  drive-workspace.mjs 9/9). Alien proof: the "Incident ops" preset
  loads from JSON at runtime and produces a working workspace with
  zero Incident-specific TSX (drive-preset-workspace.mjs 7/7).
  Icon keys resolve through a UI-layer railIconRegistry with a
  fallback glyph; row resolution (associations idiom -> registry rows,
  else demo dataset, else registry) is demo-host policy, not preset
  semantics. Generative-UI arc position: objects as data (0030) ->
  labels from model (0031) -> workspaces as data (0032) -> an agent
  can now emit a working tool as two JSON documents; the studio
  defineObject tool is next. Demo-button presets are session-scoped; persisted presets now come
  from definition files (entry above, decision 0034).
- **Status labels from the model** (branch feat/ds-status-labels,
  2026-07-18, decision 0031): status badge **text** is now model-driven -
  statusLabelFromModel/statusLabelForObject in status-map.ts, labels
  passed as children at all 7 object-layer StatusBadge call sites
  (status-badge.tsx itself untouched; it already supported children
  override). The alien-object finding is closed: an open Incident reads
  "Open", Settlement reads "Confirmed"/"Reversed". Fixture labels were
  not hand-tuned (models declare their own words; contract-active reads
  "Active"). **Open follow-up:** tone->color granularity - danger still
  colors via the cancelled variant (viz-slate), so "Open" renders in
  slate; board item filed (DS Library, Todo).
- **Dynamic objects + composition contract** (branch
  feat/ds-dynamic-objects, 2026-07-18): the object system is now
  **runtime-extensible** - objects arrive as JSON validated by
  objectModelSchema (zod), register via registerObject
  (lib/objects/registry.ts, subscriptions via useObjectRegistry() /
  useSyncExternalStore), and the Designs page derives the full suite
  (Collection/Record/Write/Query/Traversal) with zero object-specific
  TSX - proven by an Incident registered from a JSON string at runtime.
  Statuses derive generically from model-declared tones (single
  toneToStatus map in status-map.ts; A4 active->booked preserved,
  enforced by check-status-map.mjs). Rows without coords get
  deterministic djb2-derived coordinates. The composition rules are
  machine-readable: lib/objects/composition.ts manifest (6 primitives,
  4 regions, 9 doctrine rules) emitted to public/composition.json
  (decision 0030) - agents load the rules instead of re-deriving them.
  Registration is session-scoped for demo buttons; **persistence landed**
  with the definition-files loader + studio define tools (entry above,
  decision 0034). The trade-vocabulary finding below is now resolved by decision 0031
  (label-driven badges, entry above). Original finding: StatusBadge
  vocabulary is trade-shaped (booked/settled/cancelled) - foreign
  domains render semantically odd badge labels with correct tones;
  board item filed (label- or tone-driven badge variant).
- **Object-centric IA + workspace anatomy** (Objects/Aspects rail groups,
  2026-07-17): the object-centric restructure (decisions 0026-0028) merged
  to main - object pages (Shell, Workspace, Collection, Record, Write,
  Designs, Substrate) plus Aspects (Query, Traversal), generic _previews,
  and the shared status-map.ts rule. The /workspace-obj page is rebuilt
  on IDE anatomy - activity rail > navigator > canvas > dock - over a
  composable panel/view framework (objects/workspace/) and a deterministic
  60-contract demo dataset (dataset.ts, registry-separate). Decision 0029
  records the anatomy + composability doctrine and amends 0026 to
  build-first, **adapt**-later: legacy pattern/domain pages (Dashboard,
  Advanced filtering, Origination, Pricing, Modals) are source material to
  be absorbed into the object system, each as its own future plan.
- **Workspace shell** (`/workspace` route in kernel-portal, 2026-07-04):
  four-zone AI-era layout — collapsed icon rail · context column
  (menu/list that drives the canvas) · workspace canvas · chat assistant.
  Rail switches areas (Origination/Pricing), list selection drives the
  record; context column and chat become overlays below lg/xl. Linked
  from the docs rail ("Workspace demo ↗"). Route-level experiment only
  until/unless it graduates to a pattern.

## Open questions

*(none currently)*
