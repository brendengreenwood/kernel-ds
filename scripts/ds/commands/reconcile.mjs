import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { catalogEntitiesFile, fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile } from "../lib/catalog-file.mjs"
import { buildJevRequest, buildReport, validateEvidence } from "../reconcile/contract.mjs"

const DEFAULT_ENDPOINT = "https://api.typesafe.ai/v1/systemone"

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch (error) {
    throw new Error(`Cannot read ${label} ${path}: ${error.message}`)
  }
}

async function callTypeSafe(request, apiKey) {
  const response = await fetch(DEFAULT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(30_000),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`TypeSafe API ${response.status}: ${text.slice(0, 500)}`)
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`TypeSafe API returned invalid JSON: ${error.message}`)
  }
}

export async function reconcile(args) {
  const { flags, positional } = parseFlags(args, ["dry-run"])
  if (positional.length > 0) return fail("DS-RECONCILE-USAGE", `unexpected positional arguments: ${positional.join(" ")}`)
  if (!requireFlags(flags, ["evidence"], "ds:reconcile")) return false
  if (!flags["dry-run"] && !flags.out) return fail("DS-RECONCILE-USAGE", "ds:reconcile requires --out <path> unless --dry-run is used")

  try {
    const evidencePath = resolve(repoRoot, flags.evidence)
    const catalogFile = flags["catalog-file"] ? resolve(repoRoot, flags["catalog-file"]) : catalogEntitiesFile
    const evidence = validateEvidence(readJson(evidencePath, "evidence file"), parseCatalogFile(catalogFile).entities)
    const model = flags.model ?? "jev-latest"
    const request = buildJevRequest(evidence, model)

    if (flags["dry-run"]) {
      console.log(`${JSON.stringify(request, null, 2)}\n`)
      console.log(`DS-RECONCILE-DRY-RUN: ${evidence.artifact.name}; ${evidence.candidates.length} candidate(s); no API call or mutation`)
      return true
    }

    let response
    if (flags["response-file"]) {
      response = readJson(resolve(repoRoot, flags["response-file"]), "response replay file")
    } else {
      const apiKey = process.env.TYPESAFE_API_KEY
      if (!apiKey) return fail("DS-RECONCILE-CREDENTIALS", "TYPESAFE_API_KEY is required unless --response-file is supplied")
      response = await callTypeSafe(request, apiKey)
    }

    const report = buildReport({
      evidence,
      request,
      response,
      evidencePath: flags.evidence,
      modelRequested: model,
    })
    const outPath = resolve(repoRoot, flags.out)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)

    const concerns = Object.entries(report.judgment.concerns)
      .filter(([, probability]) => probability >= 0.5)
      .map(([concern]) => concern)
    console.log(`DS-RECONCILE-OK: wrote ${flags.out}`)
    console.log(`  identity=${report.judgment.identity.choice} (${report.judgment.identity.probability.toFixed(2)})`)
    console.log(`  role=${report.judgment.artifactRole.choice} (${report.judgment.artifactRole.probability.toFixed(2)})`)
    console.log(`  concerns=${concerns.length > 0 ? concerns.join(",") : "none"}`)
    console.log(`  direction=${report.judgment.syncDirection.choice} (${report.judgment.syncDirection.probability.toFixed(2)})`)
    console.log(`  authorization=${report.authorization.status}; mutationsAllowed=false`)
    return true
  } catch (error) {
    return fail("DS-RECONCILE-FAILED", error.message)
  }
}
