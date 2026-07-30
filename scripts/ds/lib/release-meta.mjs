import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

export const classifications = ["runtime", "api", "docs", "internal"]
export const metadataClassifications = ["runtime", "api"]
export const bumpOrder = ["patch", "minor", "major"]

const metaBlockPattern = /<!--\s*kernel-ds:release-meta\n([\s\S]*?)\n-->/

/**
 * Parse one Changesets-format markdown file plus the kernel-ds release
 * metadata block embedded in its body. The metadata block is an HTML comment
 * so the file stays fully compatible with @changesets/cli.
 */
export function parseChangesetFile(path, fileName) {
  // Normalize CRLF so checkouts with core.autocrlf=true parse identically.
  const raw = readFileSync(path, "utf8").replaceAll("\r\n", "\n")
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (!frontmatter) return { file: fileName, error: "missing changesets frontmatter" }

  const releases = []
  for (const line of frontmatter[1].split("\n")) {
    const entry = line.match(/^"([^"]+)":\s*(patch|minor|major)\s*$/)
    if (entry) releases.push({ name: entry[1], bump: entry[2] })
  }
  if (releases.length === 0) return { file: fileName, error: "frontmatter declares no package releases" }

  const body = raw.slice(frontmatter[0].length)
  const metaMatch = body.match(metaBlockPattern)
  let meta = null
  if (metaMatch) {
    try {
      meta = JSON.parse(metaMatch[1])
    } catch (cause) {
      return { file: fileName, error: `release-meta block is not valid JSON: ${cause.message}` }
    }
  }
  const summary = body.replace(metaBlockPattern, "").trim()
  return { file: fileName, releases, summary, meta }
}

/** Read every changeset in a directory, sorted by filename for determinism. */
export function readChangesets(dir) {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .sort()
  return files.map((name) => parseChangesetFile(resolve(dir, name), name))
}

/**
 * Release-metadata policy: every changeset must carry an explicit
 * classification; runtime/api changes must name affected catalog entities (or
 * declare whole-package scope); breaking changes must ship a migration.
 * docs/internal classifications are the explicit exemption path.
 */
export function validateChangesetMeta(parsed, entitiesById) {
  const violations = []
  const where = parsed.file
  if (parsed.error) return [`${where}: ${parsed.error}`]
  if (!parsed.summary) violations.push(`${where}: summary must not be empty`)

  const meta = parsed.meta
  if (!meta) return [...violations, `${where}: missing kernel-ds:release-meta block (classification required)`]

  if (!classifications.includes(meta.classification)) {
    violations.push(`${where}: classification "${meta.classification}" is not one of ${classifications.join(", ")}`)
    return violations
  }
  if (typeof meta.breaking !== "boolean") {
    violations.push(`${where}: breaking must be true or false`)
  }
  if (meta.breaking === true && !(typeof meta.migration === "string" && meta.migration.trim())) {
    violations.push(`${where}: breaking change requires a migration description`)
  }
  if (metadataClassifications.includes(meta.classification)) {
    const scoped = meta.scope === "package"
    const entities = Array.isArray(meta.entities) ? meta.entities : []
    if (!scoped && entities.length === 0) {
      violations.push(`${where}: ${meta.classification} change requires affected entities or scope "package"`)
    }
    for (const id of entities) {
      if (!entitiesById.has(id)) violations.push(`${where}: unknown catalog entity "${id}"`)
    }
  }
  return violations
}

/**
 * One-hop relationship expansion: the declared entities, everything they
 * relate to, and everything that relates to them. Sorted and unique so the
 * impact manifest is deterministic.
 */
export function expandEntities(entityIds, entities) {
  const affected = new Set(entityIds)
  for (const entity of entities) {
    for (const relationship of entity.relationships) {
      if (entityIds.includes(entity.id)) affected.add(relationship.target)
      if (entityIds.includes(relationship.target)) affected.add(entity.id)
    }
  }
  return [...affected].sort()
}

/** All catalog entities owned by a package, for scope "package" changesets. */
export function packageEntityIds(packageName, entities) {
  return entities
    .filter((entity) => entity.package === packageName)
    .map((entity) => entity.id)
    .sort()
}

export function maxBump(bumps) {
  return bumps.reduce((highest, bump) => (bumpOrder.indexOf(bump) > bumpOrder.indexOf(highest) ? bump : highest), "patch")
}

/** Plain semver increment, matching what `changeset version` applies. */
export function bumpVersion(version, bump) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) throw new Error(`"${version}" is not a plain semver version`)
  const [major, minor, patch] = match.slice(1).map(Number)
  if (bump === "major") return `${major + 1}.0.0`
  if (bump === "minor") return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

const manifestSchemaId = "kernel-ds/impact-manifest@1"

/** Structural validation for the machine-readable impact manifest. */
export function validateImpactManifest(manifest) {
  const issues = []
  const push = (message) => issues.push(message)
  if (manifest.schema !== manifestSchemaId) push(`schema must be "${manifestSchemaId}"`)
  if (!Array.isArray(manifest.changesets)) push("changesets must be an array of filenames")
  if (!Array.isArray(manifest.packages)) return [...issues, "packages must be an array"]
  for (const entry of manifest.packages) {
    const where = entry.name ?? "<unnamed package>"
    for (const key of ["name", "currentVersion", "bump", "plannedVersion", "registry"]) {
      if (typeof entry[key] !== "string" || !entry[key]) push(`${where}: ${key} must be a non-empty string`)
    }
    if (!Array.isArray(entry.verification) || entry.verification.length === 0) {
      push(`${where}: verification commands are required`)
    }
    if (!Array.isArray(entry.changes) || entry.changes.length === 0) {
      push(`${where}: changes must be a non-empty array`)
      continue
    }
    for (const change of entry.changes) {
      if (typeof change.changeset !== "string") push(`${where}: change.changeset must be a filename`)
      if (!classifications.includes(change.classification)) push(`${where}: change.classification invalid`)
      if (typeof change.breaking !== "boolean") push(`${where}: change.breaking must be boolean`)
      if (change.breaking && typeof change.migration !== "string") push(`${where}: breaking change lost its migration`)
      if (!Array.isArray(change.affectedEntities)) push(`${where}: change.affectedEntities must be an array`)
      if (!Array.isArray(change.docs)) push(`${where}: change.docs must be an array`)
    }
  }
  return issues
}

export { manifestSchemaId }
