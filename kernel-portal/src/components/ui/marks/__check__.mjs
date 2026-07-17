#!/usr/bin/env node
// Shape check for the mark components: each file must exist, contain
// `data-slot="<mark>"`, and export a named component.
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))

const marks = [
  { file: "pin.tsx", slot: "pin", exportName: "Pin" },
  { file: "plot.tsx", slot: "plot", exportName: "Plot" },
  { file: "cluster-badge.tsx", slot: "cluster-badge", exportName: "ClusterBadge" },
  { file: "legend-swatch.tsx", slot: "legend-swatch", exportName: "LegendSwatch" },
]

let failed = 0
for (const { file, slot, exportName } of marks) {
  const path = resolve(here, file)
  let src
  try {
    src = readFileSync(path, "utf8")
  } catch {
    console.error(`FAIL ${file}: missing`)
    failed++
    continue
  }
  if (!src.includes(`data-slot="${slot}"`)) {
    console.error(`FAIL ${file}: missing data-slot="${slot}"`)
    failed++
    continue
  }
  const exportRegex = new RegExp(`export\\s*\\{[^}]*\\b${exportName}\\b`)
  if (!exportRegex.test(src)) {
    console.error(`FAIL ${file}: missing named export ${exportName}`)
    failed++
    continue
  }
  console.log(`ok ${file}`)
}

// Barrel check
const barrelPath = resolve(here, "index.ts")
let barrel
try {
  barrel = readFileSync(barrelPath, "utf8")
} catch {
  console.error("FAIL index.ts: missing")
  failed++
}
if (barrel) {
  for (const { exportName } of marks) {
    if (!new RegExp(`\\b${exportName}\\b`).test(barrel)) {
      console.error(`FAIL index.ts: missing re-export of ${exportName}`)
      failed++
    }
  }
  if (failed === 0 || barrel) console.log("ok index.ts")
}

process.exit(failed ? 1 : 0)
