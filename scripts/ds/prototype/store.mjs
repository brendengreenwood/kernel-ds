import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

export function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableJson(value[key])]))
  }
  return value
}

export function serializePrototypeRegistry(registry) {
  return `${JSON.stringify(stableJson(registry), null, 2)}\n`
}

export function loadPrototypeRegistry(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

export function writeTextAtomic(path, next, { rename = renameSync } = {}) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : null
  if (current === next) return { changed: false, bytes: current }
  const temporary = resolve(dirname(path), `.${path.split(/[\\/]/).pop()}.${process.pid}.tmp`)
  try {
    writeFileSync(temporary, next, "utf8")
    rename(temporary, path)
  } catch (cause) {
    if (existsSync(temporary)) rmSync(temporary, { force: true })
    throw cause
  }
  return { changed: true, bytes: next }
}

export function writePrototypeRegistryAtomic(path, registry, options) {
  return writeTextAtomic(path, serializePrototypeRegistry(registry), options)
}
