import type maplibregl from "maplibre-gl"
import type { Map as MLMap } from "maplibre-gl"
import type { Destination, Site, SellRoutes } from "@app/map/model"
import { mapPalette, markRoles } from "@app/map/kit/theme"

/* Sell-side routes (object.route): where a selected buying point's grain could
   go. Rail and barge paths follow real networks but are shortest-path guesses,
   so every label says so; truck legs are straight lines under ~100 mi.
   Hue comes from the corridor ledger (rail rust, water sky); truck is ink. */

const MODE_LABEL = { rail: "shortest track", barge: "shortest river", truck: "truck" } as const

/** Features for one selected site's routes, filtered to the visible destination kinds. */
export function sellRouteData(
  routes: SellRoutes | undefined,
  site: Site | undefined,
  destById: ReadonlyMap<number, Destination>,
  destKinds: ReadonlySet<string>,
): GeoJSON.FeatureCollection {
  const list = site ? routes?.bySite.get(site.id) : undefined
  if (!routes || !site || !list) return { type: "FeatureCollection", features: [] }
  const features: GeoJSON.Feature[] = []
  for (const r of list) {
    if (!destKinds.has(r.kind)) continue
    const dest = destById.get(r.destId)
    if (!dest) continue
    const props = { mode: r.mode, label: `${MODE_LABEL[r.mode]} · ${r.miles.toLocaleString()} mi` }
    const geometry: GeoJSON.Geometry =
      r.mode === "truck" || !r.segs?.length
        ? { type: "LineString", coordinates: [[site.lon, site.lat], [dest.lon, dest.lat]] }
        : { type: "MultiLineString", coordinates: r.segs.map((i) => routes.segments[i]) }
    features.push({ type: "Feature", properties: props, geometry })
  }
  return { type: "FeatureCollection", features }
}

/** Adds the sell-route source and layers. Lines sit with the corridors (under
    labels and marks); route labels draw on top so the miles stay readable. */
export function addSellRoutes(map: MLMap, data: GeoJSON.FeatureCollection, beforeId?: string) {
  const c = mapPalette()
  const r = markRoles()
  const byMode = ["match", ["get", "mode"], "rail", c.rail, "barge", c.trunk, r.ink] as unknown as maplibregl.ExpressionSpecification
  map.addSource("om-sell", { type: "geojson", data })
  map.addLayer(
    {
      id: "om-sell",
      type: "line",
      source: "om-sell",
      layout: { "line-cap": "round" },
      paint: {
        "line-color": byMode,
        "line-width": 2.25,
        "line-opacity": 0.9,
        "line-dasharray": ["match", ["get", "mode"], "truck", ["literal", [1.5, 1.75]], ["literal", [1, 0]]] as unknown as maplibregl.ExpressionSpecification,
      },
    },
    beforeId,
  )
  map.addLayer({
    id: "om-sell-label",
    type: "symbol",
    source: "om-sell",
    layout: {
      "symbol-placement": "line-center",
      "text-field": ["get", "label"],
      "text-size": 11,
      "text-font": ["Noto Sans Regular"],
    },
    paint: {
      "text-color": byMode,
      "text-halo-color": c.ground,
      "text-halo-width": 1.25,
    },
  })
}

export function setSellRoutes(map: MLMap, data: GeoJSON.FeatureCollection) {
  ;(map.getSource("om-sell") as maplibregl.GeoJSONSource | undefined)?.setData(data)
}
