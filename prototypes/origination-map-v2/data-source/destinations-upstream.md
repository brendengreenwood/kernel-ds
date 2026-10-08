# Grain destinations

Where grain ends up, whoever owns it: export ports, large feedyards, and ethanol plants. These are demand points, not buying points, so they are drawn as hollow markers colored by category (feed slate, refinery wheat, ports teal) and never in a company color.

Built by `destinations.cjs` → `src/data/destinations.json`. Public sources only. Source files in this folder: `eia-ethanol-2025.json`, `ne-feedlots-2024.json`, `tcfa-feedyards.json`.

## Data model

Row: `[kind, name, operator, state, lat, lon, size, src]`

- `kind`: `x` export port, `f` feedyard, `e` ethanol plant
- `size`: ethanol = million gallons per year nameplate; feedyard = one-time head capacity; ports = null
- `src`: source keys below (comma-separated)

Counts at last build: 360 destinations — 24 ports, 145 feedyards, 191 ethanol plants (79 at 100M gal/yr or more).

## Sources

| Key | Source |
|---|---|
| `eia` | EIA U.S. Fuel Ethanol Plant Production Capacity, as of January 1, 2025: `eia.gov/petroleum/ethanolcapacity/ethanolcapacity.xlsx` (state, company, city, MMgy). The sheet has no coordinates: 159 plants take coordinates from the 2021 EIA ArcGIS layer (`Ethanol_Plants_US_EIA`), matched by city within state; 32 were geocoded to their town with Nominatim (OpenStreetMap). EIA typos fixed: Fairibault → Faribault MN, Bringham Lake → Bingham Lake MN. |
| `nebraska` | Nebraska Cattlemen Feedlot Council Directory 2024 (`nebraskacattleman.org/NCFCD2024/`, PDF download). Only yards of 10,000+ head (37). Champion Feeders, Mead is skipped: already mapped as Mead Cattle Co. Towns geocoded with Nominatim. |
| `tcfa` | Texas Cattle Feeders Association member feedyards (`web.tcfa.org/Feedyard`): 75 yards in TX, OK, NM after removing yards already mapped and rows that only listed a PO box. Name and town only; no capacities. Towns geocoded with Nominatim. |
| `ports` | Grain export elevator ports named in USDA AMS Grain Transportation Report / FGIS export inspection regions (PNW, Texas Gulf, Mississippi Gulf, Atlantic, Great Lakes); operators from terminal operators' public sites. Town-level placement. |
| `fiveRivers` | fiveriverscattle.com — 13 named feedyards in CO, KS, OK, TX, AZ, ID; company one-time capacity ~865,000 head. XIT 75,000 head. |
| `friona` | frionaindustries.com location pages (Dalhart 105,000 head, Friona 76,000 head). |
| `kla` | Kansas Livestock Association feedyard directory, Region C (kla.org/cattle-feeding/region-c), with stated capacities. |
| `drovers` | Drovers: Friona buys two Cattle Empire yards (139,000 head combined, Haskell County KS). |
| `ceva` | Ceva largest beef operations article (Colorado Beef, 56,000 head, near Lamar CO). |
| `agproud` | Ag Proud: Interstate Feedlot, Malta ID, 52,000 head; Southwest Feedyard, Hereford TX, 40,000 head (Cactus Feeders). |
| `agriland` | Agriland: Wrangler Feedyard near Tulia TX, 50,000 head (Cactus Feeders). |
| `cattleTown` | cattletownfeeders.com: Cattle Town Feeders (Hereford–Friona TX) 48,000 head; Spearman Cattle Feeders 54,000 head. |
| `champion` | championfeeders.com: Champion (Hereford TX) 42,000; Tascosa (Bushland TX) 25,000; Mead Cattle Co. (Mead NE) 30,000. |
| `blackshirt` | KRVN / Nebraska Examiner: Blackshirt Feeders near Haigler NE, permitted to 200,000 head (still building out). |

## Known gaps and judgment calls

- Feedyard, port, and geocoded ethanol coordinates are town-level, not the exact site. Points sharing a town are fanned out on a small ring (within ~2 miles) so each can be hovered.
- TCFA yards and Friona Randall County, Littlefield, Swisher County have no published capacity: `size` null, drawn at base size.
- Nebraska yards under 10,000 head are left out on purpose. Kansas covers only KLA Region C (southwest); Iowa, Colorado, Oklahoma beyond TCFA, and South Dakota are thin. No hog, poultry, or dairy feed mills yet.
- Port operators are the main elevators at that port, not a full list. Two Five Rivers yards (Horton, Montera) are not placed: their towns are not published.
- Inland grain terminals are a planned category with no data yet.
- Not yet included: Mexico rail border crossings (Laredo, Eagle Pass, El Paso), flour mills, oilseed crush plants owned by others, Canada.
