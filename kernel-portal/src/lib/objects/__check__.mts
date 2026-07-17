// Runtime shape check for the stub object model.
//
// Types are proven by `tsc --noEmit`; this asserts that the runtime
// data actually matches the intended shape (row counts, referential
// integrity of settlement->contract, valid coord ranges).
//
// Run: node --experimental-strip-types kernel-portal/src/lib/objects/__check__.mts
// (Requires Node >= 22.6; verified with v24.18.0 at plan-drafting time.)

import {
  objectRegistry,
  objectRowsRegistry,
  contractRows,
  settlementRows,
  type ObjectRow,
} from "./index.ts"

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error("FAIL:", msg)
    process.exit(1)
  }
}

// Registry populated.
assert(objectRegistry.contract.fields.length > 0, "contract has no fields")
assert(objectRegistry.settlement.fields.length > 0, "settlement has no fields")

// Row counts.
assert(contractRows.length >= 8, `expected >=8 contract rows, got ${contractRows.length}`)
assert(settlementRows.length >= 6, `expected >=6 settlement rows, got ${settlementRows.length}`)

// Referential integrity: every settlement.contractId maps to a real contract.
const contractIds = new Set(contractRows.map((r) => r.id))
for (const s of settlementRows) {
  const cid = s.contractId as string
  assert(
    contractIds.has(cid),
    `settlement ${s.id} references unknown contract ${cid}`,
  )
}

// Coord validity on every row of every object.
function checkCoords(rows: ObjectRow[], label: string) {
  for (const r of rows) {
    assert(
      r.coord && typeof r.coord.x === "number" && typeof r.coord.y === "number",
      `${label} ${r.id} missing numeric coord`,
    )
    assert(
      r.coord.x >= 0 && r.coord.x <= 100 && r.coord.y >= 0 && r.coord.y <= 100,
      `${label} ${r.id} coord out of range [0..100]: ${JSON.stringify(r.coord)}`,
    )
  }
}
checkCoords(objectRowsRegistry.contract, "contract")
checkCoords(objectRowsRegistry.settlement, "settlement")

// Walk manifest shape asserts — segment 02+ adds this file. Skip if absent.
try {
  const mod = await import("../../../scripts/new-rail-manifest.mjs")
  const rows = (mod as { default?: unknown[]; manifest?: unknown[] }).default
    ?? (mod as { manifest?: unknown[] }).manifest
    ?? []
  for (const row of rows as Array<Record<string, unknown>>) {
    assert(typeof row.slug === "string" && (row.slug as string).length > 0, `manifest row missing slug`)
    const path = row.path as string
    assert(typeof path === "string" && path.startsWith("/"), `manifest row ${row.slug} path must start with /`)
    const a = row.assertion as { within?: string; text?: string } | undefined
    assert(a && (a.within === "h1" || a.within === "main"), `manifest row ${row.slug} assertion.within must be h1|main`)
    assert(typeof a.text === "string" && a.text.length > 0, `manifest row ${row.slug} assertion.text required`)
  }
  console.log(`manifest ok (${(rows as unknown[]).length} rows)`)
} catch (err) {
  const code = (err as NodeJS.ErrnoException).code
  if (code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND") {
    console.log("no manifest yet — skipping shape assert")
  } else {
    throw err
  }
}

console.log("stub ok")
