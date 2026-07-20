# 0033 — Mostly green; the action blue is surgical

Date: 2026-07-20 · Status: accepted · **Amends 0032** (keeps the
`--action-*` scale and its hue rationale; reverses the role wiring)

## Context

Decision 0032 pointed the whole action layer at the new blue —
`--primary`, `--ring`, links, focus, selection — and the Color-in-use
page rendered a screen where every affordance was blue. On review the
owner's direction: **too much blue. The system must stay mostly green,
with the action blue used very surgically.** The same feedback shape as
0017 (the orange revert), but narrower: the blue itself is right; its
footprint was wrong.

## Decision

**Actions revert to green; the blue becomes a single-use accent.**

- `--primary`, `--primary-foreground`, `--ring`, and `--sidebar-ring`
  return to their pre-0032 brand-green values in both modes (light
  `oklch(0.5364 0.1457 150.5842)`, dark `oklch(0.8722 0.1272 127.8039)`).
  Buttons, links, focus rings, selection, and all chrome are green again.
- The `--action-*` scale (unchanged from 0032 — cobalt 254→267, chroma
  peak 0.190, sRGB-gamut-exact) is reserved for **at most one element per
  view**: the decisive action that commits or advances the workflow.
  Its delivery mechanism is a first-class **`Button variant="action"`**
  (light `action-600` + white, 5.32:1; dark `action-400` + `action-950`,
  7.17:1; blue-tinted focus ring) — mirroring how 0017 said a future
  accent should arrive: "a dedicated `--action` token … not by
  repurposing `--primary`".
- **Usage doctrine**: Post bid, Price selected, Settle, Confirm — the
  commit moment. Never navigation, never routine actions (create, export,
  save draft), never chrome, never bulk-applied signifiers (filters,
  sort, selection washes). If a screen has no decisive moment it has no
  blue; scarcity is the mechanism that makes the blue read as "the thing
  to do next".
- **Traversal ink stays** (from the 0032 work): green text-links
  (breadcrumbs, record links, inline navigation) use `brand-700` light /
  `brand-300` dark; active tab underlines `brand-600`/`brand-400`.
- `contrast-audit.mjs` gains an "Action button" section so the variant's
  two pairings stay gated even though no role token points at the scale.

## Consequences

- The portal reads green again everywhere; the blue appears exactly once
  per screen that has a commit moment (see `/color-roles`).
- 0032's hue analysis (placement vs info/sky/slate, the 93° distance to
  the teal-leaning success green) still stands — it justifies the scale,
  now under a narrower license.
- If the surgical rule erodes (blue creeping into routine buttons), point
  at this record: one per view is the contract.
