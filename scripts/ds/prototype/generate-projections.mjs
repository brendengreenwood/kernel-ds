import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { repoRoot } from "../lib/context.mjs"
import { FIGMA_MAP_PATH, PROTOTYPE_STATUS_PATH, renderFigmaMap, renderPrototypeStatus } from "./projection.mjs"
import { loadPrototypeRegistry, writeTextAtomic } from "./store.mjs"

export function generatePrototypeProjections(root = repoRoot) {
  const registry = loadPrototypeRegistry(resolve(root, "docs/prototypes/registry.json"))
  const status = writeTextAtomic(resolve(root, PROTOTYPE_STATUS_PATH), renderPrototypeStatus(registry))
  const figma = writeTextAtomic(resolve(root, FIGMA_MAP_PATH), renderFigmaMap(registry))
  return { changed: status.changed || figma.changed, status, figma }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = generatePrototypeProjections()
  console.log(`${result.changed ? "PROTOTYPE-PROJECTIONS-OK" : "PROTOTYPE-PROJECTIONS-NOOP"}: ${PROTOTYPE_STATUS_PATH}, ${FIGMA_MAP_PATH}`)
}
