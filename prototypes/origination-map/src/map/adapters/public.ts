import { SITES } from "@app/data/sites"
import { DESTINATIONS } from "@app/data/destinations"
import bargeRivers from "@app/data/barge-rivers.json"
import rail from "@app/data/rail.json"
import railFlow from "@app/data/rail-flow.json"
import type { MapData } from "@app/map/model"

/** Public sources only. Provenance: data-source/draw-areas-upstream.md, data-source/destinations-upstream.md. */
export const publicMapData: MapData = {
  source: { name: "Public sources", note: "Locations from public records; routes are shortest-track guesses." },
  sites: SITES,
  destinations: DESTINATIONS,
  corridors: {
    rivers: bargeRivers as GeoJSON.FeatureCollection,
    rail: rail as GeoJSON.FeatureCollection,
    routes: railFlow as GeoJSON.FeatureCollection,
  },
}
