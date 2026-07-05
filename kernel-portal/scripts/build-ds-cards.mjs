/**
 * Build Claude Design cards for the Kernel design system.
 *
 * Reads theme.css (single source of truth — cards can't drift from real
 * tokens) and emits self-contained HTML cards with first-line `@dsCard`
 * markers, ready for DesignSync upload to a claude.ai/design project.
 *
 * Usage: node scripts/build-ds-cards.mjs [outDir]
 *   outDir defaults to kernel-portal/.ds-cards (gitignored).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, resolve } from "node:path"

const REPO_ROOT = resolve(import.meta.dirname, "..", "..")
const THEME = readFileSync(join(REPO_ROOT, "theme.css"), "utf8")
const OUT = resolve(process.argv[2] ?? join(import.meta.dirname, "..", ".ds-cards"))
mkdirSync(join(OUT, "foundations"), { recursive: true })
mkdirSync(join(OUT, "components"), { recursive: true })
mkdirSync(join(OUT, "patterns"), { recursive: true })

const BASE_CSS = `
${THEME}
* { box-sizing: border-box; margin: 0; }
body {
  background: var(--background); color: var(--foreground);
  font-family: var(--font-sans); font-size: 14px; line-height: 1.5;
  padding: 20px; -webkit-font-smoothing: antialiased;
}
.mono { font-family: var(--font-mono); }
.muted { color: var(--muted-foreground); }
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.col { display: flex; flex-direction: column; gap: 14px; }
.label { font-family: var(--font-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: .1em; color: var(--muted-foreground); margin-bottom: 6px; }
`

function card(relPath, group, name, subtitle, extraCss, bodyHtml) {
  const html = `<!-- @dsCard group="${group}" name="${name}" subtitle="${subtitle}" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} — Kernel</title>
<style>${BASE_CSS}${extraCss}</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`
  writeFileSync(join(OUT, relPath), html)
  console.log("wrote", relPath)
}

/* ---------- helpers ---------- */
const STEPS_11 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const STEPS_10 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

function ramp(name, varBase, steps) {
  const cells = steps
    .map(
      (s) =>
        `<div class="cell" style="background:var(--${varBase}-${s})"><span class="${s <= 400 ? "lt" : "dk"}">${s}</span></div>`
    )
    .join("")
  return `<div class="rampline"><div class="rampname"><b>${name}</b><span class="mono muted">--${varBase}-*</span></div><div class="ramp">${cells}</div></div>`
}

const RAMP_CSS = `
.rampline { display: grid; grid-template-columns: 118px 1fr; gap: 12px; align-items: center; margin-bottom: 10px; }
.rampname { display: flex; flex-direction: column; font-size: 13px; }
.rampname .mono { font-size: 10.5px; }
.ramp { display: flex; border-radius: 6px; overflow: hidden; height: 40px; }
.cell { flex: 1; display: flex; align-items: flex-end; padding: 3px 0 2px 4px; }
.cell span { font-family: var(--font-mono); font-size: 8.5px; }
.cell .lt { color: rgba(0,0,0,.55); } .cell .dk { color: rgba(255,255,255,.75); }
`

/* ---------- Foundations ---------- */
card(
  "foundations/colors-core.html", "Colors", "Brand & neutral scales",
  "Full 50–950 ramps · green brand, green-tinted neutral", RAMP_CSS,
  ramp("Brand", "brand", STEPS_11) + ramp("Neutral", "neutral", STEPS_11)
)

card(
  "foundations/colors-notification.html", "Colors", "Notification scales",
  "success · warning · error · info (50–900)", RAMP_CSS,
  ramp("Success", "success", STEPS_10) + ramp("Warning", "warning", STEPS_10) +
  ramp("Error", "error", STEPS_10) + ramp("Info", "info", STEPS_10)
)

card(
  "foundations/colors-viz.html", "Colors", "Data visualization",
  "8 categorical hues, each a full 50–950 scale", RAMP_CSS,
  ["crop", "wheat", "clay", "sky", "plum", "teal", "rust", "slate"]
    .map((k) => ramp(k[0].toUpperCase() + k.slice(1), `viz-${k}`, STEPS_11)).join("")
)

const statuses = [
  ["draft", "Draft", "neutral"], ["pending", "Pending", "info"], ["booked", "Booked", "viz-plum"],
  ["intransit", "In transit", "warning"], ["delivered", "Delivered", "viz-teal"], ["settled", "Settled", "success"],
  ["onhold", "On hold", "viz-clay"], ["rejected", "Rejected", "error"], ["cancelled", "Cancelled", "viz-slate"],
  ["expired", "Expired", "viz-rust"],
]
card(
  "foundations/status-tokens.html", "Colors", "Status tokens",
  "10 lifecycle states, one hue each — persistent state, not notifications",
  `.status { display: inline-flex; align-items: center; gap: 6px; border: 1px solid; border-radius: 999px; padding: 3px 10px 3px 8px; font-size: 12px; font-weight: 500; }
   .status .dot { width: 6px; height: 6px; border-radius: 999px; }`,
  `<div class="label">--status-* · &lt;StatusBadge&gt;</div><div class="row">` +
  statuses.map(([k, label, fam]) => {
    const t = fam === "warning" || fam === "viz-clay" ? "900" : "800"
    return `<span class="status" style="border-color:var(--${fam}-200);background:var(--${fam}-100);color:var(--${fam}-${t})"><span class="dot" style="background:var(--status-${k})"></span>${label}</span>`
  }).join("") + `</div>
  <p class="muted" style="margin-top:14px;font-size:12.5px;max-width:52ch">Statuses are persistent lifecycle state. Momentary event outcomes use the notification variants on Alert/Badge instead — never conflate the two.</p>`
)

card(
  "foundations/typography.html", "Type", "Type scale & styles",
  "System font stacks · 12-step ramp · semantic styles",
  `.t { display: grid; grid-template-columns: 150px 1fr; gap: 14px; align-items: baseline; margin-bottom: 12px; }
   .t .mono { font-size: 10.5px; }`,
  `
  <div class="t"><span class="mono muted">display · 48/600</span><span style="font-size:34px;font-weight:600;letter-spacing:-0.025em">412 loads settled</span></div>
  <div class="t"><span class="mono muted">page title · 30/600</span><span style="font-size:26px;font-weight:600;letter-spacing:-0.02em">Open contracts</span></div>
  <div class="t"><span class="mono muted">card title · 18/600</span><span style="font-size:18px;font-weight:600;letter-spacing:-0.01em">River terminal</span></div>
  <div class="t"><span class="mono muted">body · 16/400</span><span style="font-size:16px">Merchants compare local basis, lock a price, and settle the load.</span></div>
  <div class="t"><span class="mono muted">body small · 14</span><span style="font-size:14px">The default size for controls, table cells, and dense layouts.</span></div>
  <div class="t"><span class="mono muted">label · 14/500</span><span style="font-size:14px;font-weight:500">Delivery window</span></div>
  <div class="t"><span class="mono muted">caption · 12</span><span class="muted" style="font-size:12px">Updated 12 minutes ago</span></div>
  <div class="t"><span class="mono muted">overline · 11/600</span><span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.13em" class="muted">Settlement</span></div>
  <div class="t"><span class="mono muted">numeric · mono</span><span class="mono" style="font-size:14px;font-variant-numeric:tabular-nums">$4.62 / bu&nbsp;&nbsp;&nbsp;18,400 bu</span></div>
  <p class="muted" style="margin-top:6px;font-size:12.5px">No web fonts — native system stacks only (--font-sans, --font-mono).</p>`
)

card(
  "foundations/elevation-radius.html", "Spacing", "Elevation & radius",
  "Shadow ramp 2xs–2xl · radius scale",
  `.sw { background: var(--card); border-radius: var(--radius); padding: 14px 10px; text-align: center; width: 96px; }
   .rx { background: var(--secondary); border: 1px solid var(--border); width: 72px; height: 48px; display: flex; align-items: center; justify-content: center; }`,
  `
  <div class="label">Shadows</div>
  <div class="row" style="margin-bottom:20px">
    ${["2xs", "xs", "sm", "", "md", "lg", "xl", "2xl"].map((s) => `<div class="sw" style="box-shadow:var(--shadow${s ? "-" + s : ""})"><span class="mono muted" style="font-size:10.5px">${s || "base"}</span></div>`).join("")}
  </div>
  <div class="label">Radius (--radius: 0.5rem)</div>
  <div class="row">
    ${[["sm", "var(--radius-sm)"], ["md", "var(--radius-md)"], ["lg", "var(--radius-lg)"], ["xl", "var(--radius-xl)"], ["full", "999px"]].map(([n, v]) => `<div class="rx" style="border-radius:${v}"><span class="mono muted" style="font-size:10.5px">${n}</span></div>`).join("")}
  </div>`
)

/* ---------- Components ---------- */
const BTN_CSS = `
.btn { display: inline-flex; align-items: center; gap: 7px; border-radius: var(--radius-md); font-weight: 500; font-size: 13.5px; padding: 0 16px; height: 38px; border: 1px solid transparent; cursor: pointer; font-family: var(--font-sans); }
.btn.sm { height: 32px; padding: 0 12px; font-size: 13px; }
.btn.lg { height: 44px; padding: 0 22px; font-size: 14.5px; }
.btn.primary { background: var(--primary); color: var(--primary-foreground); }
.btn.secondary { background: var(--secondary); color: var(--secondary-foreground); }
.btn.outline { background: var(--background); border-color: var(--border); color: var(--foreground); }
.btn.ghost { background: transparent; color: var(--foreground); }
.btn.destructive { background: var(--destructive); color: var(--destructive-foreground); }
.btn.link { background: none; color: var(--primary); text-decoration: underline; text-underline-offset: 4px; padding: 0; height: auto; }
.btn:disabled { opacity: .5; cursor: not-allowed; }
`
card(
  "components/buttons.html", "Components", "Buttons",
  "primary / secondary / outline / ghost / destructive / link · 3 sizes", BTN_CSS,
  `
  <div class="label">Variants</div>
  <div class="row" style="margin-bottom:18px">
    <button class="btn primary">Book contract</button>
    <button class="btn secondary">Secondary</button>
    <button class="btn outline">Outline</button>
    <button class="btn ghost">Ghost</button>
    <button class="btn destructive">Delete</button>
    <button class="btn link">Link</button>
    <button class="btn primary" disabled>Disabled</button>
  </div>
  <div class="label">Sizes</div>
  <div class="row">
    <button class="btn primary sm">Small</button>
    <button class="btn primary">Default</button>
    <button class="btn primary lg">Large</button>
  </div>`
)

const BADGE_CSS = `
.badge { display: inline-flex; align-items: center; gap: 4px; border-radius: var(--radius-md); border: 1px solid transparent; padding: 3px 8px; font-size: 12px; font-weight: 500; line-height: 1; }
.badge.default { background: var(--primary); color: var(--primary-foreground); }
.badge.secondary { background: var(--secondary); color: var(--secondary-foreground); }
.badge.outline { border-color: var(--border); color: var(--foreground); }
.badge.success { border-color: var(--success-200); background: var(--success-100); color: var(--success-800); }
.badge.warning { border-color: var(--warning-200); background: var(--warning-100); color: var(--warning-900); }
.badge.info { border-color: var(--info-200); background: var(--info-100); color: var(--info-800); }
.badge.destructive { border-color: var(--error-200); background: var(--error-100); color: var(--error-800); }
`
card(
  "components/badges.html", "Components", "Badges",
  "Kernel soft notification variants: success / warning / info / destructive", BADGE_CSS,
  `
  <div class="label">Event outcomes (notification scales)</div>
  <div class="row" style="margin-bottom:18px">
    <span class="badge success">Price locked</span>
    <span class="badge warning">Basis moved</span>
    <span class="badge info">Contract updated</span>
    <span class="badge destructive">Transfer failed</span>
  </div>
  <div class="label">Structural</div>
  <div class="row">
    <span class="badge default">Default</span>
    <span class="badge secondary">Secondary</span>
    <span class="badge outline">Outline</span>
  </div>`
)

const ALERT_CSS = `
.alert { display: grid; grid-template-columns: 18px 1fr; gap: 10px; border: 1px solid; border-radius: var(--radius-lg); padding: 13px 15px; margin-bottom: 10px; }
.alert .ttl { font-weight: 600; font-size: 13.5px; }
.alert .desc { font-size: 13px; opacity: .85; margin-top: 2px; }
.alert svg { width: 16px; height: 16px; margin-top: 1px; }
.a-default { border-color: var(--border); background: var(--card); color: var(--foreground); }
.a-success { border-color: var(--success-200); background: var(--success-100); color: var(--success-800); }
.a-warning { border-color: var(--warning-200); background: var(--warning-100); color: var(--warning-900); }
.a-info { border-color: var(--info-200); background: var(--info-100); color: var(--info-800); }
.a-error { border-color: var(--error-200); background: var(--error-100); color: var(--error-800); }
`
const ic = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
const CIRCLE_I = ic('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>')
card(
  "components/alerts.html", "Components", "Alerts",
  "default / success / warning / info / destructive",
  ALERT_CSS,
  `
  <div class="alert a-success">${ic('<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>')}<div><div class="ttl">Settlement posted</div><div class="desc">SET-0143 paid via ACH — $98,382.90 to Hartmann Farms.</div></div></div>
  <div class="alert a-warning">${ic('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>')}<div><div class="ttl">Basis moved 4¢ since quote</div><div class="desc">Re-price before sending the contract for signature.</div></div></div>
  <div class="alert a-info">${CIRCLE_I}<div><div class="ttl">Truck 14 will be posted at new scale</div><div class="desc">Tickets sync automatically in about 10 minutes.</div></div></div>
  <div class="alert a-error">${CIRCLE_I}<div><div class="ttl">Settlement failed</div><div class="desc">Bank rejected the ACH transfer. Re-enter routing details to retry.</div></div></div>`
)

const FORM_CSS = `
.field { display: flex; flex-direction: column; gap: 6px; max-width: 300px; margin-bottom: 14px; }
.field label { font-size: 13.5px; font-weight: 500; }
.input { height: 38px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--background); padding: 0 12px; font-size: 13.5px; color: var(--foreground); font-family: var(--font-sans); width: 100%; }
.input::placeholder { color: var(--muted-foreground); }
.input:focus { outline: 2px solid color-mix(in oklch, var(--ring) 50%, transparent); outline-offset: 0; border-color: var(--ring); }
.hint { font-size: 12px; color: var(--muted-foreground); }
.check { display: flex; align-items: center; gap: 8px; font-size: 13.5px; margin-bottom: 8px; }
.box { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--input); background: var(--background); display: inline-flex; align-items: center; justify-content: center; }
.box.on { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); font-size: 11px; }
.radio { width: 16px; height: 16px; border-radius: 999px; border: 1px solid var(--input); background: var(--background); display: inline-flex; align-items: center; justify-content: center; }
.radio.on::after { content: ""; width: 8px; height: 8px; border-radius: 999px; background: var(--primary); }
.switch { width: 34px; height: 20px; border-radius: 999px; background: var(--input); position: relative; }
.switch.on { background: var(--primary); }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 999px; background: var(--background); transition: left .15s; }
.switch.on::after { left: 16px; }
`
card(
  "components/form-controls.html", "Forms", "Form controls",
  "input · checkbox · radio · switch, with label anatomy", FORM_CSS,
  `
  <div class="field">
    <label>Delivery destination</label>
    <input class="input" value="River Terminal — Davenport">
    <span class="hint">Where the contracted bushels arrive.</span>
  </div>
  <div class="field">
    <label>Cash price</label>
    <input class="input mono" placeholder="$0.00 / bu">
  </div>
  <div class="row" style="gap:28px">
    <div>
      <div class="label">Checkbox</div>
      <div class="check"><span class="box on">✓</span> Allow partial deliveries</div>
      <div class="check"><span class="box"></span> Auto-roll basis</div>
    </div>
    <div>
      <div class="label">Radio</div>
      <div class="check"><span class="radio on"></span> Delivered (seller pays)</div>
      <div class="check"><span class="radio"></span> FOB farm</div>
    </div>
    <div>
      <div class="label">Switch</div>
      <div class="check"><span class="switch on"></span> Notifications</div>
      <div class="check"><span class="switch"></span> Real-time bids</div>
    </div>
  </div>`
)

const TABLE_CSS = `
table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted-foreground); font-weight: 600; padding: 8px 12px; border-bottom: 1px solid var(--border); }
td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
tr:last-child td { border-bottom: 0; }
.num { text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
th.num { font-family: var(--font-sans); }
.status { display: inline-flex; align-items: center; gap: 6px; border: 1px solid; border-radius: 999px; padding: 2px 9px 2px 7px; font-size: 12px; font-weight: 500; }
.status .dot { width: 6px; height: 6px; border-radius: 999px; }
.wrap { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; background: var(--card); }
`
const strow = (fam, k, label) => {
  const t = fam === "warning" || fam === "viz-clay" ? "900" : "800"
  return `<span class="status" style="border-color:var(--${fam}-200);background:var(--${fam}-100);color:var(--${fam}-${t})"><span class="dot" style="background:var(--status-${k})"></span>${label}</span>`
}
card(
  "components/table.html", "Data", "Table",
  "Typed cells · status column · tabular numerals", TABLE_CSS,
  `<div class="wrap"><table>
    <thead><tr><th>Load</th><th>Farm</th><th>Grain</th><th>Status</th><th class="num">Net bu</th><th class="num">$/bu</th></tr></thead>
    <tbody>
      <tr><td class="mono">#4471</td><td>Hartmann Farms</td><td>Corn</td><td>${strow("warning", "intransit", "In transit")}</td><td class="num">18,400</td><td class="num">4.62</td></tr>
      <tr><td class="mono">#4468</td><td>Valley Co-op</td><td>Soybean</td><td>${strow("success", "settled", "Settled")}</td><td class="num">9,120</td><td class="num">11.08</td></tr>
      <tr><td class="mono">#4465</td><td>Birchwood Grain</td><td>Wheat</td><td>${strow("viz-clay", "onhold", "On hold")}</td><td class="num">12,750</td><td class="num">5.94</td></tr>
      <tr><td class="mono">#4460</td><td>Hartmann Farms</td><td>Corn</td><td>${strow("error", "rejected", "Rejected")}</td><td class="num">0</td><td class="num">—</td></tr>
    </tbody>
  </table></div>`
)

card(
  "components/cards-kpi.html", "Data", "Cards & KPIs",
  "Card anatomy · KPI stat tiles with deltas",
  `.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; }
   .kpi { min-width: 168px; flex: 1; }
   .kpi .v { font-size: 26px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; margin: 4px 0 2px; }
   .up { color: var(--success-600); font-size: 12.5px; font-weight: 500; }
   .down { color: var(--error-600); font-size: 12.5px; font-weight: 500; }`,
  `
  <div class="row" style="margin-bottom:14px">
    <div class="card kpi"><div class="label">Open contracts</div><div class="v">128</div><span class="up">▲ 12 this week</span></div>
    <div class="card kpi"><div class="label">Bushels in transit</div><div class="v">86,400</div><span class="up">▲ 4.2%</span></div>
    <div class="card kpi"><div class="label">Avg basis</div><div class="v">−0.32</div><span class="down">▼ 3¢ vs 5-day</span></div>
  </div>
  <div class="card" style="max-width:380px">
    <div style="font-weight:600;font-size:15px;letter-spacing:-0.01em">River terminal</div>
    <div class="muted" style="font-size:13px;margin:2px 0 12px">Davenport, IA · 1.2M bu capacity</div>
    <div class="row" style="justify-content:space-between;font-size:13px"><span class="muted">Today's corn bid</span><span class="mono">$4.62 / bu</span></div>
  </div>`
)

/* ---------- Patterns ---------- */
card(
  "patterns/page-header.html", "Patterns", "Page header",
  "Breadcrumb · title · actions · tabs",
  BTN_CSS + `
  .crumb { display: flex; gap: 6px; font-size: 12px; color: var(--muted-foreground); }
  .crumb b { color: var(--foreground); font-weight: 500; }
  .tabs { display: flex; gap: 4px; margin-top: 14px; border-bottom: 1px solid var(--border); }
  .tab { padding: 8px 12px; font-size: 13.5px; font-weight: 500; color: var(--muted-foreground); border-bottom: 2px solid transparent; }
  .tab.on { color: var(--foreground); font-weight: 600; border-bottom-color: var(--primary); }`,
  `
  <div class="crumb">Operations <span>›</span> Contracts <span>›</span> <b>CTR-4471</b></div>
  <div class="row" style="justify-content:space-between;margin-top:8px">
    <div>
      <div style="font-size:21px;font-weight:600;letter-spacing:-0.015em">Contract CTR-4471</div>
      <div class="muted" style="font-size:13px">Hartmann Farms · Corn · Jun 2026</div>
    </div>
    <div class="row"><button class="btn outline sm">Edit</button><button class="btn primary sm">Settle</button></div>
  </div>
  <div class="tabs"><span class="tab on">Overview</span><span class="tab">Fills</span><span class="tab">Activity</span><span class="tab">Documents</span></div>`
)

card(
  "patterns/settlement-summary.html", "Patterns", "Settlement summary",
  "Deductions ledger → prominent net payable",
  `.panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; max-width: 380px; }
   .line { display: flex; justify-content: space-between; font-size: 13.5px; padding: 7px 0; border-bottom: 1px solid var(--border); }
   .line .mono { font-variant-numeric: tabular-nums; }
   .net { display: flex; justify-content: space-between; padding-top: 12px; font-weight: 600; font-size: 15px; }
   .net .mono { font-size: 18px; letter-spacing: -0.01em; }`,
  `
  <div class="panel">
    <div class="label">Settlement · SET-0143</div>
    <div class="line"><span>Gross amount</span><span class="mono">$142,638.08</span></div>
    <div class="line"><span class="muted">Drying charge</span><span class="mono">−$3,411.10</span></div>
    <div class="line"><span class="muted">State checkoff</span><span class="mono">−$214.08</span></div>
    <div class="line"><span class="muted">Advance repayment</span><span class="mono">−$25,000.00</span></div>
    <div class="line"><span class="muted">Lien payoff</span><span class="mono">−$15,630.00</span></div>
    <div class="net"><span>Net payable</span><span class="mono" style="color:var(--success-700)">$98,382.90</span></div>
  </div>`
)

console.log("done → " + OUT)
