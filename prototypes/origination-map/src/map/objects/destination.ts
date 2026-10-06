import type maplibregl from "maplibre-gl"
import { cssVarColor } from "@app/lib/color"
import type { Glyph } from "@app/map/kit/glyphs"
import type { MarkRoles } from "@app/map/kit/theme"
import { hoverState, type MarkerSpec } from "@app/map/kit/marker"

/* Destination: where grain ends up, whoever owns it.
   Encoding: hollow (never a company hue), kind -> shape + category hue, capacity -> size (capped). */

export type DestKind = "port" | "feedyard" | "ethanol"

export interface Destination {
  id: number
  /** Drives shape and category hue. */
  kind: DestKind
  name: string
  /** Any company; text only, never a hue. */
  operator: string
  state: string
  lat: number
  lon: number
  /** Capacity in the kind's unit; null when unpublished. Drives size. */
  size: number | null
}

export const DEST: Record<
  DestKind,
  { label: string; plural: string; unit: string; glyph: Glyph; token: string; text: string; /** Capacity that draws at base size. */ ref: number | null }
> = {
  port: { label: "Export port", plural: "Export ports", unit: "", glyph: "diamond", token: "--om-port", text: "text-om-port", ref: null },
  feedyard: { label: "Feedyard", plural: "Feedyards", unit: "head", glyph: "square", token: "--om-feed", text: "text-om-feed", ref: 80000 },
  ethanol: { label: "Ethanol plant", plural: "Ethanol plants", unit: "M gal/yr", glyph: "circle", token: "--om-refinery", text: "text-om-refinery", ref: 110 },
}
export const DEST_KINDS = Object.keys(DEST) as DestKind[]

export function destSize(d: Destination) {
  return d.size == null ? "" : ` · ${d.size.toLocaleString()} ${DEST[d.kind].unit}`
}

/** Size factor 1–1.6, so the biggest plant never outweighs a buying point. */
export function destScale(d: Destination) {
  const ref = DEST[d.kind].ref
  return d.size == null || ref == null ? 1 : Math.min(1.6, Math.max(1, d.size / ref))
}

export function categoryColor(): maplibregl.ExpressionSpecification {
  const pairs = DEST_KINDS.flatMap((k) => [k, cssVarColor(DEST[k].token)])
  return ["match", ["get", "kind"], ...pairs, cssVarColor("--muted-foreground")] as unknown as maplibregl.ExpressionSpecification
}

export function destinationFeature(d: Destination): GeoJSON.Feature {
  return {
    type: "Feature",
    id: d.id,
    geometry: { type: "Point", coordinates: [d.lon, d.lat] },
    properties: { id: d.id, kind: d.kind, glyph: DEST[d.kind].glyph, k: destScale(d) },
  }
}

export function destinationMarker(r: MarkRoles): MarkerSpec {
  return {
    image: ["concat", "om-", ["get", "glyph"]],
    scale: ["*", ["get", "k"], 0.8],
    fill: r.hollow,
    ring: ["case", hoverState, r.ink, categoryColor()],
    ringWidth: 1.5,
  }
}
