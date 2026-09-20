import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { catalogEntitiesFile, fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile } from "../lib/catalog-file.mjs"
import { verifyPromotionEvidence } from "../prototype/evidence.mjs"
import { checkFigmaProjection, checkPrototypeProjection, FIGMA_MAP_PATH, PROTOTYPE_STATUS_PATH, renderFigmaMap, renderPrototypeStatus } from "../prototype/projection.mjs"
import { authorizePrototypeTransition } from "../prototype/transition.mjs"
import { loadPrototypeRegistry, writePrototypeRegistryAtomic, writeTextAtomic } from "../prototype/store.mjs"
import { concerns, figmaNodeKinds, originSurfaces } from "../prototype/schema.mjs"
import { validatePrototypeRegistry } from "../prototype/validator.mjs"

function loadContext(flags) {
  const root = flags.root ? resolve(repoRoot, flags.root) : repoRoot
  const registryFile = flags.registry ? resolve(root, flags.registry) : resolve(root, "docs/prototypes/registry.json")
  const entitiesFile = flags.root ? resolve(root, "packages/catalog/src/entities.ts") : catalogEntitiesFile
  return {
    root,
    registryFile,
    projectionFile: flags.projection ? resolve(root, flags.projection) : resolve(root, PROTOTYPE_STATUS_PATH),
    figmaProjectionFile: flags["figma-projection"] ? resolve(root, flags["figma-projection"]) : resolve(root, FIGMA_MAP_PATH),
    registry: loadPrototypeRegistry(registryFile),
    entities: parseCatalogFile(entitiesFile).entities,
  }
}

function printIssues(issues) {
  for (const issue of issues) {
    if (typeof issue === "string") console.error(`  - ${issue}`)
    else console.error(`  - ${issue.code} ${issue.path}: ${issue.message}`)
  }
}

function promotionEvidenceIssues(context) {
  const invalid = []
  const unavailable = []
  for (const initiative of context.registry.initiatives) {
    for (const concern of initiative.concerns) {
      if (concern.state !== "promoted") continue
      const result = verifyPromotionEvidence({
        root: context.root,
        entities: context.entities,
        initiative,
        concern,
        acceptance: concern.acceptance,
        canonical: concern.canonical,
      })
      const entry = `${initiative.id}/${concern.concern}: ${result.issues.join("; ")}`
      if (result.status === "unverifiable-history") unavailable.push(entry)
      else if (!result.ok) invalid.push(entry)
    }
  }
  return { invalid, unavailable }
}

function validateContext(context, { projection = true } = {}) {
  const issues = validatePrototypeRegistry(context.registry, context)
  const evidence = issues.length === 0 ? promotionEvidenceIssues(context) : { invalid: [], unavailable: [] }
  const projectionResult = projection ? checkPrototypeProjection(context.projectionFile, context.registry) : { ok: true }
  const figmaProjectionResult = projection && context.registry.figma?.compatibility
    ? checkFigmaProjection(context.figmaProjectionFile, context.registry)
    : { ok: true }
  return { issues, evidence, projection: projectionResult, figmaProjection: figmaProjectionResult }
}

function check(flags) {
  const context = loadContext(flags)
  const result = validateContext(context)
  if (result.issues.length || result.evidence.invalid.length || result.evidence.unavailable.length || !result.projection.ok || !result.figmaProjection.ok) {
    printIssues(result.issues)
    printIssues(result.evidence.invalid.map((message) => `invalid-evidence ${message}`))
    printIssues(result.evidence.unavailable.map((message) => `unverifiable-history ${message}`))
    if (!result.projection.ok) printIssues([result.projection.message])
    if (!result.figmaProjection.ok) printIssues([result.figmaProjection.message])
    return fail("PROTOTYPE-CHECK-FAILED", "registry or generated projection is not valid and current")
  }
  console.log(`PROTOTYPE-CHECK-OK: ${context.registry.initiatives.length} initiative(s), registry and projection current`)
}

function status(flags) {
  const context = loadContext(flags)
  const validation = validateContext(context, { projection: false })
  if (validation.issues.length || validation.evidence.invalid.length) {
    printIssues(validation.issues)
    printIssues(validation.evidence.invalid.map((message) => `invalid-evidence ${message}`))
    return fail("PROTOTYPE-STATUS-FAILED", "registry contains invalid data or canonical evidence")
  }

  const initiatives = context.registry.initiatives.filter((initiative) => {
    if (flags.initiative && initiative.id !== flags.initiative) return false
    if (flags.entity && !initiative.entityIds.includes(flags.entity)) return false
    return true
  })
  console.log(`PROTOTYPE-STATUS: ${initiatives.length} initiative(s)`)
  const byState = new Map()
  const byOwner = new Map()
  const coverage = { figma: new Map(), "kernel-app": new Map() }
  const entityKinds = new Map(context.entities.map((entity) => [entity.id, entity.kind]))
  for (const initiative of initiatives) {
    const surfaces = [initiative.surfaces?.figma?.length ? "figma" : null, initiative.surfaces?.kernelApp?.length ? "kernel-app" : null].filter(Boolean).join(",") || "none"
    for (const entityId of initiative.entityIds) {
      const kind = entityKinds.get(entityId)
      if (!kind) continue
      if (initiative.surfaces?.figma?.length) coverage.figma.set(kind, (coverage.figma.get(kind) ?? 0) + 1)
      if (initiative.surfaces?.kernelApp?.length) coverage["kernel-app"].set(kind, (coverage["kernel-app"].get(kind) ?? 0) + 1)
    }
    for (const concern of initiative.concerns) {
      byState.set(concern.state, (byState.get(concern.state) ?? 0) + 1)
      if (concern.state === "promoted") byOwner.set(concern.canonical.package, (byOwner.get(concern.canonical.package) ?? 0) + 1)
      const owner = concern.canonical?.package ? ` owner=${concern.canonical.package}` : ""
      const authorization = concern.migrationImport ? " authorization=migration-import" : concern.acceptance ? " authorization=explicit-acceptance" : ""
      console.log(`  ${initiative.id} entity=${initiative.entityIds.join(",")} concern=${concern.concern} state=${concern.state} surfaces=${surfaces}${owner}${authorization}`)
    }
  }
  console.log(`  awaiting-call=${(byState.get("exploration") ?? 0) + (byState.get("candidate") ?? 0)} ready-to-promote=${byState.get("validated") ?? 0}`)
  console.log(`  promoted=${[...byOwner].sort().map(([owner, count]) => `${owner}:${count}`).join(",") || "none"}`)
  for (const surface of ["figma", "kernel-app"]) {
    console.log(`  coverage-${surface}=${[...coverage[surface]].sort().map(([kind, count]) => `${kind}:${count}`).join(",") || "none"}`)
  }
  if (validation.evidence.unavailable.length) {
    for (const message of validation.evidence.unavailable) console.log(`  unverifiable-history ${message}`)
    process.exitCode = 2
  }
}

function required(flags, names, name) {
  if (!requireFlags(flags, names, `ds:prototype ${name}`)) throw new Error("Missing required flags")
}

function validateBeforeWrite(context, registry) {
  const issues = validatePrototypeRegistry(registry, { ...context, registry })
  if (issues.length) {
    printIssues(issues)
    throw new Error("Mutation would create an invalid prototype registry")
  }
}

function add(flags) {
  required(flags, ["id", "title", "entity", "concern", "origin", "date", "actor", "source", "reason"], "add")
  if (!concerns.includes(flags.concern)) throw new Error(`Unknown concern ${flags.concern}`)
  if (!originSurfaces.includes(flags.origin)) throw new Error(`Unknown origin ${flags.origin}`)
  const context = loadContext(flags)
  if (context.registry.initiatives.some((initiative) => initiative.id === flags.id)) {
    console.log(`PROTOTYPE-NOOP: initiative ${flags.id} already exists`)
    return
  }
  const registry = structuredClone(context.registry)
  registry.initiatives.push({
    id: flags.id,
    title: flags.title,
    lifecycle: "active",
    scopeKey: flags.scope ?? "default",
    entityIds: [flags.entity],
    surfaces: { figma: [], kernelApp: [] },
    concerns: [{
      concern: flags.concern,
      state: "exploration",
      origin: flags.origin,
      history: [{ from: null, to: "exploration", date: flags.date, actor: flags.actor, source: flags.source, reason: flags.reason, evidence: [] }],
    }],
  })
  registry.initiatives.sort((a, b) => a.id.localeCompare(b.id))
  validateBeforeWrite(context, registry)
  const result = writePrototypeRegistryAtomic(context.registryFile, registry)
  console.log(`${result.changed ? "PROTOTYPE-ADD-OK" : "PROTOTYPE-NOOP"}: ${flags.id}`)
}

function link(flags) {
  required(flags, ["initiative", "surface"], "link")
  const context = loadContext(flags)
  const registry = structuredClone(context.registry)
  const initiative = registry.initiatives.find((item) => item.id === flags.initiative)
  if (!initiative) throw new Error(`Unknown initiative ${flags.initiative}`)
  if (flags.surface === "figma") {
    required(flags, ["file-key", "node-id", "kind"], "link --surface figma")
    if (!figmaNodeKinds.includes(flags.kind)) throw new Error(`Unknown Figma node kind ${flags.kind}`)
    const reference = { fileKey: flags["file-key"], nodeId: flags["node-id"], kind: flags.kind }
    if (flags.key) reference.key = flags.key
    if (!initiative.surfaces.figma.some((item) => JSON.stringify(item) === JSON.stringify(reference))) initiative.surfaces.figma.push(reference)
  } else if (flags.surface === "kernel-app") {
    required(flags, ["route", "source-path"], "link --surface kernel-app")
    const reference = { route: flags.route, sourcePath: flags["source-path"] }
    if (!initiative.surfaces.kernelApp.some((item) => item.route === reference.route && item.sourcePath === reference.sourcePath)) initiative.surfaces.kernelApp.push(reference)
  } else {
    throw new Error(`Unknown surface ${flags.surface}`)
  }
  validateBeforeWrite(context, registry)
  const result = writePrototypeRegistryAtomic(context.registryFile, registry)
  console.log(`${result.changed ? "PROTOTYPE-LINK-OK" : "PROTOTYPE-NOOP"}: ${flags.initiative} ${flags.surface}`)
}

function readJsonFlag(root, value, name) {
  if (!value) return undefined
  try { return JSON.parse(readFileSync(resolve(root, value), "utf8")) } catch (cause) { throw new Error(`Cannot read --${name} JSON: ${cause.message}`) }
}

function set(flags) {
  required(flags, ["initiative", "concern", "state", "date", "actor", "source", "reason"], "set")
  const context = loadContext(flags)
  const registry = structuredClone(context.registry)
  const index = registry.initiatives.findIndex((item) => item.id === flags.initiative)
  if (index === -1) throw new Error(`Unknown initiative ${flags.initiative}`)
  const initiative = registry.initiatives[index]
  let record = initiative.concerns.find((item) => item.concern === flags.concern)
  if (!record) {
    if (flags.state !== "exploration") throw new Error(`New concern ${flags.concern} must start at exploration`)
    if (!concerns.includes(flags.concern) || !originSurfaces.includes(flags.origin)) throw new Error("New concern requires valid --concern and --origin")
    initiative.concerns.push({ concern: flags.concern, state: "exploration", origin: flags.origin, history: [{ from: null, to: "exploration", date: flags.date, actor: flags.actor, source: flags.source, reason: flags.reason, evidence: [] }] })
  } else {
    const acceptance = readJsonFlag(context.root, flags.acceptance, "acceptance")
    const canonical = readJsonFlag(context.root, flags.canonical, "canonical")
    const authorization = authorizePrototypeTransition({
      initiative,
      concern: flags.concern,
      nextState: flags.state,
      date: flags.date,
      actor: flags.actor,
      source: flags.source,
      reason: flags.reason,
      evidence: flags.evidence ? flags.evidence.split(",").filter(Boolean) : [],
      acceptance,
      canonical,
      verifyPromotion: ({ initiative: subject, concern, acceptance: accepted, canonical: canonicalEvidence }) => verifyPromotionEvidence({ root: context.root, entities: context.entities, initiative: subject, concern, acceptance: accepted, canonical: canonicalEvidence }),
    })
    if (!authorization.ok) {
      printIssues(authorization.issues)
      if (authorization.status === "unverifiable-history") process.exitCode = 2
      throw new Error(`Transition refused with status ${authorization.status}`)
    }
    registry.initiatives[index] = authorization.initiative
  }
  validateBeforeWrite(context, registry)
  const result = writePrototypeRegistryAtomic(context.registryFile, registry)
  console.log(`${result.changed ? "PROTOTYPE-SET-OK" : "PROTOTYPE-NOOP"}: ${flags.initiative} ${flags.concern}=${flags.state}`)
}

function project(flags) {
  const context = loadContext(flags)
  const issues = validatePrototypeRegistry(context.registry, context)
  if (issues.length) {
    printIssues(issues)
    throw new Error("Cannot project an invalid registry")
  }
  const statusResult = writeTextAtomic(context.projectionFile, renderPrototypeStatus(context.registry))
  const figmaResult = context.registry.figma?.compatibility
    ? writeTextAtomic(context.figmaProjectionFile, renderFigmaMap(context.registry))
    : { changed: false }
  const changed = statusResult.changed || figmaResult.changed
  console.log(`${changed ? "PROTOTYPE-PROJECT-OK" : "PROTOTYPE-NOOP"}: ${context.projectionFile}${context.registry.figma?.compatibility ? `, ${context.figmaProjectionFile}` : ""}`)
}

export async function prototype(argv) {
  const { flags, positional } = parseFlags(argv)
  const [command] = positional
  try {
    if (command === "check") return check(flags)
    if (command === "status") return status(flags)
    if (command === "add") return add(flags)
    if (command === "link") return link(flags)
    if (command === "set") return set(flags)
    if (command === "project") return project(flags)
    return fail("PROTOTYPE-USAGE", `unknown command "${command ?? ""}". Commands: check, status, add, link, set, project`)
  } catch (cause) {
    if (cause.message === "Missing required flags") return
    return fail("PROTOTYPE-FAILED", cause.message)
  }
}
