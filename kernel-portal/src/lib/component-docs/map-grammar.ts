import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Map grammar — the visual language for geographic canvases (decision 0088). */
export const mapGrammarDoc: ComponentDoc = parseComponentDoc({
  id: "map-grammar",
  name: "Map grammar",
  slug: "map-grammar",
  summary:
    "The visual language for maps of buying points, destinations and corridors: three layers (ground, marks, chrome), one job per visual channel, a hue ledger that claims colors before use, named zoom stops, and an explicit tile-source binding so the same grammar restyles any MapLibre basemap.",
  status: "experimental",
  // Documentation-only: the grammar is canonical here; the map kit lives in
  // the origination-map prototypes, not in @kernel/ui.
  sourceFiles: [],
  metadata: { owner: "ds", kind: "pattern" },
  docs: [
    {
      kind: "guidelines",
      dos: [
        "Give each channel one job: fill says who buys, shape says facility kind, hue says owner or category, size says capacity, outline says interaction state.",
        "Claim a hue in the ledger before painting with it; when the ledger is full, reach for a second channel or grouping instead of a new hue.",
        "Name zoom levels (country, region, state, county, town) and style against the names, so curves read as intent instead of magic numbers.",
        "Keep tile-source bindings — basemap layer ids and handoff zooms — in one file, so porting to a new basemap touches one place.",
      ],
      donts: [
        "Don't let hue mean importance or size mean ownership; a channel that means two things means nothing.",
        "Don't style marks from the basemap's palette; marks read Kernel tokens so light and dark both hold.",
        "Don't hardcode a zoom number inside a layer definition; route it through the named stops.",
      ],
    },
    {
      kind: "useCases",
      use: [
        "Maps of buying points, destinations and draw areas in merchant workspaces.",
        "Corridor overlays — barge rivers and rail flow — drawn from our own sources over any basemap.",
      ],
      dontUse: [
        "Charts and plots — the viz ramps apply, but axes and series follow the chart components instead.",
      ],
    },
    {
      kind: "decisions",
      refs: [{ number: 88, title: "Map grammar is portal-canonical" }],
    },
  ],
})
