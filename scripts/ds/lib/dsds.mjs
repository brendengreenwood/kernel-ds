import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { basename, dirname, isAbsolute, join, resolve } from "node:path"
import Ajv2020 from "ajv/dist/2020.js"
import addFormats from "ajv-formats"
import { mapCatalogEntityContract } from "./dsds-contract.mjs"

export const INITIAL_DSDS_VERSION = "0.15.2"

export function dsdsPaths(root) {
  return {
    root,
    outputDir: join(root, "dsds"),
    fixtureFile: join(root, "scripts", "ds", "__fixtures__", "dsds", "mapping-contract.json"),
    vendorDir: join(root, "vendor", "dsds"),
    versionFile: join(root, "vendor", "dsds", "VERSION"),
    schemaFile: join(root, "vendor", "dsds", "dsds.bundled.schema.json"),
    provenanceFile: join(root, "vendor", "dsds", "provenance.json"),
  }
}

export function stableJson(value) {
  const sort = (input) => {
    if (Array.isArray(input)) return input.map(sort)
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.keys(input).sort().map((key) => [key, sort(input[key])]))
    }
    return input
  }
  return `${JSON.stringify(sort(value), null, 2)}\n`
}

export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex")
}

export function generateDsdsFiles(root) {
  const paths = dsdsPaths(root)
  const fixture = JSON.parse(readFileSync(paths.fixtureFile, "utf8"))
  const entity = fixture.entities[0]
  const mapped = mapCatalogEntityContract(entity)
  const version = readFileSync(paths.versionFile, "utf8").trim()
  const provenance = JSON.parse(readFileSync(paths.provenanceFile, "utf8"))
  return new Map([
    ["contract-sample.dsds.json", stableJson({
      $schema: provenance.schemaId,
      dsdsVersion: version,
      entity: {
        ...mapped,
        name: entity.name,
      },
    })],
  ])
}

export function writeDsdsFiles(root) {
  const paths = dsdsPaths(root)
  mkdirSync(paths.outputDir, { recursive: true })
  const files = generateDsdsFiles(root)
  for (const [name, contents] of files) writeFileSync(join(paths.outputDir, name), contents)
  return files
}

export function loadAndVerifyVendor(root) {
  const paths = dsdsPaths(root)
  const version = readFileSync(paths.versionFile, "utf8").trim()
  const schemaBytes = readFileSync(paths.schemaFile)
  const schema = JSON.parse(schemaBytes.toString("utf8"))
  const provenance = JSON.parse(readFileSync(paths.provenanceFile, "utf8"))
  const errors = []
  if (!/^\d+\.\d+\.\d+$/.test(version) || provenance.dsdsVersion !== version) errors.push("version mismatch")
  if (provenance.schemaId !== schema.$id) errors.push("schema ID mismatch")
  if (provenance.schemaSha256 !== sha256(schemaBytes)) errors.push("schema SHA-256 mismatch")
  if (!/^[0-9a-f]{40}$/.test(provenance.upstreamCommit ?? "")) errors.push("invalid upstream commit")
  if (provenance.upstreamRepository !== "somerandomdude/design-system-documentation-schema") errors.push("invalid upstream repository")
  if (errors.length > 0) throw new Error(errors.join("; "))
  return { paths, provenance, schema, version }
}

export function validateDsdsDocuments(root, documents = generateDsdsFiles(root)) {
  const { schema } = loadAndVerifyVendor(root)
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const errors = []
  for (const [name, contents] of documents) {
    const valid = validate(JSON.parse(contents))
    if (!valid) errors.push(`${name}: ${ajv.errorsText(validate.errors, { separator: "; " })}`)
  }
  if (errors.length > 0) throw new Error(errors.join("\n"))
  return documents.size
}

export function checkDsdsFiles(root) {
  const paths = dsdsPaths(root)
  const expected = generateDsdsFiles(root)
  validateDsdsDocuments(root, expected)
  const actualNames = existsSync(paths.outputDir)
    ? readdirSync(paths.outputDir).filter((name) => name.endsWith(".dsds.json")).sort()
    : []
  const expectedNames = [...expected.keys()].sort()
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error(`generated file set is stale: expected ${expectedNames.join(", ")}; found ${actualNames.join(", ") || "none"}`)
  }
  for (const [name, contents] of expected) {
    if (readFileSync(join(paths.outputDir, name), "utf8") !== contents) throw new Error(`generated output is stale: ${name}`)
  }
  return expected.size
}

export async function readJsonSource(source, root) {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`source request failed: ${response.status}`)
    return response.json()
  }
  const path = isAbsolute(source) ? source : resolve(root, source)
  return JSON.parse(readFileSync(path, "utf8"))
}

export function compareUpstream(pinned, upstream) {
  if (!/^\d+\.\d+\.\d+$/.test(upstream.version ?? "")) return { state: "ambiguous", reason: "invalid version" }
  const pinnedParts = pinned.dsdsVersion.split(".").map(Number)
  const upstreamParts = upstream.version.split(".").map(Number)
  const order = upstreamParts.findIndex((part, index) => part !== pinnedParts[index])
  const comparison = order === -1 ? 0 : upstreamParts[order] - pinnedParts[order]
  if (comparison > 0) return { state: "newer" }
  if (comparison < 0) return { state: "ambiguous", reason: "upstream version is older than the pin" }
  if (upstream.commitSha && upstream.commitSha !== pinned.upstreamCommit) return { state: "ambiguous", reason: "same version has a different commit" }
  return { state: "current" }
}

export async function readAsset(source, descriptorFile, root) {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source)
    if (!response.ok) throw new Error(`asset request failed: ${response.status} ${source}`)
    return Buffer.from(await response.arrayBuffer())
  }
  if (source.startsWith("fixture://")) {
    if (!descriptorFile) throw new Error(`fixture source requires a descriptor file: ${source}`)
    return readFileSync(join(dirname(descriptorFile), source.slice("fixture://".length)))
  }
  return readFileSync(isAbsolute(source) ? source : resolve(root, source))
}

export function sourcePath(source, root) {
  if (/^https?:\/\//.test(source)) return undefined
  return isAbsolute(source) ? source : resolve(root, source)
}

export function writeVendorUpdate(root, upstream, assets) {
  const paths = dsdsPaths(root)
  mkdirSync(paths.vendorDir, { recursive: true })
  writeFileSync(paths.schemaFile, assets.schema)
  writeFileSync(join(paths.vendorDir, "LICENSE"), assets.license)
  writeFileSync(join(paths.vendorDir, "MIGRATION.md"), assets.migration)
  writeFileSync(paths.versionFile, `${upstream.version}\n`)
  const schema = JSON.parse(assets.schema.toString("utf8"))
  const provenance = {
    dsdsVersion: upstream.version,
    schemaId: schema.$id,
    schemaSha256: sha256(assets.schema),
    sourceUrl: upstream.schemaUrl,
    upstreamCommit: upstream.commitSha,
    upstreamRepository: "somerandomdude/design-system-documentation-schema",
    retrievedAt: new Date().toISOString().slice(0, 10),
  }
  writeFileSync(paths.provenanceFile, stableJson(provenance))
  return basename(paths.schemaFile)
}
