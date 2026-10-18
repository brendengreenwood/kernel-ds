/** Kernel-themed MapLibre basemaps.
 *
 *  Ported from the map app (`src/lib/map-styles.ts`) with its palette intact.
 *  An earlier pass here retuned the ground to read as the plate — same hue as
 *  the card, land a step up, water a step down. It was wrong: the map app's
 *  ground is the one that has been looked at for months, and a basemap tuned
 *  to disappear into its container stops reading as territory.
 *
 *  Hex, not `oklch()`: these values cross into MapLibre's paint properties,
 *  which are parsed by the map's own colour engine, not the browser's — a
 *  `var()` would arrive as an unparseable string. They are the resolved twins
 *  of the neutral ramp in `packages/ui/src/styles.css`; if that ramp moves,
 *  these move with it. */

import type { Map as MapLibreMap } from "maplibre-gl"

/* The map app's Kernel palette, kept verbatim. */
const K = {
  brand100: "#e8ebd3",
  neutral100: "#f1f2ee",
  neutral200: "#e7e8e4",
  neutral300: "#dfe0dc",
  neutral700: "#515550",
  neutral900: "#2e3230",
  neutral1000: "#252927",
  white: "#ffffff",
  water: "#c8dbe5",
  waterDark: "#1a2c38",
} as const

export const CARTO_URLS = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const

type PaintProperty = Parameters<MapLibreMap["setPaintProperty"]>[1]
type PaintValue = Parameters<MapLibreMap["setPaintProperty"]>[2]
type PaintOverride = { property: PaintProperty; value: PaintValue }
type LayerOverride = { id: string; overrides: PaintOverride[] }

const LIGHT_OVERRIDES: LayerOverride[] = [
  { id: "background", overrides: [{ property: "background-color", value: K.neutral100 }] },
  { id: "water", overrides: [{ property: "fill-color", value: K.water }] },
  { id: "landcover", overrides: [{ property: "fill-color", value: "rgba(210, 230, 200, 0.5)" }] },
  {
    id: "park_national_park",
    overrides: [{ property: "fill-color", value: "rgba(210, 230, 200, 0.5)" }],
  },
  {
    id: "park_nature_reserve",
    overrides: [{ property: "fill-color", value: "rgba(210, 230, 200, 0.5)" }],
  },
  { id: "building", overrides: [{ property: "fill-color", value: K.neutral300 }] },
  {
    id: "building-top",
    overrides: [
      { property: "fill-color", value: K.neutral200 },
      { property: "fill-outline-color", value: K.neutral300 },
    ],
  },
]

const DARK_OVERRIDES: LayerOverride[] = [
  { id: "background", overrides: [{ property: "background-color", value: "#0d0f0e" }] },
  { id: "water", overrides: [{ property: "fill-color", value: K.waterDark }] },
  { id: "landcover", overrides: [{ property: "fill-opacity", value: 0 }] },
  { id: "landuse", overrides: [{ property: "fill-color", value: K.neutral900 }] },
  { id: "landuse_residential", overrides: [{ property: "fill-opacity", value: 0 }] },
  { id: "park_national_park", overrides: [{ property: "fill-color", value: "#2a3328" }] },
  { id: "park_nature_reserve", overrides: [{ property: "fill-color", value: "#2a3328" }] },
  { id: "building", overrides: [{ property: "fill-color", value: "#1a1d1b" }] },
  {
    id: "building-top",
    overrides: [
      { property: "fill-color", value: "#1e211f" },
      { property: "fill-outline-color", value: "#1a1d1b" },
    ],
  },
]

/** Apply the Kernel palette to the basemap. Call once the style has loaded —
 *  before that the layers do not exist yet and every set is a no-op. */
export function applyMapTheme(map: MapLibreMap, theme: "light" | "dark") {
  const overrides = theme === "light" ? LIGHT_OVERRIDES : DARK_OVERRIDES
  for (const { id, overrides: props } of overrides) {
    for (const { property, value } of props) {
      try {
        map.setPaintProperty(id, property, value)
      } catch {
        // The layer is absent from this style variant. Carto's two styles do
        // not carry an identical layer list, and a missing layer is not an
        // error — it is one fewer thing to recolour.
      }
    }
  }
}
