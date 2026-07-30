import { spawnSync } from "node:child_process"
import { resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot, runNode, runNpm } from "../lib/context.mjs"

/** Gate registry: changed-path pattern → the focused checks that guard it. */
export const verifyGates = [
  {
    id: "ds-commands",
    match: /^(scripts\/ds\/|package\.json$)/,
    run: () => [runNode(resolve(repoRoot, "scripts/ds/__check__.mjs"))],
  },
  {
    id: "catalog",
    match: /^packages\/catalog\//,
    run: () => [runNpm(["run", "catalog:check"])],
  },
  {
    id: "ui",
    match: /^packages\/ui\//,
    run: () => [runNpm(["run", "ui:build"]), runNpm(["run", "ui:test"]), runNpm(["run", "ui:check"])],
  },
  {
    id: "definitions",
    match: /^packages\/definitions\//,
    run: () => [runNpm(["run", "definitions:build"]), runNpm(["run", "definitions:test"]), runNpm(["run", "definitions:check"])],
  },
  {
    id: "portal",
    match: /^kernel-portal\//,
    run: () => [
      runNpm(["run", "build"], { cwd: resolve(repoRoot, "kernel-portal") }),
      runNpm(["run", "lint"], { cwd: resolve(repoRoot, "kernel-portal") }),
      runNode(resolve(repoRoot, "kernel-portal/scripts/check-component-docs.mjs"), ["--coverage"], { cwd: resolve(repoRoot, "kernel-portal") }),
    ],
  },
  {
    id: "studio",
    match: /^kernel-studio-server\//,
    run: () => [
      runNpm(["run", "check"], { cwd: resolve(repoRoot, "kernel-studio-server") }),
      runNpm(["test"], { cwd: resolve(repoRoot, "kernel-studio-server") }),
    ],
  },
]

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
    selected = verifyGates.filter((gate) => paths.some((path) => gate.match.test(path)))
    if (selected.length === 0) {
      console.log("DS-VERIFY: no gate-mapped changes detected; running catalog baseline")
      selected = verifyGates.filter((gate) => gate.id === "catalog")
    }
  }

  console.log(`DS-VERIFY selected: ${selected.map((gate) => gate.id).join(", ")}`)
  const failures = []
  for (const gate of selected) {
    console.log(`DS-VERIFY gate: ${gate.id}`)
    for (const result of gate.run()) {
      if (result.status !== 0) {
        failures.push(gate.id)
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
