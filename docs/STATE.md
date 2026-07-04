# STATE — what is true right now

> Living document. Edited in place on every change. History lives in
> `worklog/`; rationale lives in `decisions/`; retired sections in `archive/`.
> Last touched: 2026-07-03

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
   sections); entry `src/main.tsx` → `src/pages/portal.tsx`. Deploys to
   Netlify (`netlify.toml`: build to `dist/`, SPA redirect).

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
  internals.
- Netlify deploy configured for `kernel-portal` (build command, publish dir,
  SPA redirect).
- Docs system (this directory) in place — see decision 0001.
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
  presets) — both surfaces, experimental. Candidates next: origination
  flows, pricing worksheet patterns, bulk-edit patterns.

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

## Open questions

*(none currently)*
