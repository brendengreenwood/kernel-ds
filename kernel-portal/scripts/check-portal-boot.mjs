// Boot smoke check: proves the built portal actually renders, not just builds.
// A resolution-level failure (e.g. two React copies bundled through the
// symlinked @kernel/* file: deps) produces a successful build that crashes on
// boot with a blank #root — invisible to every build-only gate.
//
// Usage:
//   node scripts/check-portal-boot.mjs             # serves dist/ via vite preview
//   node scripts/check-portal-boot.mjs <url>       # checks an already-deployed URL
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const externalUrl = process.argv[2]
const PORT = 4317

function fail(message) {
  console.error(`PORTAL-BOOT-FAILED: ${message}`)
  process.exit(1)
}

let preview = null
if (!externalUrl) {
  preview = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    { cwd: new URL("..", import.meta.url), stdio: "ignore", shell: process.platform === "win32" },
  )
}
const url = externalUrl ?? `http://localhost:${PORT}/`

try {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const errors = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(String(err)))

  let lastError = null
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 })
      lastError = null
      break
    } catch (err) {
      lastError = err
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  if (lastError) fail(`could not load ${url}: ${lastError}`)

  // Give React a beat to mount (or crash) after network idle.
  await page.waitForTimeout(1000)
  const rootChildren = await page.evaluate(
    () => document.querySelector("#root")?.children.length ?? -1,
  )
  const bodyText = await page.evaluate(() => document.body.innerText.trim())
  await browser.close()

  if (errors.length > 0) fail(`console/page errors at ${url}:\n${errors.join("\n")}`)
  if (rootChildren < 1) fail(`#root is empty at ${url} — the app did not mount`)
  if (bodyText.length === 0) fail(`page rendered no text at ${url}`)

  console.log(`PORTAL-BOOT-OK: ${url} rendered (#root children: ${rootChildren}, 0 console errors)`)
} finally {
  preview?.kill()
}
