# 0018 — A motion system: tokens + reduced-motion, engines opt-in

Date: 2026-07-08 · Status: accepted

## Context

The owner wants "a good system to add polish." The temptation is to import a
decorative component pack (e.g. SmoothUI) — but most of those cut against
this project's restrained, native-feeling B2B ethos, and SmoothUI's registry
is unreachable from this environment anyway (network policy blocks
`smoothui.dev` / `ui.shadcn.com`; only npm-style hosts are allowed). Polish
should be a *system*, the same way density (`--control-h-*`) and type roles
are — not a grab-bag of widgets.

## Decision

**Motion is token-driven and accessible by default; richer engines are
opt-in npm libraries layered on top.**

- **Motion tokens** (both surfaces, `index.css` + `theme.css`): a small
  timing + easing scale — `--duration-fast` 120ms · `--duration-base` 200ms ·
  `--duration-slow` 320ms; `--ease-out` (decelerate, most UI) · `--ease-in-out`
  (symmetric) · `--ease-spring` (playful overshoot). One place to tune the
  whole system's feel; new animation references these, never ad-hoc ms/curves.
- **Reduced-motion guard** (both surfaces): a global
  `@media (prefers-reduced-motion: reduce)` rule near-zeros animation and
  transition durations and disables smooth-scroll. Polish never costs comfort;
  this ships before any animation does.
- **Engines are opt-in and npm-installed** (the block is only the shadcn
  registry hosts — npm works): recommended, all tasteful and domain-fitting —
  `@number-flow/react` (rolling numerics for prices/bushels/basis/settlement —
  the standout, because it draws the eye to *what changed*),
  `@formkit/auto-animate` (list/table/reorder transitions), and `motion`
  (Framer Motion) as the general engine. React engines are **portal-only**
  (decision 0012); the token layer + CSS animations mirror to the preview.

## Consequences

- "Make it feel snappier/softer" is a token edit, not a sweep.
- Every interaction respects `prefers-reduced-motion` for free.
- Adopting an engine is a scoped, tracked task (install + wire + verify),
  starting from a consistent token base rather than one-off durations.
- New components animate with the tokens (`duration-[var(--duration-base)]
  ease-[var(--ease-out)]` in Tailwind, or `var(--…)` in preview CSS).
