/** Priority areas on the map: drawn with a lasso, shown as dashed outlines (see PRIORITY-AREAS.md). */
import type { Map as MLMap, GeoJSONSource } from "maplibre-gl"
import { cssVarColor } from "@app/lib/color"
import type { Producer } from "./producers"

export type LngLat = [number, number]
export type Area = { id: string; name: string; ring: LngLat[]; hidden: boolean }

/** Ray-casting point-in-polygon. */
export function inside([x, y]: LngLat, ring: LngLat[]) {
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

export const producersIn = (area: Area, producers: Producer[]) =>
  producers.filter((p) => inside([p.lon, p.lat], area.ring))

const empty = { type: "FeatureCollection" as const, features: [] }

/** Adds the producer, area and lasso layers. Safe to call again after a style reload. */
export function installAreaLayers(map: MLMap) {
  if (map.getSource("om-areas")) return
  const fg = cssVarColor("--foreground")
  map.addSource("om-producers", { type: "geojson", data: empty })
  map.addSource("om-areas", { type: "geojson", data: empty })
  map.addSource("om-lasso", { type: "geojson", data: empty })
  map.addLayer({ id: "om-areas-fill", type: "fill", source: "om-areas", paint: { "fill-color": fg, "fill-opacity": ["case", ["get", "selected"], 0.1, 0.05] } })
  map.addLayer({
    id: "om-areas-line",
    type: "line",
    source: "om-areas",
    paint: { "line-color": fg, "line-width": ["case", ["get", "selected"], 2.5, 1.5], "line-dasharray": [3, 2] },
  })
  map.addLayer({ id: "om-lasso", type: "line", source: "om-lasso", paint: { "line-color": fg, "line-width": 1.5, "line-dasharray": [1, 1.5] } })
  // Producers are neutral marks: the hue ledger is full and they are not a company.
  map.addLayer({
    id: "om-producers",
    type: "circle",
    source: "om-producers",
    paint: {
      "circle-radius": ["case", ["get", "inArea"], 4, 3],
      "circle-color": ["case", ["get", "inArea"], fg, cssVarColor("--muted-foreground")],
      "circle-stroke-color": cssVarColor("--background"),
      "circle-stroke-width": 1,
    },
  })
}

export function setProducers(map: MLMap, producers: Producer[], areas: Area[]) {
  const live = areas.filter((a) => !a.hidden)
  ;(map.getSource("om-producers") as GeoJSONSource | undefined)?.setData({
    type: "FeatureCollection",
    features: producers.map((p) => ({
      type: "Feature",
      properties: { inArea: live.some((a) => inside([p.lon, p.lat], a.ring)) },
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
    })),
  })
}

export function setAreas(map: MLMap, areas: Area[], selectedId: string | null) {
  ;(map.getSource("om-areas") as GeoJSONSource | undefined)?.setData({
    type: "FeatureCollection",
    features: areas
      .filter((a) => !a.hidden)
      .map((a) => ({
        type: "Feature",
        properties: { selected: a.id === selectedId },
        geometry: { type: "Polygon", coordinates: [[...a.ring, a.ring[0]]] },
      })),
  })
}

/** Starts one lasso stroke. Resolves with the ring, or null if cancelled or too small. */
export function lasso(map: MLMap): { done: Promise<LngLat[] | null>; cancel: () => void } {
  const canvas = map.getCanvas()
  const src = map.getSource("om-lasso") as GeoJSONSource
  const pts: LngLat[] = []
  let resolve!: (r: LngLat[] | null) => void
  const done = new Promise<LngLat[] | null>((r) => (resolve = r))
  const draw = () =>
    src.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts } }] })

  const down = (e: { lngLat: { lng: number; lat: number } }) => {
    pts.length = 0
    pts.push([e.lngLat.lng, e.lngLat.lat])
    map.on("mousemove", move)
  }
  const move = (e: { lngLat: { lng: number; lat: number } }) => {
    pts.push([e.lngLat.lng, e.lngLat.lat])
    draw()
  }
  const finish = (ring: LngLat[] | null) => {
    map.off("mousedown", down)
    map.off("mousemove", move)
    map.off("mouseup", up)
    window.removeEventListener("keydown", key)
    map.dragPan.enable()
    canvas.style.cursor = ""
    src.setData(empty)
    resolve(ring)
  }
  const up = () => finish(pts.length >= 3 ? [...pts] : null)
  const key = (e: KeyboardEvent) => e.key === "Escape" && finish(null)

  map.dragPan.disable()
  canvas.style.cursor = "crosshair"
  map.on("mousedown", down)
  map.on("mouseup", up)
  window.addEventListener("keydown", key)
  return { done, cancel: () => finish(null) }
}
