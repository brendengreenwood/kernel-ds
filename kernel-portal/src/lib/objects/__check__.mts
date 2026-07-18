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
function checkCoords(rows: readonly ObjectRow[], label: string) {
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

// Phase 3: schema + parseObjectModel asserts.
{
  const { parseObjectModel } = await import("./schema.ts")

  const validJson = JSON.stringify({
    model: {
      key: "gadget",
      label: "Gadget",
      plural: "Gadgets",
      fields: [{ key: "name", label: "Name", type: "text", sample: "Widget" }],
      statuses: [{ key: "live", label: "Live", tone: "active" }],
      associations: [
        { key: "owner", label: "Owner", targetObjectKey: "not-registered" },
      ],
    },
    rows: [
      { id: "G-1", name: "Widget" },
      { id: "G-2", name: "Doodad", coord: { x: 50, y: 50 } },
    ],
  })

  // (1) Valid JSON parses to typed model + rows.
  const { model, rows } = parseObjectModel(validJson)
  assert(
    model.key === "gadget" && rows.length === 2,
    "valid JSON must parse to model + rows",
  )

  // (2) A model whose status entry omits `tone` fails.
  let toneRejected = false
  try {
    parseObjectModel(
      JSON.stringify({
        model: {
          key: "gadget",
          label: "Gadget",
          plural: "Gadgets",
          fields: [],
          statuses: [{ key: "live", label: "Live" }],
          associations: [],
        },
        rows: [],
      }),
    )
  } catch {
    toneRejected = true
  }
  assert(toneRejected, "model whose status lacks tone must fail zod parse")

  // (3) A row with no coord gets a derived coord in [5..95], deterministically.
  const derived = rows[0].coord
  assert(
    derived.x >= 5 && derived.x <= 95 && derived.y >= 5 && derived.y <= 95,
    `derived coord out of [5..95]: ${JSON.stringify(derived)}`,
  )
  const again = parseObjectModel(validJson)
  assert(
    again.rows[0].coord.x === derived.x && again.rows[0].coord.y === derived.y,
    "coord derivation must be deterministic",
  )
  assert(
    rows[1].coord.x === 50 && rows[1].coord.y === 50,
    "explicit coord must be preserved",
  )
  console.log(
    `schema ok (parse, tone-required, derived coord ${derived.x},${derived.y} in [5..95])`,
  )
}

console.log("stub ok")
