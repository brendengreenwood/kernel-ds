# 0009 — Comfortable touch sizing: controls visibly grow on coarse pointers

Date: 2026-07-03 · Status: accepted · Amends 0007

## Context

Decision 0007 gave compact controls ≥44px *effective* touch targets via
invisible pseudo-element hit extensions, deliberately leaving visuals
untouched. Using the system from a phone, the owner's verdict: hit areas
aren't enough — buttons and inputs should *feel* comfortable to tap, which
means visible size.

## Decision

On `@media (pointer: coarse)` only, primary controls grow to comfortable
visible sizes; desktop pointer density is untouched:

- **Portal** (`src/index.css`): `button` slot min-height 44px (compact
  `h-7`/`h-6` sizes → 40px; icon sizes gain matching min-widths), `input`,
  `input-group`, and `select-trigger` slots min-height 44px (sm trigger
  40px). `min-height` deliberately wins over utility `h-*` heights —
  even `h-8!` — without `!important`.
- **Preview** (`portal.css`, same coarse block as the 0007 rules):
  `.btn`/`.theme-toggle`/`.filter-chip`/`.ghost-link`/`.input`/`.select`/
  `.addon-select`/`.view-tab` 44px; `.btn-sm`/`.input-sm`/`.page-btn`
  40px; `.btn-icon`/`.nav-toggle` 44px square; `.row-kebab` 36px;
  segmented buttons 36px.

The 0007 invisible extensions **stay** for controls that remain small by
design (checkbox/radio/switch glyphs, row kebabs, dense chips) — sizing
and extension compose: visible size where it reads as comfort, extension
where visual growth would wreck density.

## Consequences

- 0007's "never resize visuals" clause is superseded; the rest of 0007
  (drawer nav, 16px input floor, extensions) stands.
- Touch layouts get taller rows and may wrap sooner — that is the point;
  demos must tolerate it (verified at 390px on both surfaces).
- New controls choose: primary/standalone → visible 44px on coarse;
  dense/inline → keep size, extend hit area.
