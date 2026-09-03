import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { END_MARKER, START_MARKER } from "./agents-inventory.mjs"

/**
 * Citation gate for hand-authored agent guidance (decision 0069).
 *
 * The generated inventory blocks in AGENTS files update themselves; the prose
 * around them cites paths and npm scripts by hand and nothing checked that
 * those still resolve. Decision 0038 deferred this gate and the ui-package
 * extraction then left five stale lines behind, so it exists now.
 *
 * What counts as a citation (outside the generated markers):
 *   - a token with a source/doc file extension (`main.tsx`, `.github/ci.yml`)
 *   - a token ending in `/` (`components/portal/`)
 *   - a slash token whose first segment is a real directory (`kernel-portal/src`)
 *     — `light/dark` and `pass/fail` are prose, not paths, and are ignored
 *   - `npm run <script>` (resolved against the nearest package.json chain)
 *
 * How a citation resolves: relative to the guidance file's directory, each of
 * its ancestors, their `src/` children (the portal's shorthand), and any
 * directory cited earlier in the same paragraph ("Architecture (src/)" then
 * "index.css — tokens"). A bare basename that still fails is searched by name
 * inside the nearest package. Placeholders (`YYYY-MM.md`, `<slug>.ts`, `*.tsx`),
 * package specifiers (`@kernel/ui`), URLs, and gitignored outputs (`dist/`,
 * `ds-bundle/`, `.release/`) are never citations.
 */

const GUIDANCE_FILES = new Set(["AGENTS.md", "CLAUDE.md"])
const SKIP_DIRS = new Set([
  "node_modules", "dist", ".git", ".netlify", ".ci-packs", ".release", "ds-bundle",
  "__fixtures__", "vendor", "uploads", "screenshots",
])
const GENERATED_SEGMENTS = new Set(["node_modules", "dist", ".netlify", ".ci-packs", ".release", "ds-bundle"])
const EXTENSION = /\.(?:mjs|cjs|js|mts|cts|ts|tsx|jsx|css|json|md|ya?ml|toml|html|svg)$/i
const PLACEHOLDER = /[*<>{}[\]=|"]|:\/\/|YYYY|NNNN/
const EXTENSION_LIST = /^\.[a-z]+(?:\/\.[a-z]+)*$/i

/** Guidance files under root, repo-relative, sorted; generated trees skipped. */
export function findGuidanceFiles(root) {
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name))
      } else if (GUIDANCE_FILES.has(entry.name)) {
        found.push(relative(root, join(dir, entry.name)).replaceAll("\\", "/"))
      }
    }
  }
  walk(root)
  return found.sort()
}

function isDir(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

/** Split a prose line into candidate tokens, trimming sentence punctuation. */
export function tokenize(line) {
  return line
    .split(/[\s`'"(),;→]+/)
    .map((token) => token.replace(/[.,;:!?)\]}]+$/, "").replace(/^[(\[{]+/, ""))
    .filter(Boolean)
}

function stripRelativePrefix(token) {
  return token.replace(/^(?:\.\.?\/)+/, "")
}

/** Classify a token: "path" (must resolve), "alias" (@/ shorthand), or null. */
function classify(token) {
  if (PLACEHOLDER.test(token)) return null
  if (token.startsWith("@/")) return "alias"
  // `/base/` out of "`-light`/base/`-dark`" is a token-alias idiom, not a repo path.
  if (token.startsWith("@") || token.startsWith("-") || token.startsWith("#") || token.startsWith("/")) return null
  if (EXTENSION_LIST.test(token)) return null
  const segments = stripRelativePrefix(token).split("/").filter(Boolean)
  if (segments.length === 0) return null
  if (segments.some((segment) => /^\d+/.test(segment))) return null
  if (segments.some((segment) => GENERATED_SEGMENTS.has(segment))) return null
  const hasExtension = EXTENSION.test(token)
  const trailingSlash = token.endsWith("/")
  const hasSlash = token.includes("/")
  if (!hasExtension && !trailingSlash && !hasSlash) return null
  return hasExtension || trailingSlash ? "path" : "path-if-rooted"
}

/** Directory bases a citation in `fileDir` may be relative to (ancestors + their src/). */
function ancestorBases(fileDir, root) {
  const bases = []
  let dir = fileDir
  for (;;) {
    bases.push(dir)
    const src = join(dir, "src")
    if (isDir(src)) bases.push(src)
    if (dir === root) break
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return bases
}

function resolveAgainst(bases, token) {
  for (const base of bases) {
    const candidate = resolve(base, token)
    if (existsSync(candidate)) return candidate
  }
  return undefined
}

/** Nearest ancestor of `fileDir` (inclusive) carrying a package.json, else root. */
function packageRoot(fileDir, root) {
  let dir = fileDir
  for (;;) {
    if (existsSync(join(dir, "package.json"))) return dir
    if (dir === root) return root
    const parent = dirname(dir)
    if (parent === dir) return root
    dir = parent
  }
}

const basenameIndexes = new Map()

/** Lazily index every file basename under a package root (generated trees skipped). */
function basenameIndex(packageDir) {
  if (basenameIndexes.has(packageDir)) return basenameIndexes.get(packageDir)
  const names = new Set()
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name))
      } else {
        names.add(entry.name)
      }
    }
  }
  walk(packageDir)
  basenameIndexes.set(packageDir, names)
  return names
}

function scriptsAlongChain(fileDir, root) {
  const scripts = new Set()
  let dir = fileDir
  for (;;) {
    const manifest = join(dir, "package.json")
    if (existsSync(manifest)) {
      for (const name of Object.keys(JSON.parse(readFileSync(manifest, "utf8")).scripts ?? {})) scripts.add(name)
    }
    if (dir === root) break
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return scripts
}

/**
 * Check every citation in one guidance file. Returns
 * `{ line, code, message }` violations, empty when the file is current.
 */
export function checkGuidanceFile(root, file) {
  const absolute = resolve(root, file)
  const fileDir = dirname(absolute)
  const bases = ancestorBases(fileDir, root)
  const srcBases = bases.filter((base) => /[\\/]src$/.test(base))
  const scripts = scriptsAlongChain(fileDir, root)
  const violations = []

  let insideMarkers = false
  let paragraphDirs = []
  const lines = readFileSync(absolute, "utf8").split(/\r?\n/)
  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    const lineNumber = index + 1
    if (line.includes(START_MARKER)) insideMarkers = true
    if (line.includes(END_MARKER)) {
      insideMarkers = false
      return
    }
    if (insideMarkers) return
    if (line === "") {
      paragraphDirs = []
      return
    }

    for (const match of line.matchAll(/\bnpm run ([\w:.<>-]+)/g)) {
      const name = match[1]
      if (PLACEHOLDER.test(name)) continue
      if (line.slice(match.index).includes("--workspace")) continue
      // `cd kernel-portal && npm run build` resolves against that directory's chain.
      const before = line.slice(0, match.index)
      const cdMatch = [...before.matchAll(/\bcd ([\w./-]+)\s*&&/g)].at(-1)
      const cdDir = cdMatch ? resolveAgainst(bases, cdMatch[1]) : undefined
      const available = cdDir ? scriptsAlongChain(cdDir, root) : scripts
      if (!available.has(name)) {
        violations.push({ line: lineNumber, code: "unknown-script", message: `${file}:${lineNumber} cites npm script "${name}" that no package.json on its chain defines` })
      }
    }

    for (const token of tokenize(line)) {
      const kind = classify(token)
      if (!kind) continue
      const lineBases = [...paragraphDirs, ...bases]

      let resolved
      if (kind === "alias") {
        resolved = resolveAgainst(srcBases, token.slice(2))
      } else {
        const rooted = stripRelativePrefix(token)
        const firstSegment = rooted.split("/")[0]
        if (kind === "path-if-rooted" && !resolveAgainst(lineBases, firstSegment)) continue
        resolved = resolveAgainst(lineBases, token)
        if (!resolved && !token.includes("/")) {
          if (basenameIndex(packageRoot(fileDir, root)).has(token)) resolved = token
        }
      }

      if (!resolved) {
        violations.push({ line: lineNumber, code: "stale-citation", message: `${file}:${lineNumber} cites "${token}" which does not resolve` })
        continue
      }
      if (resolved !== token && isDir(resolved)) paragraphDirs.push(resolved)
    }
  })
  return violations
}

/** Check every guidance file under root; returns flat `{ file, line, code, message }` list. */
export function collectCitationViolations(root) {
  basenameIndexes.clear()
  return findGuidanceFiles(root).flatMap((file) =>
    checkGuidanceFile(root, file).map((violation) => ({ file, ...violation })),
  )
}
