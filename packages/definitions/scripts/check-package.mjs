import { readFile, readdir } from "node:fs/promises"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"))
const exportKeys = Object.keys(pkg.exports)
if (exportKeys.some((key) => key.includes("*"))) throw new Error("Wildcard exports are forbidden")
for (const entry of ["index.js", "index.d.ts", "composition.js", "composition.d.ts", "presets.js", "presets.d.ts"]) {
  await readFile(resolve(root, "dist", entry))
}
const files = await readdir(resolve(root, "dist"))
console.log(`DEFINITIONS-PACKAGE-OK: ${files.length} dist files, ${exportKeys.length} explicit exports, 0 violations`)
