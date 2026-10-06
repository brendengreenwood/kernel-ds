# Map design system (origination map)

A grammar for drawing grain data on a map. Every visual channel has one job; no meaning gets two channels. Rules here are backed by code — each points at where it lives.

## Three layers

1. **Ground** — land, water, roads, rail, rivers. Quiet, ranked, recedes. (`src/components/draw-area-map.tsx` `mapPalette()`, `om-rail`, `om-rail-flow`, `om-rivers`)
2. **Marks** — every data point, drawn by one recipe. (`marker()` in `draw-area-map.tsx`)
3. **Chrome** — frame, floating panes, legend, filter dock. Floats above the map; moving to `@kernel/ui` panes (PR #99, decision 0083).

## Channels

| Channel | Means | Never means |
|---|---|---|
| Fill vs hollow | Filled = company buying point. Hollow = destination, any owner | Kind |
| Shape | Facility kind: triangle river terminal, circle elevator/ethanol, square plant/feedyard, diamond export terminal/port | Owner |
| Hue | Owner (buying points) or category (destinations) | Importance |
| Size | Capacity, capped so no destination outweighs a buying point | Owner |
| Lightness | Closeness to the viewer: lighter = closer in dark; light mode mirrors | Category |
| Outline weight, beam | Interaction: hover +0.5, selected +1, selected also gets the border beam | Data |

## Hue ledger

Hues are a finite budget. Claim one here before using it.

| Hue | Meaning | Token |
|---|---|---|
| Brand green | Cargill | `--om-cargill` |
| Plum | ADM | `--om-adm` |
| Sky / cool gray | Water only — blue means nothing else | `--om-water`, rivers |
| Rust | Rail flow | `--viz-rust-*` |
| Teal | Export ports | `--om-port` |
| Wheat | Ethanol plants | `--om-refinery` |
| Slate (200 in dark) | Feedyards | `--om-feed` |
| Clay | Reserved: LDC | `--om-ldc` |
| Crop | Reserved: reads as Cargill — avoid | — |

The ledger is full. A new category (inland terminals) needs a second channel or a grouping, not a new hue.

Category hues are a step darker in light mode (600) and lighter in dark (400, slate 200), same as company hues.

## The marker recipe

One call per mark kind: `marker({ id, source, image, scale, fill, ring, ringWidth, filter?, layout?, before? })` emits `<id>-shadow` and `<id>`.

- Shared: shadow, size curve (zoom 3/5/7/9 → 0.3/0.45/0.75/1.1), outline zoom curve, hover/selected thickening, 200 ms transition.
- Shadow is a pre-blurred image per shape (`om-shadow-<shape>`), not an SDF halo — halos wider than the SDF falloff fill the icon quad and show as squares at high zoom.
- Per kind: buying points fill company hue, ring 3px page-colored; destinations fill page color, ring 1.5px category hue, scale × capacity × 0.8.
- Glyphs are SDF (`shapeImage()`), 80px with 20px edge so thick outlines don't clip.
- Draw order: destinations under buying points; processing plants on top of buying points.

Adding a mark kind = one `marker()` call. Don't hand-build symbol layers.

## Ground and frame

- Dark ranks away from the ground toward light; light mode mirrors the same table (`mapPalette()`).
- Light frame `--sidebar: var(--brand-950)`; Cargill mark in the rail.
- Tooltips: darkest neutral in dark mode.
- Loading: thinking-orbs "Solving" orb until the map first paints; static under reduced motion.

## Data

Every mark traces to a public source in `data-source/` (`draw-areas-upstream.md`, `destinations-upstream.md`). Town-level points sharing a coordinate fan out within ~2 miles so each can be hovered.

## Open

- Inland terminals: no data, no hue.
- Light/dark mirror: rule or current tuning?
- Selected beam and light-mode sidebar collapse glitch not verified with a real click.
