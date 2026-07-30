import { resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot, runNode, runNpm } from "../lib/context.mjs"

/**
 * Declared generation order. Later phases append steps (AGENTS inventories,
 * release impact); order is part of the contract because downstream steps
 * consume upstream outputs (the bundle reads catalog + package API metadata).
 */
export const generateSteps = [
  {
    id: "catalog-adapter",
    description: "Regenerate the portal lifecycle adapter from the catalog",
    run: () => runNode(resolve(repoRoot, "packages/catalog/scripts/generate-portal-adapter.mjs")),
  },
  {
    id: "ui-package",
    description: "Rebuild @kernel/ui (entry points, dist, api.json)",
    run: () => runNpm(["run", "build", "--workspace", "@kernel/ui"]),
  },
  {
    id: "definitions-package",
    description: "Rebuild @kernel/definitions (dist, api.json)",
    run: () => runNpm(["run", "build", "--workspace", "@kernel/definitions"]),
  },
  {
    id: "agents-inventories",
    description: "Refresh bounded generated-inventory sections in AGENTS files",
    run: () => runNode(resolve(repoRoot, "scripts/ds/cli.mjs"), ["agents"]),
  },
  {
    id: "ds-bundle",
    description: "Regenerate ds-bundle from catalog entities and package API metadata",
    run: () => runNode(resolve(repoRoot, "kernel-portal/scripts/build-ds-bundle.mjs"), [], { cwd: resolve(repoRoot, "kernel-portal") }),
  },
]

export async function generate(argv) {
  const { flags } = parseFlags(argv, ["list"])
  if (flags.list) {
    for (const step of generateSteps) console.log(`${step.id} — ${step.description}`)
    return
  }

  const only = flags.only ? String(flags.only).split(",") : undefined
  const skip = flags.skip ? String(flags.skip).split(",") : []
  for (const id of [...(only ?? []), ...skip]) {
    if (!generateSteps.some((step) => step.id === id)) {
      console.error(`DS-GENERATE-REFUSED: unknown step "${id}"; run with --list to see steps`)
      process.exitCode = 1
      return
    }
  }

  const selected = generateSteps.filter((step) => (only ? only.includes(step.id) : !skip.includes(step.id)))
  console.log(`DS-GENERATE order: ${selected.map((step) => step.id).join(" → ")}`)
  for (const step of selected) {
    console.log(`DS-GENERATE step: ${step.id}`)
    const result = step.run()
    if (result.status !== 0) {
      console.error(`DS-GENERATE-FAILED: step ${step.id} exited ${result.status}`)
      process.exitCode = 1
      return
    }
  }
  console.log(`DS-GENERATE-OK: ${selected.length} steps completed`)
}
