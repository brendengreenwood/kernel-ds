# 2026-07-10 — Static preview (retired surface)

Archived from `STATE.md` on 2026-07-10 because the static preview was
retired (decision 0022) — the portal is now the single surface. Worklog
coverage: entries through 2026-07-10 in `worklog/2026-07.md`.

## What it was

The **static preview** — `Kernel Design System.html` + `theme.css` +
`portal.css` + `portal.js` at the repo root. Zero-build, open-in-browser.
It was the original surface of the system; `kernel-portal/` (the real
build) was added later and the two were kept mirrored on every change per
the old CLAUDE.md contract. It was never deployed — Netlify always
published only `kernel-portal/dist`.

## Preview-specific state at retirement (all verified by the 2026-07-10 audit)

- Both surfaces were verified mirrored by the 2026-07-03 sync audit and
  re-proved by the 2026-07-10 project audit (296 light / 41 dark tokens on
  both surfaces, 0 value drift after one mechanical fix; 24 nav links = 24
  sections; component status ready 57 / experimental 11 on both sides).
- Per-page IA (decision 0011): the preview used a `portal.js` hash router
  showing one `.section.is-active` at a time (sub-anchors resolved to
  their section), gated on a pre-paint `.js` class. The two rails mirrored
  at destination level; per-component pages were portal-only by design.
- Mobile ergonomics (decisions 0007/0009): the preview had a hamburger →
  drawer nav below 880px; `.table-wrap` overflow-x + `.crud-scroll`
  wrappers made tables scroll in place; the drawer's `.nav-link` rows grew
  to 44px on coarse pointers; last mobile audit 0/0/0/0 at 390px.
- Control density (decision 0010): the preview's `.fb` filter builder was
  swept onto the `--control-h-*` tokens; the preview default control
  height was 38px before the portal converged on it.
- Dogfooding (decision 0014): the preview chrome CSS mirrored the portal's
  named type roles (`src/lib/type-styles.ts`).
- Doc pager (decision 0015): the preview mirrored `<DocPager>` via a
  `#doc-pager` populated by `portal.js`.
- Motion (decision 0018): motion tokens existed on both surfaces with a
  `prefers-reduced-motion` guard; `portal.css` still carried ~30 raw
  duration literals predating the token system (backlogged, now moot).
- Icons (decision 0019): preview `<svg>`s were single-path MDI
  (`fill="currentColor"`), including the `portal.css` select-arrow
  data-URIs and `portal.js` pager chevrons.
- The portal-only carve-out (decision 0012) existed to exempt third-party
  React packages (border-beam, motion engines) from the mirror rule.
- The a11y backlog carried a "preview-CSS pairing pass" item (never run;
  moot with retirement).

## Why retired

The mirror was double-entry bookkeeping: every parity finding in the
2026-07-10 audit was drift caused by it. Nothing consumed the preview
(owner confirmed 2026-07-10); CI and Netlify only ever touched
`kernel-portal/`. Full rationale in decision 0022.
