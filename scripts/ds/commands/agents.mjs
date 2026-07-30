import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot } from "../lib/context.mjs"
import { applyMarkers, buildInventories } from "../lib/agents-inventory.mjs"

/** Compute stale AGENTS inventory sections without writing. */
export async function collectStaleAgents() {
  const stale = []
  for (const target of await buildInventories()) {
    const path = resolve(repoRoot, target.file)
    const current = readFileSync(path, "utf8")
    if (applyMarkers(current, target.lines) !== current) stale.push(target.file)
  }
  return stale
}

/**
 * Regenerate the bounded generated-inventory sections in AGENTS files.
 * Only marker sections change; hand-authored prose is preserved verbatim.
 */
export async function agents(argv) {
  const { flags } = parseFlags(argv, ["check"])
  if (flags.check) {
    const stale = await collectStaleAgents()
    if (stale.length > 0) {
      for (const file of stale) console.error(`AGENTS-STALE: ${file}`)
      console.error("AGENTS-CHECK-FAILED: run npm run agents:generate")
      process.exitCode = 1
      return
    }
    console.log("AGENTS-CHECK-OK: generated inventory sections are current")
    return
  }

  let updated = 0
  for (const target of await buildInventories()) {
    const path = resolve(repoRoot, target.file)
    const current = readFileSync(path, "utf8")
    const next = applyMarkers(current, target.lines)
    if (next !== current) {
      writeFileSync(path, next)
      updated += 1
      console.log(`AGENTS-GENERATED: ${target.file}`)
    }
  }
  console.log(`AGENTS-GENERATE-OK: ${updated} files updated`)
}
