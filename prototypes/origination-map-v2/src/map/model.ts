import type { BuyingPoint as Site } from "@app/map/objects/buying-point"
import type { Destination } from "@app/map/objects/destination"

export type { Site, Destination }

/** Lines the map draws as corridors. Plain GeoJSON so any source can supply them. */
export type Corridors = {
  /** Barge rivers; feature properties: name, trunk (boolean). */
  rivers: GeoJSON.FeatureCollection
  /** Background rail network. */
  rail: GeoJSON.FeatureCollection
  /** Routed rail segments; feature properties: routes (count of routes using the segment). */
  routes: GeoJSON.FeatureCollection
}

/**
 * Everything the map renders, in one typed shape. The map never imports data files;
 * an adapter builds this object. Public data is one adapter; private data is another.
 */
export type MapData = {
  /** Where the data came from, shown to people who need to know how far to trust it. */
  source: { name: string; note: string }
  sites: Site[]
  destinations: Destination[]
  corridors: Corridors
}
