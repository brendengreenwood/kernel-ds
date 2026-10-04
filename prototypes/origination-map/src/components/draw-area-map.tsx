import * as React from "react"
import maplibregl, { type GeoJSONSource, type Map as MLMap } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

import { COMPANY, FACILITY, cropList, type FacilityType, type Site } from "@app/data/sites"
import { circleRing } from "@app/lib/geo"
import { cssVarColor } from "@app/lib/color"
import type { Theme } from "@app/lib/theme"

/* Basemaps: OpenFreeMap's vector styles — free, no API key, OSM data. Either
   can be swapped for any MapLibre style URL (MapTiler, Stadia, a self-hosted
   PMTiles style…) via env without touching the code. */
const STYLE: Record<Theme, string> = {
  light: import.meta.env.VITE_MAP_STYLE_LIGHT ?? "https://tiles.openfreemap.org/styles/positron",
  dark: import.meta.env.VITE_MAP_STYLE_DARK ?? "https://tiles.openfreemap.org/styles/dark",
}

/* Offline fallback: if the tile host can't be reached, draw the lower-48
   state outlines (us-atlas, served from /public) in DS surface colours so the
   sites, draw areas and tables all still work. */
function fallbackStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: { us: { type: "geojson", data: `${import.meta.env.BASE_URL}us-states.geojson` } },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": cssVarColor("--muted") } },
      { id: "land", type: "fill", source: "us", filter: ["==", ["get", "kind"], "land"], paint: { "fill-color": cssVarColor("--card") } },
      { id: "border", type: "line", source: "us", filter: ["==", ["get", "kind"], "border"], paint: { "line-color": cssVarColor("--border"), "line-width": 0.8 } },
    ],
  }
}

type Bounds = [[number, number], [number, number]]

/* One SDF glyph per facility type: shape carries type, colour carries company
   (redundant coding — the type key never depends on hue). */
const SHAPES: FacilityType[] = ["i", "r", "p", "x"]
function shapeImage(type: FacilityType): ImageData {
  const n = 48
  const c = document.createElement("canvas")
  c.width = c.height = n
  const g = c.getContext("2d")!
  g.fillStyle = "#000"
  g.beginPath()
  const m = n / 2
  const r = n * 0.36
  if (type === "i") g.arc(m, m, r * 0.92, 0, Math.PI * 2)
  else if (type === "r") {
    g.moveTo(m, m - r * 1.05)
    g.lineTo(m + r * 1.05, m + r * 0.8)
    g.lineTo(m - r * 1.05, m + r * 0.8)
  } else if (type === "p") g.rect(m - r * 0.85, m - r * 0.85, r * 1.7, r * 1.7)
  else {
    g.moveTo(m, m - r * 1.1)
    g.lineTo(m + r * 1.1, m)
    g.lineTo(m, m + r * 1.1)
    g.lineTo(m - r * 1.1, m)
  }
  g.closePath()
  g.fill()
  return g.getImageData(0, 0, n, n)
}

export interface DrawAreaMapProps {
  sites: Site[]
  visible: Set<number>
  radiusMi: number
  theme: Theme
  selectedId: number | null
  /** Two sites to tie together (a hovered/selected Cargill–ADM pair). */
  pair: [number, number] | null
  /** Bumped by the parent to request a camera move to the selection/pair. */
  focusKey: number
  onSelect: (id: number | null) => void
  /** Reports whether the live basemap or the offline outline fallback is showing. */
  onBasemap?: (b: "tiles" | "fallback") => void
}

export function DrawAreaMap({ sites, visible, radiusMi, theme, selectedId, pair, focusKey, onSelect, onBasemap }: DrawAreaMapProps) {
  const container = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<MLMap | null>(null)
  const [ready, setReady] = React.useState(0)
  const onSelectRef = React.useRef(onSelect)
  onSelectRef.current = onSelect

  const byId = React.useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites])
  const home = React.useMemo<Bounds>(() => {
    const lons = sites.map((s) => s.lon)
    const lats = sites.map((s) => s.lat)
    return [
      [Math.min(...lons) - 1, Math.min(...lats) - 1],
      [Math.max(...lons) + 1, Math.max(...lats) + 1],
    ]
  }, [sites])
  const onBasemapRef = React.useRef(onBasemap)
  onBasemapRef.current = onBasemap

  const siteData = React.useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: sites
        .filter((s) => visible.has(s.id))
        .map((s) => {
          const a = s.stack * 2.1
          const off = s.stack ? [Math.cos(a) * 9, Math.sin(a) * 9] : [0, 0]
          return {
            type: "Feature",
            id: s.id,
            geometry: { type: "Point", coordinates: [s.lon, s.lat] },
            properties: { id: s.id, co: s.co, type: s.type, off },
          }
        }),
    }),
    [sites, visible],
  )

  const drawData = React.useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: sites
        .filter((s) => visible.has(s.id) && s.type !== "x")
        .map((s) => ({
          type: "Feature",
          id: s.id,
          geometry: { type: "Polygon", coordinates: [circleRing(s.lat, s.lon, radiusMi)] },
          properties: { id: s.id, co: s.co },
        })),
    }),
    [sites, visible, radiusMi],
  )

  const pairData = React.useMemo<GeoJSON.FeatureCollection>(() => {
    const p = pair && [byId.get(pair[0]), byId.get(pair[1])]
    return {
      type: "FeatureCollection",
      features:
        p && p[0] && p[1]
          ? [
              {
                type: "Feature",
                geometry: { type: "LineString", coordinates: [[p[0].lon, p[0].lat], [p[1].lon, p[1].lat]] },
                properties: {},
              },
            ]
          : [],
    }
  }, [pair, byId])

  // Latest data for the style.load handler, which re-installs everything after
  // a basemap swap.
  const latest = React.useRef({ siteData, drawData, pairData })
  latest.current = { siteData, drawData, pairData }

  // ---- create the map once --------------------------------------------------
  React.useEffect(() => {
    if (!container.current) return
    const map = new maplibregl.Map({
      container: container.current,
      style: STYLE[theme],
      bounds: home,
      fitBoundsOptions: { padding: 24 },
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    })
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial" }), "bottom-left")
    mapRef.current = map

    const tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: "om-tip" })

    map.on("style.load", () => {
      stylePending.current = false
      install(map)
      setReady((n) => n + 1)
    })
    map.on("error", () => {
      // An error before the requested style finished loading means the style
      // (or its sprite/source manifest) is unreachable — fall back once.
      if (!stylePending.current || usingFallback.current) return
      usingFallback.current = true
      onBasemapRef.current?.("fallback")
      map.setStyle(fallbackStyle(), { diff: false })
    })
    map.on("mousemove", "om-sites", (e) => {
      const f = e.features?.[0]
      if (!f) return
      map.getCanvas().style.cursor = "pointer"
      const s = byIdRef.current.get(f.properties.id as number)
      if (!s) return
      tip
        .setLngLat([s.lon, s.lat])
        .setHTML(
          `<strong>${COMPANY[s.co]} ${s.name}, ${s.state}</strong><span>${FACILITY[s.type].label} · bids ${cropList(s.crops)}</span>`,
        )
        .addTo(map)
    })
    map.on("mouseleave", "om-sites", () => {
      map.getCanvas().style.cursor = ""
      tip.remove()
    })
    map.on("click", (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ["om-sites"] })[0]
      onSelectRef.current(f ? (f.properties.id as number) : null)
    })

    return () => {
      tip.remove()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stylePending = React.useRef(true)
  const usingFallback = React.useRef(false)
  const byIdRef = React.useRef(byId)
  byIdRef.current = byId

  function install(map: MLMap) {
    const cargill = cssVarColor("--om-cargill")
    const adm = cssVarColor("--om-adm")
    const halo = cssVarColor("--background")
    const ink = cssVarColor("--foreground")
    const byCo = ["match", ["get", "co"], "C", cargill, adm] as unknown as maplibregl.ExpressionSpecification

    for (const t of SHAPES) {
      if (map.hasImage(`om-${t}`)) map.removeImage(`om-${t}`)
      map.addImage(`om-${t}`, shapeImage(t), { sdf: true, pixelRatio: 2 })
    }

    // Draw areas go under the basemap's labels so place names stay legible.
    const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol")?.id
    const { siteData, drawData, pairData } = latest.current
    map.addSource("om-draw", { type: "geojson", data: drawData })
    map.addSource("om-sites", { type: "geojson", data: siteData })
    map.addSource("om-pair", { type: "geojson", data: pairData })

    map.addLayer(
      {
        id: "om-draw-fill",
        type: "fill",
        source: "om-draw",
        paint: {
          "fill-color": byCo,
          "fill-opacity": ["case", ["boolean", ["feature-state", "on"], false], 0.22, 0.1],
        },
      },
      firstLabel,
    )
    map.addLayer(
      {
        id: "om-draw-line",
        type: "line",
        source: "om-draw",
        paint: {
          "line-color": byCo,
          "line-opacity": ["case", ["boolean", ["feature-state", "on"], false], 0.95, 0.45],
          "line-width": ["case", ["boolean", ["feature-state", "on"], false], 1.75, 0.75],
        },
      },
      firstLabel,
    )
    map.addLayer({
      id: "om-pair",
      type: "line",
      source: "om-pair",
      layout: { "line-cap": "round" },
      paint: { "line-color": ink, "line-width": 2, "line-dasharray": [2, 1.5] },
    })
    map.addLayer({
      id: "om-sites",
      type: "symbol",
      source: "om-sites",
      layout: {
        "icon-image": ["concat", "om-", ["get", "type"]],
        "icon-size": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 6, 0.85, 9, 1.1],
        "icon-offset": ["get", "off"],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "symbol-sort-key": ["case", ["==", ["get", "type"], "p"], 0, 1],
      },
      paint: {
        "icon-color": byCo,
        "icon-halo-color": ["case", ["boolean", ["feature-state", "on"], false], ink, halo],
        "icon-halo-width": ["case", ["boolean", ["feature-state", "on"], false], 3, 1.25],
      },
    })
  }

  // ---- push data -------------------------------------------------------------
  React.useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    ;(map.getSource("om-sites") as GeoJSONSource | undefined)?.setData(siteData)
  }, [siteData, ready])
  React.useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    ;(map.getSource("om-draw") as GeoJSONSource | undefined)?.setData(drawData)
  }, [drawData, ready])
  React.useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    ;(map.getSource("om-pair") as GeoJSONSource | undefined)?.setData(pairData)
  }, [pairData, ready])

  // ---- highlight state -------------------------------------------------------
  const on = React.useMemo(() => {
    const ids = new Set<number>()
    if (selectedId != null) ids.add(selectedId)
    if (pair) pair.forEach((i) => ids.add(i))
    return ids
  }, [selectedId, pair])
  React.useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const src of ["om-sites", "om-draw"]) {
      if (!map.getSource(src)) continue
      map.removeFeatureState({ source: src })
      on.forEach((id) => map.setFeatureState({ source: src, id }, { on: true }))
    }
  }, [on, ready, siteData, drawData])

  // ---- theme: swap basemap; style.load re-installs our layers in new colours --
  const firstTheme = React.useRef(theme)
  React.useEffect(() => {
    const map = mapRef.current
    if (!map || theme === firstTheme.current) return
    firstTheme.current = theme
    stylePending.current = true
    map.setStyle(usingFallback.current ? fallbackStyle() : STYLE[theme], { diff: false })
  }, [theme])

  // ---- camera ----------------------------------------------------------------
  React.useEffect(() => {
    const map = mapRef.current
    if (!map || !focusKey) return
    const ids = pair ?? (selectedId != null ? [selectedId] : [])
    const pts = ids.map((i) => byId.get(i)).filter((s): s is Site => !!s)
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700
    if (!pts.length) {
      map.fitBounds(home, { padding: 24, duration })
      return
    }
    const pad = (radiusMi * 1.6) / 69
    const lons = pts.map((s) => s.lon)
    const lats = pts.map((s) => s.lat)
    map.fitBounds(
      [
        [Math.min(...lons) - pad * 1.4, Math.min(...lats) - pad],
        [Math.max(...lons) + pad * 1.4, Math.max(...lats) + pad],
      ],
      { padding: 48, maxZoom: 9, duration },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  return (
    <div
      ref={container}
      className="size-full"
      role="region"
      aria-label="Map of Cargill and ADM grain buying points with draw-area circles. Use the Pairs and Regions lists for keyboard access."
    />
  )
}
