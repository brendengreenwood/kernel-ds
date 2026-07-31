import { execFileSync } from "node:child_process"
import { access, readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { assertExplicitExports, assertNoPrivateSource, assertReactPeerOnly, collectFiles, readRuntimeSpecifiers } from "./package-contract.mjs"

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const manifest = JSON.parse(await readFile(resolve(packageDir, "package.json"), "utf8"))
assertExplicitExports(manifest.exports)
assertReactPeerOnly(manifest)

for (const path of ["dist/index.js", "dist/index.d.ts", "dist/marks.js", "dist/marks.d.ts", "dist/icon.js", "dist/icon.d.ts", "dist/utils.js", "dist/utils.d.ts", "dist/styles.css", "api.json"]) {
  await access(resolve(packageDir, path))
}

const declared = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {})])
const runtimeSpecifiers = await readRuntimeSpecifiers(resolve(packageDir, "dist"))
const undeclared = [...runtimeSpecifiers].filter((specifier) => !declared.has(specifier))
if (undeclared.length) throw new Error(`Undeclared runtime externals: ${undeclared.join(", ")}`)

for (const file of await collectFiles(resolve(packageDir, "dist"))) {
  if (!/[.](?:js|d\.ts)$/.test(file)) continue
  const source = await readFile(file, "utf8")
  try {
    assertNoPrivateSource(source)
  } catch (error) {
    throw new Error(`${error.message}: ${file}`)
  }
}

const npmCli = process.env.npm_execpath
if (!npmCli) throw new Error("npm_execpath is required")
const pack = JSON.parse(execFileSync(process.execPath, [npmCli, "pack", "--dry-run", "--json"], { cwd: packageDir, encoding: "utf8" }))
const files = pack[0].files.map(({ path }) => path)
const unexpected = files.filter((path) => !path.startsWith("dist/") && !["README.md", "api.json", "package.json"].includes(path))
if (unexpected.length) throw new Error(`Unexpected packed files: ${unexpected.join(", ")}`)
console.log(`UI-PACKAGE-OK: ${files.length} packed files, ${runtimeSpecifiers.size} declared runtime externals, 0 violations`)
