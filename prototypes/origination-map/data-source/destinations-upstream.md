# Grain destinations

Where grain ends up, whoever owns it: export ports, large feedyards, and ethanol plants. These are demand points, not buying points, so they are drawn as hollow markers in one ink color and never in a company color.

Built by `destinations.cjs` → `src/data/destinations.json`. Public sources only.

## Data model

Row: `[kind, name, operator, state, lat, lon, size, src]`

- `kind`: `x` export port, `f` feedyard, `e` ethanol plant
- `size`: ethanol = million gallons per year nameplate; feedyard = one-time head capacity; ports = null
- `src`: source keys below (comma-separated)

Counts at last build: 243 destinations — 24 ports, 22 feedyards, 197 ethanol plants (72 at 100M gal/yr or more).

## Sources

| Key | Source |
|---|---|
| `eia` | EIA ethanol plant list (Form EIA-819, as of January 1, 2021), via the public `Ethanol_Plants_US_EIA` ArcGIS layer: `gispublic.waterboards.ca.gov/portalserver/rest/services/Hosted/Ethanol_Plants_US_EIA/FeatureServer/0`. Download: `query?where=1%3D1&outFields=*&outSR=4326&f=geojson` → `C:/tmp/ethanol.json`. Plant coordinates come from EIA. |
| `ports` | Grain export elevator ports named in USDA AMS Grain Transportation Report / FGIS export inspection regions (PNW, Texas Gulf, Mississippi Gulf, Atlantic, Great Lakes); operators from terminal operators' public sites. Town-level placement. |
| `fiveRivers` | fiveriverscattle.com — 13 named feedyards in CO, KS, OK, TX, AZ, ID; company one-time capacity ~865,000 head. |
| `friona` | frionaindustries.com location pages (Dalhart 105,000 head, Friona 76,000 head). |
| `kla` | Kansas Livestock Association feedyard directory, Region C (kla.org/cattle-feeding/region-c), with stated capacities. |
| `drovers` | Drovers: Friona buys two Cattle Empire yards (139,000 head combined, Haskell County KS). |
| `ceva` | Ceva largest beef operations article (Colorado Beef, 56,000 head, near Lamar CO). |
| `agproud` Also Southwest Feedyard, Hereford TX, 40,000 head (Cactus Feeders). | Ag Proud: Interstate Feedlot, Malta ID, 52,000 head. |
| `agriland` | Agriland: Wrangler Feedyard near Tulia TX, 50,000 head (Cactus Feeders). |
| `cattleTown` | cattletownfeeders.com: Cattle Town Feeders (Hereford–Friona TX) 48,000 head; Spearman Cattle Feeders 54,000 head. |
| `champion` | championfeeders.com: Champion (Hereford TX) 42,000; Tascosa (Bushland TX) 25,000; Mead Cattle Co. (Mead NE) 30,000. |
| `blackshirt` | KRVN / Nebraska Examiner: Blackshirt Feeders near Haigler NE, permitted to 200,000 head (still building out). |

## Known gaps and judgment calls

- Ethanol list is EIA's January 2021 snapshot; a few plants have since closed, restarted, or expanded.
- Feedyards are only the largest operators with public pages plus the Kansas association's Region C list. Texas Panhandle is better covered (Cactus, Friona, Five Rivers, Champion, Cattle Town) but still partial (Hereford alone has 35+ yards); Nebraska has only two yards. Friona Randall County, Littlefield and Swisher County have no published capacity. XIT capacity is 75,000 head (fiveRivers); no hog, poultry, or dairy feed mills yet. Next sources: Texas Cattle Feeders Association, Nebraska Cattlemen, the remaining KLA regions.
- Feedyard and port coordinates are town-level, placed by hand. Feedyards without a published capacity have `size` null and draw at the base size.
- Port operators are the main elevators at that port, not a full list. Two Five Rivers yards (Horton, Montera) are not placed: their towns are not published.
- Not yet included: Mexico rail border crossings (Laredo, Eagle Pass, El Paso), flour mills, oilseed crush plants owned by others, Canada.
