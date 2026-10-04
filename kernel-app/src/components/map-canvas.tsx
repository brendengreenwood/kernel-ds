import * as React from "react"
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl"
import { useTheme } from "next-themes"
import "maplibre-gl/dist/maplibre-gl.css"
// MapLibre 6 parses tiles in a worker it can no longer locate on its own: inside
// a bundler `import.meta.url` does not resolve to the worker file, so every
// consumer wires it once. Without this the style loads, the canvas paints, and
// not a single tile ever arrives — a blank plate with no error.
// `?worker&url` rather than `?url`: the dist worker imports a sibling shared
// chunk, and the plain form ships the file without it.
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"
import { applyMapTheme, CARTO_URLS } from "@app/lib/map-styles"
import { locationSites } from "@app/data/scenarios"
import { cn } from "@/lib/utils"

export type MapSite = {
  name: string
  /** How many scenarios this house is running — the marker's weight. */
  count: number
}

type Props = {
  sites: MapSite[]
  /** The house currently being worked. Gets the accent marker and the camera. */
  selected: string
  onSelect: (name: string) => void
  /** Pixels of plate hidden by something floating on it — the dock. The camera
      centres on what is visible rather than on the element it fills. */
  occludedLeft?: number
  className?: string
}

/** The one raised surface in the workspace is the plate, and the map fills it
 *  edge to edge — so the map has no chrome of its own. No border, no radius,
 *  no card: it inherits the plate's. MapLibre's own attribution stays (it is
 *  a licence term, not decoration) but is restyled to the DS's muted type.
 *
 *  Markers are DOM, not a symbol layer. A symbol layer would be the right call
 *  for hundreds of points, but there are four houses here and the markers have
 *  to be focusable, hoverable and keyboard-reachable — all of which the DOM
 *  gives for free and a canvas layer would have to reimplement. */
export function MapCanvas({ sites, selected, onSelect, occludedLeft = 0, className }: Props) {
  const holder = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<MapLibreMap | null>(null)
  const markers = React.useRef<Marker[]>([])
  const [ready, setReady] = React.useState(false)
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === "light" ? "light" : "dark"

  // Latest handler without re-running the map's lifecycle: markers are built in
  // an effect that must not tear the map down when the parent re-renders.
  const onSelectRef = React.useRef(onSelect)
  onSelectRef.current = onSelect

  /* Build once. The style swap on theme change is handled separately — tearing
     the map down and rebuilding it would lose the camera, which is the one
     piece of state the user set themselves. */
  React.useEffect(() => {
    if (!holder.current || map.current) return
    setWorkerUrl(workerUrl)
    const m = new MapLibreMap({
      container: holder.current,
      style: CARTO_URLS.dark,
      center: [-89.92, 41.63],
      zoom: 6.7,
      attributionControl: { compact: true },
      // The workspace's canvas is a working surface, not a globe demo.
      pitchWithRotate: false,
      dragRotate: false,
      touchZoomRotate: true,
    })
    m.addControl(new NavigationControl({ showCompass: false }), "bottom-right")
    m.on("error", (e) => console.error("[map]", e.error ?? e))
    m.on("load", () => setReady(true))
    map.current = m
    return () => {
      markers.current.forEach((mk) => mk.remove())
      markers.current = []
      m.remove()
      map.current = null
      setReady(false)
    }
  }, [])

  /* Theme. `setStyle` replaces every layer, so the recolour has to run again on
     the far side of the swap — `styledata` fires once the new style is in. */
  React.useEffect(() => {
    const m = map.current
    if (!m || !ready) return
    const url = CARTO_URLS[theme]
    const paint = () => applyMapTheme(m, theme)
    if (m.getStyle()?.name?.toLowerCase().includes(theme === "dark" ? "dark" : "positron")) {
      paint()
      return
    }
    m.setStyle(url)
    m.once("styledata", paint)
  }, [theme, ready])

  /* Markers follow the data. Rebuilt wholesale on change: four elements is far
     below the cost where diffing earns its complexity. */
  React.useEffect(() => {
    const m = map.current
    if (!m || !ready) return
    markers.current.forEach((mk) => mk.remove())
    markers.current = sites.flatMap((site) => {
      const at = locationSites[site.name]
      if (!at) return []
      const el = document.createElement("button")
      el.type = "button"
      el.dataset.site = site.name
      el.setAttribute("aria-label", `${site.name}, ${site.count} scenarios`)
      el.className = "v2-map-pin"
      if (site.name === selected) el.dataset.selected = "true"
      el.innerHTML =
        `<span class="v2-map-pin-dot"><span class="v2-map-pin-count">${site.count}</span></span>` +
        `<span class="v2-map-pin-label">${site.name}</span>`
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        onSelectRef.current(site.name)
      })
      return [new Marker({ element: el }).setLngLat([at.lng, at.lat]).addTo(m)]
    })
  }, [sites, selected, ready])

  /* The camera follows the selection, but eases rather than jumps: the pins are
     the same four every time, so a cut would leave you re-finding which one you
     just picked.

     It also centres on the part of the plate you can SEE. The dock covers the
     right third, so a camera centred on the element puts the site you just
     picked underneath the panel describing it. `padding` is the map's own
     answer to occlusion — the visible centre shifts left by the dock and its
     gutter, and the pin lands where the eye is.

     Zoom is chosen to keep the neighbours in frame. These four houses sit
     inside about 130 miles of each other, and a basis you are about to post is
     read against what the houses around it are doing — a camera tight enough
     to show one elevator and its parking lot answers a question nobody asked. */
  React.useEffect(() => {
    const m = map.current
    const at = locationSites[selected]
    if (!m || !ready || !at) return
    m.easeTo({
      center: [at.lng, at.lat],
      zoom: 7.6,
      duration: 900,
      padding: { top: 0, bottom: 0, left: occludedLeft, right: 0 },
    })
  }, [selected, ready, occludedLeft])

  return <div ref={holder} className={cn("v2-map size-full", className)} aria-label="Draw area map" />
}
