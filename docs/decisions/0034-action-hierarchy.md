# 0034 — The action hierarchy: decisive / primary / secondary / tertiary

Date: 2026-07-20 · Status: accepted · Builds on 0033

## Context

Decision 0033 made the surgical blue the top of an emphasis ladder — and
the owner's follow-up: now that the blue is a major mental model, the
tiers beneath it need to be a defined system too, with a **white**
secondary and a tertiary level. Until now the Button variants existed as
a flat list (default/secondary/outline/ghost/…) with no doctrine about
which to reach for when composing an action cluster.

## Decision

**Four tiers of action emphasis, each mapped to an existing Button
variant, each with its own license:**

| Tier | Variant | Rendering | License |
| --- | --- | --- | --- |
| 1 · Decisive | `action` | cobalt blue solid | the commit moment — at most one per view (0033) |
| 2 · Primary | `default` | brand green solid | the main routine action of a region — about one per region |
| 3 · Secondary | `outline` | **white** surface, border, foreground text (raised translucent surface in dark) | supporting actions — any number |
| 4 · Tertiary | `ghost` | transparent, text-only | quietest — cancel, dismiss, inline utilities |

- **Composition rules**: read a cluster right-to-left and the ladder
  descends; adjacent buttons differ by at least one tier; never two
  solids side by side. Beside a decisive blue, routine siblings go white
  or ghost — the green tier is skipped (a dialog footer is
  ghost · outline · action, not green · green · blue).
- **No new variants, no new tokens.** The white tier is the existing
  `outline` treatment (paper white in light via `--background`, raised
  `--input/30` surface in dark); the tertiary is `ghost`. The hierarchy
  is doctrine mapped onto proven pieces — both tiers' contrast pairs are
  already gated by the audit (`foreground`/`background`, `muted` pairs).
- **The brand-tinted `variant="secondary"` is re-scoped, not removed**:
  it sits outside the action ladder — toned chips, toggled/selected
  states (e.g. filter chips ride `bg-secondary`) — and should not appear
  in action clusters, where "secondary" now means the white outline tier.
- The ladder is documented where builders meet it: a comment block on
  `buttonVariants` in `ui/button.tsx`, a hierarchy row + `action` swatch
  in the Button gallery cluster, and a full "Action hierarchy" section on
  `/color-roles` with dialog-footer and list-header compositions.

## Consequences

- "Which button variant?" now has a deterministic answer: find the tier.
- The two composition demos encode the common cases: decisive moment
  present (ghost · outline · action) and absent (ghost · outline · green).
- If a future surface genuinely needs a distinct white-button treatment
  that `outline` can't express, that's a new decision — don't fork the
  tier meanings ad hoc.
