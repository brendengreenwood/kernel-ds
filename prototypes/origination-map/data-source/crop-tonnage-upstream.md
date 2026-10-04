# US crop tonnage and what the ABCDs buy

Single-page chart: 16 US crops ranked by annual production in million metric tons, with estimates of Cargill, ADM, Bunge and Louis Dreyfus purchases of each overlaid. Linear/log toggle. Below the chart, a table of how each estimate was built and a caveats section.

Published copy: https://claude.ai/artifact/A1oYtGoaE8Q6ihWXXP9J4x

## Files

| File | What it is |
|---|---|
| `crop-tonnage.html` | The whole page. Data is inline in the `d` array near the bottom: `[crop, US production, Cargill, ADM, Bunge, LDC]` in million metric tons. No external libraries. |

The page is a fragment (no doctype/html/head/body); wrap it in a skeleton to open locally. Fonts come from Google Fonts with system fallbacks.

## Provenance, in plain terms

- **US production figures** were supplied by the user, citing USDA NASS crop production reports and FAS production data. They were not re-checked against those reports. The supplied corn bushel range (15.8 to 17.0 billion) does not match the tonnage at the low end; 432.3M t is about 17.0B bu.
- **Company figures are estimates, not sourced numbers.** They were built from rough market-share reasoning (crush share, grind capacity, export share) and could be off by 30% or more on corn and soybeans. Cargill and LDC are private; ADM and Bunge report global volumes, not US purchases by crop.
- **LDC's footprint was checked** against ldc.com (eight US facilities), Feed and Grain (Upper Sandusky 1.5M t crush, still under construction as of April 2026), the Port of Seattle (Terminal 86 operator), and NCTO (Allenberg Cotton). Its volumes are still estimates.
- Tonnage is not like-for-like across crops: sugar crops, potatoes and apples are wet weight, hay is air-dry, grains are at standard moisture.

## If you extend it

- Replace the estimate columns with real numbers if any become available; the page text in "How each estimate was built" and "Reading this carefully" should change with them.
- The chart layout is a CSS grid per row with four thin bars inside the production bar; adding a fifth company means another column, another bar class, and another `--color` token in `:root` and both dark-mode blocks.
