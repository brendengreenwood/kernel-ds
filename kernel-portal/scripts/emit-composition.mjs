/**
 * emit-composition.mjs — serialize the composition contract to
 * public/composition.json (decision 0030).
 *
 * Imports the typed manifest via Node 24 native type-stripping, validates
 * that every rule cites a real source record, and writes the JSON artifact
 * the portal serves. Run from kernel-portal/:
 *
 *   node scripts\emit-composition.mjs
 *
 * Fails loudly (exit 1) on a dangling source reference.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const portalRoot = join(here, "..")
const repoRoot = join(portalRoot, "..")

const { compositionContract } = await import("@kernel/definitions/composition")

// --- Validate every rules[].source against real records ------------------
const decisionFiles = readdirSync(join(repoRoot, "docs", "decisions"))
const failures = []

for (const rule of compositionContract.rules) {
  const { id, source } = rule
  if (source === "amendment-A4") {
    // A4 lives outside docs/decisions; its durable trace is the A4 comment
    // in status-map.ts (the toneToStatus rationale). Fail if that vanished.
    const statusMap = readFileSync(
      join(portalRoot, "src", "lib", "objects", "status-map.ts"),
      "utf8",
    )
    if (!statusMap.includes("A4")) {
      failures.push(`${id}: amendment-A4 cited but status-map.ts no longer references A4`)
    }
    continue
  }
  const m = /^decision-(\d{4})$/.exec(source)
  if (!m) {
    failures.push(`${id}: malformed source "${source}"`)
    continue
  }
  const prefix = `${m[1]}-`
  if (!decisionFiles.some((f) => f.startsWith(prefix))) {
    failures.push(`${id}: cites ${source} but no docs/decisions/${prefix}*.md exists`)
  }
}

if (failures.length > 0) {
  console.error("EMIT-COMPOSITION FAILED — dangling source references:")
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

// --- Emit ----------------------------------------------------------------
const outPath = join(portalRoot, "public", "composition.json")
writeFileSync(outPath, JSON.stringify(compositionContract, null, 2) + "\n")
console.log(
  `EMIT-OK composition.json (${compositionContract.primitives.length} primitives, ` +
    `${compositionContract.regions.length} regions, ${compositionContract.rules.length} rules; all sources resolve)`,
)
