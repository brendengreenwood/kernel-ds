import type { Crop, Site } from "@app/data/sites"
import { miles } from "./geo"

export interface Pair {
  c: Site
  a: Site
  mi: number
  shared: Crop[]
}

export interface RegionRow {
  region: string
  cargill: number
  adm: number
  /** Cargill sites in this region with an ADM site within two draw radii. */
  contested: number
  closest: Pair | null
}

export interface Analysis {
  pairs: Pair[]
  contestedCargill: number
  contestedAdm: number
  cargill: number
  adm: number
  sameTown: number
  regions: RegionRow[]
}

/* Two draw circles overlap when their centres are within 2R. Export terminals
   draw by barge and rail, not from nearby farms, so they sit out of every
   competition count — same rule as the source page. */
export function analyse(visible: Site[], radiusMi: number): Analysis {
  const C = visible.filter((s) => s.co === "C" && s.type !== "x")
  const A = visible.filter((s) => s.co === "A" && s.type !== "x")
  const pairs: Pair[] = []
  for (const c of C)
    for (const a of A)
      pairs.push({ c, a, mi: miles(c, a), shared: c.crops.filter((x) => a.crops.includes(x)) })
  pairs.sort((p, q) => p.mi - q.mi)

  const reach = 2 * radiusMi
  const hit = pairs.filter((p) => p.mi < reach)
  const contestedC = new Set(hit.map((p) => p.c.id))
  const contestedA = new Set(hit.map((p) => p.a.id))

  const byRegion = new Map<string, RegionRow>()
  for (const s of [...C, ...A]) {
    const r = byRegion.get(s.region) ?? { region: s.region, cargill: 0, adm: 0, contested: 0, closest: null }
    if (s.co === "C") r.cargill++
    else r.adm++
    byRegion.set(s.region, r)
  }
  for (const r of byRegion.values()) {
    r.contested = C.filter((c) => c.region === r.region && contestedC.has(c.id)).length
    r.closest = pairs.find((p) => p.c.region === r.region || p.a.region === r.region) ?? null
  }

  return {
    pairs,
    cargill: C.length,
    adm: A.length,
    contestedCargill: contestedC.size,
    contestedAdm: contestedA.size,
    sameTown: new Set(pairs.filter((p) => p.mi < 2).map((p) => p.c.id)).size,
    regions: [...byRegion.values()].sort(
      (x, y) => y.contested - x.contested || y.cargill + y.adm - (x.cargill + x.adm),
    ),
  }
}

/** Nearest rival (non-export) sites within reach of `s`. */
export function rivalsNear(s: Site, visible: Site[], radiusMi: number, limit = 5) {
  if (s.type === "x") return []
  return visible
    .filter((o) => o.co !== s.co && o.type !== "x")
    .map((o) => ({ site: o, mi: miles(s, o) }))
    .filter((o) => o.mi < 2 * radiusMi)
    .sort((p, q) => p.mi - q.mi)
    .slice(0, limit)
}

export const fmtMi = (mi: number) => (mi < 1 ? "same town" : `${Math.round(mi)} mi`)
