import type { Map as MLMap } from "maplibre-gl"
import type { Corridors } from "@app/map/model"
import { mapPalette } from "@app/map/kit/theme"

/** Rail background, routed rail flow, and barge rivers, ranked by importance. */
export function addCorridors(map: MLMap, corridors: Corridors, before?: string) {
  // Zoomed out the tiles drop river names, so the barge network ships as its own
  // Natural Earth layer until z8, where the tile waterways take over the ranking.
  const c = mapPalette()
  // Tile rail only appears near street zoom; Natural Earth rail fills in until then.
  map.addSource("om-rail", { type: "geojson", data: corridors.rail })
  map.addLayer(
    {
      id: "om-rail",
      type: "line",
      source: "om-rail",
      maxzoom: 13,
      layout: { "line-join": "round" },
      paint: {
        "line-color": c.rail,
        "line-opacity": 0.35,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 8, 1.4, 12, 2],
      },
    },
    before,
  )
  // Rail Cargill grain rides to a Gulf outlet (scripts/build-rail-flow.mjs):
  // the more site routes share a segment, the brighter and thicker it draws.
  map.addSource("om-rail-flow", { type: "geojson", data: corridors.routes })
  map.addLayer(
    {
      id: "om-rail-flow",
      type: "line",
      source: "om-rail-flow",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["step", ["get", "routes"], c.flow[0], 3, c.flow[1], 6, c.flow[2]],
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, ["interpolate", ["linear"], ["get", "routes"], 1, 1, 9, 3], 10, ["interpolate", ["linear"], ["get", "routes"], 1, 2, 9, 6]],
      },
    },
    before,
  )
  map.addSource("om-rivers", { type: "geojson", data: corridors.rivers })
  map.addLayer(
    {
      id: "om-rivers",
      type: "line",
      source: "om-rivers",
      maxzoom: 8,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["case", ["get", "trunk"], c.trunk, c.tributary],
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, ["case", ["get", "trunk"], 2.5, 1.2], 8, ["case", ["get", "trunk"], 4, 2]],
      },
    },
    before,
  )
}
