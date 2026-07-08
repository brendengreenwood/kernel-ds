# 0017 — Revert the orange action color; actions stay green

Date: 2026-07-08 · Status: accepted · **Supersedes 0016**

## Context

Decision 0016 made Cargill orange the action color (`--primary`/`--ring` →
`--orange-*`) with green reserved for navigation, and it shipped (PR #26).
On review the owner changed their mind: **don't use orange for actions.**

## Decision

**Revert 0016 entirely.** Actions go back to green; the orange scale is
removed.

- `--primary`, `--primary-foreground`, and `--ring` return to the brand
  green values in both modes (light `oklch(0.5364 0.1457 150.5842)`, dark
  `oklch(0.8722 …)`), exactly as before 0016.
- The `--orange-*` scale is removed from both surfaces (`index.css` +
  `theme.css` scales and `@theme` maps, the `#colors` ramp and `#install`
  reference, the `foundations.tsx` ramp and Primary role pair, the README).
  It was introduced only to be the action colour; with that rejected it has
  no role, so it's gone rather than left as an orphan.
- The green brand again does double duty (nav + action), as it did before
  0016; the "two brand roles" convention added to `CLAUDE.md` by 0016 is
  removed.

## Consequences

- Back to the pre-0016 state: green primary buttons/links/focus, green nav.
- 0016 remains on record (immutable) as a decision that was made, shipped,
  and reversed — this record is the supersession, not an edit of 0016.
- If a Cargill-orange accent is ever wanted again, it starts fresh from this
  point with a clear role defined up front (e.g. a dedicated `--action`
  token distinct from links), not by repurposing `--primary`.
