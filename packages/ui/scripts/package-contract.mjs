import { readFile, readdir } from "node:fs/promises"
import { extname, resolve } from "node:path"

export function assertExplicitExports(exportsMap) {
  for (const key of Object.keys(exportsMap)) {
    if (key.includes("*")) throw new Error(`Wildcard package export is forbidden: ${key}`)
  }
}

export function assertReactPeerOnly(manifest) {
  if (manifest.dependencies?.react || manifest.dependencies?.["react-dom"]) {
    throw new Error("React must be peer-only")
  }
  if (!manifest.peerDependencies?.react || !manifest.peerDependencies?.["react-dom"]) {
    throw new Error("React peers are required")
  }
}

export function assertNoPrivateSource(source) {
  if (source.includes("kernel-portal/src") || source.includes("node_modules/react/cjs")) {
    throw new Error("Private source or bundled React leaked into distribution")
  }
}

export async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collectFiles(path))
    else files.push(path)
  }
  return files
}

export function packageName(specifier) {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/")
  return specifier.split("/")[0]
}

export async function readRuntimeSpecifiers(distDir) {
  const specifiers = new Set()
  for (const file of await collectFiles(distDir)) {
    if (extname(file) !== ".js") continue
    const source = await readFile(file, "utf8")
    for (const match of source.matchAll(/(?:from|import)\s*(?:\([^)]*\)|["'])?\s*["']([^"']+)["']/g)) {
      if (!match[1].startsWith(".")) specifiers.add(packageName(match[1]))
    }
  }
  return specifiers
}
