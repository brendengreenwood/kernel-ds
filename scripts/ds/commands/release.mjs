import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { parseFlags } from "../lib/args.mjs"
import { fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile } from "../lib/catalog-file.mjs"
import {
  bumpVersion,
  expandEntities,
  manifestSchemaId,
  maxBump,
  metadataClassifications,
  packageEntityIds,
  readChangesets,
  validateChangesetMeta,
  validateImpactManifest,
} from "../lib/release-meta.mjs"

const registry = "https://npm.pkg.github.com"
const publishablePackages = ["@kernel/ui", "@kernel/definitions"]

function loadCatalogEntities() {
  return parseCatalogFile(resolve(repoRoot, "packages/catalog/src/entities.ts")).entities
}

function workspaceManifests() {
  const packagesDir = resolve(repoRoot, "packages")
  const manifests = new Map()
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const manifest = JSON.parse(readFileSync(resolve(packagesDir, entry.name, "package.json"), "utf8"))
    manifests.set(manifest.name, { dir: entry.name, manifest })
  }
  return manifests
}

function collectValidatedChangesets(dir, entities) {
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]))
  const parsed = readChangesets(dir)
  const violations = parsed.flatMap((changeset) => validateChangesetMeta(changeset, entitiesById))
  return { parsed, violations }
}

/**
 * Build the machine-readable impact manifest from pending changesets plus
 * catalog relationships. Deterministic: sorted packages, changes ordered by
 * changeset filename, sorted entity lists, no timestamps.
 */
export async function releaseImpact(argv) {
  const { flags } = parseFlags(argv, ["print"])
  const dir = resolve(repoRoot, flags.dir ?? ".changeset")
  const out = resolve(repoRoot, flags.out ?? ".release/impact-manifest.json")

  const entities = loadCatalogEntities()
  const manifests = workspaceManifests()
  const { parsed, violations } = collectValidatedChangesets(dir, entities)
  if (violations.length > 0) {
    for (const violation of violations) console.error(`  - ${violation}`)
    return fail("RELEASE-IMPACT-FAILED", `${violations.length} changeset violation(s); fix release metadata first`)
  }
  if (parsed.length === 0) {
    console.log("RELEASE-IMPACT-OK: no pending changesets; nothing to release")
    return
  }

  const byPackage = new Map()
  for (const changeset of parsed) {
    for (const release of changeset.releases) {
      if (!manifests.has(release.name)) {
        return fail("RELEASE-IMPACT-FAILED", `${changeset.file} releases unknown package "${release.name}"`)
      }
      if (!byPackage.has(release.name)) byPackage.set(release.name, [])
      byPackage.get(release.name).push({ changeset, bump: release.bump })
    }
  }

  const docsByEntity = new Map(entities.map((entity) => [entity.id, entity.documentation.portalAnchor]))
  const packages = [...byPackage.keys()].sort().map((name) => {
    const { manifest } = manifests.get(name)
    const entriesForPackage = byPackage.get(name)
    const bump = maxBump(entriesForPackage.map((entry) => entry.bump))
    const changes = entriesForPackage
      .sort((a, b) => a.changeset.file.localeCompare(b.changeset.file))
      .map(({ changeset }) => {
        const meta = changeset.meta
        const declared =
          meta.scope === "package" ? packageEntityIds(name, entities) : [...(meta.entities ?? [])].sort()
        const affected = metadataClassifications.includes(meta.classification)
          ? expandEntities(declared, entities)
          : []
        return {
          changeset: changeset.file,
          summary: changeset.summary,
          classification: meta.classification,
          breaking: meta.breaking === true,
          migration: meta.breaking === true ? meta.migration : null,
          entities: declared,
          affectedEntities: affected,
          docs: affected.map((id) => docsByEntity.get(id)).filter(Boolean).sort(),
        }
      })
    return {
      name,
      currentVersion: manifest.version,
      bump,
      plannedVersion: bumpVersion(manifest.version, bump),
      registry,
      peerDependencies: manifest.peerDependencies ?? {},
      verification: [
        "npm run ds:verify -- --all",
        "npm run ds:pack",
        "node .mastracode/plans/kernel-ds-productionization.proof/scripts/pack-and-install.mjs",
      ],
      changes,
    }
  })

  const manifest = {
    schema: manifestSchemaId,
    changesets: parsed.map((changeset) => changeset.file),
    packages,
  }
  const schemaIssues = validateImpactManifest(manifest)
  if (schemaIssues.length > 0) {
    for (const issue of schemaIssues) console.error(`  - ${issue}`)
    return fail("RELEASE-IMPACT-FAILED", "generated manifest failed its own schema validation")
  }

  const serialized = `${JSON.stringify(manifest, null, 2)}\n`
  if (flags.print) process.stdout.write(serialized)
  mkdirSync(resolve(out, ".."), { recursive: true })
  writeFileSync(out, serialized)
  const summary = packages.map((entry) => `${entry.name}@${entry.plannedVersion} (${entry.bump})`).join(", ")
  console.log(`RELEASE-IMPACT-OK: ${out} — ${summary}`)
}

/**
 * Version the workspace with @changesets/cli inside a temporary copy so the
 * working tree is never mutated. Returns the planned versions per package.
 */
function versionDryRun(changesetDir, manifests) {
  const temp = mkdtempSync(join(tmpdir(), "ds-release-dryrun-"))
  try {
    const rootManifest = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"))
    writeFileSync(
      resolve(temp, "package.json"),
      JSON.stringify({ name: rootManifest.name, private: true, version: "0.0.0", workspaces: ["packages/*"] }, null, 2),
    )
    mkdirSync(resolve(temp, ".changeset"), { recursive: true })
    cpSync(resolve(repoRoot, ".changeset/config.json"), resolve(temp, ".changeset/config.json"))
    for (const name of readdirSync(changesetDir)) {
      if (name.endsWith(".md") && name !== "README.md") cpSync(resolve(changesetDir, name), resolve(temp, ".changeset", name))
    }
    for (const { dir, manifest } of manifests.values()) {
      mkdirSync(resolve(temp, "packages", dir), { recursive: true })
      writeFileSync(resolve(temp, "packages", dir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`)
    }
    const changesetBin = resolve(repoRoot, "node_modules/@changesets/cli/bin.js")
    const result = spawnSync(process.execPath, [changesetBin, "version"], { cwd: temp, encoding: "utf8" })
    if (result.status !== 0) {
      return { error: `changeset version failed in dry-run worktree:\n${result.stdout}${result.stderr}` }
    }
    const versions = {}
    for (const { dir, manifest } of manifests.values()) {
      versions[manifest.name] = JSON.parse(readFileSync(resolve(temp, "packages", dir, "package.json"), "utf8")).version
    }
    return { versions }
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

/** Scan committed config surfaces for registry credentials. */
function committedCredentialViolations() {
  const listing = spawnSync(process.platform === "win32" ? "git.exe" : "git", ["ls-files"], {
    cwd: repoRoot,
    encoding: "utf8",
  })
  if (listing.status !== 0) return ["git ls-files failed; cannot prove no credentials are committed"]
  const suspects = listing.stdout
    .split("\n")
    .filter((name) => /(^|\/)\.npmrc$|\.ya?ml$|(^|\/)\.changeset\/|(^|\/)package\.json$/.test(name))
  const violations = []
  for (const name of suspects) {
    const content = readFileSync(resolve(repoRoot, name), "utf8")
    if (/_authToken\s*=\s*(?!\$\{)\S/.test(content) || /(ghp|gho|ghs)_[A-Za-z0-9]{20,}/.test(content)) {
      violations.push(`${name} contains what looks like a registry credential`)
    }
  }
  return violations
}

/**
 * Release gate: release metadata policy, publishable package configuration,
 * no committed credentials, and a mutation-free version dry-run.
 */
export async function releaseCheck(argv) {
  const { flags } = parseFlags(argv)
  const dir = resolve(repoRoot, flags.dir ?? ".changeset")
  const entities = loadCatalogEntities()
  const manifests = workspaceManifests()
  const problems = []

  const { parsed, violations } = collectValidatedChangesets(dir, entities)
  problems.push(...violations)

  for (const name of publishablePackages) {
    const entry = manifests.get(name)
    if (!entry) {
      problems.push(`publishable package ${name} is missing from the workspace`)
      continue
    }
    const { manifest } = entry
    if (manifest.private) problems.push(`${name} must not be private; it publishes to GitHub Packages`)
    if (manifest.publishConfig?.registry !== registry) {
      problems.push(`${name} publishConfig.registry must be ${registry}`)
    }
    if (manifest.publishConfig?.access !== "restricted") {
      problems.push(`${name} publishConfig.access must be "restricted" (private GitHub Packages)`)
    }
  }
  const catalog = manifests.get("@kernel/catalog")
  if (catalog && catalog.manifest.private !== true) {
    problems.push("@kernel/catalog is internal tooling and must stay private")
  }

  problems.push(...committedCredentialViolations())

  let plannedSummary = "no pending changesets"
  if (parsed.length > 0 && problems.length === 0) {
    const dryRun = versionDryRun(dir, manifests)
    if (dryRun.error) {
      problems.push(dryRun.error)
    } else {
      plannedSummary = Object.entries(dryRun.versions)
        .filter(([name, version]) => manifests.get(name).manifest.version !== version)
        .map(([name, version]) => `${name} ${manifests.get(name).manifest.version} -> ${version}`)
        .sort()
        .join(", ")
      if (flags["expect-versions"]) {
        // Test hook: assert the dry run produced exactly these bumps.
        const expected = String(flags["expect-versions"])
        if (plannedSummary !== expected) {
          problems.push(`dry-run versions "${plannedSummary}" do not match expected "${expected}"`)
        }
      }
    }
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(`  - ${problem}`)
    return fail("RELEASE-CHECK-FAILED", `${problems.length} violation(s)`)
  }
  console.log(`RELEASE-CHECK-OK: ${parsed.length} changeset(s) valid; ${plannedSummary}`)
}

/**
 * Release orchestration: gate -> impact manifest -> pack -> release record ->
 * dry-run upgrade propagation for every opted-in managed consumer. Publishing
 * is an explicit mode (--publish) and refuses to start without registry
 * credentials; everything before it works credential-free.
 */
export async function releaseRun(argv) {
  const { flags } = parseFlags(argv, ["publish"])
  const { fileURLToPath } = await import("node:url")
  const { runNode } = await import("../lib/context.mjs")
  const { defaultRegistryFile, loadRegistry, validateRegistry } = await import("../lib/consumers.mjs")
  const cliFile = resolve(fileURLToPath(import.meta.url), "../../cli.mjs")

  if (flags.publish === true && !process.env.NODE_AUTH_TOKEN) {
    return fail(
      "DS-RELEASE-REFUSED",
      "publish mode requires NODE_AUTH_TOKEN for GitHub Packages; nothing was published (dry-run needs no credentials)",
    )
  }

  const registry = loadRegistry(defaultRegistryFile)
  const registryIssues = validateRegistry(registry)
  if (registryIssues.length > 0) {
    for (const issue of registryIssues) console.error(`  - ${issue}`)
    return fail("DS-RELEASE-BLOCKED", "consumer registry invalid; fix scripts/ds/consumers.json first")
  }

  const steps = [
    ["release-check", ["release-check"]],
    ["release-impact", ["release-impact"]],
    ["pack", ["pack"]],
  ]
  for (const [label, args] of steps) {
    const result = runNode(cliFile, args)
    if (result.status !== 0) return fail("DS-RELEASE-BLOCKED", `${label} failed; releasing is not allowed`)
  }

  const manifestFile = resolve(repoRoot, ".release/impact-manifest.json")
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"))
  const record = {
    schema: "kernel-ds/release-record@1",
    mode: flags.publish === true ? "publish" : "dry-run",
    changesets: manifest.changesets,
    packages: manifest.packages.map((entry) => ({
      name: entry.name,
      version: entry.plannedVersion,
      registry: entry.registry,
    })),
  }
  const recordFile = resolve(repoRoot, ".release/release-record.json")
  writeFileSync(recordFile, `${JSON.stringify(record, null, 2)}\n`)

  for (const consumer of registry.consumers.filter((entry) => entry.optIn)) {
    const propagation = runNode(cliFile, ["upgrade", "--consumer", consumer.id, "--dry-run"])
    if (propagation.status !== 0) {
      return fail("DS-RELEASE-BLOCKED", `upgrade propagation plan failed for ${consumer.id}`)
    }
  }

  if (flags.publish === true) {
    const changesetBin = resolve(repoRoot, "node_modules/@changesets/cli/bin.js")
    const publish = spawnSync(process.execPath, [changesetBin, "publish"], { cwd: repoRoot, stdio: "inherit" })
    if (publish.status !== 0) return fail("DS-RELEASE-FAILED", "changeset publish failed; see output above")
    console.log(`DS-RELEASE-OK: published ${record.packages.map((entry) => `${entry.name}@${entry.version}`).join(", ")}`)
    return
  }
  console.log(
    `DS-RELEASE-OK: dry-run complete — ${record.packages.map((entry) => `${entry.name}@${entry.version}`).join(", ")}; record at ${recordFile}`,
  )
}
