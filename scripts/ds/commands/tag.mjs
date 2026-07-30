import { resolve } from "node:path"
import { entityTags } from "../../../packages/catalog/src/taxonomy.ts"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { catalogEntitiesFile, fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile, writeCatalogFile } from "../lib/catalog-file.mjs"

/** Add or remove a taxonomy tag on a catalog entity; validates before writing. */
export async function tag(argv) {
  const { flags } = parseFlags(argv, ["remove"])
  if (!requireFlags(flags, ["entity", "tag"], "ds:tag")) return

  const catalogFile = resolve(repoRoot, flags["catalog-file"] ?? catalogEntitiesFile)
  if (!entityTags.includes(flags.tag)) {
    return fail("DS-TAG-REFUSED", `unknown tag "${flags.tag}"; expected one of ${entityTags.join(", ")}`)
  }

  const parsed = parseCatalogFile(catalogFile)
  const entity = parsed.entities.find((candidate) => candidate.id === flags.entity)
  if (!entity) {
    return fail("DS-TAG-REFUSED", `unknown entity "${flags.entity}"`)
  }

  if (flags.remove) {
    if (!entity.tags.includes(flags.tag)) {
      console.log(`DS-TAG-OK: ${flags.entity} already lacks tag ${flags.tag}; no change`)
      return
    }
    entity.tags = entity.tags.filter((existing) => existing !== flags.tag)
  } else {
    if (entity.tags.includes(flags.tag)) {
      console.log(`DS-TAG-OK: ${flags.entity} already tagged ${flags.tag}; no change`)
      return
    }
    entity.tags = [...entity.tags, flags.tag]
  }

  writeCatalogFile(parsed)
  console.log(`DS-TAG-OK: ${flags.remove ? "removed" : "added"} ${flags.tag} on ${flags.entity}`)
}
