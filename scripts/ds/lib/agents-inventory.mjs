import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { repoRoot } from "./context.mjs"

export const START_MARKER = "<!-- kernel-ds:generated:start -->"
export const END_MARKER = "<!-- kernel-ds:generated:end -->"

const GENERATED_HEADING =
  "## Generated inventory (do not edit — regenerate with `npm run agents:generate`)"

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

function countBy(items, key) {
  const counts = new Map()
  for (const item of items) {
    const value = key(item)
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))
}

function formatCounts(counts) {
  return counts.map(([name, count]) => `${name} ${count}`).join(", ")
}

async function loadEntities() {
  const { catalog } = await import("../../../packages/catalog/src/entities.ts")
  return catalog
}

function kernelDeps(appDir) {
  const manifest = readJson(resolve(repoRoot, appDir, "package.json"))
  return Object.entries(manifest.dependencies ?? {})
    .filter(([name]) => name.startsWith("@kernel/"))
    .map(([name, spec]) => `${name} (${spec})`)
    .sort()
}

function dsScripts() {
  const manifest = readJson(resolve(repoRoot, "package.json"))
  return Object.keys(manifest.scripts)
    .filter((name) => ["ds:", "agents:", "skills:", "release:", "changeset:"].some((prefix) => name.startsWith(prefix)))
    .sort()
}

function skillNames() {
  const dir = resolve(repoRoot, ".agents/skills")
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(dir, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort()
}

/**
 * Inventory builders per AGENTS.md target. Content must be deterministic:
 * everything derives from the catalog, package manifests, generated API
 * inventories, and the command registries — sorted where order is not defined.
 */
export async function buildInventories() {
  const entities = await loadEntities()
  const uiApi = readJson(resolve(repoRoot, "packages/ui/api.json"))
  const definitionsApi = readJson(resolve(repoRoot, "packages/definitions/api.json"))
  const uiManifest = readJson(resolve(repoRoot, "packages/ui/package.json"))
  // Unique documentation slugs — the same predicate check-catalog.mjs reports.
  const documentationRecords = new Set(
    entities.flatMap((entity) => (entity.documentation?.slug ? [entity.documentation.slug] : [])),
  ).size

  const { generateSteps } = await import("../commands/generate.mjs")
  const { verifyGates } = await import("../commands/verify.mjs")
  const { doctorChecks } = await import("../commands/doctor.mjs")

  return [
    {
      file: "AGENTS.md",
      lines: [
        `Catalog: ${entities.length} entities (${formatCounts(countBy(entities, (entity) => entity.kind))}); ${documentationRecords} documentation records`,
        `Workspace packages: @kernel/catalog, @kernel/definitions (${Object.keys(definitionsApi.exports).length} export entries), @kernel/ui (${Object.keys(uiManifest.exports).length} export entries)`,
        `DS lifecycle scripts: ${dsScripts().join(", ")}`,
        `Skills: ${skillNames().join(", ")}`,
      ],
    },
    {
      file: "packages/catalog/AGENTS.md",
      lines: [
        `Entities: ${entities.length} — by kind: ${formatCounts(countBy(entities, (entity) => entity.kind))}`,
        `By maturity: ${formatCounts(countBy(entities, (entity) => entity.maturity))}`,
        `By package owner: ${formatCounts(countBy(entities, (entity) => entity.package))}`,
        `Documentation records: ${documentationRecords}`,
      ],
    },
    {
      file: "packages/ui/AGENTS.md",
      lines: [
        `Export entries: ${Object.keys(uiManifest.exports).sort().join(", ")}`,
        `Root-entry modules: ${uiApi.modules.length} (${uiApi.modules.filter((module) => module.catalogBacked).length} catalog-backed)`,
        `Catalog entities owned: ${entities.filter((entity) => entity.package === "@kernel/ui").length}`,
      ],
    },
    {
      file: "packages/definitions/AGENTS.md",
      lines: [
        ...Object.entries(definitionsApi.exports).map(
          ([entry, symbols]) => `Export \`${entry}\`: ${symbols.join(", ")}`,
        ),
        `Catalog entities owned: ${entities.filter((entity) => entity.package === "@kernel/definitions").length}`,
      ],
    },
    {
      file: "kernel-portal/AGENTS.md",
      lines: [
        `Consumes: ${kernelDeps("kernel-portal").join(", ")}`,
        `Catalog entities owned: ${entities.filter((entity) => entity.package === "kernel-portal").length}`,
      ],
    },
    {
      file: "kernel-studio-server/AGENTS.md",
      lines: [`Consumes: ${kernelDeps("kernel-studio-server").join(", ")}`],
    },
    {
      file: "scripts/ds/AGENTS.md",
      lines: [
        `Root scripts: ${dsScripts().join(", ")}`,
        `Generate order: ${generateSteps.map((step) => step.id).join(" → ")}`,
        `Verify gates: ${verifyGates.map((gate) => gate.id).join(", ")}`,
        `Doctor checks: ${doctorChecks.map((check) => check.id).join(", ")}`,
      ],
    },
  ]
}

function renderBlock(lines) {
  return `${GENERATED_HEADING}\n\n${lines.map((line) => `- ${line}`).join("\n")}`
}

/**
 * Replace only the bounded marker section. Hand-authored prose outside the
 * markers is preserved byte-for-byte; when no markers exist yet, a new bounded
 * section is appended at the end of the file.
 */
export function applyMarkers(content, lines) {
  const eol = content.includes("\r\n") ? "\r\n" : "\n"
  const block = `${START_MARKER}\n${renderBlock(lines)}\n${END_MARKER}`.replaceAll("\n", eol)
  const startIndex = content.indexOf(START_MARKER)
  const endIndex = content.indexOf(END_MARKER)
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return content.slice(0, startIndex) + block + content.slice(endIndex + END_MARKER.length)
  }
  if (startIndex !== -1 || endIndex !== -1) {
    throw new Error("Unbalanced kernel-ds generated markers")
  }
  const trimmed = content.endsWith(eol) ? content : content + eol
  return trimmed + eol + block + eol
}
