/* US crop production and estimated ABCD purchases, million metric tons.
   Production as supplied (USDA NASS / FAS, not re-checked). Company columns are
   market-share estimates, not sourced numbers — see the reasoning table on the
   page and data-source/crop-tonnage-upstream.md. */
export type Buyer = "cargill" | "adm" | "bunge" | "ldc"

export interface CropRow {
  crop: string
  production: number
  buys: Record<Buyer, number>
}

const rows: [string, number, number, number, number, number][] = [
  ["Corn (grain)", 432.3, 40, 32, 14, 5],
  ["Soybeans", 116.0, 18, 20, 13, 5],
  ["Hay (all)", 102.7, 0, 0, 0, 0],
  ["Wheat (all)", 41.6, 4.5, 8, 4, 1.5],
  ["Sugarbeets", 32.5, 0, 0, 0, 0],
  ["Sugarcane", 30.0, 0, 0, 0, 0],
  ["Potatoes", 19.0, 0, 0, 0, 0],
  ["Sorghum", 11.1, 1.2, 1.5, 0.5, 0.3],
  ["Rice (rough)", 6.8, 0.2, 0.1, 0.2, 0.2],
  ["Apples", 4.8, 0, 0, 0, 0],
  ["Barley", 3.8, 0.2, 0.1, 0.1, 0],
  ["Cotton (lint + seed)", 3.3, 0.3, 0.4, 0.2, 0.6],
  ["Almonds (shelled)", 1.36, 0, 0, 0, 0],
  ["Oats", 1.1, 0.1, 0.1, 0.1, 0],
  ["Pistachios", 0.712, 0, 0, 0, 0],
  ["Walnuts", 0.644, 0, 0, 0, 0],
]

export const TONNAGE: CropRow[] = rows.map(([crop, production, cargill, adm, bunge, ldc]) => ({
  crop,
  production,
  buys: { cargill, adm, bunge, ldc },
}))

export const BUYERS: { key: Buyer; label: string; total: string }[] = [
  { key: "cargill", label: "Cargill", total: "~65M t" },
  { key: "adm", label: "ADM", total: "~62M t" },
  { key: "bunge", label: "Bunge", total: "~32M t" },
  { key: "ldc", label: "Louis Dreyfus", total: "~13M t" },
]

export interface Reasoning {
  crop: string
  est: [string, string, string, string]
  why: string
}

export const REASONING: Reasoning[] = [
  { crop: "Corn", est: ["~40M t", "~32M t", "~14M t", "~5M t"], why: "Cargill: wet milling and ethanol grind at roughly 15M t, a 15 to 20% share of exports at roughly 12M t, and the rest domestic feed merchandising. ADM: a larger grind at roughly 18M t across its wet and dry mills, plus roughly 14M t of merchandising. Bunge: little US corn processing of its own, so almost all merchandising and export, including the interior network that came with Viterra. LDC: roughly 1M t for its Iowa ethanol plant, plus roughly 4M t of exports." },
  { crop: "Soybeans", est: ["~18M t", "~20M t", "~13M t", "~5M t"], why: "Cargill: 15 to 20% of US crush at roughly 11M t, plus about 15% of exports at roughly 7M t. ADM: the largest US crusher, at roughly 13M t, plus a similar export share. Bunge: the third large crusher, at roughly 9M t, plus roughly 4M t of exports. LDC: one crush plant at Claypool, put at roughly 1.5 to 2M t, plus roughly 3M t of exports. Its Ohio plant is not counted because it had not opened." },
  { crop: "Wheat", est: ["~4.5M t", "~8M t", "~4M t", "~1.5M t"], why: "Cargill: merchandising and export only; Ardent Mills is left out because it is a joint venture that buys on its own account. ADM: mills flour itself, at roughly 5M t of wheat, plus roughly 3M t of export merchandising. Bunge: merchandising and export, mostly through the Viterra network. LDC: export only." },
  { crop: "Sorghum", est: ["~1.2M t", "~1.5M t", "~0.5M t", "~0.3M t"], why: "Mostly Gulf export for all four. ADM has the strongest Texas footprint." },
  { crop: "Cotton", est: ["~0.3M t", "~0.4M t", "~0.2M t", "~0.6M t"], why: "Cargill: lint only, about 10% of US lint. ADM: cottonseed only, for crushing. Bunge: lint merchandising inherited from Viterra. LDC: lint through Allenberg Cotton in Memphis, at roughly 20% of US lint — the one crop where LDC leads." },
  { crop: "Rice", est: ["~0.2M t", "~0.1M t", "~0.2M t", "~0.2M t"], why: "Residual merchandising for Cargill and ADM. Bunge mills some rice itself. LDC lists rice as a US business line." },
  { crop: "Barley, oats", est: ["0.1–0.2M t", "~0.1M t", "~0.1M t", "~0"], why: "Residual merchandising. None of the four has a US malting business to pull barley." },
  { crop: "Hay, potatoes, apples, tree nuts", est: ["~0", "~0", "~0", "~0"], why: "Not businesses any of the four is in." },
  { crop: "Sugarbeets, sugarcane", est: ["~0", "~0", "~0", "~0"], why: "Processed by grower co-ops and mills. The companies handle sugar or sweeteners but do not buy the crop." },
]
