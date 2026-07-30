import { mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { fail, repoRoot, runNpm } from "../lib/context.mjs"

const packablePackages = [
  { name: "@kernel/ui", dir: "packages/ui" },
  { name: "@kernel/definitions", dir: "packages/definitions" },
]

const allowedRootFiles = new Set(["package.json", "api.json", "README.md"])

/**
 * Build and pack the distributable packages, then verify the exact pack
 * payload: only dist output plus the intentional root files may ship.
 */
export async function pack(argv) {
  const { flags } = parseFlags(argv, ["write"])
  const selected = flags.package
    ? packablePackages.filter((candidate) => candidate.name === flags.package)
    : packablePackages
  if (selected.length === 0) {
    return fail("DS-PACK-REFUSED", `unknown package "${flags.package}"; expected one of ${packablePackages.map((candidate) => candidate.name).join(", ")}`)
  }

  const outDir = flags.out ? resolve(repoRoot, flags.out) : resolve(tmpdir(), "kernel-ds-pack")
  if (flags.write) mkdirSync(outDir, { recursive: true })

  for (const candidate of selected) {
    const cwd = resolve(repoRoot, candidate.dir)
    const build = runNpm(["run", "build"], { cwd })
    if (build.status !== 0) {
      return fail("DS-PACK-FAILED", `${candidate.name} build exited ${build.status}`)
    }

    const packArgs = ["pack", "--json", ...(flags.write ? ["--pack-destination", outDir] : ["--dry-run"])]
    const packed = runNpm(packArgs, { cwd, capture: true })
    if (packed.status !== 0) {
      return fail("DS-PACK-FAILED", `${candidate.name} npm pack exited ${packed.status}: ${packed.stderr}`)
    }

    const [report] = JSON.parse(packed.stdout)
    const badFiles = report.files
      .map((file) => file.path)
      .filter((path) => !path.startsWith("dist/") && !allowedRootFiles.has(path))
    if (badFiles.length > 0) {
      return fail("DS-PACK-FAILED", `${candidate.name} pack leaks unexpected files: ${badFiles.join(", ")}`)
    }

    console.log(
      `DS-PACK-OK: ${report.name}@${report.version} — ${report.entryCount} files, ${report.size} bytes packed${flags.write ? `, tarball ${report.filename} in ${outDir}` : " (dry run)"}`,
    )
  }
}
