// Grain destinations: where grain ends up, whoever owns it. Public sources only.
// Run: node data-source/destinations.js  (needs C:/tmp/ethanol.json, see destinations-upstream.md)
// Row: [kind, name, operator, state, lat, lon, size, src]
//   kind: e ethanol plant (size = million gallons/yr), f feedyard (size = head, one-time), x export port (size = null)
//   src: key into SOURCES in destinations-upstream.md
const fs = require("fs")
const path = require("path")

// Export ports. Town-level placement; operators are the grain elevators at that port.
const ports = `
Seattle|Louis Dreyfus (Terminal 86)|WA|47.62|-122.37|pnw
Tacoma|TEMCO (Cargill/CHS)|WA|47.27|-122.41|pnw
Kalama|TEMCO, Kalama Export|WA|46.01|-122.85|pnw
Longview|EGT|WA|46.13|-122.98|pnw
Vancouver|United Grain|WA|45.63|-122.70|pnw
Portland|Columbia Grain, Louis Dreyfus|OR|45.56|-122.73|pnw
Duluth-Superior|CHS, Riverland, Gavilon|MN|46.75|-92.11|lakes
Chicago|Port of Chicago elevators|IL|41.70|-87.55|lakes
Toledo|ADM, Andersons|OH|41.67|-83.52|lakes
Houston|TEMCO, Louis Dreyfus|TX|29.73|-95.20|gulf
Galveston|Galveston elevator|TX|29.31|-94.81|gulf
Corpus Christi|Port of Corpus Christi elevator|TX|27.81|-97.42|gulf
Beaumont|Louis Dreyfus|TX|30.08|-94.09|gulf
Baton Rouge|Louis Dreyfus|LA|30.43|-91.19|gulf
Convent|Zen-Noh / Bunge area elevators|LA|30.02|-90.83|gulf
Reserve|Cargill|LA|30.05|-90.55|gulf
Destrehan|ADM, Bunge|LA|29.94|-90.36|gulf
Ama|ADM|LA|29.94|-90.30|gulf
Westwego|Cargill|LA|29.90|-90.14|gulf
Myrtle Grove|ADM|LA|29.63|-89.96|gulf
Wilmington|Wilmington grain terminal|NC|34.20|-77.95|east
Morehead City|Port of Morehead City|NC|34.72|-76.71|east
Norfolk|Norfolk / Chesapeake elevator|VA|36.80|-76.29|east
Philadelphia|Tioga elevator|PA|39.99|-75.08|east
`

// Large feedyards (one-time capacity). Operator and capacity from the operator's or state association's public pages.
const feedyards = `
Grant County Feeders|Five Rivers|KS|37.58|-101.36|120000|fiveRivers,kla
XIT Feeders|Five Rivers|TX|36.03|-102.55|75000|fiveRivers
Coronado Feeders|Five Rivers|TX|36.03|-102.47||fiveRivers
Hartley Feeders|Five Rivers|TX|35.88|-102.40||fiveRivers
Cimarron Feeders|Five Rivers|OK|36.50|-101.78||fiveRivers
Colorado Beef|Five Rivers|CO|38.09|-102.62|56000|fiveRivers,ceva
Kuner Feedlot|Five Rivers|CO|40.39|-104.56||fiveRivers
Gilcrest Feedlot|Five Rivers|CO|40.28|-104.78||fiveRivers
Yuma Feedlot|Five Rivers|CO|40.12|-102.72||fiveRivers
Interstate Feedlot|Five Rivers|ID|42.31|-113.37|52000|fiveRivers,agproud
McElhaney Feedyard|Five Rivers|AZ|32.67|-114.13||fiveRivers
Dalhart Cattle Feeders|Friona Industries|TX|36.08|-102.55|105000|friona
Friona Feedyard|Friona Industries|TX|34.64|-102.72|76000|friona
Friona Cattle Feeders North|Friona Industries|KS|37.44|-100.99|139000|kla,drovers
Centerfire Feedyard|Cactus Feeders|KS|37.60|-101.32|65000|kla
Ulysses Feedyard|Cactus Feeders|KS|37.56|-101.40|75000|kla
Cattle Empire|Cattle Empire|KS|37.43|-100.97|53000|kla
Cobalt Cattle Satanta|Cobalt Cattle|KS|37.45|-101.01|50000|kla
Cobalt Cattle Sublette|Cobalt Cattle|KS|37.48|-100.84|50000|kla
Trinity Feedyard|Trinity|KS|37.97|-100.87|90000|kla
Brookover Feed Yard|Brookover|KS|37.99|-100.82|45000|kla
Brookover Ranch Feed Yard|Brookover|KS|37.93|-100.93|35000|kla
Southwest Feedyard|Cactus Feeders|TX|34.82|-102.40|40000|agproud
Wrangler Feedyard|Cactus Feeders|TX|34.54|-101.77|50000|agriland
Randall County Feedyard|Friona Industries|TX|34.98|-101.92||friona
Littlefield Feedyard|Friona Industries|TX|33.99|-102.43||friona
Swisher County Feedyard|Friona Industries|TX|34.70|-101.80||friona
Cattle Town Feeders|Cattle Town Feeders|TX|34.72|-102.55|48000|cattleTown
Spearman Cattle Feeders|Cattle Town Feeders|TX|36.20|-101.19|54000|cattleTown
Champion Feed Yard|Champion Feeders|TX|34.82|-102.35|42000|champion
Tascosa Feed Yard|Champion Feeders|TX|35.19|-102.07|25000|champion
Mead Cattle Co.|Champion Feeders|NE|41.20|-96.49|30000|champion
Blackshirt Feeders|Blackshirt Feeders|NE|40.05|-101.94|200000|blackshirt
`

const out = []
for (const l of ports.trim().split("\n")) {
  const [name, op, st, lat, lon] = l.split("|")
  out.push(["x", name, op, st, +lat, +lon, null, "ports"])
}
for (const l of feedyards.trim().split("\n")) {
  const [name, op, st, lat, lon, head, src] = l.split("|")
  out.push(["f", name, op, st, +lat, +lon, head ? +head : null, src])
}
const ST = { Alabama:"AL",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",Georgia:"GA",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",Louisiana:"LA",Michigan:"MI",Minnesota:"MN",Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA","South Dakota":"SD",Tennessee:"TN",Texas:"TX",Virginia:"VA",Wisconsin:"WI",Wyoming:"WY",Idaho:"ID",Washington:"WA" }
const eth = JSON.parse(fs.readFileSync("C:/tmp/ethanol.json", "utf8")).features
for (const { properties: p } of eth) {
  out.push(["e", p.site_name.trim(), p.company.trim(), ST[p.state] ?? p.state, +p.latitude.toFixed(3), +p.longitude.toFixed(3), p.capacity, "eia"])
}
fs.writeFileSync(path.join(__dirname, "../src/data/destinations.json"), JSON.stringify(out))
const n = (k) => out.filter((o) => o[0] === k).length
console.log(`DESTINATIONS-OK: ${out.length} (ports ${n("x")}, feedyards ${n("f")}, ethanol ${n("e")}, ethanol >=100M gal ${out.filter((o) => o[0] === "e" && o[6] >= 100).length})`)
