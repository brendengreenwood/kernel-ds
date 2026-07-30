import { resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { fail, repoRoot } from "../lib/context.mjs"
import { defaultRegistryFile, loadRegistry, validateRegistry } from "../lib/consumers.mjs"

/**
 * Validate the managed-consumer registry: schema, id/path policy, package
 * subscriptions, verification-command allowlist, and the decision-0036
 * unmanaged fence. Nonzero on any violation.
 */
export async function consumers(argv) {
  const { flags } = parseFlags(argv)
  const registryFile = flags.registry ? resolve(repoRoot, flags.registry) : defaultRegistryFile

  let registry
  try {
    registry = loadRegistry(registryFile)
  } catch (cause) {
    return fail("CONSUMERS-CHECK-FAILED", `cannot read registry ${registryFile}: ${cause.message}`)
  }

  const issues = validateRegistry(registry)
  if (issues.length > 0) {
    for (const issue of issues) console.error(`  - ${issue}`)
    return fail("CONSUMERS-CHECK-FAILED", `${issues.length} violation(s) in ${registryFile}`)
  }

  const optedIn = registry.consumers.filter((consumer) => consumer.optIn).length
  console.log(
    `CONSUMERS-CHECK-OK: ${registry.consumers.length} managed consumer(s) (${optedIn} opted in), ${registry.unmanaged.length} unmanaged fork(s) fenced`,
  )
}
