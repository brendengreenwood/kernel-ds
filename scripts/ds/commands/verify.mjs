import { spawnSync } from "node:child_process"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot } from "../lib/context.mjs"
import { gateManifest, runCheck } from "../lib/gates.mjs"

/**
 * Gate registry: changed-path pattern → the focused checks that guard it.
 * The registry itself lives in lib/gates.mjs (the single gate manifest, also
 * consumed by ds:doctor's gate-coverage check against ci.yml). `dependents`
 * lists downstream gates that consume this gate's outputs; they are selected
 * transitively so a package change never silently skips its consumers
 * (portal consumes catalog/ui/definitions, Studio consumes the ds-bundle
 * built from the portal and the packages).
 */
export const verifyGates = gateManifest

/**
 * Pure selection: changed paths → gates to run, expanded through `dependents`
 * so transitive consumers are always included. Returned in registry order.
 */
export function selectGates(paths) {
  const selected = new Set()
  const enqueue = (id) => {
    if (selected.has(id)) return
    selected.add(id)
    const gate = verifyGates.find((candidate) => candidate.id === id)
    for (const dependent of gate.dependents) enqueue(dependent)
  }
  for (const gate of verifyGates) {
    if (paths.some((path) => gate.match.test(path))) enqueue(gate.id)
  }
  return verifyGates.filter((gate) => selected.has(gate.id))
}

function changedPaths(base) {
  const args = base ? ["diff", "--name-only", `${base}...HEAD`] : []
  const paths = new Set()
  if (base) {
    const committed = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" })
    if (committed.status !== 0) throw new Error(`git diff against ${base} failed: ${committed.stderr}`)
    for (const line of committed.stdout.split("\n")) if (line.trim()) paths.add(line.trim())
  }
  const working = spawnSync("git", ["diff", "--name-only", "HEAD"], { cwd: repoRoot, encoding: "utf8" })
  if (working.status !== 0) throw new Error(`git diff HEAD failed: ${working.stderr}`)
  for (const line of working.stdout.split("\n")) if (line.trim()) paths.add(line.trim())
  return [...paths]
}

/** Select and run the focused gates implied by changed paths (or every gate with --all). */
export async function verify(argv) {
  const { flags } = parseFlags(argv, ["all"])
  let selected
  if (flags.all) {
    selected = verifyGates
  } else {
    const paths = changedPaths(flags.base)
    selected = selectGates(paths)
    if (selected.length === 0) {
      console.log("DS-VERIFY: no gate-mapped changes detected; running catalog baseline")
      selected = verifyGates.filter((gate) => gate.id === "catalog")
    }
  }

  console.log(`DS-VERIFY selected: ${selected.map((gate) => gate.id).join(", ")}`)
  const failures = []
  for (const gate of selected) {
    console.log(`DS-VERIFY gate: ${gate.id}`)
    for (const check of gate.checks) {
      if (check.ciOnly) continue
      console.log(`DS-VERIFY check: ${gate.id}/${check.id}`)
      const result = runCheck(gate, check)
      if (result.status !== 0) {
        failures.push(`${gate.id}/${check.id}`)
        break
      }
    }
  }

  if (failures.length > 0) {
    console.error(`DS-VERIFY-FAILED: ${[...new Set(failures)].join(", ")}`)
    process.exitCode = 1
    return
  }
  console.log(`DS-VERIFY-OK: ${selected.length} gates passed`)
}
