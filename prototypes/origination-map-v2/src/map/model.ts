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

/** One sell-side route from a buying point to a destination (object.route — a guess, not a contract). */
export type SellRoute = {
  kind: "port" | "feedyard" | "ethanol"
  destId: number
  mode: "rail" | "barge" | "truck"
  miles: number
  /** Indices into SellRoutes.segments (rail/barge only; truck is a straight line). */
  segs?: number[]
}

/** Precomputed sell-side routes; geometry is shared between routes via `segments`. */
export type SellRoutes = {
  segments: [number, number][][]
  bySite: ReadonlyMap<number, SellRoute[]>
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
  /** Sell-side routes per buying point; absent when the source can't route. */
  sellRoutes?: SellRoutes
}
