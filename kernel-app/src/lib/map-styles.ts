/** Kernel-themed MapLibre basemaps.
 *
 *  Ported from the map app (`src/lib/map-styles.ts`), retuned for the v2
 *  surface. The original recoloured the DS's *light* palette; here the ground
 *  has to read as the PLATE, because in the workspace the map is not a widget
 *  sitting on the page — it IS the canvas. So the basemap background is the
 *  card colour exactly, and everything else steps off it: land a shade up,
 *  water a shade down and cooler, buildings between the two.
 *
 *  Hex, not `oklch()`: these values cross into MapLibre's paint properties,
 *  which are parsed by the map's own colour engine, not the browser's — a
 *  `var()` would arrive as an unparseable string. They are the resolved twins
 *  of the neutral ramp in `packages/ui/src/styles.css`; if that ramp moves,
 *  these move with it. */

import type { Map as MapLibreMap } from "maplibre-gl"

/* Resolved from the DS neutral ramp — the same tokens the plate itself uses. */
const K = {
  card: "#1f2924", // --neutral-800, the dark plate
  cardStep: "#243029", // one step off the plate, for land
  building: "#28352e",
  buildingTop: "#2d3b34",
  waterDark: "#16232b", // cooler than the ground so water still reads as water
  white: "#ffffff",
  n50: "#f9fafa",
  n100: "#f2f5f3",
  n200: "#e9ecea",
  n300: "#dbdfdd",
  waterLight: "#dbe7ee",
  landLight: "#eef2ea",
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
  { id: "background", overrides: [{ property: "background-color", value: K.white }] },
  { id: "water", overrides: [{ property: "fill-color", value: K.waterLight }] },
  { id: "landcover", overrides: [{ property: "fill-color", value: K.landLight }] },
  { id: "park_national_park", overrides: [{ property: "fill-color", value: K.landLight }] },
  { id: "park_nature_reserve", overrides: [{ property: "fill-color", value: K.landLight }] },
  { id: "landuse", overrides: [{ property: "fill-color", value: K.n50 }] },
  { id: "building", overrides: [{ property: "fill-color", value: K.n200 }] },
  {
    id: "building-top",
    overrides: [
      { property: "fill-color", value: K.n100 },
      { property: "fill-outline-color", value: K.n300 },
    ],
  },
]

const DARK_OVERRIDES: LayerOverride[] = [
  { id: "background", overrides: [{ property: "background-color", value: K.card }] },
  { id: "water", overrides: [{ property: "fill-color", value: K.waterDark }] },
  { id: "landcover", overrides: [{ property: "fill-opacity", value: 0 }] },
  { id: "landuse", overrides: [{ property: "fill-color", value: K.cardStep }] },
  { id: "landuse_residential", overrides: [{ property: "fill-opacity", value: 0 }] },
  { id: "park_national_park", overrides: [{ property: "fill-color", value: K.cardStep }] },
  { id: "park_nature_reserve", overrides: [{ property: "fill-color", value: K.cardStep }] },
  { id: "building", overrides: [{ property: "fill-color", value: K.building }] },
  {
    id: "building-top",
    overrides: [
      { property: "fill-color", value: K.buildingTop },
      { property: "fill-outline-color", value: K.building },
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
