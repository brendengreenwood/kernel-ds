#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { parseFlags } from "./lib/args.mjs"
import { repoRoot } from "./lib/context.mjs"
import {
  checkDsdsFiles,
  compareUpstream,
  dsdsPaths,
  loadAndVerifyVendor,
  readAsset,
  readJsonSource,
  sourcePath,
  validateDsdsDocuments,
  writeDsdsFiles,
  writeVendorUpdate,
} from "./lib/dsds.mjs"

function fail(code, error) {
  console.error(`${code}: ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
}

function commandRoot(flags) {
  return flags.root ? resolve(String(flags.root)) : repoRoot
}

async function generate(flags) {
  const root = commandRoot(flags)
  const files = writeDsdsFiles(root)
  validateDsdsDocuments(root, files)
  console.log(`DSDS-GENERATE-OK: ${files.size} deterministic document generated for ${loadAndVerifyVendor(root).version}`)
}

async function check(flags) {
  const root = commandRoot(flags)
  const count = checkDsdsFiles(root)
  console.log(`DSDS-CHECK-OK: ${count} document current; pinned schema and provenance verified offline`)
}

async function status(flags) {
  const root = commandRoot(flags)
  const source = String(flags.source ?? "https://registry.npmjs.org/design-system-documentation-schema/latest")
  const pinned = loadAndVerifyVendor(root).provenance
  const upstream = await readJsonSource(source, root)
  const result = compareUpstream(pinned, upstream)
  const detail = result.reason ? ` — ${result.reason}` : ""
  console.log(`DSDS-STATUS-${result.state.toUpperCase()}: pinned ${pinned.dsdsVersion}; upstream ${upstream.version ?? "unknown"}${detail}`)
  if (result.state === "ambiguous") process.exitCode = 2
}

async function update(flags) {
  const root = commandRoot(flags)
  if (!flags.source || flags.source === true) throw new Error("dsds:update requires --source <descriptor.json>")
  const descriptorPath = sourcePath(String(flags.source), root)
  const upstream = await readJsonSource(String(flags.source), root)
  const pinned = loadAndVerifyVendor(root).provenance
  const comparison = compareUpstream(pinned, upstream)
  if (comparison.state === "ambiguous") throw new Error(`upstream release is ambiguous: ${comparison.reason}`)
  if (!upstream.commitSha || !/^[0-9a-f]{40}$/.test(upstream.commitSha)) throw new Error("upstream descriptor requires an exact 40-character commit SHA")
  for (const key of ["schemaUrl", "licenseUrl", "migrationUrl"]) {
    if (!upstream[key]) throw new Error(`upstream descriptor requires ${key}`)
  }

  const assets = {
    schema: await readAsset(upstream.schemaUrl, descriptorPath, root),
    license: await readAsset(upstream.licenseUrl, descriptorPath, root),
    migration: await readAsset(upstream.migrationUrl, descriptorPath, root),
  }
  const schema = JSON.parse(assets.schema.toString("utf8"))
  if (schema.$id !== upstream.schemaId || !schema.$id.includes(`/v${upstream.version}/`)) {
    throw new Error("upstream schema ID does not match the descriptor version")
  }
  if (assets.migration.length === 0) throw new Error("upstream migration guide is empty")

  const staging = mkdtempSync(join(tmpdir(), "kernel-dsds-update-"))
  try {
    writeVendorUpdate(staging, upstream, assets)
    const staged = dsdsPaths(staging)
    JSON.parse(readFileSync(staged.schemaFile, "utf8"))
    if (flags["dry-run"]) {
      console.log(`DSDS-UPDATE-DRY-RUN: verified ${upstream.version} from ${upstream.commitSha}; repository unchanged`)
      return
    }
    writeVendorUpdate(root, upstream, assets)
    const files = writeDsdsFiles(root)
    validateDsdsDocuments(root, files)
    console.log(`DSDS-UPDATE-OK: staged ${upstream.version}; review vendored schema, provenance, migration guide, and generated diffs before committing`)
  } finally {
    rmSync(staging, { recursive: true, force: true })
  }
}

const [name, ...argv] = process.argv.slice(2)
const { flags, positional } = parseFlags(argv, ["dry-run"])
if (positional.length > 0) {
  fail("DSDS-USAGE", `unexpected positional arguments: ${positional.join(" ")}`)
} else {
  const commands = { generate, check, status, update }
  const command = commands[name]
  if (!command) {
    fail("DSDS-USAGE", `unknown command "${name ?? ""}"; commands: ${Object.keys(commands).join(", ")}`)
  } else {
    try {
      await command(flags)
    } catch (error) {
      fail(`DSDS-${name.toUpperCase()}-FAILED`, error)
    }
  }
}
