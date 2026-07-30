import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { fail, repoRoot, runNode } from "../lib/context.mjs"
import { defaultRegistryFile, loadRegistry, resolveConsumer, validateRegistry } from "../lib/consumers.mjs"
import { validateImpactManifest } from "../lib/release-meta.mjs"

const cliFile = resolve(fileURLToPath(import.meta.url), "../../cli.mjs")

function loadManifest(manifestFile, usingDefaultPath) {
  if (!existsSync(manifestFile) && usingDefaultPath) {
    // Convenience for the documented one-paste gate: derive the manifest from
    // pending changesets with the command's own defaults.
    const generated = runNode(cliFile, ["release-impact"], { capture: true })
    if (generated.status !== 0) {
      return { error: `no impact manifest at ${manifestFile} and release-impact failed:\n${generated.stdout}${generated.stderr}` }
    }
  }
  if (!existsSync(manifestFile)) {
    return { error: `no impact manifest at ${manifestFile}; run npm run release:impact first` }
  }
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"))
  const issues = validateImpactManifest(manifest)
  if (issues.length > 0) return { error: `impact manifest invalid: ${issues.join("; ")}` }
  return { manifest }
}

function dependencySlot(consumerManifest, name) {
  for (const key of ["dependencies", "devDependencies"]) {
    if (consumerManifest[key]?.[name] !== undefined) return key
  }
  return null
}

function runVerification(commands, cwd) {
  for (const command of commands) {
    const [binary, ...args] = command.trim().split(/\s+/)
    const windows = process.platform === "win32"
    const needsShell = windows && binary !== "node"
    const result = spawnSync(needsShell ? `${binary}.cmd` : binary, args, {
      cwd,
      encoding: "utf8",
      shell: needsShell,
      stdio: ["ignore", "pipe", "pipe"],
    })
    if (result.status !== 0) {
      return { command, output: `${result.stdout ?? ""}${result.stderr ?? ""}` }
    }
    console.log(`  verified: ${command}`)
  }
  return null
}

/**
 * Plan (default, dry-run) or apply (--apply) a design-system upgrade for one
 * registered managed consumer. Resolves target versions from the impact
 * manifest, prints the dependency/migration/docs/verification plan, and in
 * apply mode updates dependencies, installs, and runs the consumer's
 * registered verification commands — restoring the consumer on failure.
 */
export async function upgrade(argv) {
  const { flags } = parseFlags(argv, ["dry-run", "apply", "no-install"])
  if (!requireFlags(flags, ["consumer"], "upgrade")) return
  const apply = flags.apply === true

  const registryFile = flags.registry ? resolve(repoRoot, flags.registry) : defaultRegistryFile
  const root = flags.root ? resolve(repoRoot, flags.root) : repoRoot
  const registry = loadRegistry(registryFile)
  const registryIssues = validateRegistry(registry)
  if (registryIssues.length > 0) {
    for (const issue of registryIssues) console.error(`  - ${issue}`)
    return fail("DS-UPGRADE-REFUSED", `consumer registry ${registryFile} is invalid; fix it first`)
  }

  const { consumer, unmanaged } = resolveConsumer(registry, flags.consumer)
  if (unmanaged) {
    return fail(
      "DS-UPGRADE-REFUSED",
      `"${unmanaged.id}" is unmanaged and cannot be targeted: ${unmanaged.reason}`,
    )
  }
  if (!consumer) {
    const known = registry.consumers.map((entry) => entry.id).join(", ")
    return fail("DS-UPGRADE-REFUSED", `unknown consumer "${flags.consumer}"; managed consumers: ${known}`)
  }

  const manifestFile = resolve(repoRoot, flags.manifest ?? ".release/impact-manifest.json")
  const { manifest, error } = loadManifest(manifestFile, flags.manifest === undefined)
  if (error) return fail("DS-UPGRADE-FAILED", error)

  const relevant = manifest.packages.filter((entry) => consumer.packages.includes(entry.name))
  if (relevant.length === 0) {
    console.log(`DS-UPGRADE-NOOP: no pending releases touch ${consumer.id}'s subscribed packages`)
    return
  }

  if (apply && consumer.optIn !== true) {
    return fail("DS-UPGRADE-REFUSED", `${consumer.id} has not opted in to applied upgrades; rerun with --dry-run`)
  }
  if (apply && consumer.repository !== "local") {
    return fail(
      "DS-UPGRADE-REFUSED",
      `${consumer.id} lives in ${consumer.repository} and applying requires repository credentials; dry-run is available without them`,
    )
  }

  const local = consumer.repository === "local"
  let consumerDir = null
  let consumerManifest = null
  if (local) {
    consumerDir = resolve(root, consumer.localPath)
    const manifestPath = resolve(consumerDir, "package.json")
    if (!existsSync(manifestPath)) {
      return fail("DS-UPGRADE-FAILED", `consumer package.json not found at ${manifestPath}`)
    }
    consumerManifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  }

  const packsDir = flags["packs-dir"] ? resolve(repoRoot, flags["packs-dir"]) : null
  const updates = []
  for (const entry of relevant) {
    const target = packsDir
      ? `file:${relative(consumerDir ?? repoRoot, resolve(packsDir, `${entry.name.replace("@", "").replace("/", "-")}-${entry.plannedVersion}.tgz`)).split("\\").join("/")}`
      : `^${entry.plannedVersion}`
    if (!local) {
      updates.push({ entry, slot: "dependencies", current: "(remote)", target })
      continue
    }
    const slot = dependencySlot(consumerManifest, entry.name)
    if (!slot) {
      console.log(`  ${entry.name}: not installed in ${consumer.id} — skipped`)
      continue
    }
    const current = consumerManifest[slot][entry.name]
    if (current === target) continue
    updates.push({ entry, slot, current, target })
  }
  if (local && updates.length === 0) {
    console.log(`DS-UPGRADE-NOOP: ${consumer.id} is already at the planned versions`)
    return
  }

  console.log(`Upgrade plan for ${consumer.id} (${consumer.repository}):`)
  console.log("  dependencies:")
  for (const { entry, current, target } of updates) {
    console.log(`    ${entry.name}: ${current} -> ${target} (${entry.bump}, ${entry.currentVersion} => ${entry.plannedVersion})`)
  }
  const migrations = relevant.flatMap((entry) =>
    entry.changes.filter((change) => change.breaking).map((change) => `${entry.name}: ${change.migration}`),
  )
  console.log(`  migrations: ${migrations.length === 0 ? "none required" : ""}`)
  for (const migration of migrations) console.log(`    - ${migration}`)
  const docs = [...new Set(relevant.flatMap((entry) => entry.changes.flatMap((change) => change.docs)))].sort()
  if (docs.length > 0) console.log(`  docs: ${docs.join(", ")}`)
  console.log("  verification:")
  for (const command of consumer.verification) console.log(`    - ${command}`)

  if (!apply) {
    const versions = relevant.map((entry) => `${entry.name.split("/")[1]}-${entry.plannedVersion}`).join("-")
    console.log(`  branch: ${consumer.branch.prefix}/${versions} (base ${consumer.branch.base})`)
    console.log(`DS-UPGRADE-OK: dry-run plan for ${consumer.id} — no files changed`)
    return
  }

  const manifestPath = resolve(consumerDir, "package.json")
  const before = readFileSync(manifestPath, "utf8")
  for (const { entry, slot, target } of updates) {
    consumerManifest[slot][entry.name] = target
  }
  writeFileSync(manifestPath, `${JSON.stringify(consumerManifest, null, 2)}\n`)

  const restore = () => writeFileSync(manifestPath, before)
  if (flags["no-install"] !== true) {
    const install = runVerification(["npm install"], consumerDir)
    if (install) {
      restore()
      return fail("DS-UPGRADE-BLOCKED", `npm install failed; ${consumer.id} restored:\n${install.output}`)
    }
  }
  const failure = runVerification(consumer.verification, consumerDir)
  if (failure) {
    restore()
    return fail("DS-UPGRADE-BLOCKED", `verification "${failure.command}" failed; ${consumer.id} restored:\n${failure.output}`)
  }
  console.log(`DS-UPGRADE-OK: applied to ${consumer.id}; verification passed`)
}
