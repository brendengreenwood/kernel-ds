import { Z, zoomCurve } from "@app/map/kit/zoom"
import type maplibregl from "maplibre-gl"
import type { Map as MLMap } from "maplibre-gl"

export const hoverState = ["boolean", ["feature-state", "hover"], false] as unknown as maplibregl.ExpressionSpecification
export const litState = ["boolean", ["feature-state", "on"], false] as unknown as maplibregl.ExpressionSpecification
const hover = hoverState
const lit = litState

// One marker recipe for every point on the map: a soft drop shadow, then the glyph with an outline.
// Kinds differ only in source, glyph, scale, fill, and outline color; shadow and zoom curves are shared.
/** What an object decides about its marks; the map adds id, source, filter and order. */
export type MarkerSpec = {
  image: maplibregl.ExpressionSpecification
  scale: maplibregl.ExpressionSpecification | number
  fill: maplibregl.ExpressionSpecification | string
  ring: maplibregl.ExpressionSpecification | string
  ringWidth: maplibregl.ExpressionSpecification | number
  layout?: Record<string, unknown>
}

export function addMarker(map: MLMap, o: MarkerSpec & { id: string; source: string; filter?: maplibregl.FilterSpecification; before?: string }) {
  const z = (n: number): maplibregl.ExpressionSpecification | number => (typeof o.scale === "number" ? o.scale * n : ["*", o.scale, n])
  const layout = {
    "icon-image": o.image,
    "icon-size": zoomCurve({ country: z(0.3), region: z(0.45), state: z(0.75), county: z(1.1) }),
    "icon-allow-overlap": true,
    "icon-ignore-placement": true,
    ...o.layout,
  } as maplibregl.SymbolLayerSpecification["layout"]
  const base = { type: "symbol" as const, source: o.source, layout, ...(o.filter ? { filter: o.filter } : {}) }
  const shadowImage = JSON.parse(JSON.stringify(o.image).replace('"om-"', '"om-shadow-"')) as maplibregl.ExpressionSpecification
  map.addLayer(
    {
      ...base,
      layout: { ...layout, "icon-image": shadowImage },
      id: o.id + "-shadow",
      paint: {
        "icon-translate": ["interpolate", ["linear"], ["zoom"], Z.country, ["literal", [0, 0.5]], Z.county, ["literal", [0, 1.5]]],
      },
    },
    o.before,
  )
  // Outline grows with icon-size so it keeps the same proportion at every zoom; hover +0.5, selected +1.
  const rw = (k: number): maplibregl.ExpressionSpecification | number => (typeof o.ringWidth === "number" ? o.ringWidth * k : ["*", o.ringWidth, k])
  const w = (k: number): maplibregl.ExpressionSpecification => ["case", lit, ["+", rw(k), 0.75], hover, ["+", rw(k), 0.5], rw(k)]
  map.addLayer(
    {
      ...base,
      id: o.id,
      paint: {
        "icon-color": o.fill,
        "icon-halo-color": o.ring,
        "icon-halo-width": zoomCurve({ country: w(0.42), state: w(0.78), county: w(1) }),
        "icon-halo-width-transition": { duration: 200 },
      },
    },
    o.before,
  )
}
