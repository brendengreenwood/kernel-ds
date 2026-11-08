# 0085 — Floating surface, segmented toggle, overline, dark-card tints

Date: 2026-10-08
Status: accepted

## Context

The origination-map v2 merchant workspace floats panels over a full-bleed map. Building it surfaced gaps Kernel had to patch locally: kernel-app's segmented toggle existed only as app CSS; dark `--muted` equals `--card`, so `bg-muted` hover (`Item`) and the `Calendar` today marker disappeared on cards; all-caps panel titles were hand-written; in dark mode `--input` equalled the floating panel fill so field edges vanished; native controls ignored the theme.

## Decision

- `Toggle`/`ToggleGroup` gain `variant="segmented"`: bordered track on `--radius-surface`, pressed item fills with `--primary`. Use for one-of-few filters.
- `Item` link hover uses `bg-foreground/5`; `Calendar` today uses `bg-foreground/8` — the foreground-overlay rule already noted in `styles.css` for dark cards.
- `text-overline` utility in `@kernel/ui` is the one all-caps small-label recipe; the portal's `typeStyles.overline` composes it.
- `--floating` token (`bg-floating`): card in light, one step brighter than card in dark. Containers marked `data-surface="floating"` drop inputs/select triggers to `--card` in dark so field edges hold.
- `:root` / `.dark` set `color-scheme` so native controls follow the theme.

## Consequences

kernel-app's local `[data-v2-segmented]` CSS can be replaced by the variant. Prototypes delete their local copies (see `prototypes/origination-map-v2/PATCHES.md`).
