// Routes every Cargill interior elevator and processing plant over the FRA
// main-line rail network to its nearest Gulf outlet (a Cargill Gulf export
// terminal, or a Cargill river terminal that hands grain to barge), then
// counts how many site routes cross each track segment.
//
// Input: FRA North American Rail Network lines, NET='M', US only, as GeoJSON
// (fetched from the NTAD FeatureServer). Usage:
//   node scripts/build-rail-flow.mjs <narn-main.geojson>
// Shortest path is an approximation of where trains really go.
import fs from "node:fs"

const [input] = process.argv.slice(2)
if (!input) throw new Error("usage: build-rail-flow.mjs <narn-main.geojson>")
const narn = JSON.parse(fs.readFileSync(input, "utf8"))
const sites = JSON.parse(fs.readFileSync(new URL("../src/data/sites.json", import.meta.url), "utf8"))

const SNAP_MILES = 2
const miles = ([a, b], [c, d]) => {
  const r = Math.PI / 180
  const x = (c - a) * r * Math.cos(((b + d) / 2) * r)
  const y = (d - b) * r
  return 3958.8 * Math.hypot(x, y)
}

// Graph: FRA node ids, edges carry their segment index.
const coord = new Map()
const adj = new Map()
const link = (n, m, e, w) => {
  if (!adj.has(n)) adj.set(n, [])
  adj.get(n).push([m, e, w])
}
narn.features.forEach((f, e) => {
  const { FRFRANODE: a, TOFRANODE: b, MILES } = f.properties
  const g = f.geometry
  const line = g.type === "MultiLineString" ? g.coordinates.flat() : g.coordinates
  if (!line?.length) return
  coord.set(a, line[0])
  coord.set(b, line[line.length - 1])
  const w = MILES > 0 ? MILES : miles(line[0], line[line.length - 1])
  link(a, b, e, w)
  link(b, a, e, w)
})

// Grid index for snapping sites to the nearest node.
const cell = ([x, y]) => `${Math.floor(x * 10)},${Math.floor(y * 10)}`
const grid = new Map()
for (const [n, p] of coord) {
  const k = cell(p)
  if (!grid.has(k)) grid.set(k, [])
  grid.get(k).push(n)
}
const snap = (p) => {
  let best = null
  let bestD = SNAP_MILES
  const [cx, cy] = [Math.floor(p[0] * 10), Math.floor(p[1] * 10)]
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (const n of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
        const d = miles(p, coord.get(n))
        if (d < bestD) [best, bestD] = [n, d]
      }
  return best
}

const cargill = sites.filter((s) => s[0] === "C")
const outlets = cargill.filter((s) => (s[5] === "x" && s[6] === "Gulf") || s[5] === "r")
const sources = cargill.filter((s) => s[5] === "i" || s[5] === "p")

// Multi-source Dijkstra from every outlet: each node learns its nearest outlet.
const dist = new Map()
const prev = new Map()
const heap = []
const push = (d, n) => {
  heap.push([d, n])
  let i = heap.length - 1
  while (i > 0) {
    const p = (i - 1) >> 1
    if (heap[p][0] <= heap[i][0]) break
    ;[heap[p], heap[i]] = [heap[i], heap[p]]
    i = p
  }
}
const pop = () => {
  const top = heap[0]
  const last = heap.pop()
  if (heap.length) {
    heap[0] = last
    let i = 0
    for (;;) {
      const l = 2 * i + 1
      const r = l + 1
      let m = i
      if (l < heap.length && heap[l][0] < heap[m][0]) m = l
      if (r < heap.length && heap[r][0] < heap[m][0]) m = r
      if (m === i) break
      ;[heap[m], heap[i]] = [heap[i], heap[m]]
      i = m
    }
  }
  return top
}
let outletCount = 0
for (const s of outlets) {
  const n = snap([s[4], s[3]])
  if (n == null) continue
  outletCount++
  dist.set(n, 0)
  push(0, n)
}
while (heap.length) {
  const [d, n] = pop()
  if (d > dist.get(n)) continue
  for (const [m, e, w] of adj.get(n) ?? []) {
    const nd = d + w
    if (nd < (dist.get(m) ?? Infinity)) {
      dist.set(m, nd)
      prev.set(m, [n, e])
      push(nd, m)
    }
  }
}

const count = new Map()
let routed = 0
const unrouted = []
for (const s of sources) {
  let n = snap([s[4], s[3]])
  if (n == null || !dist.has(n)) {
    unrouted.push(`${s[1]}, ${s[2]}`)
    continue
  }
  routed++
  while (prev.has(n)) {
    const [p, e] = prev.get(n)
    count.set(e, (count.get(e) ?? 0) + 1)
    n = p
  }
}

const features = [...count].map(([e, routes]) => ({
  type: "Feature",
  properties: { routes, owner: narn.features[e].properties.RROWNER1 },
  geometry: narn.features[e].geometry,
}))
const out = new URL("../src/data/rail-flow.json", import.meta.url)
fs.writeFileSync(out, JSON.stringify({ type: "FeatureCollection", features }))
const max = Math.max(...count.values())
console.log(`RAIL-FLOW-OK: ${outletCount}/${outlets.length} outlets on rail, ${routed}/${sources.length} sites routed, ${features.length} segments, max ${max} routes`)
if (unrouted.length) console.log(`no main line within ${SNAP_MILES} mi: ${unrouted.join("; ")}`)
