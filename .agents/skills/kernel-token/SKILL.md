---
name: kernel-token
description: Add or change a color scale, status/commodity hue, or any design token in the Kernel design system, keeping every surface in sync. Use for "add a color", "new viz hue", "new commodity", "change the brand ramp", "add a spacing/radius/shadow token", or any edit to theme.css / index.css tokens. Handles the full OKLCH-ramp + @theme + token-reference pipeline.
user-invocable: true
---

# Kernel — add/change a token

Tokens live on **two mirrored surfaces** that must always agree. Missing one
surface is the #1 way this system drifts. Touch **all** of these in one pass.

## The three color axes (never cross them)

- **Status** — persistent lifecycle state (`--status-*`, `<StatusBadge>`).
- **Notification** — momentary event outcome (`success`/`warning`/`error`/`info` on `Alert`/`Badge`). These four scales run **50→900** by design (decision 0004).
- **Commodity** — which grain (`--commodity-*`, `<CommodityBadge>`; corn/canola/soybeans/wheat — decision 0013).
- **Data-viz** (`--viz-*`) stays abstract — chart series that must not read as a status.

A new categorical hue picks the right axis. New hues are **full 50→950 scales** + `-light`(200)/base(500)/`-dark`(700) aliases, following the brand/viz ramp shape.

## Ramp convention (OKLCH)

Model L/C/H on an existing sibling ramp (`--viz-*`): L descends ~0.975→0.225 across 50→950; chroma peaks mid-scale; hue ~constant. Keep values **identical byte-for-byte** across files — generate them once (a tiny Python dict → string script is the reliable way; see the commodity add in `docs/worklog/2026-07.md`) rather than hand-copying 44 numbers.

## Surfaces to edit (all, same turn)

1. **`kernel-portal/src/index.css`**
   - `:root` — the scale steps + aliases (add after the matching family; e.g. after `--viz-slate-*`).
   - `@theme inline` — the `--color-<name>-<step>: var(--<name>-<step>)` maps (so `bg-<name>-500` utilities exist). Add after the matching family's color maps.
   - If the token is a **role token** (remaps light/dark), also add the `.dark` override. Scales are absolute — no `.dark` block.
2. **`theme.css`** (preview) — mirror the same `:root` scale + aliases.
3. **`Kernel Design System.html`**
   - `#install` → **"4 · Tokens — complete reference"** — add the exhaustive ramp rows (`.ramp` with `.ramp-cell lt/dk` per step, `title`+`data-copy`+`data-copy-label`). It is a full list, not an excerpt.
   - `#colors` foundation — add a labeled panel/ramp so the palette page shows it (with an example badge/tag if categorical).
4. **`kernel-portal/src/components/portal/foundations.tsx`** — add a `<Ramp .../>` (and example component) to `ColorsSection`, matching the HTML.
5. **`kernel-portal/README.md`** — Color system / Type scale section mention.
6. If the token drives a **new component** (a badge/tag for the hue), build it as a `StatusBadge` sibling in `src/components/ui/` and add a `component-meta` entry — see `/kernel-feature`.

## Finish

- `cd kernel-portal && npx tsc -b && npm run build`.
- `node scripts/contrast-audit.mjs` — every rendered pair must pass AA 4.5:1 (soft-fill badges included). Fix L nudges in the role layer if any fail (decision 0003/0004 history).
- Then `/kernel-verify` (screenshots both surfaces, light+dark) and `/kernel-ship`.

## Reference decisions

0003 (status vs notification), 0004 (notifications end at 900), 0010 (control tokens), 0013 (commodity coding). Read the relevant one before changing its tokens.
