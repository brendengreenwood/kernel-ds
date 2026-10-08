import * as React from "react"
import { cn } from "@/lib/utils"
import { ThinkingOrb } from "thinking-orbs"
import maplibregl, { type GeoJSONSource, type Map as MLMap } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

import { cropList } from "@app/data/sites"
import { COMPANY, FACILITY, buyingPointFeature, buyingPointMarker, companyColor, type BuyingPoint as Site } from "@app/map/objects/buying-point"
import { circleRing } from "@app/lib/geo"
import { cssVarColor } from "@app/lib/color"
import { DEST, DEST_KINDS, destSize, destinationFeature, destinationMarker, type Destination } from "@app/map/objects/destination"
import { useMapData } from "@app/map/data"
import { mapPalette, markRoles } from "@app/map/kit/theme"
import { installGlyphs } from "@app/map/kit/glyphs"
import { addMarker, hoverState, litState } from "@app/map/kit/marker"
import { styleTileCorridors, addCorridors, setCorridorHighlight, type CorridorHighlight } from "@app/map/kit/corridors"
import type { Theme } from "@app/lib/theme"

/* Basemaps: OpenFreeMap's vector styles — free, no API key, OSM data. Either
   can be swapped for any MapLibre style URL (MapTiler, Stadia, a self-hosted
   PMTiles style…) via env without touching the code. */


const STYLE: Record<Theme, string> = {
  // Both themes repaint the same layer set, so light reuses the dark style's layer ids.
  light: import.meta.env.VITE_MAP_STYLE_LIGHT ?? "https://tiles.openfreemap.org/styles/dark",
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

const ALL_DEST: ReadonlySet<string> = new Set(DEST_KINDS)
const destData = (list: Destination[]): GeoJSON.FeatureCollection => ({ type: "FeatureCollection", features: list.map(destinationFeature) })


export interface DrawAreaMapProps {
  sites: Site[]
  visible: Set<number>
  radiusMi: number
  /** Draw-area circles on or off; sites stay either way. */
  showDraw?: boolean
  theme: Theme
  selectedId: number | null
  /** Two sites to tie together (a hovered/selected Cargill–ADM pair). */
  pair: [number, number] | null
  /** Bumped by the parent to request a camera move to the selection/pair. */
  focusKey: number
  onSelect: (id: number | null) => void
  /** Reports whether the live basemap or the offline outline fallback is showing. */
  onBasemap?: (b: "tiles" | "fallback") => void
  /** Adds a reset-view button to the map's zoom controls. */
  onReset?: () => void
  /** A site hovered outside the map (e.g. a rival list row) — lit and labelled as if the cursor were on it. */
  /** Destination kinds to show. */
  destKinds?: ReadonlySet<string>
  highlight?: CorridorHighlight
  hoverSite?: number | null
  /** Called with the map after every style load, so callers can add their own layers. */
  onMap?: (map: MLMap) => void
}

const ALL_ON: CorridorHighlight = { rivers: true, rail: true }

export function DrawAreaMap({ sites, visible, radiusMi, showDraw = true, theme, selectedId, pair, focusKey, onSelect, onBasemap, onReset, hoverSite = null, destKinds = ALL_DEST, highlight = ALL_ON, onMap }: DrawAreaMapProps) {
  const listTip = React.useRef<maplibregl.Popup | null>(null)
  const container = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<MLMap | null>(null)
  const [ready, setReady] = React.useState(0)
  // Hold the map hidden until its first tiles have drawn, then fade it in.
  const [painted, setPainted] = React.useState(false)
  const onSelectRef = React.useRef(onSelect)
  onSelectRef.current = onSelect
  const onResetRef = React.useRef(onReset)
  onResetRef.current = onReset

  const data = useMapData()
  const dataRef = React.useRef(data)
  dataRef.current = data
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
        .map(buyingPointFeature),
    }),
    [sites, visible],
  )

  const drawData = React.useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: sites
        .filter((s) => showDraw && visible.has(s.id) && s.type !== "export")
        .map((s) => ({
          type: "Feature",
          id: s.id,
          geometry: { type: "Polygon", coordinates: [circleRing(s.lat, s.lon, radiusMi)] },
          properties: { id: s.id, co: s.co },
        })),
    }),
    [sites, visible, radiusMi, showDraw],
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
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right")
    map.addControl(
      {
        onAdd: () => {
          const g = document.createElement("div")
          g.className = "maplibregl-ctrl maplibregl-ctrl-group"
          const b = document.createElement("button")
          b.type = "button"
          b.title = "Reset view"
          b.setAttribute("aria-label", "Reset view")
          b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" style="margin:auto" fill="currentColor" aria-hidden="true"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M14.19,14.19L6,18L9.81,9.81L18,6M12,10.9A1.1,1.1 0 0,0 10.9,12A1.1,1.1 0 0,0 12,13.1A1.1,1.1 0 0,0 13.1,12A1.1,1.1 0 0,0 12,10.9Z"/></svg>'
          b.onclick = () => onResetRef.current?.()
          g.appendChild(b)
          return g
        },
        onRemove: () => {},
      },
      "bottom-right",
    )
    map.addControl(new maplibregl.ScaleControl({ unit: "imperial" }), "bottom-left")
    mapRef.current = map
    map.once("idle", () => setPainted(true))
    listTip.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: "om-tip" })
    const giveUp = window.setTimeout(() => setPainted(true), 4000)

    const tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12, className: "om-tip" })

    map.on("style.load", () => {
      stylePending.current = false
      // Basemap reduced to what origination reads: ground, water, the road/rail
      // network and place names, everything else hidden.
      if (!usingFallback.current) {
        const c = mapPalette()
        for (const l of map.getStyle().layers) {
          if (l.type === "background") map.setPaintProperty(l.id, "background-color", c.ground)
          else if (l.id === "water") map.setPaintProperty(l.id, "fill-color", c.water)
          else if (styleTileCorridors(map, l.id)) continue
          else if (/^highway_(minor|major_inner|major_subtle|motorway_inner|motorway_subtle)$/.test(l.id)) map.setPaintProperty(l.id, "line-color", c.roads)
          else if (l.id.startsWith("place_")) {
            map.setPaintProperty(l.id, "text-color", c.label)
            map.setPaintProperty(l.id, "text-halo-color", c.ground)
          }
          else map.setLayoutProperty(l.id, "visibility", "none")
        }
      }
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
    let hoverId: number | null = null
    // Relationship lines march slowly so a pinned pair reads as a live link.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const DASH = [
      [0, 2, 1.5], [0.25, 2, 1.25], [0.5, 2, 1], [0.75, 2, 0.75], [1, 2, 0.5], [1.25, 2, 0.25],
      [1.5, 2, 0], [0, 0.25, 2, 1.25], [0, 0.5, 2, 1], [0, 0.75, 2, 0.75], [0, 1, 2, 0.5], [0, 1.25, 2, 0.25],
    ]
    let raf = 0
    let step = -1
    const march = (t: number) => {
      const next = Math.floor(t / 70) % DASH.length
      if (next !== step && map.getLayer("om-pair")) {
        step = next
        map.setPaintProperty("om-pair", "line-dasharray", DASH[step])
      }
      raf = requestAnimationFrame(march)
    }
    if (!reduce) raf = requestAnimationFrame(march)
    map.on("mousemove", "om-sites", (e) => {
      const f = e.features?.[0]
      if (!f) return
      map.getCanvas().style.cursor = "pointer"
      const id = f.properties.id as number
      if (hoverId !== id) {
        if (hoverId != null) map.setFeatureState({ source: "om-sites", id: hoverId }, { hover: false })
        hoverId = id
        map.setFeatureState({ source: "om-sites", id }, { hover: true })
      }
      const s = byIdRef.current.get(id)
      if (!s) return
      tip
        .setLngLat([s.lon, s.lat])
        .setHTML(
          `<strong>${COMPANY[s.co].label} ${s.name}, ${s.state}</strong><span>${FACILITY[s.type].label} · bids ${cropList(s.crops)}</span>`,
        )
        .addTo(map)
    })
    let destHover: number | null = null
    map.on("mousemove", "om-dest", (e) => {
      const f = e.features?.[0]
      if (!f || map.queryRenderedFeatures(e.point, { layers: ["om-sites"] }).length) return
      const id = f.properties.id as number
      if (destHover !== id) {
        if (destHover != null) map.setFeatureState({ source: "om-dest", id: destHover }, { hover: false })
        destHover = id
        map.setFeatureState({ source: "om-dest", id }, { hover: true })
      }
      const d = dataRef.current.destinations[id]
      tip
        .setLngLat([d.lon, d.lat])
        .setHTML(`<strong>${d.name}, ${d.state}</strong><span>${DEST[d.kind].label} · ${d.operator}${destSize(d)}</span>`)
        .addTo(map)
    })
    map.on("mouseleave", "om-dest", () => {
      if (destHover != null) map.setFeatureState({ source: "om-dest", id: destHover }, { hover: false })
      destHover = null
      tip.remove()
    })
    map.on("mouseleave", "om-sites", () => {
      map.getCanvas().style.cursor = ""
      if (hoverId != null) map.setFeatureState({ source: "om-sites", id: hoverId }, { hover: false })
      hoverId = null
      tip.remove()
    })
    map.on("click", (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ["om-sites"] })[0]
      onSelectRef.current(f ? (f.properties.id as number) : null)
    })

    return () => {
      window.clearTimeout(giveUp)
      cancelAnimationFrame(raf)
      tip.remove()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onMapRef = React.useRef(onMap)
  onMapRef.current = onMap
  React.useEffect(() => {
    if (ready && mapRef.current) onMapRef.current?.(mapRef.current)
  }, [ready])

  const stylePending = React.useRef(true)
  const usingFallback = React.useRef(false)
  const byIdRef = React.useRef(byId)
  const destFilter = (k: ReadonlySet<string>) => ["in", ["get", "kind"], ["literal", [...k]]] as maplibregl.FilterSpecification
  const destRef = React.useRef(destKinds)
  destRef.current = destKinds
  React.useEffect(() => {
    const map = mapRef.current
    if (map && ready && map.getLayer("om-dest")) map.setFilter("om-dest", destFilter(destKinds))
    if (map && ready && map.getLayer("om-dest-shadow")) map.setFilter("om-dest-shadow", destFilter(destKinds))
  }, [destKinds, ready])
  const hlRef = React.useRef(highlight)
  hlRef.current = highlight
  React.useEffect(() => {
    const map = mapRef.current
    if (map && ready) setCorridorHighlight(map, highlight)
  }, [highlight.rivers, highlight.rail, ready])
  byIdRef.current = byId

  function install(map: MLMap) {
    const r = markRoles()
    const byCo = companyColor()

    installGlyphs(map, r.shade)

    // Draw areas go under the basemap's labels so place names stay legible.
    const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol")?.id
    const { siteData, drawData, pairData } = latest.current
    map.addSource("om-draw", { type: "geojson", data: drawData })
    map.addSource("om-sites", { type: "geojson", data: siteData })
    map.addSource("om-pair", { type: "geojson", data: pairData })
    map.addSource("om-dest", { type: "geojson", data: destData(dataRef.current.destinations) })

    addCorridors(map, dataRef.current.corridors, firstLabel)
    setCorridorHighlight(map, hlRef.current)

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
      paint: { "line-color": r.ink, "line-width": 2, "line-dasharray": [2, 1.5] },
    })
    const hover = hoverState
    const lit = litState
    map.addLayer({
      id: "om-glow",
      type: "circle",
      source: "om-sites",
      paint: {
        "circle-color": byCo,
        "circle-blur": 1,
        "circle-radius": ["case", hover, 18, lit, 16, 6],
        "circle-opacity": ["case", hover, 0.55, lit, 0.4, 0],
        "circle-radius-transition": { duration: 200 },
        "circle-opacity-transition": { duration: 200 },
      },
    })
    // Destinations: hollow (page-color fill, ink ring), sized by capacity, drawn under buying points.
    addMarker(map, {
      id: "om-dest",
      source: "om-dest",
      ...destinationMarker(r),
      filter: destFilter(destRef.current),
    })
    // Buying points: filled in company color with a page-color ring.
    addMarker(map, {
      id: "om-sites",
      source: "om-sites",
      ...buyingPointMarker(r),
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

  // ---- selected marker: a short light streak travels around its outline -------
  React.useEffect(() => {
    const map = mapRef.current
    const s = selectedId != null ? byIdRef.current.get(selectedId) : undefined
    if (!map || !ready || !s) return
    const el = document.createElement("div")
    el.className = "om-beam"
    el.innerHTML = "<span></span>"
    const marker = new maplibregl.Marker({ element: el }).setLngLat([s.lon, s.lat]).addTo(map)
    // Same zoom curve as the marker's icon-size, so the beam hugs the outline.
    const size = () => {
      const stops: [number, number][] = [[3, 0.3], [5, 0.45], [7, 0.75], [9, 1.1]]
      const z = map.getZoom()
      let k = z <= 3 ? 0.3 : 1.1
      for (let i = 1; i < stops.length; i++) {
        const [z0, s0] = stops[i - 1]
        const [z1, s1] = stops[i]
        if (z > z0 && z <= z1) k = s0 + ((s1 - s0) * (z - z0)) / (z1 - z0)
      }
      el.style.setProperty("--om-beam-d", `${Math.round(17.3 * k + 10)}px`)
    }
    size()
    map.on("zoom", size)
    return () => {
      map.off("zoom", size)
      marker.remove()
    }
  }, [selectedId, ready, siteData])

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

  React.useEffect(() => {
    const map = mapRef.current
    const tip = listTip.current
    if (!map || !tip || hoverSite == null || !map.getSource("om-sites")) return
    const s = byIdRef.current.get(hoverSite)
    if (!s) return
    map.setFeatureState({ source: "om-sites", id: hoverSite }, { hover: true })
    tip
      .setLngLat([s.lon, s.lat])
      .setHTML(`<strong>${COMPANY[s.co].label} ${s.name}, ${s.state}</strong><span>${FACILITY[s.type].label} · bids ${cropList(s.crops)}</span>`)
      .addTo(map)
    return () => {
      if (map.getSource("om-sites")) map.setFeatureState({ source: "om-sites", id: hoverSite }, { hover: false })
      tip.remove()
    }
  }, [hoverSite, ready])

  return (
    <div className="relative size-full">
      {!painted && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <ThinkingOrb state="solving" size={64} theme={theme} aria-label="Loading map" />
        </div>
      )}
    <div
      ref={container}
      className={cn("size-full transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out)] motion-reduce:transition-none", painted ? "opacity-100" : "opacity-0")}
      role="region"
      aria-label="Map of Cargill and ADM grain buying points with draw-area circles. Use the Pairs and Regions lists for keyboard access."
    />
    </div>
  )
}
