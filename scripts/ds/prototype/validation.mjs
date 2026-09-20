import { resolve } from "node:path"
import { parseCatalogFile } from "../lib/catalog-file.mjs"
import { verifyPromotionEvidence } from "./evidence.mjs"
import { validatePrototypeRegistry } from "./validator.mjs"

export function loadPrototypeEntities(root) {
  return parseCatalogFile(resolve(root, "packages/catalog/src/entities.ts")).entities
}

export function validatePrototypeData({ root, registry, entities = loadPrototypeEntities(root), checkLivePaths = true }) {
  const issues = validatePrototypeRegistry(registry, { root, entities, checkLivePaths })
  const invalid = []
  const unavailable = []
  if (issues.length === 0) {
    for (const initiative of registry.initiatives) {
      for (const concern of initiative.concerns) {
        if (concern.state !== "promoted") continue
        const result = verifyPromotionEvidence({
          root,
          entities,
          initiative,
          concern,
          acceptance: concern.acceptance,
          canonical: concern.canonical,
          requireLiveAcceptance: true,
        })
        const entry = `${initiative.id}/${concern.concern}: ${result.issues.join("; ")}`
        if (result.status === "unverifiable-history") unavailable.push(entry)
        else if (!result.ok) invalid.push(entry)
      }
    }
  }
  return { issues, evidence: { invalid, unavailable } }
}
