// Simulated team activity and scenario performance for the merchant's Home. Rough first pass.
import { LOCATIONS, SCENARIOS, shipWindow, type Scenario } from "@app/merchant/scenario"

export type TeamAction = "accepted" | "rejected"

export const ACTION_LABEL: Record<TeamAction, string> = {
  accepted: "Accepted",
  rejected: "Rejected",
}

export type TeamEvent = {
  id: string
  originator: string
  producer: string
  action: TeamAction
  scenario: Scenario
  bid: number
  bushels: number
  at: Date
}

const ORIGINATORS = ["Dana Kraus", "Luis Ortega", "Megan Holt", "Sam Lindqvist"]
const PRODUCERS = ["Eklund Family Farms", "Fischer Farms", "Gustafson Grain", "Jensen Grain", "Kühn Acres", "Meyer Farms", "Petersen Ag", "Quist Bros", "Rasmussen Land", "Weber Farms", "Zimmerman Grain"]
const ACTIONS: TeamAction[] = ["accepted", "rejected", "accepted", "accepted", "rejected"]

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}

const now = new Date()
const r = rng(7)

export const TEAM: TeamEvent[] = Array.from({ length: 60 }, (_, n) => {
  const scenario = SCENARIOS[Math.floor(r() * SCENARIOS.length)]
  const action = ACTIONS[Math.floor(r() * ACTIONS.length)]
  return {
    id: `t${n}`,
    originator: ORIGINATORS[Math.floor(r() * ORIGINATORS.length)],
    producer: PRODUCERS[Math.floor(r() * PRODUCERS.length)],
    action,
    scenario,
    bid: scenario.postedBid + Math.round((r() - 0.5) * 8) / 100,
    bushels: Math.round(2 + r() * 18) * 1000,
    at: new Date(now.getTime() - Math.pow(r(), 2) * 40 * 86_400_000),
  }
}).sort((a, b) => b.at.getTime() - a.at.getTime())

export type Performance = {
  scenario: Scenario
  target: number
  bought: number
  accepted: number
  rejected: number
  competitor: number
}

export function performance(events: TeamEvent[]): Performance[] {
  return SCENARIOS.map((s, i) => {
    const mine = events.filter((e) => e.scenario.id === s.id)
    const accepted = mine.filter((e) => e.action === "accepted")
    const c = rng(Math.imul(i + 1, 2654435761) >>> 0)
    c()
    return {
      scenario: s,
      target: Math.round(80 + c() * 120) * 1000,
      bought: accepted.reduce((t, e) => t + e.bushels, 0),
      accepted: accepted.length,
      rejected: mine.filter((e) => e.action === "rejected").length,
      competitor: s.postedBid + Math.round((c() - 0.4) * 10) / 100,
    }
  })
}

export function scenarioLabel(s: Scenario) {
  const loc = LOCATIONS.find((l) => l.id === s.locationId)?.name ?? s.locationId
  return `${loc} · ${s.contract} · ${shipWindow(s)}`
}

export function whenLabel(d: Date) {
  const h = (now.getTime() - d.getTime()) / 3_600_000
  if (h < 1) return "Just now"
  if (h < 24) return `${Math.round(h)}h ago`
  return `${Math.round(h / 24)}d ago`
}

const RANGE_HOURS: Record<string, number> = { Today: 24, "7d": 168, "30d": 720, All: Infinity }
export const RANGES = Object.keys(RANGE_HOURS)
export const inRange = (e: TeamEvent, range: string) => (now.getTime() - e.at.getTime()) / 3_600_000 <= RANGE_HOURS[range]
