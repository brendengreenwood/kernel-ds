// Simulated bid history for one scenario over calendar time: your posted and max basis,
// the top competitors' posted basis, futures, and the basis you actually bought at. All simulated.
import { TEAM } from "@app/merchant/activity"
import type { Scenario } from "@app/merchant/scenario"

export const HISTORY_DAYS = 40
export const COMPETITORS = ["ADM", "Bunge", "Local Co-op"]

export type CurvePoint = {
  day: number // days before today, negative; 0 = today
  posted: number
  max: number
  c0: number
  c1: number
  c2: number
  futures: number
  bought?: number
}

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

function hash(str: string) {
  let h = 2166136261
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}

const round = (n: number) => Math.round(n * 100) / 100
const DAY = 86_400_000

export function curve(s: Scenario): CurvePoint[] {
  const r = rng(hash(s.id))
  const comp = [-0.03, 0.02, -0.08].map((o) => s.postedBid + o)
  let posted = s.postedBid - 0.06
  let futures = s.commodity === "corn" ? 4.2 : 10.4
  const now = Date.now()
  const points: CurvePoint[] = []
  for (let day = -HISTORY_DAYS; day <= 0; day++) {
    // Posted basis steps when the merchant republishes, roughly weekly.
    if (day > -HISTORY_DAYS && r() < 0.18) posted += Math.round((r() - 0.35) * 6) / 100
    if (day === 0) posted = s.postedBid
    for (let i = 0; i < comp.length; i++) if (r() < 0.15) comp[i] += Math.round((r() - 0.5) * 6) / 100
    futures += (r() - 0.5) * (s.commodity === "corn" ? 0.06 : 0.14)
    const accepted = TEAM.filter(
      (e) => e.action === "accepted" && e.scenario.id === s.id && Math.floor((e.at.getTime() - now) / DAY) + 1 === day,
    )
    points.push({
      day,
      posted: round(posted),
      max: round(day === 0 ? s.maxBid : posted + 0.1),
      c0: round(comp[0]),
      c1: round(comp[1]),
      c2: round(comp[2]),
      futures: round(futures),
      bought: accepted.length ? round(accepted.reduce((t, e) => t + e.bid, 0) / accepted.length) : undefined,
    })
  }
  return points
}

// Today's numbers for one scenario. Market = a regional basis index (simulated stand-in for a cash index minus futures).
export function snapshot(s: Scenario) {
  const today = curve(s).at(-1)!
  const best = Math.max(today.c0, today.c1, today.c2)
  const market = round(s.postedBid + ((hash(s.id + "m") % 13) - 8) / 100)
  return { posted: today.posted, best, market }
}
