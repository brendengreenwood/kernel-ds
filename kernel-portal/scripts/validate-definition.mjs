/**
 * validate-definition.mjs — schema verdicts for agent-authored documents.
 *
 * The cross-package validation boundary (decision 0033): the studio
 * server never imports portal TypeScript — it spawns this CLI as a
 * subprocess and reads one machine-readable JSON verdict line. The
 * schemas exercised here (`parseObjectModel`, `parseWorkspacePreset`)
 * are the portal's own — a single source of truth, no duplicated zod.
 *
 * Usage (run under `node --experimental-strip-types`):
 *   node --experimental-strip-types scripts/validate-definition.mjs --kind object <file.json>
 *   node --experimental-strip-types scripts/validate-definition.mjs --kind workspace -
 *     (`-` reads the document from stdin)
 *
 * Output: exactly one JSON line on stdout —
 *   { "ok": true, "kind": "object" | "workspace", "key": "<slug>" }
 *   { "ok": false, "errors": ["<issue>", ...] }
 * Exit codes: 0 valid · 1 invalid document · 2 usage error.
 *
 * Imports resolve from this script's own location (`import.meta.url`),
 * never cwd — the studio subprocess spawns it from an arbitrary cwd.
 */

import { readFileSync } from "node:fs"

const KINDS = new Set(["object", "workspace"])

function usage(message) {
  process.stderr.write(
    `${message}\nusage: node --experimental-strip-types scripts/validate-definition.mjs --kind object|workspace <file.json | ->\n`,
  )
  process.exit(2)
}

const args = process.argv.slice(2)
let kind = null
let source = null
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--kind") {
    kind = args[i + 1]
    i += 1
  } else if (source === null) {
    source = args[i]
  } else {
    usage(`unexpected argument: ${args[i]}`)
  }
}

if (!kind || !KINDS.has(kind)) usage(`--kind must be "object" or "workspace" (got: ${kind ?? "nothing"})`)
if (!source) usage("missing input: pass a JSON file path, or - for stdin")

let json
try {
  json = source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8")
} catch (err) {
  usage(`cannot read input ${source}: ${err.message}`)
}

const { parseObjectModel, parseWorkspacePreset } = await import("@kernel/definitions")

/** Flatten a thrown validation error into human-readable strings. */
function errorStrings(err) {
  if (err && Array.isArray(err.issues)) {
    // zod error: name each field by dotted path.
    return err.issues.map((issue) => {
      const path = issue.path.join(".")
      return path ? `${path}: ${issue.message}` : issue.message
    })
  }
  return [String(err?.message ?? err)]
}

try {
  let key
  if (kind === "object") {
    const { model } = parseObjectModel(json)
    key = model.key
  } else {
    const preset = parseWorkspacePreset(json)
    key = preset.key
  }
  process.stdout.write(`${JSON.stringify({ ok: true, kind, key })}\n`)
  process.exit(0)
} catch (err) {
  process.stdout.write(`${JSON.stringify({ ok: false, errors: errorStrings(err) })}\n`)
  process.exit(1)
}
