# 0082 — Measured surface ladder, status roles, and branded inverse

**Status:** Accepted (2026-10-02) on `exp/claude-shell`; not yet on `main`.

## Context

The Claude-shell experiment (`claude-shell/`, see its `DRIFT.md`) rebuilt a
real product screen from Kernel parts. In dark mode the page and panels did not
separate (one 0.057 L jump, `--muted` equal to `--card` so `bg-muted` was
invisible on cards). In light mode page and card were both pure white. Status
colors existed only as numbered scales, so screens reached for `text-info-400`.
Input edges failed WCAG 1.4.11 against panels in both modes.

Values were measured from claude.ai's computed `--om-*` tokens, not eyeballed.

## Decision

1. **Surface ladder.** Solid surfaces step in even small lightness increments
   at Kernel hue 165 with neutral chroma. Dark goes lighter as layers rise
   (page 0.22 → panel 0.25 → raised 0.28 → popover 0.30); light puts white
   cards above an off-white page and steps recessed fills darker.
2. **Edges, hover, and secondary text are the foreground at partial opacity**
   (`--border` 12% dark / 10% light, `--muted-foreground` 64%), so they read on
   every rung without per-surface values.
3. **`--accent` (hover/menu highlight) is neutral**, not brand. Selection gets
   its own green token when a selected-row component lands.
4. **Status roles** `--info|success|warning|error` + `-foreground` + `-muted`,
   registered in `@theme`. Screens use `text-info`, never a numbered scale.
5. **`--input` darkened** to clear 3:1 on panels; dark `--destructive` moved to
   `error-400` to clear 4.5:1. Control fills use foreground overlays
   (`bg-foreground/5`, hover `/12`) instead of `bg-input/*`.
6. **Button `inverse` variant** on the brand ramp (`--inverse` brand-900 light,
   brand-100 dark) for a second strong action.
7. **`--shadow-panel`** for the one main work panel; `--shadow-color` stays green.
8. **Optical icon padding:** narrow-ink glyphs (chevrons) carry
   `data-optic="narrow"` and Button pads to the visible ink.

## Consequences

Every dark and light Kernel screen changes, portal included. `/tables`
checked in both modes; `/forms` and `/dashboard` still unchecked. Surface
values are raw numbers today — next step is named ladder roles
(page/panel/raised/overlay) plus a gate that keeps the steps intact.
Supersedes the "nav selection is neutral, not green" and "`--muted` equals
`--card`" notes in the dark token block.
