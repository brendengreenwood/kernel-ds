# 0010 — Control density comes from tokens; the default gets chunkier

Date: 2026-07-04 · Status: accepted · Refines 0009

## Context

The owner's read after living in the system: "the UI feels too compact…
I want things a bit chunkier, but I don't want to go crazy adjusting it."
Investigation showed the two surfaces actually disagreed: the preview's
controls were 38px tall while the portal (base-nova defaults) sat at
32px — the deployed portal was the compact one. Density adjustments were
scattered: per-component size props, the table density modes, and the
0009 coarse-pointer min-height overrides.

## Decision

**One knob: three control-metric tokens**, defined in both `theme.css`
and `kernel-portal/src/index.css`, referenced by every interactive
control (button, input, select trigger) on both surfaces:

```
--control-h-sm: 2rem;      /* 32px — compact toolbars, dense rows  */
--control-h:    2.375rem;  /* 38px — the resting default           */
--control-h-lg: 2.75rem;   /* 44px — hero actions; touch minimum   */
```

- Portal components use the Tailwind var syntax (`h-(--control-h)`,
  `size-(--control-h)` for icon buttons); the preview uses
  `var(--control-h)` directly. **Never hardcode a control height.**
- The default lands at 38px — the preview's existing value — so the
  preview is visually unchanged and the portal converges up from 32px.
- On coarse pointers the tokens themselves are redefined
  (40 / 44 / 48px), which is now the primary mechanism of decision
  0009's visible touch sizing; the old min-height rules remain only as
  a backstop for call sites with explicit heights.
- The **table density modes are untouched** — data density is a separate
  axis from control density, and tables already own it.

## Consequences

- "Make it chunkier/tighter" is henceforth a token edit, not a sweep.
- An app-level compact/comfortable user setting is now trivial: redefine
  the three tokens under a `[data-density]` attribute when wanted.
- Call sites that intentionally set explicit heights (dense demo rows,
  the filter builder's h-7 controls) opt out locally — that stays legal
  but should be the exception.
- New interactive control components must reference the tokens.
