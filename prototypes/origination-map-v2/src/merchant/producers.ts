/** Simulated producers. Names, places and bids are made up; no calculation is modeled. */
import type { Scenario } from "./scenario"

export type Producer = { id: string; name: string; lon: number; lat: number; offset: number }

const SURNAMES = [
  "Ahrens", "Bauer", "Carlson", "Dvorak", "Eklund", "Fischer", "Gustafson", "Hansen", "Iverson", "Jensen",
  "Kühn", "Lindgren", "Meyer", "Nielsen", "Olsen", "Petersen", "Quist", "Rasmussen", "Schultz", "Thorson",
  "Uhlig", "Vogel", "Weber", "Yoder", "Zimmerman", "Brandt", "Hoffman", "Krause", "Lund", "Novak",
]
const SUFFIX = ["Farms", "Family Farms", "Grain", "Ag", "Land & Cattle", "Acres"]

/** Deterministic so a location always gets the same producers. */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const cache = new Map<string, Producer[]>()

/** About 40 producers scattered within ~50 mi of a buying point. */
export function producersNear(locationId: string, lon: number, lat: number): Producer[] {
  const hit = cache.get(locationId)
  if (hit) return hit
  const r = rng(locationId)
  const list = Array.from({ length: 40 }, (_, i) => {
    const dist = Math.sqrt(r()) * 50
    const ang = r() * Math.PI * 2
    return {
      id: `${locationId}-p${i}`,
      name: `${SURNAMES[Math.floor(r() * SURNAMES.length)]} ${SUFFIX[Math.floor(r() * SUFFIX.length)]}`,
      lat: lat + (dist * Math.sin(ang)) / 69,
      lon: lon + (dist * Math.cos(ang)) / (69 * Math.cos((lat * Math.PI) / 180)),
      offset: Math.round((r() - 0.6) * 20) / 100,
    }
  })
  cache.set(locationId, list)
  return list
}

/** Simulated bid for one producer: the posted bid nudged by a fixed per-producer offset. */
export const producerBid = (s: Scenario, p: Producer) => s.postedBid + p.offset
