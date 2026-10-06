import type maplibregl from "maplibre-gl"
import type { Map as MLMap } from "maplibre-gl"

export const hoverState = ["boolean", ["feature-state", "hover"], false] as unknown as maplibregl.ExpressionSpecification
export const litState = ["boolean", ["feature-state", "on"], false] as unknown as maplibregl.ExpressionSpecification
const hover = hoverState
const lit = litState

// One marker recipe for every point on the map: a soft drop shadow, then the glyph with an outline.
// Kinds differ only in source, glyph, scale, fill, and outline color; shadow and zoom curves are shared.
export function addMarker(map: MLMap, o: {
  id: string
  source: string
  image: maplibregl.ExpressionSpecification
  scale: maplibregl.ExpressionSpecification | number
  fill: maplibregl.ExpressionSpecification | string
  ring: maplibregl.ExpressionSpecification | string
  ringWidth: number
  filter?: maplibregl.FilterSpecification
  layout?: Record<string, unknown>
  before?: string
}) {
  const z = (n: number): maplibregl.ExpressionSpecification | number => (typeof o.scale === "number" ? o.scale * n : ["*", o.scale, n])
  const layout = {
    "icon-image": o.image,
    "icon-size": ["interpolate", ["linear"], ["zoom"], 3, z(0.3), 5, z(0.45), 7, z(0.75), 9, z(1.1)],
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
        "icon-translate": ["interpolate", ["linear"], ["zoom"], 3, ["literal", [0, 0.5]], 9, ["literal", [0, 1.5]]],
      },
    },
    o.before,
  )
  // Outline grows with icon-size so it keeps the same proportion at every zoom; hover +0.5, selected +1.
  const w = (k: number): maplibregl.ExpressionSpecification => ["case", lit, o.ringWidth * k + 0.75, hover, o.ringWidth * k + 0.5, o.ringWidth * k]
  map.addLayer(
    {
      ...base,
      id: o.id,
      paint: {
        "icon-color": o.fill,
        "icon-halo-color": o.ring,
        "icon-halo-width": ["interpolate", ["linear"], ["zoom"], 3, w(0.42), 6, w(0.67), 9, w(1)],
        "icon-halo-width-transition": { duration: 200 },
      },
    },
    o.before,
  )
}
