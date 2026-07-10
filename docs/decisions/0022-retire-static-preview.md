# 0022 — Retire the static preview: the portal is the single surface

**Status:** accepted · 2026-07-10

## Context

Kernel began as a hand-maintained static preview (`Kernel Design System.html`
+ `theme.css` + `portal.css` + `portal.js` at the repo root) and later grew a
real build (`kernel-portal/`, React 19 + Vite + shadcn). CLAUDE.md required
every change to land on both surfaces in the same turn — double-entry
bookkeeping enforced by convention, not tooling.

By 2026-07 the authority had flipped:

- All recent work landed portal-first; the preview was a trailing mirror.
- Netlify deploys only `kernel-portal/dist` (`netlify.toml`) — the preview
  was never deployed.
- CI (`.github/workflows/ci.yml`) runs only in `kernel-portal/`.
- The 2026-07-10 project audit (`docs/audit/2026-07-10-project-audit.md`)
  found that every parity discrepancy was drift caused by exactly this
  mirror ritual, and proved all portal gates (tsc, build, lint, contrast,
  mobile 390px) green independent of the preview files.
- `kernel-portal/` has zero references to the root preview files;
  `index.css` is self-contained (the audit's token-parity proof showed
  0 value drift, so it carries every token the preview did).
- The owner confirmed nothing consumes the preview anymore (2026-07-10):
  "i dont need that anymore. as long as the portal is now working properly
  and deploying".

## Decision

**Delete the four preview files. `kernel-portal/` is the single surface of
the Kernel design system.** There is no mirror; there is nothing to keep in
sync. Tokens live in `kernel-portal/src/index.css`, foundations in
`foundations.tsx`, component status in `component-meta.ts`, coverage notes
in `kernel-portal/README.md`.

## Consequences

- `CLAUDE.md` is rewritten as a single-surface contract: the mirror/sync
  rules are gone; docs discipline, color-axis, scale-range, motion, icon,
  and mobile-ergonomics conventions carry over unchanged.
- The six project skills (`kernel-feature`, `kernel-token`, `kernel-verify`,
  `kernel-norman`, `kernel-typesetting`, `kernel-ship`) drop their preview
  steps/legs (preview markup, `theme.css` mirroring, HTML token-reference
  regeneration, port-4601 serve, preview screenshot/mobile-audit legs).
- Parity checks between surfaces are obsolete — there is one source of
  truth, so token drift of that kind can no longer exist.
- Decision 0012's "portal-only carve-out" framing is moot (everything is
  portal-only now); its actual decision — border-beam as an opt-in prop —
  still stands, so 0012 keeps its accepted status.
- Historical docs (worklog entries, decisions 0001–0021, audit reports,
  archives) keep their preview references — they are records of the past.
- The preview-specific portion of `STATE.md` is archived to
  `docs/archive/2026-07-10-static-preview.md` per docs discipline.
