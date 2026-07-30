import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseObjectModel, parseWorkspacePreset } from "../dist/index.js"

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const repoRoot = path.resolve(packageRoot, "..", "..")
const definitionsDir = path.join(repoRoot, "kernel-portal", "public", "definitions")
const manifest = JSON.parse(await readFile(path.join(definitionsDir, "manifest.json"), "utf8"))

if (manifest.version !== 1 || !Array.isArray(manifest.definitions)) {
  throw new Error("definitions manifest must have version 1 and a definitions array")
}

for (const entry of manifest.definitions) {
  if (entry.kind !== "object" && entry.kind !== "workspace") {
    throw new Error(`unknown definition kind: ${String(entry.kind)}`)
  }
  if (typeof entry.path !== "string" || path.isAbsolute(entry.path) || entry.path.includes("..")) {
    throw new Error(`unsafe definition path: ${String(entry.path)}`)
  }
  const document = await readFile(path.join(definitionsDir, entry.path), "utf8")
  if (entry.kind === "object") parseObjectModel(document)
  else parseWorkspacePreset(document)
}

console.log(`DEFINITIONS-MANIFEST-OK: ${manifest.definitions.length} entries`)
