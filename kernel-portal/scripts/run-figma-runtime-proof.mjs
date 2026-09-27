import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { chromium } from "playwright"
import { validateCohort, validateMatrix, validateResults, matrixHash, RESULT_SCHEMA } from "./check-figma-runtime-proof.mjs"

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => value.startsWith("--") ? [...pairs, [value.slice(2), values[index + 1]]] : pairs, []))
const root = resolve(import.meta.dirname, "..")
const matrixPath = resolve(root, args.matrix ?? "../docs/figma/runtime-proof-matrix.json")
const scopePath = resolve(root, args.scope)
const outPath = resolve(root, args.out)
const captureDir = resolve(root, args["capture-dir"])
const baseUrl = args["base-url"] ?? "http://127.0.0.1:4173"

try {
  if (!args.scope || !args.out || !args["capture-dir"] || !args["build-hash"]) throw new Error("Runner requires --scope, --out, --capture-dir, and --build-hash")
  const matrixText = readFileSync(matrixPath, "utf8")
  const matrix = JSON.parse(matrixText)
  const scope = JSON.parse(readFileSync(scopePath, "utf8"))
  const hash = matrixHash(matrixText)
  validateMatrix(matrix, matrix.scenarios.map((item) => item.entityId))
  validateCohort(scope, matrix, hash)
  const selected = matrix.scenarios.filter((item) => scope.entityIds.includes(item.entityId))
  mkdirSync(captureDir, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const scenario of selected) {
      const startedAt = new Date().toISOString()
      const videoDir = resolve(captureDir, scenario.entityId)
      mkdirSync(videoDir, { recursive: true })
      const context = await browser.newContext({ recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } } })
      const page = await context.newPage()
      let screenshotPath = null
      let scenarioPassed = false
      let recordingPath = null
      try {
        for (const step of scenario.steps) {
          if (step.type === "goto") await page.goto(new URL(step.path, baseUrl).href, { waitUntil: "networkidle" })
          else if (step.type === "click") await page.locator(step.selector).click()
          else if (step.type === "press") await page.locator(step.selector ?? "body").press(step.key)
          else if (step.type === "hover") await page.locator(step.selector).hover()
          else if (step.type === "waitFor") await page.locator(step.selector).waitFor({ state: step.state ?? "visible" })
          else if (step.type === "assertVisible") { if (!(await page.locator(step.selector).isVisible())) throw new Error(`${step.selector} is not visible`) }
          else if (step.type === "assertAttribute") { const actual = await page.locator(step.selector).getAttribute(step.name); if (actual !== step.value) throw new Error(`${step.selector} ${step.name} expected ${step.value}, got ${actual}`) }
          else if (step.type === "screenshot") { screenshotPath = resolve(captureDir, scenario.requiredCaptureName); await page.screenshot({ path: screenshotPath, fullPage: true }) }
          else throw new Error(`Unknown runtime-proof step ${step.type}`)
        }
        scenarioPassed = true
      } finally {
        const video = page.video()
        await context.close()
        recordingPath = video ? await video.path() : null
        results.push({ scenarioId: scenario.scenarioId, entityId: scenario.entityId, url: scenario.route, startedAt, finishedAt: new Date().toISOString(), buildHash: args["build-hash"], matrixHash: hash, observedResult: scenarioPassed ? "pass" : "fail", screenshotPath, recordingPath })
      }
    }
  } finally { await browser.close() }
  const document = { $schema: RESULT_SCHEMA, results }
  validateResults(document, selected, args["build-hash"], hash)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`)
  console.log(`FIGMA-RUNTIME-PROOF-OK: ${results.length}/${selected.length} scenarios`)
} catch (error) {
  console.error(`FIGMA-RUNTIME-PROOF-FAILED: ${error.message}`)
  process.exitCode = 1
}
