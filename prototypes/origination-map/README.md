# Origination map

A Kernel prototype built from two research uploads (2026-10-04):

- **Draw areas** (`/`) — every public US grain buying point for Cargill and ADM
  on a real, pannable/zoomable **MapLibre GL** map, each with a geodesic
  draw-area circle. Filter by company, facility type and crop; change the draw
  radius; click a site for its nearest rivals; Regions and Pairs tabs fly the
  map to the closest Cargill–ADM pairs.
- **Crop tonnage** (`/tonnage`) — 16 US crops ranked by production with
  estimated Cargill / ADM / Bunge / LDC purchases overlaid, linear/log toggle,
  and the reasoning behind each estimate.

## Run

```sh
npm ci                                   # repo root first (DS deps)
cd prototypes/origination-map
npm install
npm run dev                              # http://localhost:5173
npm run build                            # tsc + vite build → dist/
```

## Map

- **Engine:** [MapLibre GL JS](https://maplibre.org/) (open-source fork of
  Mapbox GL v1 — same API shape, no token).
- **Basemap:** [OpenFreeMap](https://openfreemap.org/) vector styles
  (`positron` light / `dark` dark), free with no API key, OSM data. Override
  with any MapLibre style URL:

  ```sh
  VITE_MAP_STYLE_LIGHT=https://api.maptiler.com/maps/dataviz/style.json?key=… \
  VITE_MAP_STYLE_DARK=https://api.maptiler.com/maps/dataviz-dark/style.json?key=… \
  npm run dev
  ```

  A Mapbox-hosted style needs `mapbox-gl` instead (its `mapbox://` URLs and
  token auth aren't MapLibre-compatible) — `draw-area-map.tsx` is the only file
  that would change.
- **Offline fallback:** if the tile host is unreachable the map swaps to a
  bundled lower-48 state outline (`public/us-states.geojson`, from `us-atlas`)
  in DS surface colours and says so; sites, circles and tables keep working.
- **Theming:** layers are painted from Kernel tokens. MapLibre can't parse
  `oklch()`, so `src/lib/color.ts` resolves each custom property to `rgba()`
  through a canvas. Theme toggle swaps the basemap and re-installs the layers.
- **Encoding:** colour = company (`--om-cargill` / `--om-adm`, mapped onto the
  abstract `--viz-crop` / `--viz-sky` series — competitors are not a status,
  notification, or commodity); shape = facility type (SDF icons: ▲ river,
  ● interior, ■ plant, ◆ export). Crop tags use `<CommodityBadge>` where a
  Kernel commodity exists (corn, soybeans, wheat, canola).

## Files

| Path | What |
|---|---|
| `src/components/draw-area-map.tsx` | MapLibre map: sources, layers, hover tooltip, selection feature-state, camera, fallback |
| `src/pages/draw-areas.tsx` | Side panel (summary, selected site, Layers/Regions/Pairs tabs) + map |
| `src/pages/crop-tonnage.tsx` | Tonnage ledger + estimate reasoning |
| `src/lib/analysis.ts` | Pairs, contested counts, region roll-up (2R overlap rule) |
| `src/lib/geo.ts` | Haversine miles + geodesic circle ring |
| `src/data/sites.json` | Generated site list — rebuild with `data-source/build.js` |
| `src/data/tonnage.ts` | Production + estimate table |
| `data-source/` | Upstream build script and the two original READMEs (provenance, caveats, sources) |

## Data caveats

Read `data-source/draw-areas-upstream.md` and
`data-source/crop-tonnage-upstream.md` before citing anything. In short: sites
are placed at town ZIP centroids; ADM's list is only sites that post public
bids; facility type was inferred from river location; draw areas are circles;
company tonnage figures are market-share estimates that could be off by 30%+.
