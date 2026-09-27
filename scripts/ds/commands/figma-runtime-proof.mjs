import { createHash } from "node:crypto"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { spawn, spawnSync } from "node:child_process"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot } from "../figma/component-scope.mjs"

const sha256 = (value) => createHash("sha256").update(value).digest("hex")
function directoryHash(dir) {
  const files = []
  const walk = (path) => { for (const name of readdirSync(path).sort()) { const target = resolve(path, name); statSync(target).isDirectory() ? walk(target) : files.push(target) } }
  walk(dir)
  return sha256(files.map((path) => `${path.slice(dir.length)}\0${sha256(readFileSync(path))}`).join("\n"))
}
async function waitForReady(url, timeoutMs = 30_000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try { if ((await fetch(url)).ok) return } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250))
  }
  throw new Error(`Preview did not become ready at ${url}`)
}

const { flags, positional } = parseFlags(process.argv.slice(2))
try {
  if (positional.length) throw new Error(`Unexpected positional arguments: ${positional.join(" ")}`)
  for (const name of ["scope-file", "out"]) if (!flags[name] || flags[name] === true) throw new Error(`requires --${name} <value>`)
  const portal = resolve(repoRoot, "kernel-portal")
  const npm = process.platform === "win32" ? "npm.cmd" : "npm"
  const build = spawnSync(npm, ["run", "build"], { cwd: portal, stdio: "inherit", shell: process.platform === "win32" })
  if (build.status !== 0) throw new Error("Portal build failed")
  const buildHash = directoryHash(resolve(portal, "dist"))
  const preview = spawn(npm, ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], { cwd: portal, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" })
  try {
    await waitForReady("http://127.0.0.1:4173")
    const captureDir = resolve(repoRoot, ".mastracode/plans/full-kernel-ui-figma-integration.proof/runtime")
    const runner = spawnSync(process.execPath, ["scripts/run-figma-runtime-proof.mjs", "--scope", resolve(repoRoot, flags["scope-file"]), "--out", resolve(repoRoot, flags.out), "--capture-dir", captureDir, "--build-hash", buildHash], { cwd: portal, stdio: "inherit" })
    if (runner.status !== 0) throw new Error("Runtime proof runner failed")
  } finally {
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(preview.pid), "/t", "/f"], { stdio: "ignore" })
    else preview.kill("SIGTERM")
  }
} catch (error) {
  console.error(`FIGMA-RUNTIME-PROOF-FAILED: ${error.message}`)
  process.exitCode = 1
}
