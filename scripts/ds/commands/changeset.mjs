import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { fail, repoRoot } from "../lib/context.mjs"

const bumps = ["patch", "minor", "major"]

function workspacePackageNames() {
  const packagesDir = resolve(repoRoot, "packages")
  const names = []
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    names.push(JSON.parse(readFileSync(resolve(packagesDir, entry.name, "package.json"), "utf8")).name)
  }
  return names
}

/**
 * Write a Changesets-format release note noninteractively. The filename is a
 * content hash, so reruns are idempotent and distinct changes never collide.
 * Release execution itself lands in Segment 5.
 */
export async function changeset(argv) {
  const { flags } = parseFlags(argv)
  if (!requireFlags(flags, ["package", "bump", "summary"], "ds:changeset")) return

  const names = workspacePackageNames()
  if (!names.includes(flags.package)) {
    return fail("DS-CHANGESET-REFUSED", `unknown package "${flags.package}"; expected one of ${names.join(", ")}`)
  }
  if (!bumps.includes(flags.bump)) {
    return fail("DS-CHANGESET-REFUSED", `unknown bump "${flags.bump}"; expected one of ${bumps.join(", ")}`)
  }
  if (!String(flags.summary).trim()) {
    return fail("DS-CHANGESET-REFUSED", "summary must not be empty")
  }

  const content = `---\n"${flags.package}": ${flags.bump}\n---\n\n${String(flags.summary).trim()}\n`
  const digest = createHash("sha256").update(content).digest("hex").slice(0, 8)
  const slug = flags.package.replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, "")
  const dir = resolve(repoRoot, flags.dir ?? ".changeset")
  const file = resolve(dir, `${slug}-${flags.bump}-${digest}.md`)

  if (existsSync(file)) {
    console.log(`DS-CHANGESET-OK: ${file} already records this change; no write`)
    return
  }
  mkdirSync(dir, { recursive: true })
  writeFileSync(file, content)
  console.log(`DS-CHANGESET-OK: wrote ${file}`)
}
