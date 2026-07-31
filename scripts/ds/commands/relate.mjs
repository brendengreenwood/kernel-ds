import { resolve } from "node:path"
import { relationshipTypes } from "../../../packages/catalog/src/taxonomy.ts"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { catalogEntitiesFile, fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile, writeCatalogFile } from "../lib/catalog-file.mjs"

/** Record a typed relationship between two catalog entities; validates type and target first. */
export async function relate(argv) {
  const { flags } = parseFlags(argv)
  if (!requireFlags(flags, ["entity", "type", "target"], "ds:relate")) return

  const catalogFile = resolve(repoRoot, flags["catalog-file"] ?? catalogEntitiesFile)
  if (!relationshipTypes.includes(flags.type)) {
    return fail("DS-RELATE-REFUSED", `unknown relationship type "${flags.type}"; expected one of ${relationshipTypes.join(", ")}`)
  }

  const parsed = parseCatalogFile(catalogFile)
  const entity = parsed.entities.find((candidate) => candidate.id === flags.entity)
  if (!entity) {
    return fail("DS-RELATE-REFUSED", `unknown entity "${flags.entity}"`)
  }
  if (!parsed.entities.some((candidate) => candidate.id === flags.target)) {
    return fail("DS-RELATE-REFUSED", `relationship target "${flags.target}" is not a catalog entity`)
  }

  if (entity.relationships.some((existing) => existing.type === flags.type && existing.target === flags.target)) {
    console.log(`DS-RELATE-OK: ${flags.entity} already has ${flags.type} → ${flags.target}; no change`)
    return
  }

  entity.relationships = [...entity.relationships, { type: flags.type, target: flags.target }]
  writeCatalogFile(parsed)
  console.log(`DS-RELATE-OK: ${flags.entity} ${flags.type} → ${flags.target}`)
}
