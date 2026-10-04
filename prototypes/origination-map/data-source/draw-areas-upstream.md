# Cargill vs ADM draw-area map

A single-page map of every public US grain buying point for Cargill and ADM, with draw-area circles, layer toggles (company, facility type, crop), a head-to-head table by region, and the tightest site pairs. Built from public sources only.

Published copy: https://claude.ai/artifact/NGb2yjjVajvccw5khDgnA7

## Files

| File | What it is |
|---|---|
| `build.js` | Source of truth. Holds the site list (company, name, town, state, type, region), the per-crop bid lists, and hand-placed coordinates for towns the ZIP lookup misses. Run with `node build.js` to regenerate `sites.json`. Needs the `zipcodes` npm package. |
| `sites.json` | Generated. One row per site: `[co, name, state, lat, lon, type, region, crops]`. |
| `template.html` | The page, with `__SITES__` where the data goes. Loads d3 7.9.0 and topojson-client 3.0.2 from cdnjs, fetches `states-10m.json` relative to itself. |
| `draw-areas.html` | Generated. `template.html` with `sites.json` inlined. This is what gets published. |
| `states-10m.json` | US state outlines from the `us-atlas@3` npm package. Must be served next to the page. |

Rebuild: `node build.js && node -e "require('fs').writeFileSync('draw-areas.html', require('fs').readFileSync('template.html','utf8').replace('__SITES__', require('fs').readFileSync('sites.json','utf8')))"`

The page is a fragment (no doctype/html/head/body). To open it locally, wrap it in a skeleton and serve the folder over HTTP so the `fetch` for the state outlines works.

## Data model

- `co`: `C` Cargill, `A` ADM
- `type`: `r` river terminal, `i` interior rail/truck elevator, `p` processing plant, `x` export terminal
- `region`: river system or interior belt, assigned by hand (Illinois River, Upper Mississippi, Mid-Mississippi, Ohio River, Minnesota River, Plains, Eastern Corn Belt, Illinois interior, Iowa interior, West, Southeast, Michigan, Gulf, Great Lakes)
- `crops`: letters, `c` corn, `s` soybeans, `w` wheat (HRW or SRW), `m` sorghum, `o` canola or sunflower

Counts at last build: 183 sites, 80 Cargill, 103 ADM.

## Sources

- Cargill sites: cargillag.com/locations (78 sites with street addresses), cross-checked with farmbucks.com/grain-prices/cargill and its per-state pages
- ADM sites: farmbucks.com/grain-prices/adm and its per-state pages (every location posting a bid), plus plants from NOPA member locations and Corn Refiners Association member locations
- Louisiana export terminals: farmdoc (Illinois) post-Ida export coverage; TEMCO terminals from CHS
- Coordinates: ZIP centroid for the town via the `zipcodes` npm package; a dozen facility names that are not post-office towns are hand-placed in `build.js`

## Known gaps and judgment calls

- ADM's list is only sites that post public bids. ADM runs more US locations than that.
- Facility type (`r` vs `i`) was assigned by whether the town sits on a navigable river. A few will be wrong.
- Crop tags come from posted bids. ADM's Illinois wheat bids were not broken out by site, so Illinois River terminals are not tagged for wheat. Plants with no posted bid are tagged for the crop they process.
- Four delivered bids at third-party plants were dropped: Cargill Dana IN (AC Grain), Gibson City IL (Bunge), Davenport IA (Nestlé Purina), and ADM Country Store KS. ADM's Fremont NE Lincoln Premium Poultry bid and Northern Crossing Rail (location unknown) were also dropped.
- Cargill's Kalama, Portland and Tacoma TEMCO terminals are not shown; Houston is.
- Draw areas are circles. Real draws follow highways and rail and shrink toward a nearer competitor.
- Distances are great-circle between town centroids.

## Ideas not built

- Add Bunge and LDC sites (LDC's eight US facilities are listed on ldc.com; Bunge's would need the same bid-scrape approach).
- Replace circles with river corridors for `r` sites.
- Pull daily basis per site from the same bid pages and color sites by who is bidding stronger.
