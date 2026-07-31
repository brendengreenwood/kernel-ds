import { readFileSync, writeFileSync } from "node:fs"

const ARRAY_OPEN = "export const catalog = ["
const ARRAY_CLOSE = "] as const satisfies readonly CatalogEntity[]"

/**
 * Parse a canonical catalog entities file. The entity array is strict JSON by
 * convention (quoted keys, two-space indent), so the file round-trips through
 * JSON byte-for-byte; `scripts/ds/__check__.mjs` proves that invariant.
 */
export function parseCatalogFile(path) {
  const raw = readFileSync(path, "utf8")
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

export function serializeCatalogFile(parsed) {
  const body = parsed.header + JSON.stringify(parsed.entities, null, 2) + parsed.footer
  return parsed.eol === "\r\n" ? body.replaceAll("\n", "\r\n") : body
}

export function writeCatalogFile(parsed) {
  writeFileSync(parsed.path, serializeCatalogFile(parsed))
}
