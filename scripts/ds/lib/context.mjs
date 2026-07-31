import { spawnSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

export const catalogEntitiesFile = resolve(repoRoot, "packages/catalog/src/entities.ts")
export const portalAdapterFile = resolve(repoRoot, "kernel-portal/src/lib/component-meta.generated.ts")

/** Run a node script with type stripping; stdio inherited unless capture is set. */
export function runNode(scriptPath, args = [], options = {}) {
  return spawnSync(process.execPath, ["--experimental-strip-types", scriptPath, ...args], {
    cwd: options.cwd ?? repoRoot,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    env: { ...process.env, ...options.env },
  })
}

/**
 * Run an npm invocation. Arguments must be internal constants, never
 * user-controlled strings: Windows requires a shell for npm.cmd.
 */
export function runNpm(args, options = {}) {
  const windows = process.platform === "win32"
  return spawnSync(windows ? "npm.cmd" : "npm", args, {
    cwd: options.cwd ?? repoRoot,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    shell: windows,
    env: { ...process.env, ...options.env },
  })
}

export function fail(code, message) {
  console.error(`${code}: ${message}`)
  process.exitCode = 1
  return false
}
