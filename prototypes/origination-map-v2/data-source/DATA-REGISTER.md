# Data register — provenance, vintage, confidence

One row per dataset the map renders. The map is the primary surface and this
data is its weakest layer: before trusting any number on screen, check its row
here. Per-dataset detail lives in the `*-upstream.md` files; this register is
the roll-up and the ranked gap list.

## Datasets

| File | Rows | Built by | Upstream | Vintage | Confidence |
|---|---|---|---|---|---|
| `src/data/sites.json` | 183 buying points (80 Cargill, 103 ADM) | `data-source/build.js` | cargillag.com/locations, farmbucks.com bid pages, NOPA + Corn Refiners member lists | scraped 2026-10 | Medium — real public listings, but coordinates are town ZIP centroids and ADM is undercounted (see gaps) |
| `src/data/destinations.json` | 360 (24 ports, 145 feedyards, 191 ethanol) | `data-source/destinations.cjs` | EIA ethanol capacity (Jan 2025), NE Cattlemen 2024, TCFA, KLA Region C, USDA AMS/FGIS port regions, operator sites | 2024–2025 | Medium — authoritative capacity sources, town-level placement |
| `src/data/barge-rivers.json` | 12 river polylines (name, trunk) | none in repo | **not recorded** | unknown | Low — provenance gap; treat as illustrative geometry |
| `src/data/rail.json` | 752 background segments (rank) | none in repo | **not recorded** (shape suggests an FRA/NARN-derived subset) | unknown | Low — provenance gap; background texture only |
| `src/data/rail-flow.json` | 4,718 segments (routes, owner) | `scripts/build-rail-flow.mjs` | FRA North American Rail Network (NARN), NET='M', US, from the NTAD FeatureServer | fetched 2026-10 | Medium — real track geometry; route counts are shortest-path guesses |
| `src/data/sell-routes.json` | 175 sites · 426 rail + 49 barge + 552 truck routes | `scripts/build-sell-routes.mjs` | NARN (same input) + `barge-rivers.json` + `destinations.json` | built 2026-11 | Medium rail / Low barge — shortest track, not contracts; barge legs inherit the barge-rivers provenance gap |
| `src/data/tonnage.ts` | 16 crops | hand-built | USDA production + market-share reasoning | 2026-10 | Low for company splits — estimates may be off 30%+ |
| `public/us-states.geojson` | lower-48 outlines | copied | `us-atlas@3` npm package | stable | High |

The NARN input (`narn-main.geojson`, ~17 MB) is **not in the repo** — the two
rail scripts take it as a CLI argument. A cached copy currently sits at
`C:\tmp\narn-main.json` on the build machine.

## Ranked gaps

1. **ADM is undercounted.** `sites.json` lists only ADM sites posting public
   bids; ADM runs more US locations. Every competition read (pairs, rivals,
   head-to-head) is biased toward Cargill coverage.
2. **The rail input is not versioned.** No fetch script or NARN snapshot is
   committed; a rebuild on another machine starts with a download hunt. Fix:
   commit a fetch script with the exact FeatureServer query and record the
   fetch date here.
3. **`barge-rivers.json` and `rail.json` have no recorded upstream.** The
   barge graph now feeds sell-route mileage, so this gap propagates into
   numbers on screen. Fix: re-derive both from a named source (NARN for rail,
   USACE National Waterway Network for rivers) with a build script.
4. **Coordinates are town-level.** ZIP/Nominatim centroids, not facility
   sites. Fine at state zoom; wrong at town zoom. Co-located points are fanned
   out artificially.
5. **Missing categories.** Inland grain terminals, Bunge + LDC buying points,
   third-party crush and flour mills, Mexico rail border crossings, Canada;
   feedyard coverage is thin outside TX/NE/southwest KS.
6. **Company tonnage splits are estimates** (±30%+). Never cite them as
   sourced numbers.
7. **Draw areas are circles and routes are shortest-path.** Both are explicit
   model guesses (see `object.draw-area`, `object.route` in the catalog);
   labels must keep saying so.
8. **No refresh discipline.** Nothing records when a dataset should be
   re-pulled. Bid-derived fields (crops, ADM list) drift fastest.
