import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const ARRAY_OPEN = "export const catalog = ["
const ARRAY_CLOSE = "] as const satisfies readonly CatalogEntity[]"

/** Deterministic entity order: kind ladder (decision 0057), then id. */
const kindOrder = { component: 0, element: 1, pattern: 2, domain: 3, object: 4 }

export function sortEntities(entities) {
  return [...entities].sort(
    (left, right) => (kindOrder[left.kind] ?? 9) - (kindOrder[right.kind] ?? 9) || left.id.localeCompare(right.id),
  )
}

/**
 * Parse a canonical catalog entities file. The entity array is strict JSON by
 * convention (quoted keys, two-space indent), so the file round-trips through
 * JSON byte-for-byte; `scripts/ds/__check__.mjs` proves that invariant.
 */
export function parseCatalogText(raw, path = "<catalog>") {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n"
  const text = eol === "\r\n" ? raw.replaceAll("\r\n", "\n") : raw
  const openIndex = text.indexOf(ARRAY_OPEN)
  const closeIndex = text.lastIndexOf(ARRAY_CLOSE)
  if (openIndex === -1 || closeIndex === -1) {
    throw new Error(`Unrecognized catalog file shape: ${path}`)
  }
  const bracketStart = openIndex + ARRAY_OPEN.length - 1
  const entities = JSON.parse(text.slice(bracketStart, closeIndex + 1))
  return {
    path,
    eol,
    header: text.slice(0, bracketStart),
    footer: text.slice(closeIndex + 1),
    entities,
  }
}

export function parseCatalogFile(path) {
  return parseCatalogText(readFileSync(path, "utf8"), path)
}

export function serializeCatalogFile(parsed) {
  const body = parsed.header + JSON.stringify(parsed.entities, null, 2) + parsed.footer
  return parsed.eol === "\r\n" ? body.replaceAll("\n", "\r\n") : body
}

/* ----------------------------------------------------------------------------
 * Per-entity JSON store. The source of truth is one `<id>.json` file per
 * entity in the `entities/` directory next to `entities.ts`; `entities.ts`
 * is generated from the store (sorted by kind ladder then id) so every
 * existing consumer keeps importing the same typed array.
 * ------------------------------------------------------------------------- */

/** The store directory for a given entities.ts path (fixtures have none). */
export function catalogStoreDir(entitiesFilePath) {
  return join(dirname(entitiesFilePath), "entities")
}

export function hasCatalogStore(entitiesFilePath) {
  return existsSync(catalogStoreDir(entitiesFilePath))
}

export function readCatalogStore(storeDir) {
  const entities = readdirSync(storeDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(storeDir, name), "utf8")))
  return sortEntities(entities)
}

/** Write the store to mirror `entities` exactly: add/update files, delete strays. */
export function writeCatalogStore(storeDir, entities) {
  mkdirSync(storeDir, { recursive: true })
  const expected = new Set(entities.map((entity) => `${entity.id}.json`))
  for (const name of readdirSync(storeDir)) {
    if (name.endsWith(".json") && !expected.has(name)) unlinkSync(join(storeDir, name))
  }
  for (const entity of entities) {
    writeFileSync(join(storeDir, `${entity.id}.json`), JSON.stringify(entity, null, 2) + "\n")
  }
}

export function generateEntitiesSource(parsed, entities) {
  return serializeCatalogFile({ ...parsed, entities: sortEntities(entities) })
}

/**
 * Persist a catalog edit. When the canonical per-entity store exists next to
 * the target file, the store is the source of truth: the JSON files are
 * mirrored first and `entities.ts` is regenerated from them. Fixture
 * mini-repos (no `entities/` directory) keep the single-file behavior.
 */
export function writeCatalogFile(parsed) {
  if (hasCatalogStore(parsed.path)) {
    const storeDir = catalogStoreDir(parsed.path)
    writeCatalogStore(storeDir, parsed.entities)
    writeFileSync(parsed.path, generateEntitiesSource(parsed, readCatalogStore(storeDir)))
    return
  }
  writeFileSync(parsed.path, serializeCatalogFile(parsed))
}
