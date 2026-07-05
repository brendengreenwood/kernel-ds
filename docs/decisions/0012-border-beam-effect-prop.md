# 0012 — Border beam: a third-party effect as an opt-in prop (portal-only)

Date: 2026-07-05 · Status: accepted

## Context

The owner wanted the `border-beam` package
(https://github.com/Jakubantalik/border-beam, MIT) installed and working
"as a prop for buttons and inputs and cards" — an animated glowing border
for drawing attention to a focal control.

`border-beam` is a React component (`>=18`, no other deps,
`sideEffects: false`) that **wraps** its children in a positioned `<div>`
and overlays the beam with pseudo-element layers, auto-detecting the
child's border-radius. It is not a token or a CSS utility.

## Decision

**Expose it as an opt-in `borderBeam` prop on `Button`, `Input`, and
`Card`, not a standalone component.**

- Prop type: `borderBeam?: boolean | Omit<BorderBeamProps, "children">`.
  `true` uses the control's sensible default beam; an object tunes it
  (`size` · `colorVariant` · `strength` · `active` · …).
- A shared `BeamWrap` (`components/ui/border-beam.tsx`) wraps the rendered
  control only when the prop is set — so every un-beamed Button/Input/Card
  pays nothing (no wrapper, no `useTheme` subscription, beam code never
  instantiated).
- The beam's light/dark `theme` follows the app's resolved theme
  (`next-themes`) unless the caller overrides it, so the glow matches the
  surface it sits on.
- Per-control defaults: Button → `size:"sm"` inline wrapper; Input →
  `size:"line"` (bottom traveling glow) full-width; Card → `size:"md"`
  full border, wrapper `h-full` so it fills a grid cell.

## Portal-only — no static-preview mirror

This is a **deliberate exception** to the two-surface mirror rule
(CLAUDE.md). The static preview (`Kernel Design System.html`) is
zero-build and cannot import a React package. Faithfully reproducing the
beam would mean hand-porting its animated conic-gradient / pulse layers to
bespoke CSS — a large, divergent reimplementation of someone else's
library, not a mirror. So:

- The effect lives only in the real build (`kernel-portal/`), which is
  what deploys to production.
- Its `component-meta` entry and the docs say "portal-only" explicitly, so
  the divergence is recorded, not silent.
- If we later want it in the preview, that is its own task: a CSS
  approximation, tracked and labelled as an approximation.

## Consequences

- `border-beam` is now a runtime dependency of `kernel-portal`.
- New controls that want the effect follow the same pattern: render
  through `BeamWrap` with a per-control default; never wrap unconditionally.
- The mirror rule now has one named carve-out (third-party React-only
  effects); future ones cite this record rather than re-litigating it.
- The effect is purely decorative and reduced-motion aware (the library
  respects `prefers-reduced-motion`); guidance says reserve it for a
  single focal action.
