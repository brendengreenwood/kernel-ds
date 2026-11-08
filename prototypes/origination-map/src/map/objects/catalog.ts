import type { Glyph } from "@app/map/kit/glyphs"
import { COMPANIES, COMPANY, FACILITIES, FACILITY } from "@app/map/objects/buying-point"
import { DEST, DEST_KINDS } from "@app/map/objects/destination"

/* The map's object catalog. The Data model page renders this; values come
   from the object files, so the page can't drift from what the map draws. */

export type Status = "built" | "guessed" | "future"
export type Geometry = "point" | "line" | "area" | "none"
export type Channel = "hue" | "shape" | "size" | "fill" | "filter" | "label" | "position"

export interface Value {
  label: string
  glyph?: Glyph
  hollow?: boolean
  /** Text-color class for the swatch. */
  text?: string
}

export interface Attribute {
  name: string
  type: string
  channel: Channel
  note: string
  values?: Value[]
}

export interface MapObject {
  id: string
  name: string
  definition: string
  status: Status
  geometry: Geometry
  /** Has a file in src/map/objects that owns its encoding. */
  file?: string
  attributes: Attribute[]
}

export interface Relationship {
  from: string
  verb: string
  to: string
  status: Status
  note: string
}

const pos: Attribute = { name: "lat, lon", type: "number", channel: "position", note: "Town-level for public data." }

export const OBJECTS: MapObject[] = [
  {
    id: "buying-point",
    name: "Buying point",
    definition: "A site where a company buys grain from farmers.",
    status: "built",
    geometry: "point",
    file: "src/map/objects/buying-point.ts",
    attributes: [
      {
        name: "co",
        type: "Company",
        channel: "hue",
        note: "Filled in the company's hue.",
        values: COMPANIES.map((c) => ({ label: COMPANY[c].label, glyph: "circle", text: COMPANY[c].text })),
      },
      {
        name: "type",
        type: "Facility",
        channel: "shape",
        note: "One glyph per facility kind.",
        values: FACILITIES.map((f) => ({ label: FACILITY[f].label, glyph: FACILITY[f].glyph, text: "text-foreground" })),
      },
      { name: "crops", type: "Crop[]", channel: "filter", note: "Filters only; never a visual channel." },
      { name: "name, state, region", type: "string", channel: "label", note: "Tooltip and lists." },
      pos,
    ],
  },
  {
    id: "destination",
    name: "Destination",
    definition: "Where grain ends up, whoever owns it.",
    status: "built",
    geometry: "point",
    file: "src/map/objects/destination.ts",
    attributes: [
      {
        name: "kind",
        type: "DestKind",
        channel: "shape",
        note: "Shape and category hue; always hollow.",
        values: DEST_KINDS.map((k) => ({ label: DEST[k].label, glyph: DEST[k].glyph, hollow: true, text: DEST[k].text })),
      },
      { name: "size", type: "number | null", channel: "size", note: "Capacity; scales 1–1.6× so no destination outweighs a buying point." },
      { name: "operator", type: "string", channel: "label", note: "Any company; text only, never a hue." },
      pos,
    ],
  },
  { id: "company", name: "Company", definition: "Who owns a buying point. Decides its hue.", status: "built", geometry: "none", attributes: [] },
  { id: "commodity", name: "Commodity", definition: "Corn, soybeans, wheat, sorghum, canola or sunflower.", status: "built", geometry: "none", attributes: [] },
  { id: "draw-area", name: "Draw area", definition: "The assumed radius a buying point pulls grain from.", status: "built", geometry: "area", attributes: [] },
  { id: "pair", name: "Pair", definition: "Two nearby competing buying points.", status: "built", geometry: "line", attributes: [] },
  { id: "region", name: "Region", definition: "A named group of buying points.", status: "built", geometry: "none", attributes: [] },
  { id: "corridor", name: "Corridor", definition: "Barge rivers and main-line rail that grain moves over.", status: "built", geometry: "line", attributes: [] },
  { id: "route", name: "Route", definition: "Rail path from a buying point to an outlet. Shortest track, not a real contract.", status: "guessed", geometry: "line", attributes: [] },
  { id: "bid", name: "Bid", definition: "A buying point's posted price to farmers.", status: "future", geometry: "none", attributes: [] },
  { id: "destination-bid", name: "Destination bid", definition: "What a destination pays for delivered grain.", status: "future", geometry: "none", attributes: [] },
  { id: "freight", name: "Freight", definition: "Cost to move grain along a route.", status: "future", geometry: "none", attributes: [] },
  { id: "netback", name: "Netback", definition: "Destination bid minus freight: the best place to sell.", status: "future", geometry: "none", attributes: [] },
]

export const RELATIONSHIPS: Relationship[] = [
  { from: "Company", verb: "owns", to: "Buying point", status: "built", note: "Shown by hue." },
  { from: "Buying point", verb: "bids on", to: "Commodity", status: "built", note: "Filter only." },
  { from: "Buying point", verb: "draws from", to: "Draw area", status: "built", note: "Assumed radius." },
  { from: "Buying point", verb: "competes with", to: "Buying point", status: "built", note: "Drawn as a pair." },
  { from: "Buying point", verb: "sits in", to: "Region", status: "built", note: "Grouping." },
  { from: "Buying point", verb: "ships to", to: "Destination", status: "guessed", note: "Along a route; today nearest outlet by rail." },
  { from: "Route", verb: "runs along", to: "Corridor", status: "guessed", note: "Shortest track." },
  { from: "Destination", verb: "consumes", to: "Commodity", status: "future", note: "Not modeled." },
  { from: "Netback", verb: "ranks", to: "Destination", status: "future", note: "Per origin, after freight." },
]

export interface Hue {
  hue: string
  token: string
  claim: string
  text?: string
}

/** Every hue on the map and who claims it. New kinds pick from what's free. */
export const LEDGER: Hue[] = [
  ...COMPANIES.map((c) => ({ hue: c === "cargill" ? "Brand green" : "Plum", token: COMPANY[c].token, claim: COMPANY[c].label, text: COMPANY[c].text })),
  { hue: "Sky", token: "--om-water", claim: "Water only", text: "text-viz-sky-500" },
  { hue: "Rust", token: "--viz-rust-*", claim: "Rail flow", text: "text-viz-rust-500" },
  ...DEST_KINDS.map((k) => ({ hue: { port: "Teal", feedyard: "Slate", ethanol: "Wheat" }[k], token: DEST[k].token, claim: DEST[k].plural, text: DEST[k].text })),
  { hue: "Clay", token: "--om-ldc", claim: "Reserved: LDC", text: "text-viz-clay-500" },
  { hue: "Crop", token: "--viz-crop-*", claim: "Avoid: reads as Cargill", text: "text-viz-crop-500" },
]
