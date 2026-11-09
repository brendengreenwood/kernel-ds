// Sell-side routes for every buying point: the 3 nearest destinations of each
// kind and how grain would get there.
//   ports    -> shortest track over the FRA main-line rail network (Dijkstra),
//               plus shortest river over the barge network for river terminals
//   feedyard -> truck leg when within ~100 mi (straight line, drawn by the client)
//   ethanol  -> truck leg when within ~100 mi
// Shortest track / shortest river are guesses, not contracts — the map labels
// them as such (object.route is a "guessed" catalog object).
//
// Input: FRA North American Rail Network lines, NET='M', US only, as GeoJSON.
// Usage: node scripts/build-sell-routes.mjs <narn-main.geojson>
// Output: src/data/sell-routes.json
//   { segs: [[lon,lat][]...], sites: { [siteId]: [{k,d,m,mi,s?}] } }
//   k = dest kind, d = dest index, m = rail|barge|truck, mi = miles,
//   s = indices into segs (rail/barge only; truck is a straight client-drawn line)
import fs from "node:fs"

const [input] = process.argv.slice(2)
if (!input) throw new Error("usage: build-sell-routes.mjs <narn-main.geojson>")
const narn = JSON.parse(fs.readFileSync(input, "utf8"))
const sites = JSON.parse(fs.readFileSync(new URL("../src/data/sites.json", import.meta.url), "utf8"))
const dests = JSON.parse(fs.readFileSync(new URL("../src/data/destinations.json", import.meta.url), "utf8"))
const rivers = JSON.parse(fs.readFileSync(new URL("../src/data/barge-rivers.json", import.meta.url), "utf8"))

const TRUCK_MI = 100
const NEAREST = 3

const miles = ([a, b], [c, d]) => {
  const r = Math.PI / 180
  const x = (c - a) * r * Math.cos(((b + d) / 2) * r)
  const y = (d - b) * r
  return 3958.8 * Math.hypot(x, y)
}

// ---- generic graph helpers --------------------------------------------------
function makeHeap() {
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
  return { heap, push, pop }
}

/** Dijkstra from one node. withPrev keeps the predecessor chain for path walks. */
function dijkstra(adj, start, withPrev) {
  const dist = new Map([[start, 0]])
  const prev = withPrev ? new Map() : null
  const { heap, push, pop } = makeHeap()
  push(0, start)
  while (heap.length) {
    const [d, n] = pop()
    if (d > dist.get(n)) continue
    for (const [m, e, w] of adj.get(n) ?? []) {
      const nd = d + w
      if (nd < (dist.get(m) ?? Infinity)) {
        dist.set(m, nd)
        if (prev) prev.set(m, [n, e])
        push(nd, m)
      }
    }
  }
  return { dist, prev }
}

function makeSnapper(coord, snapMiles) {
  const cell = ([x, y]) => `${Math.floor(x * 10)},${Math.floor(y * 10)}`
  const grid = new Map()
  for (const [n, p] of coord) {
    const k = cell(p)
    if (!grid.has(k)) grid.set(k, [])
    grid.get(k).push(n)
  }
  return (p) => {
    let best = null
    let bestD = snapMiles
    const [cx, cy] = [Math.floor(p[0] * 10), Math.floor(p[1] * 10)]
    const reach = Math.ceil(snapMiles / 6.9) // ~0.1 deg cells
    for (let dx = -reach; dx <= reach; dx++)
      for (let dy = -reach; dy <= reach; dy++)
        for (const n of grid.get(`${cx + dx},${cy + dy}`) ?? []) {
          const d = miles(p, coord.get(n))
          if (d < bestD) [best, bestD] = [n, d]
        }
    return best
  }
}

// ---- rail graph from NARN ---------------------------------------------------
const railCoord = new Map()
const railAdj = new Map()
const railGeom = [] // per NARN feature: flattened line
{
  const link = (n, m, e, w) => {
    if (!railAdj.has(n)) railAdj.set(n, [])
    railAdj.get(n).push([m, e, w])
  }
  narn.features.forEach((f, e) => {
    const { FRFRANODE: a, TOFRANODE: b, MILES } = f.properties
    const g = f.geometry
    const line = g.type === "MultiLineString" ? g.coordinates.flat() : g.coordinates
    railGeom[e] = line
    if (!line?.length) return
    railCoord.set(a, line[0])
    railCoord.set(b, line[line.length - 1])
    const w = MILES > 0 ? MILES : miles(line[0], line[line.length - 1])
    link(a, b, e, w)
    link(b, a, e, w)
  })
}
const snapRail = makeSnapper(railCoord, 3)

// ---- river graph from the barge network ------------------------------------
// Nodes are rounded coordinates so confluences that share a vertex join up.
const rivCoord = new Map()
const rivAdj = new Map()
const rivGeom = [] // per edge: [a, b] coord pair
{
  const key = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`
  const node = (p) => {
    const k = key(p)
    if (!rivCoord.has(k)) rivCoord.set(k, p)
    return k
  }
  const link = (n, m, e, w) => {
    if (!rivAdj.has(n)) rivAdj.set(n, [])
    rivAdj.get(n).push([m, e, w])
  }
  for (const f of rivers.features) {
    const linesets = f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates]
    for (const line of linesets)
      for (let i = 1; i < line.length; i++) {
        const [a, b] = [node(line[i - 1]), node(line[i])]
        if (a === b) continue
        const e = rivGeom.push([line[i - 1], line[i]]) - 1
        const w = miles(line[i - 1], line[i])
        link(a, b, e, w)
        link(b, a, e, w)
      }
  }
}
const snapRiver = makeSnapper(rivCoord, 8)

// ---- destinations -----------------------------------------------------------
// Row shape: [kind, name, operator, state, lat, lon, size, group]
const KIND = { x: "port", f: "feedyard", e: "ethanol" }
const destList = dests.map((row, id) => ({ id, kind: KIND[row[0]], lat: row[4], lon: row[5] }))
const ports = destList.filter((d) => d.kind === "port")

// Export terminals are already sell-side endpoints: no routes from them.
const routable = (s) => s[5] !== "x"

// Pass 1 — dist-only Dijkstra per port; keep only distances at site nodes.
const siteNode = sites.map((s) => snapRail([s[4], s[3]]))
const portNode = ports.map((p) => snapRail([p.lon, p.lat]))
const railMiles = new Map() // `${siteIdx}:${portId}` -> miles
ports.forEach((p, pi) => {
  const n = portNode[pi]
  if (n == null) return
  const { dist } = dijkstra(railAdj, n, false)
  sites.forEach((_, si) => {
    const sn = siteNode[si]
    if (sn != null && dist.has(sn)) railMiles.set(`${si}:${p.id}`, dist.get(sn))
  })
})

// Pick the 3 nearest ports by rail for every site, then group by port.
const wantsPort = new Map() // portId -> site indices
sites.forEach((s, si) => {
  if (!routable(s)) return
  const reachable = ports
    .filter((p) => railMiles.has(`${si}:${p.id}`) && railMiles.get(`${si}:${p.id}`) >= 1)
    .sort((a, b) => railMiles.get(`${si}:${a.id}`) - railMiles.get(`${si}:${b.id}`))
    .slice(0, NEAREST)
  for (const p of reachable) {
    if (!wantsPort.has(p.id)) wantsPort.set(p.id, [])
    wantsPort.get(p.id).push(si)
  }
})

// Shared segment store: rail/barge route geometry is stored once and referenced.
const segIndex = new Map()
const segs = []
const round = (n) => Math.round(n * 1000) / 1000
const storeSeg = (kind, e, line) => {
  const k = `${kind}:${e}`
  if (segIndex.has(k)) return segIndex.get(k)
  const i = segs.push(line.map(([x, y]) => [round(x), round(y)])) - 1
  segIndex.set(k, i)
  return i
}

const routes = new Map() // siteIdx -> route list
const add = (si, r) => {
  if (!routes.has(si)) routes.set(si, [])
  routes.get(si).push(r)
}

// Pass 2 — per assigned port, Dijkstra with prev and walk each site's path.
for (const [portId, siteIdxs] of wantsPort) {
  const pi = ports.findIndex((p) => p.id === portId)
  const { prev } = dijkstra(railAdj, portNode[pi], true)
  for (const si of siteIdxs) {
    const segRefs = []
    let n = siteNode[si]
    while (prev.has(n)) {
      const [p, e] = prev.get(n)
      segRefs.push(storeSeg("rail", e, railGeom[e]))
      n = p
    }
    add(si, { k: "port", d: portId, m: "rail", mi: Math.round(railMiles.get(`${si}:${portId}`)), s: segRefs })
  }
}

// River terminals also get a shortest-river route to the nearest port on the barge network.
const rivPortNode = ports.map((p) => snapRiver([p.lon, p.lat]))
let riverRouted = 0
sites.forEach((s, si) => {
  if (s[5] !== "r") return
  const start = snapRiver([s[4], s[3]])
  if (start == null) return
  const { dist, prev } = dijkstra(rivAdj, start, true)
  let best = null
  ports.forEach((p, pi) => {
    const n = rivPortNode[pi]
    if (n != null && dist.has(n) && (!best || dist.get(n) < best.mi)) best = { p, n, mi: dist.get(n) }
  })
  if (!best) return
  riverRouted++
  const segRefs = []
  let n = best.n
  while (prev.has(n)) {
    const [p, e] = prev.get(n)
    segRefs.push(storeSeg("riv", e, rivGeom[e]))
    n = p
  }
  add(si, { k: "port", d: best.p.id, m: "barge", mi: Math.round(best.mi), s: segRefs })
})

// Truck legs: 3 nearest feedyards and ethanol plants within ~100 mi.
for (const kind of ["feedyard", "ethanol"]) {
  const pool = destList.filter((d) => d.kind === kind)
  sites.forEach((s, si) => {
    if (!routable(s)) return
    pool
      .map((d) => ({ d, mi: miles([s[4], s[3]], [d.lon, d.lat]) }))
      .filter((x) => x.mi <= TRUCK_MI && x.mi >= 1)
      .sort((a, b) => a.mi - b.mi)
      .slice(0, NEAREST)
      .forEach(({ d, mi }) => add(si, { k: kind, d: d.id, m: "truck", mi: Math.round(mi) }))
  })
}

const out = { segs, sites: Object.fromEntries([...routes].map(([si, r]) => [si, r])) }
const file = new URL("../src/data/sell-routes.json", import.meta.url)
fs.writeFileSync(file, JSON.stringify(out))
const railRoutes = [...routes.values()].flat().filter((r) => r.m === "rail").length
const truckRoutes = [...routes.values()].flat().filter((r) => r.m === "truck").length
console.log(
  `SELL-ROUTES-OK: ${routes.size}/${sites.length} sites, ${railRoutes} rail + ${riverRouted} barge + ${truckRoutes} truck routes, ${segs.length} shared segments, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`,
)
