import type maplibregl from "maplibre-gl"
import { cssVarColor } from "@app/lib/color"
import type { Glyph } from "@app/map/kit/glyphs"
import type { MarkRoles } from "@app/map/kit/theme"
import { hoverState, litState, type MarkerSpec } from "@app/map/kit/marker"

/* Buying point: a site where a company buys grain from farmers.
   Encoding: company -> hue (filled), facility -> shape, size fixed, page-color ring. */

export type Company = "cargill" | "adm"
export type Facility = "river" | "elevator" | "processor" | "export"
export type Crop = "c" | "s" | "w" | "m" | "o"

export interface BuyingPoint {
  id: number
  /** Owning company. Drives hue. */
  co: Company
  name: string
  state: string
  lat: number
  lon: number
  /** Facility kind. Drives shape. */
  type: Facility
  region: string
  /** Commodities it bids on. Filters only; never a visual channel. */
  crops: Crop[]
  /** Index among points sharing a town centroid; fans markers out. */
  stack: number
}

export const COMPANY: Record<Company, { label: string; token: string; swatch: string; text: string }> = {
  cargill: { label: "Cargill", token: "--om-cargill", swatch: "bg-om-cargill", text: "text-om-cargill" },
  adm: { label: "ADM", token: "--om-adm", swatch: "bg-om-adm", text: "text-om-adm" },
}
export const COMPANIES = Object.keys(COMPANY) as Company[]

export const FACILITY: Record<Facility, { label: string; plural: string; glyph: Glyph }> = {
  river: { label: "River terminal", plural: "River terminals", glyph: "triangle" },
  elevator: { label: "Interior elevator", plural: "Interior elevators", glyph: "circle" },
  processor: { label: "Processing plant", plural: "Processing plants", glyph: "square" },
  export: { label: "Export terminal", plural: "Export terminals", glyph: "diamond" },
}
export const FACILITIES = Object.keys(FACILITY) as Facility[]

/** Company hue as a map expression over the feature's `co`. */
export function companyColor(): maplibregl.ExpressionSpecification {
  const pairs = COMPANIES.flatMap((c) => [c, cssVarColor(COMPANY[c].token)])
  return ["match", ["get", "co"], ...pairs, cssVarColor("--muted-foreground")] as unknown as maplibregl.ExpressionSpecification
}

export function buyingPointFeature(s: BuyingPoint): GeoJSON.Feature {
  const a = s.stack * 2.1
  const off = s.stack ? [Math.cos(a) * 9, Math.sin(a) * 9] : [0, 0]
  return {
    type: "Feature",
    id: s.id,
    geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    properties: { id: s.id, co: s.co, glyph: FACILITY[s.type].glyph, off, top: s.type === "processor" ? 0 : 1 },
  }
}

export function buyingPointMarker(r: MarkRoles): MarkerSpec {
  return {
    image: ["concat", "om-", ["get", "glyph"]],
    scale: 1,
    fill: companyColor(),
    ring: ["case", litState, r.haloActive, hoverState, r.haloHover, r.halo],
    ringWidth: 3,
    // Processing plants draw on top.
    layout: { "icon-offset": ["get", "off"], "symbol-sort-key": ["get", "top"] },
  }
}
