import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile } from "../lib/catalog-file.mjs"
import { classifications, metadataClassifications } from "../lib/release-meta.mjs"

const bumps = ["patch", "minor", "major"]

function workspacePackageNames() {
  const packagesDir = resolve(repoRoot, "packages")
  const names = []
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    names.push(JSON.parse(readFileSync(resolve(packagesDir, entry.name, "package.json"), "utf8")).name)
  }
  return names
}

/**
 * Write a Changesets-format release note noninteractively, carrying kernel-ds
 * release metadata in an embedded comment block. Runtime/API changes must name
 * affected catalog entities (or declare whole-package scope); breaking changes
 * must ship a migration; docs/internal classifications are the explicit
 * exemption path. The filename is a content hash, so reruns are idempotent.
 */
export async function changeset(argv) {
  const { flags } = parseFlags(argv, ["breaking"])
  if (!requireFlags(flags, ["package", "bump", "summary", "classification"], "ds:changeset")) return

  const names = workspacePackageNames()
  if (!names.includes(flags.package)) {
    return fail("DS-CHANGESET-REFUSED", `unknown package "${flags.package}"; expected one of ${names.join(", ")}`)
  }
  if (!bumps.includes(flags.bump)) {
    return fail("DS-CHANGESET-REFUSED", `unknown bump "${flags.bump}"; expected one of ${bumps.join(", ")}`)
  }
  if (!String(flags.summary).trim()) {
    return fail("DS-CHANGESET-REFUSED", "summary must not be empty")
  }
  if (!classifications.includes(flags.classification)) {
    return fail("DS-CHANGESET-REFUSED", `unknown classification "${flags.classification}"; expected one of ${classifications.join(", ")}`)
  }

  const breaking = flags.breaking === true
  const migration = typeof flags.migration === "string" ? flags.migration.trim() : ""
  if (breaking && !migration) {
    return fail("DS-CHANGESET-REFUSED", "breaking changes require --migration <description>")
  }

  const scope = flags.scope === "package" ? "package" : "entities"
  const entities = typeof flags.entities === "string" ? flags.entities.split(",").map((id) => id.trim()).filter(Boolean) : []
  if (metadataClassifications.includes(flags.classification) && scope !== "package" && entities.length === 0) {
    return fail(
      "DS-CHANGESET-REFUSED",
      `${flags.classification} changes require --entities <catalog ids> or --scope package; docs/internal classifications are exempt`,
    )
  }
  if (entities.length > 0) {
    const catalog = parseCatalogFile(resolve(repoRoot, "packages/catalog/src/entities.ts"))
    const known = new Set(catalog.entities.map((entity) => entity.id))
    const unknown = entities.filter((id) => !known.has(id))
    if (unknown.length > 0) {
      return fail("DS-CHANGESET-REFUSED", `unknown catalog entities: ${unknown.join(", ")}`)
    }
  }

  const meta = {
    classification: flags.classification,
    breaking,
    ...(breaking ? { migration } : {}),
    ...(scope === "package" ? { scope: "package" } : { entities }),
  }
  const content = `---\n"${flags.package}": ${flags.bump}\n---\n\n${String(flags.summary).trim()}\n\n<!-- kernel-ds:release-meta\n${JSON.stringify(meta)}\n-->\n`
  const digest = createHash("sha256").update(content).digest("hex").slice(0, 8)
  const slug = flags.package.replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, "")
  const dir = resolve(repoRoot, flags.dir ?? ".changeset")
  const file = resolve(dir, `${slug}-${flags.bump}-${digest}.md`)

  if (existsSync(file)) {
    console.log(`DS-CHANGESET-OK: ${file} already records this change; no write`)
    return
  }
  mkdirSync(dir, { recursive: true })
  writeFileSync(file, content)
  console.log(`DS-CHANGESET-OK: wrote ${file}`)
}
