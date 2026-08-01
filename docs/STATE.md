# STATE — what is true right now

> Living document. Edited in place on every change. History lives in
> `worklog/`; rationale lives in `decisions/`; retired sections in `archive/`.
> Last touched: 2026-07-31

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
  `packages/ui/src/styles.css`; public components in `packages/ui/src/components/ui/`
  (shadcn) and portal-only sections in `src/components/portal/`; entry
  `src/main.tsx` → `src/pages/portal-layout.tsx` with a route per rail
  item (decision 0011). Deploys to Netlify (`netlify.toml`: build to
  `dist/`, SPA redirect).

The portal is **per-page** (decision 0011): every side-rail item is its
own route, not a section of one long scroll.

## Current state

- **Elevation ramp works in dark, and climbs** (decision 0042, 2026-07-31):
  `--shadow-*` had been declared in `:root` and repeated **byte for byte** in
  `.dark` — on the dark card (rgb 31,41,36) the light ramp's 4–10% black
  resolves to under one 8-bit level, so dark mode shipped an elevation ramp
  that could not produce a visible shadow at any rung, while
  `/foundations/elevation` rendered eight identical swatches and documented it
  as working. Light `--shadow-2xl` was separately non-monotonic
  (`0 1px 3px / 0.25`, tighter than `md`), so the top of the ramp cast the
  smallest shadow in the set. Now: geometry shared across themes so `lg` means
  one thing everywhere, alpha scaled ~4–7× in dark (0.28→0.55 vs 0.04→0.14),
  and `2xl` continued to `0 16px 32px -8px`. The doubling progression
  (1/2 → 2/4 → 4/8 → 8/16 → 16/32, spread −blur/4) is the ramp's stated
  contract: every rung larger than the one below on every axis. The two
  smallest rungs stay transparent by design (borders, not lift) — the ramp is
  effectively six steps, which the foundation page now says out loud. Surfaced
  by the v2 prototype needing a resting cast and finding no working token.

- **Shadows are tinted; `--shadow-color` is load-bearing** (decision 0043,
  2026-07-31): the token had been declared in both theme blocks since the token
  sheet was written and **nothing referenced it** — the ramp hardcoded
  `hsl(0 0% 0%)`, so the one knob for shadow hue was inert. Every rung now
  derives from it via `color-mix`; light is `oklch(0.16 0.022 165)`, dark
  `oklch(0.04 0.018 165)` (deeper, since it must darken a 0.165 rail). Kernel's
  surfaces are green-tinted neutrals and occlusion stays in the surface's hue
  family, so a neutral-black cast read as a foreign smudge. Tinting costs 0.3 of
  an 8-bit level of depth in dark, which is affordable because dark's cast was
  never carrying elevation — edge contrast and gutter do that.

- **`--lime-*` accent scale** (decision 0041, 2026-07-30): the accent lime — the
  hue on every primary button, focus ring, active pill and first chart series —
  had been a bare `oklch()` literal repeated **twelve times** across both themes,
  the only significant colour with no family behind it. It is now a full 50→950
  scale beside `--brand-*`/`--neutral-*` (with `-light`/base/`-dark` aliases at
  200/500/700), and all twelve role tokens reference it. Steps 300 and 500 are
  pinned to the two values already shipped, so the migration is visually inert —
  resolved values asserted per theme. Sets the rule that a raw `oklch()` in the
  role layer is a missing family, not a shortcut. Follow-up: light `--secondary`
  and `--sidebar-accent` sit near `--lime-50` but off by +0.009 L / −6° hue and
  were left alone.
- Portal styling restored (2026-07-30): `@kernel/ui` styles.css now carries `@source "./";` so Tailwind v4 scans the packaged component code from consumers' node_modules (decision 0052). Portal CI gate `check-portal-css.mjs` asserts component-utility sentinels in the built CSS, between Build and boot smoke.

- **Portal boot is a gate** (decision 0051, 2026-07-30): kernel-portal deduplicates every dependency shared with @kernel/ui via resolve.dedupe in vite.config.ts - the file: symlink otherwise resolves bare imports to the repo-root node_modules and bundles a second React, crashing boot with a blank #root (the 2026-07-30 white-screen production incident). scripts/check-portal-boot.mjs drives headless Chromium at the built site (vite preview or a deployed URL) and fails on console errors or an empty #root; it runs in the portal CI job after the build.

- **Protected release workflow** (decision 0050, 2026-07-30): `.github/workflows/release.yml` is manual-only with a `mode` input. Dry-run (default) is credential-free — changeset status, `release:check`, `release:impact`, `ds:pack` — with manifest + tarballs as run artifacts. Publish is explicit, main-only, in the protected `release` environment, refuses without the `KERNEL_DS_PUBLISH_TOKEN` secret, and re-runs every release gate (packages, catalog, portal, Studio, pack smoke) on the exact commit before `changeset publish`. Workflow safety is statically enforced by `scripts/ds/__check__.mjs`; rollback/yank/deprecation guidance lives in `docs/release-runbook.md`.

- **Managed consumers + verified upgrades** (decision 0049, 2026-07-30): upgrade propagation targets only `scripts/ds/consumers.json` (schema `kernel-ds/consumer-registry@1`, validated by `consumers:check`): opt-in entries with repository identity, repo-relative paths, subscribed publishable packages, branch strategy, and allowlisted (`npm`/`npx`/`node`) verification commands. `ds:upgrade` plans from the impact manifest (dry-run default: dependency diff, migrations, docs anchors, suggested branch) and applies only for opted-in local consumers - install + registered verification, restoring the consumer on failure. `ds:release` orchestrates check -> impact -> pack -> release record -> per-consumer dry-run plans; `--publish` refuses without `NODE_AUTH_TOKEN`. The decision-0036 `kernel-app` fork is fenced as unmanaged and cannot be targeted. Upgrade proof: `upgrade-demo.mjs` -> `upgrade.txt` ends `PROOF: GREEN`.

- **Changesets versioning + release impact** (decision 0048, 2026-07-30): `@kernel/ui` and `@kernel/definitions` version independently through `@changesets/cli` and publish (when authorized) to private GitHub Packages (`publishConfig.registry: npm.pkg.github.com`, restricted); `@kernel/catalog` stays private. `ds:changeset` embeds a `kernel-ds:release-meta` block — runtime/API changes must name catalog entities or whole-package scope, breaking changes must carry a migration, docs/internal are the explicit exemptions. `release:impact` emits a deterministic catalog-linked manifest (`.release/impact-manifest.json`, schema `kernel-ds/impact-manifest@1`); `release:check` gates metadata policy, publish config, committed credentials, and runs `changeset version` in a temp worktree (never mutating the repo). Runbook: `docs/release-runbook.md`.

- **CI enforces DS automation gates** (decision 0047, 2026-07-30): `.github/workflows/ci.yml` gained an `automation` job (`ds:check`, `ds:doctor`, `skills:check`, `agents:check`, then generated-artifact freshness via `ds:generate --skip ds-bundle` + `git diff --exit-code`), a `definitions-package` job (build + tests + contract, mirroring `ui-package`), and a `pack-smoke` job that packs the real tarballs and imports every public entry point from a clean consumer through `scripts/ds/pack-smoke.mjs`. `ds:verify` selection now expands through per-gate `dependents` (packages → portal + studio; portal → studio) with a pure `selectGates` covered by a changed-path matrix in `scripts/ds/__check__.mjs`; portal and Studio CI jobs are unchanged.

- **Generated agent guidance** (decision 0046, 2026-07-30): AGENTS.md facts (catalog counts, package export entries, DS scripts, skills, command registries) are generated only inside bounded `kernel-ds:generated` marker sections via `npm run agents:generate` / checked by `agents:check`; hand-authored prose is never generated over. Nine DS lifecycle skills (`kernel-ds-*`) encode use/component/pattern/definition/document/verify/release/upgrade/audit rituals and are statically validated by `npm run skills:check`; legacy kernel skills delegate to the DS commands. `agents-freshness` and `skill-integrity` run in `ds:doctor`; `agents-inventories` runs in `ds:generate`.

- **DS lifecycle command layer** (decision 0045, 2026-07-30): `scripts/ds/` exposes deterministic, noninteractive root commands — `ds:add`/`ds:tag`/`ds:relate` write the canonical catalog through a shared byte-round-tripping parser with taxonomy validation and no-overwrite refusals; `ds:generate` runs the declared generation order (catalog adapter → `@kernel/ui` → `@kernel/definitions` → ds-bundle); `ds:verify` selects focused gates from changed paths; `ds:doctor` reports catalog, generated-artifact, API-alignment, a11y-readiness, version, and workspace violations; `ds:changeset` writes Changesets-format notes; `ds:pack` verifies the pack payload allowlist. Red/green fixtures and `scripts/ds/__check__.mjs` keep the commands honest.

- **Definitions package extraction in progress** (decision 0044, 2026-07-30): `packages/definitions` now owns the framework-free object model and workspace preset schemas, parsers, validation APIs, deterministic coordinate helper, composition doctrine, and committed compatibility fixtures. It distributes explicit root/composition/presets entries plus a generated `api.json`. Portal runtime registries, fetching, persistence, and React hooks remain application-owned behind compatibility re-exports while the portal consumes `@kernel/definitions` through a package-local `file:` dependency.

- **UI package extraction in progress** (decision 0042, 2026-07-30): `packages/ui` now owns the canonical UI implementations and distributes `@kernel/ui` as ESM, declarations, CSS, and a catalog-backed `api.json`, with explicit root/marks/icon/utils/style exports. The portal consumes the package through a package-local `file:` dependency; no duplicate implementation tree remains under `kernel-portal`. React and React DOM are peer-only, and package tests reject wildcard exports, private portal-source leakage, bundled or dependency-owned React, undeclared runtime imports, missing public artifacts, and payload files outside the allowlist.

- **Canonical catalog foundation in progress** (decision 0041, 2026-07-29): the repository now has a minimal private npm workspace limited to `packages/*`; `kernel-portal` and `kernel-studio-server` remain independently installed applications with their own lockfiles and commands. `packages/catalog` owns the single canonical inventory of **93 lifecycle entries** and **81 registered documentation records**, with closed taxonomies plus source, docs, and AI references. Catalog selectors generate the portal's stable `componentMeta`/`components` adapter in deterministic group-and-name order; the former hand-maintained portal registry is gone. Root `catalog:generate` and `catalog:check` commands, catalog tests, and CI enforce selector behavior, anchor uniqueness, source/doc resolution, adapter freshness, and catalog integrity without rewriting tracked files during checks.

- **Salvaged shadcn primitives ported** (decision 0040, 2026-07-28): the 13
  component files stranded on the salvage tag `salvage/ds-shadcn-full-parity`
  (`fb0238b`) are on `main`, each run through the full documentation pipeline
  rather than merged. Chat and AI primitives — **Message, Message Scroller,
  Bubble, Attachment, Spinner, Marker** — under a new **"AI & chat"** gallery
  group (the tenth entry in `groupOrder`; a cluster whose group is missing from
  that array renders nowhere). Form and layout primitives — **Field, Button
  Group, Item, Empty, Kbd, Native Select**. `direction.tsx` is a deliberate
  utility drop-in: a four-line Base UI re-export with no componentMeta entry, no
  doc entity, and no cluster. **Combobox migrated** from a Popover + Command
  composition — which had no source file, shared Command's `c-command` anchor,
  and left `/components/combobox` a dead route — to the Base UI primitive with
  its own `c-combobox` anchor, a parity-checked doc entity, and the first real
  combobox cluster; the Command cluster title drops the trailing "Combobox".
  Adaptations on the way in: three `rounded-xl` -> `rounded-lg`, and Native
  Select's hardcoded `h-8`/`h-7` -> `--control-h` tokens (it would otherwise
  have sat 32px beside a 38px Input). One new dependency, `@shadcn/react`
  pinned exact at `0.2.1`, used only by Message Scroller. Counts: **53 -> 67**
  primitives, **69 -> 81** doc entities, **81 -> 93** componentMeta entries,
  **26 -> 39** gallery clusters, **53 -> 67** ds-bundle prompt files. Lint
  **56 -> 76** warnings, 0 errors — all 20 new ones the existing
  `react/only-export-components` fast-refresh pattern; the ceiling in
  `kernel-portal/AGENTS.md` moves to 76 with a breakdown so the next climb stays
  visible. Two findings recorded but not fixed: `scripts/check-prose-quality.mjs`
  is a zero-byte file that has been in the gate list and in CI since PR #69 and
  has never checked anything, and anatomy slots are `z.array(z.string())`
  despite `lib/AGENTS.md` advertising the enriched `{ name, description }` form.

- **Nested AGENTS.md operational map** (decision 0038, 2026-07-27): adopted
  Mastra’s nested-AGENTS.md pattern. Root `AGENTS.md` + package-local files
  (`kernel-portal/AGENTS.md`, `kernel-studio-server/AGENTS.md`) + eight deeper
  files carry the operational map (per-package build/test/typecheck commands,
  the verification-gate catalogue, cross-package path facts, source-tree
  architecture). `CLAUDE.md` keeps the design conventions and points at the
  AGENTS chain. Every command/path verified against the running repo.

- **Root README + docs guide split** (2026-07-27): added a repo-root
  `README.md` (what Kernel is, the two-package monorepo, quick start, links).
  Renamed `docs/README.md` -> `docs/GUIDE.md` so the docs-system guide is not
  mistaken for the repo README; live pointers updated across `AGENTS.md`,
  `CLAUDE.md`, `docs/AGENTS.md`, and the playbook.

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
- CI quality gates (decision 0039, 2026-07-27): GitHub Actions
  (`.github/workflows/ci.yml`) runs two jobs on every PR and push to `main`.
  The `portal` job runs build (tsc -b && vite build) + lint (oxlint) + the full
  canonical gate sequence (parity, coverage, prose-quality, style-fidelity,
  status-map, composition, and the three `__check__` runtime assertions); the
  `studio` job runs `tsc --noEmit` + vitest. Node pinned to 24 (the .mts gates
  need --experimental-strip-types). Every step was verified locally job-for-job
  before commit. CodeRabbit (`.coderabbit.yaml`) adds the AI review layer, reading
  the per-directory AGENTS.md conventions. Branch protection requiring the `portal`
  and `studio` checks, and installing the CodeRabbit GitHub App, are repo-owner
  actions in GitHub settings.

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
  **81 entities** live under `src/lib/component-docs/` covering all `ready`
  entries (61 components, 6 elements, 10 patterns, 4 object marks); pattern
  entities are documentation-only (`sourceFiles: []`, no parity blocks) and the
  gate rejects unverifiable variants/anatomy/api on them. `ComponentDocSections`
  renders entities on the component page with graceful fallback for undocumented
  components, and ds-bundle prompt-guidance is generated from the same entities
  (49/52 structured; Input/Icon/InputGroup minimal or non-entity). Parity 81/0,
  coverage 81/0. **Prose + presentation (2026-07-25):** a variant key can now carry its own
  prose (`keys: string | { key, description }`; the gate normalizes both
  shapes), Button is the voice exemplar (per-key descriptions, states,
  accessibility, decision cross-refs), and `ComponentDocSections` was
  redesigned — tinted Do/Don't guideline cards, and the live demo moved
  to the top of the page. **Summary lead fix (2026-07-25):** the component
  page passed `lead={undefined}`, so every entity's `summary` — the one
  sentence orienting the reader — never rendered. It now flows through an
  exported `renderInlineCode` helper into `Section.lead` (backtick terms
  render as styled inline code), and the breadcrumb row's compensating
  `-mt-4` was dropped. **Playbook + nav
  (2026-07-25, decision 0036):** the doc-page rules are now written down in
  `docs/component-doc-page-playbook.md` (content structure, canonical block
  order, conformance ladder, prose/voice bar, layout rules, add/change
  checklist). An "On this page" section nav (`on-this-page.tsx`) derives its
  list from the same `renderedBlocks` the renderer uses (`docSectionNav` /
  `docSectionId` / shared `SECTION_TITLE`), scroll-spies the active section,
  and floats in a sticky `2xl:` rail. A grid/flex `min-width:auto` overflow
  bug in the doc sections is fixed with `min-w-0` guards (documented as a
  required rule in the playbook, with a `scrollWidth === clientWidth`
  regression check). **Full prose rewrite (2026-07-26, branch `feat/ds-prose-rewrite`):** every one of the 69 entities now carries hand-written prose - no auto-authored placeholders remain. Concrete summaries, reasoned dos/donts, and real use-cases across all families (layout, forms, overlays, navigation, data-display, feedback, marks + patterns), plus per-key variant descriptions on the remaining CVA components (badge, alert, toggle, pin, clusterbadge, legendswatch, plot, commodity-tags). `check-prose-quality.mjs` is on the branch and reports 0 placeholders; an rg scan for all six placeholder patterns returns nothing. **Style fidelity (2026-07-27, decision 0037):** the token baseline is now owned rather than inherited — `--radius` tightened `0.5rem` -> `0.25rem` and the shadow ramp rebuilt as a single-layer low-opacity set (`2xs`/`xs` transparent; `sm`..`xl` a restrained `0.04`-`0.10` ramp; `2xl` the one real lift; surfaces read nearly flat, defined by borders; Foundations "Elevation" section lead updated to match). ~40 hand-rolled uppercase-tracked overline treatments across the doc renderer and portal chrome were routed through `typeStyles.overline` (with `cn(typeStyles.overline, colorOverride)` on the tinted Do/Don't labels), `text-[11px]` -> `text-2xs`, `rounded-xl` -> `rounded-lg`. A new drift guard `scripts/check-style-fidelity.mjs` fails the build on non-`typeStyles.overline` uppercase-tracking and radius hardcodes (allowlisting deliberate one-offs), red/green proven — bringing the standing gate count to 13.
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

- **Kernel v2 prototype** (decision 0040; branch
  claude/kernel-insider-portal-fvqfq2, 2026-07-29): `kernel-app/` is a
  separate Vite app that consumes the design system **at source** (`@` alias
  -> `../kernel-portal/src`, `resolve.dedupe` for react/react-dom/recharts)
  rather than forking it. It is a **design sandbox, not a product surface** —
  it began as "Kernel Insider" (an internal product-insider portal), but none
  of that content survived and it is now a prototype of Kernel v2 itself. Its
  screens, copy and data do not define product behaviour and must not be cited
  as a spec. It pushes the DS toward a dark premium-analytics look through two
  layers only: a token override layer (`kernel-app/src/index.css` remaps the
  semantic role tokens onto DS **scale** tokens — `--background:
  var(--neutral-900)` etc.; `--chart-*` is left alone so charts keep the Kernel
  green ramp) and a modification layer (`kernel-app/src/v2-layer.css`, keyed
  off shadcn `data-slot` hooks plus `data-v2-*` markers; unlayered +
  `!important` so it beats Tailwind's utilities layer). No component is forked
  — delete the layer and stock Kernel renders. Pages: Overview (KPI cards +
  sparklines, a book-wide producer-activity feed, and a bottom strip of
  revenue trend / latest orders / cash position), Scenarios (folder tabs +
  object table whose rows expand into a producer-activity panel with a
  Since-Last-Update / All-Time underline nav and a row-level activity flag),
  Producers (ranked prospecting table whose row expander opens a nested
  open-bids inset with Accept/Reject), Settings (organization + notification
  preferences). Every collection in the app renders inside the same outlined
  `TableFrame`, and every panel heads with an `IconChip` + title/description;
  the shared furniture lives in `kernel-app/src/components/panels.tsx`.
  Elevation follows one plate ladder — page inset `2xl` > card `lg` > nested
  frame (none) — with an opaque `--border` edge and a 1px top lip at every
  level. Note for anyone tuning it: in dark the cast contributes almost
  nothing (a black shadow on the `--neutral-950` rail moves ~3 of 255 levels),
  so dark floats on edge contrast and gutter while light floats on the cast.
  Netlify serves the
  prototype for the branch via a branch-scoped `[context."…"]` block in
  `netlify.toml` (root `base`, installs both packages) so the deploy preview
  shows the prototype, not the portal — the branch name is historical and must
  stay verbatim, since the context block matches it literally; `main` still
  builds the portal. Eight DS defects surfaced and were fixed upstream:
  `Table`'s `striped` selector was descendant-scoped (leaked into nested
  tables), `SidebarInset` lacked `min-w-0` (wide content pushed the page past
  the sidebar), `Button`'s optical icon padding never fired (it keyed off a
  `data-icon` attribute almost nothing set), Tabs applied hover styling to the
  active tab, light mode needed the pre-paint theme script, the elevation ramp
  had no dark-mode retune and a non-monotonic top rung (decision 0042), and the
  the `prefers-reduced-motion` guard zeroed animation/transition *durations* but
  not their **delays**, so a delayed transition still waited out its delay and
  snapped (contradicting decision 0018's "near-instant" intent), and the
  coarse-pointer hit extensions (decisions 0007 + 0009) omitted
  `select-trigger` — a compact select grew to 40px visibly but never got the
  `::after` extension that carries the effective target to 44px, because it is
  not a `[data-slot="button"]`. `mobile-audit` had flagged it for several
  rounds; the register had wrongly written it off as sanctioned. Not merged to
  main — **`docs/v2-prototype-drift.md` is the full drift register**: how the
  prototype attaches to the DS, every token remapped (including the inverted
  dark elevation model and the 3.5x radius), every modification-layer rule, all
  seven DS source changes, and the prototype's own convention departures — with
  per-item cherry-pick guidance, since the DS bug fixes are worth rescuing
  independently of whether the prototype lands.

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
