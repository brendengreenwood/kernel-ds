import type { ExpressionSpecification, Map as MLMap } from "maplibre-gl"
import type { Corridors } from "@app/map/model"
import { mapPalette } from "@app/map/kit/theme"
import { HANDOFF, zoomCurve } from "@app/map/kit/zoom"

// Rivers come from two sources: our Natural Earth barge layer below HANDOFF.rivers
// and the tile "waterway" layer above it. Both are styled here from one rank and
// one width curve, so the handoff is invisible and the highlight toggle covers both.
type Rank = "trunk" | "barge" | "river" | "stream"

const BARGE = ["Mississippi", "Missouri", "Ohio", "Illinois", "Tennessee", "Arkansas", "Cumberland", "Columbia", "Snake"]
// Low zooms use Natural Earth names ("Mississippi"), higher zooms OSM names ("Mississippi River").
const named = (names: string[]): ExpressionSpecification => ["in", ["get", "name"], ["literal", names.flatMap((n) => [n, n + " River"])]]

const TILE_RANK: ExpressionSpecification = ["case", named(["Mississippi"]), "trunk", named(BARGE), "barge", ["==", ["get", "class"], "river"], "river", "stream"]
const OWN_RANK: ExpressionSpecification = ["case", ["get", "trunk"], "trunk", "barge"]

function riverColor(rank: ExpressionSpecification, on: boolean): ExpressionSpecification {
  const c = mapPalette()
  if (!on) return ["match", rank, "stream", c.streams, c.rivers] as ExpressionSpecification
  return ["match", rank, "trunk", c.trunk, "barge", c.tributary, "river", c.rivers, c.streams] as ExpressionSpecification
}

// Interpolate must sit at the top of a paint value, so widths are written per stop.
function rankedWidth(rank: ExpressionSpecification): ExpressionSpecification {
  const at = (z: "country" | "county" | "town") =>
    ["match", rank, "trunk", RIVER_WIDTH_AT.trunk[z], "barge", RIVER_WIDTH_AT.barge[z], "river", RIVER_WIDTH_AT.river[z], RIVER_WIDTH_AT.stream[z]] as ExpressionSpecification
  return zoomCurve({ country: at("country"), county: at("county"), town: at("town") })
}
const RIVER_WIDTH_AT: Record<Rank, Record<"country" | "county" | "town", number>> = {
  trunk: { country: 2.5, county: 4, town: 5 },
  barge: { country: 1.2, county: 2, town: 3 },
  river: { country: 0.8, county: 1, town: 1.2 },
  stream: { country: 0.5, county: 0.75, town: 1 },
}

// One rail look on both sides of HANDOFF.rail.
const RAIL_WIDTH = zoomCurve({ country: 0.6, state: 1.1, county: 1.4, town: 2 })
const RAIL_OPACITY = 0.35

/** Restyle the basemap's own corridor layers (tile waterways and rail) to match ours. */
export function styleTileCorridors(map: MLMap, layerId: string): boolean {
  const c = mapPalette()
  if (layerId === "waterway") {
    map.setPaintProperty(layerId, "line-color", riverColor(TILE_RANK, true))
    map.setPaintProperty(layerId, "line-width", rankedWidth(TILE_RANK))
    map.setLayerZoomRange(layerId, HANDOFF.rivers, 24)
    return true
  }
  if (/^railway(_minor|_transit)?$/.test(layerId)) {
    map.setPaintProperty(layerId, "line-color", c.rail)
    map.setPaintProperty(layerId, "line-opacity", RAIL_OPACITY)
    map.setPaintProperty(layerId, "line-width", RAIL_WIDTH)
    map.setLayerZoomRange(layerId, HANDOFF.rail, 24)
    return true
  }
  return false
}

/** Rail background, routed rail flow, and barge rivers, ranked by importance. */
export function addCorridors(map: MLMap, corridors: Corridors, before?: string) {
  const c = mapPalette()
  map.addSource("om-rail", { type: "geojson", data: corridors.rail })
  map.addLayer(
    {
      id: "om-rail",
      type: "line",
      source: "om-rail",
      maxzoom: HANDOFF.rail,
      layout: { "line-join": "round" },
      paint: { "line-color": c.rail, "line-opacity": RAIL_OPACITY, "line-width": RAIL_WIDTH },
    },
    before,
  )
  // Rail Cargill grain rides to a Gulf outlet (scripts/build-rail-flow.mjs):
  // the more site routes share a segment, the brighter and thicker it draws.
  const byRoutes = (lo: number, hi: number): ExpressionSpecification => ["interpolate", ["linear"], ["get", "routes"], 1, lo, 9, hi]
  map.addSource("om-rail-flow", { type: "geojson", data: corridors.routes })
  map.addLayer(
    {
      id: "om-rail-flow",
      type: "line",
      source: "om-rail-flow",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["step", ["get", "routes"], c.flow[0], 3, c.flow[1], 6, c.flow[2]],
        "line-width": zoomCurve({ country: byRoutes(1, 3), county: byRoutes(1.8, 5), town: byRoutes(2.5, 7) }),
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
      maxzoom: HANDOFF.rivers,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": riverColor(OWN_RANK, true), "line-width": rankedWidth(OWN_RANK) },
    },
    before,
  )
}

export interface CorridorHighlight { rivers: boolean; rail: boolean }

/** Highlight off drops a corridor to plain ground at every zoom: rivers lose their
    rank colors (both sources), routed rail fades out over the background rail. */
export function setCorridorHighlight(map: MLMap, h: CorridorHighlight) {
  if (map.getLayer("om-rivers")) map.setPaintProperty("om-rivers", "line-color", riverColor(OWN_RANK, h.rivers))
  if (map.getLayer("waterway")) map.setPaintProperty("waterway", "line-color", riverColor(TILE_RANK, h.rivers))
  if (map.getLayer("om-rail-flow")) map.setPaintProperty("om-rail-flow", "line-opacity", h.rail ? 1 : 0)
}
