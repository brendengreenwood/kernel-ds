import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadComponentScope, repoRoot, sha256, stableJson } from "./component-scope.mjs"

export const CONTRACTS_SCHEMA = "kernel-ds/figma-component-contracts@1"
export const OVERRIDES_SCHEMA = "kernel-ds/figma-component-contract-overrides@1"
export const CONTRACTS_PATH = "docs/figma/component-contracts.json"
export const OVERRIDES_PATH = "docs/figma/component-contract-overrides.json"

function readSource(path) {
  return readFileSync(resolve(repoRoot, path), "utf8")
}

function objectAfter(source, marker) {
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) return ""
  const start = source.indexOf("{", markerIndex + marker.length)
  if (start < 0) return ""
  let depth = 0
  let quote = null
  let escaped = false
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (escaped) escaped = false
      else if (char === "\\") escaped = true
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'" || char === "`") quote = char
    else if (char === "{") depth += 1
    else if (char === "}" && --depth === 0) return source.slice(start, index + 1)
  }
  return ""
}

function topLevelEntries(objectText) {
  if (!objectText) return []
  const entries = []
  let depth = 0
  let quote = null
  let escaped = false
  let start = 1
  for (let index = 1; index < objectText.length - 1; index += 1) {
    const char = objectText[index]
    if (quote) {
      if (escaped) escaped = false
      else if (char === "\\") escaped = true
      else if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'" || char === "`") quote = char
    else if (char === "{" || char === "[" || char === "(") depth += 1
    else if (char === "}" || char === "]" || char === ")") depth -= 1
    else if (char === "," && depth === 0) {
      entries.push(objectText.slice(start, index).trim())
      start = index + 1
    }
  }
  entries.push(objectText.slice(start, -1).trim())
  return entries.filter(Boolean)
}

function extractVariantAxes(source) {
  const variants = objectAfter(source, "variants:")
  const result = {}
  for (const entry of topLevelEntries(variants)) {
    const match = entry.match(/^([A-Za-z_$][\w$-]*|["'][^"']+["'])\s*:\s*(\{[\s\S]*\})$/)
    if (!match) continue
    const key = match[1].replace(/^["']|["']$/g, "")
    result[key] = topLevelEntries(match[2])
      .map((value) => value.match(/^([A-Za-z_$][\w$-]*|["'][^"']+["'])\s*:/)?.[1]?.replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .sort()
  }
  return result
}

function extractSlots(source) {
  return [...source.matchAll(/data-slot\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]).filter((value, index, all) => all.indexOf(value) === index).sort()
}

function extractPublicProperties(source) {
  const names = new Set()
  for (const match of source.matchAll(/function\s+[A-Z][A-Za-z0-9]*\s*\(\s*\{([\s\S]*?)\}\s*:/g)) {
    for (const part of match[1].split(",")) {
      const name = part.trim().match(/^([A-Za-z_$][\w$]*)/)?.[1]
      if (name && name !== "props") names.add(name)
    }
  }
  return [...names].sort()
}

function extractPropTypeExpressions(source) {
  return [...source.matchAll(/function\s+([A-Z][A-Za-z0-9]*)\s*\([\s\S]*?\}\s*:\s*([\s\S]*?)\)\s*\{/g)]
    .map((match) => ({ component: match[1], type: match[2].replace(/\s+/g, " ").trim() }))
    .sort((a, b) => a.component.localeCompare(b.component))
}

function inferTokenRoles(source) {
  const roles = new Set()
  if (source.includes("--radius-control")) roles.add("radius/control")
  if (source.includes("--radius-surface")) roles.add("radius/surface")
  if (source.includes("--radius-floating")) roles.add("radius/floating")
  if (source.includes("--radius-modal")) roles.add("radius/modal")
  if (/\bbg-(?:background|card|popover|primary|secondary|muted|accent|destructive)\b/.test(source)) roles.add("semantic/fill")
  if (/\bborder-(?:border|input|destructive)\b/.test(source)) roles.add("semantic/stroke")
  if (/--control-h(?:-sm|-lg)?/.test(source)) roles.add("metric/control-height")
  return [...roles].sort()
}

function applyOverrides(contract, override) {
  if (!override) return contract
  const allowed = new Set(["variantAxes", "publicProperties", "slots", "requiredTokenRoles", "designStateAxes", "figmaProperties", "notes"])
  for (const key of Object.keys(override)) if (!allowed.has(key)) throw new Error(`Unknown override key ${key} for ${contract.entityId}`)
  if (override.variantAxes) {
    for (const [axis, values] of Object.entries(override.variantAxes)) {
      if (!contract.variantAxes[axis]) throw new Error(`Unknown variant axis ${axis} for ${contract.entityId}`)
      for (const value of values) if (!contract.variantAxes[axis].includes(value)) throw new Error(`Unknown variant value ${axis}=${value} for ${contract.entityId}`)
    }
  }
  if (override.publicProperties) for (const name of override.publicProperties) if (!contract.publicProperties.includes(name)) throw new Error(`Unknown public property ${name} for ${contract.entityId}`)
  if (override.slots) for (const slot of override.slots) if (!contract.slots.includes(slot)) throw new Error(`Unknown anatomy slot ${slot} for ${contract.entityId}`)
  if (override.designStateAxes) {
    for (const [axis, values] of Object.entries(override.designStateAxes)) {
      if (!axis || !Array.isArray(values) || !values.length || values.some((value) => typeof value !== "string" || !value)) throw new Error(`Invalid design state axis ${axis} for ${contract.entityId}`)
    }
  }
  if (override.figmaProperties) {
    const allowedTypes = new Set(["TEXT", "BOOLEAN", "INSTANCE_SWAP"])
    const allowedMappings = new Set(["children", "composition", "public-property"])
    for (const [name, property] of Object.entries(override.figmaProperties)) {
      if (!name || !property || !allowedTypes.has(property.type)) throw new Error(`Invalid Figma property ${name} for ${contract.entityId}`)
      if (!allowedMappings.has(property.mapsTo)) throw new Error(`Invalid Figma property mapping ${name} for ${contract.entityId}`)
      if (property.mapsTo === "public-property" && !contract.publicProperties.includes(property.property)) throw new Error(`Unknown mapped public property ${property.property} for ${contract.entityId}`)
    }
  }
  return { ...contract, ...override, sourceFiles: contract.sourceFiles, sourceHash: contract.sourceHash }
}

export function buildComponentContracts(overridesInput) {
  const scope = loadComponentScope()
  const overrides = overridesInput ?? JSON.parse(readSource(OVERRIDES_PATH))
  if (overrides.$schema !== OVERRIDES_SCHEMA || typeof overrides.components !== "object" || Array.isArray(overrides.components)) throw new Error(`Invalid ${OVERRIDES_PATH}`)
  const allowedIds = new Set(scope.components.map((entity) => entity.id))
  for (const id of Object.keys(overrides.components)) if (!allowedIds.has(id)) throw new Error(`Override references unknown entity ${id}`)

  const components = scope.components.map((entity) => {
    const sources = entity.sourceFiles.map((path) => ({ path, content: readSource(path) }))
    const combined = sources.map(({ content }) => content).join("\n")
    const contract = {
      entityId: entity.id,
      name: entity.name,
      maturity: entity.maturity,
      sourceFiles: entity.sourceFiles,
      sourceHash: sha256(sources.map(({ path, content }) => `${path}\n${content}`).join("\n")),
      variantAxes: extractVariantAxes(combined.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")),
      publicProperties: extractPublicProperties(combined),
      propTypeExpressions: extractPropTypeExpressions(combined),
      slots: extractSlots(combined),
      requiredTokenRoles: inferTokenRoles(combined),
      designStateAxes: {},
      figmaProperties: {},
      notes: [],
    }
    const resolved = applyOverrides(contract, overrides.components[entity.id])
    return { ...resolved, contractHash: sha256(stableJson(resolved)) }
  })

  return { $schema: CONTRACTS_SCHEMA, components }
}

export function writeComponentContracts() {
  const contracts = buildComponentContracts()
  writeFileSync(resolve(repoRoot, CONTRACTS_PATH), stableJson(contracts))
  return contracts
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const contracts = writeComponentContracts()
    console.log(`FIGMA-COMPONENT-CONTRACTS-OK: ${contracts.components.length} components`)
  } catch (error) {
    console.error(`FIGMA-COMPONENT-CONTRACTS-FAILED: ${error.message}`)
    process.exitCode = 1
  }
}
