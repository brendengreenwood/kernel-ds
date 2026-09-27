import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { repoRoot } from "../lib/context.mjs"
import { stableJson, validateEntityIds } from "../figma/component-scope.mjs"
import { hash, persistLiveAudit, validateLiveAuditResponse } from "../figma/live-component-audit.mjs"

const REQUEST_SCHEMA = "kernel-ds/figma-live-audit-request@1"
const stateDir = resolve(repoRoot, ".mastracode/plans/full-kernel-ui-figma-integration.proof/live-audit")

function readJson(path) { return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8")) }
function writeJson(path, value) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, stableJson(value)) }
function fail(message) { console.error(`FIGMA-LIVE-AUDIT-FAILED: ${message}`); process.exitCode = 1 }

function begin(args) {
  if (!requireFlags(args, ["mode", "scope-file", "capture"], "ds:figma:live begin")) return
  if (!['preliminary', 'full'].includes(args.mode)) return fail("--mode must be preliminary or full")
  if (args.mode === "preliminary" && (args["update-evidence"] || args["proof-out"])) return fail("preliminary mode cannot persist evidence or proof output")
  const cohort = readJson(args["scope-file"])
  const contractsDoc = readJson("docs/figma/component-contracts.json")
  const entities = validateEntityIds(cohort.entityIds, new Set(contractsDoc.components.map((item) => item.entityId)), "cohort")
  const contracts = Object.fromEntries(contractsDoc.components.filter((item) => entities.includes(item.entityId)).map((item) => [item.entityId, item]))
  const implementation = readFileSync(resolve(repoRoot, "scripts/ds/figma/live-component-audit.js"), "utf8")
  const requestId = randomUUID()
  const implementationHash = hash(implementation)
  const input = { mode: args.mode, entities, contracts, auditedAt: new Date().toISOString(), requestId, requestHash: null, implementationHash }
  const requestHash = hash(input)
  input.requestHash = requestHash
  const code = implementation.replace("__KERNEL_AUDIT_INPUT__", JSON.stringify(input))
  const request = { $schema: REQUEST_SCHEMA, ...input, scopeFile: args["scope-file"], capture: args.capture, updateEvidence: Boolean(args["update-evidence"]), proofOut: args["proof-out"] || null, code, codeHash: hash(code), responsePath: `.mastracode/plans/full-kernel-ui-figma-integration.proof/live-audit/${requestId}.response.json` }
  const requestPath = resolve(stateDir, `${requestId}.request.json`)
  writeJson(requestPath, request)
  console.log(`FIGMA-LIVE-AUDIT-HANDOFF-READY: ${relative(repoRoot, requestPath).replaceAll('\\', '/')}`)
}

function complete(args) {
  if (!requireFlags(args, ["request"], "ds:figma:live complete")) return
  const request = readJson(args.request)
  const implementation = readFileSync(resolve(repoRoot, "scripts/ds/figma/live-component-audit.js"), "utf8")
  const requestInput = { mode: request.mode, entities: request.entities, contracts: request.contracts, auditedAt: request.auditedAt, requestId: request.requestId, requestHash: null, implementationHash: request.implementationHash }
  if (request.$schema !== REQUEST_SCHEMA || hash(request.code) !== request.codeHash || hash(implementation) !== request.implementationHash || hash(requestInput) !== request.requestHash) return fail("request or implementation code was tampered with")
  if (!existsSync(resolve(repoRoot, request.responsePath))) return fail(`missing response ${request.responsePath}`)
  const response = readJson(request.responsePath)
  validateLiveAuditResponse(response, request)
  persistLiveAudit(response, request)
  rmSync(resolve(repoRoot, args.request))
  const label = request.mode === "full" ? "FIGMA-LIVE-AUDIT-OK" : "FIGMA-LIVE-AUDIT-PRELIMINARY-OK"
  console.log(`${label}: ${response.resolved}/${response.expected} scoped components`)
}

function abort(args) {
  if (!requireFlags(args, ["request"], "ds:figma:live abort")) return
  const requestPath = resolve(repoRoot, args.request)
  if (existsSync(requestPath)) {
    const request = readJson(args.request)
    if (request.$schema === REQUEST_SCHEMA && existsSync(resolve(repoRoot, request.responsePath))) rmSync(resolve(repoRoot, request.responsePath))
    rmSync(requestPath)
  }
  console.log("FIGMA-LIVE-AUDIT-ABORTED")
}

try {
  const [command, ...rest] = process.argv.slice(2)
  const { flags: args, positional } = parseFlags(rest, ["update-evidence"])
  if (positional.length) throw new Error(`unexpected positional arguments: ${positional.join(" ")}`)
  if (command === "begin") begin(args)
  else if (command === "complete") complete(args)
  else if (command === "abort") abort(args)
  else fail("expected begin, complete, or abort")
} catch (error) { fail(error.message) }
