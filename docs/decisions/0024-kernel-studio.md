# 0024 — Kernel Studio: generative prototyping on HTML-in-Canvas

**Status:** accepted · 2026-07-12

## Decision

Kernel gets a generative design-prototyping surface, **Kernel Studio**:

- A **Mastra dev server** in a new repo-root package `kernel-studio-server/`
  hosts `kernel-design-agent` (Anthropic Sonnet), which reads the real
  ds-bundle (component docs, design docs) through tools and writes
  contract-validated prototypes to `kernel-studio-server/prototypes/<id>/`
  (manifest + JSX screens + README auto-doc). Contract v1 is specified in
  `kernel-studio-server/PROTOTYPE-CONTRACT.md` with a zod schema enforced by
  the `write-prototype` tool.
- A **`/studio` route** in the portal renders prototypes on an
  **HTML-in-Canvas flow map**: each screen mounts live into a pooled
  `layoutsubtree` container and is drawn with `ctx.drawElementImage`
  (Chrome 150 behind `--enable-features=CanvasDrawElement`), with pan/zoom,
  direction lanes, and edge curves. Clicking a card enters a **player mode**
  that reparents the real DOM into a full-size overlay — fully interactive —
  with edge-based navigation, then returns it to the canvas pool.
- A **chat panel** on /studio streams from the agent (text + image parts);
  finished generations land on the map without a reload.
- **Prototypes render via the ds-bundle browser global** (`window.Kernel` +
  vendored React), transpiled at runtime with sucrase — no build step per
  generation. The portal's React 19 renders the shell; the vendored React
  renders prototype subtrees into dedicated nodes. The two never mix.
- The studio is **dev-server-only**: the Vite middleware that serves
  `ds-bundle/` and `prototypes/` exists only under `vite dev`. The deployed
  portal is unaffected (capability gate shows instructions in unflagged
  browsers; every other route works untouched).

## Why

- **Prototyping with the real system.** Generated prototypes consume the
  actual ds-bundle components and tokens, so a design idea is expressed in the
  system's true vocabulary — not a lookalike.
- **Flow map + player** covers both needs: seeing a whole multi-screen,
  multi-direction workflow at a glance (canvas), and feeling one screen as a
  real interactive artifact (player). HTML-in-Canvas makes the map cheap: the
  same live DOM that powers the player is drawn to the canvas, no
  screenshotting pipeline.
- **Runtime transpile over per-prototype builds.** sucrase + browser globals
  means zero build steps per generation; a Vite build per prototype was
  rejected as slow and stateful.
- **Fixture-first ordering.** A committed hand-written fixture
  (`fixture-grain-intake`) decoupled canvas work from agent work, so canvas
  iteration never cost a model call.

## Alternatives considered

- **Agent-first ordering** — rejected: every canvas iteration would cost a
  model call and block on the API key.
- **Per-prototype Vite builds importing portal source components** — rejected:
  needs a build per generation; the browser-global bundle needs none.
- **Separate repo** — rejected: the studio is a portal surface over this
  repo's ds-bundle; decision 0022's single-surface principle extends here.

## Constraints that shaped it

- `drawElementImage` requires the `layoutsubtree` attribute **on the canvas**
  and only draws **immediate children** of that canvas; offscreen-positioned
  children draw fine, hidden ones don't. The pool design follows directly.
- `ds-bundle/` stays untracked (synced artifact); the studio reads it at
  runtime and never commits it.
- Agent reliability needed explicit loop budgets (`maxSteps`,
  `maxOutputTokens`) — the model-loop defaults truncated multi-screen
  write-prototype calls mid-JSON.
