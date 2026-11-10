#!/usr/bin/env node
/**
 * UI comes from @kernel/ui — fix Kernel, don't patch locally (the library rule).
 * Flags hand-spun UI in consumer code where a Kernel component already exists:
 * raw form/table elements, hand-built card surfaces, and icon packages other
 * than the Kernel icon shim. Ratcheted: the baseline file records known
 * offenders per file and rule; counts may only go down, and a new file starts
 * at zero.
 *   node scripts/check-ds-usage.mjs            check
 *   node scripts/check-ds-usage.mjs --update   rewrite baseline
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs"
import { join, relative, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, "..", "..")
const roots = ["kernel-portal/src", "prototypes/origination-map-v2/src"]
const baselinePath = join(here, "ds-usage-baseline.json")

const tag = (name) => new RegExp(`<${name}(?=[\\s/>])`, "g")
const classAttr = /className=(?:"([^"]*)"|\{[^}]*?["'`]([^"'`]*)["'`])/g
const has = (cls, token) => new RegExp(`(^|\\s)${token}(\\s|$)`).test(cls)

/** rule id → { count(src), use } */
const rules = {
  "raw-button": { count: (s) => (s.match(tag("button")) ?? []).length, use: "Button" },
  "raw-input": { count: (s) => (s.match(tag("input")) ?? []).length, use: "Input, Checkbox, Switch or RadioGroup" },
  "raw-select": { count: (s) => (s.match(tag("select")) ?? []).length, use: "Select or NativeSelect" },
  "raw-textarea": { count: (s) => (s.match(tag("textarea")) ?? []).length, use: "Textarea" },
  "raw-label": { count: (s) => (s.match(tag("label")) ?? []).length, use: "Label or Field" },
  "raw-table": { count: (s) => (s.match(tag("table")) ?? []).length, use: "Table" },
  "hand-card": {
    count: (s) => {
      let n = 0
      for (const m of s.matchAll(classAttr)) {
        const cls = m[1] ?? m[2] ?? ""
        if (has(cls, "rounded-lg") && has(cls, "border") && has(cls, "bg-card")) n++
      }
      return n
    },
    use: "Card",
  },
  "foreign-icons": {
    count: (s) => (s.match(/from\s+["'](lucide-react|@heroicons\/[^"']+|react-icons\/[^"']+)["']/g) ?? []).length,
    use: "the icon shim (@kernel/ui/icon)",
  },
}

function walk(dir, out) {
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.tsx$/.test(e.name)) out.push(p)
  }
  return out
}

// Comments describe UI without building it; strip them so prose never counts.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")

const found = {}
for (const r of roots) {
  for (const f of walk(join(repo, r), [])) {
    const rel = relative(repo, f).replaceAll("\\", "/")
    const src = stripComments(readFileSync(f, "utf8"))
    for (const [id, rule] of Object.entries(rules)) {
      const n = rule.count(src)
      if (n) (found[rel] ??= {})[id] = n
    }
  }
}

if (process.argv.includes("--update")) {
  const sorted = Object.fromEntries(Object.keys(found).sort().map((f) => [f, found[f]]))
  writeFileSync(baselinePath, JSON.stringify(sorted, null, 2) + "\n")
  console.log(`DS-USAGE baseline written: ${Object.keys(sorted).length} files`)
  process.exit(0)
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {}
const errors = []
const totals = {}
for (const [f, byRule] of Object.entries(found)) {
  for (const [id, n] of Object.entries(byRule)) {
    totals[id] = (totals[id] ?? 0) + n
    const allowed = baseline[f]?.[id] ?? 0
    if (n > allowed) errors.push(`${f}: ${n} ${id}, baseline ${allowed} — use ${rules[id].use} from @kernel/ui`)
  }
}
if (errors.length) {
  console.error(errors.join("\n"))
  console.error(`DS-USAGE-FAILED: ${errors.length} file/rule pair(s) above baseline. If Kernel lacks the piece, add it to @kernel/ui instead of building it here.`)
  process.exit(1)
}
const stale = []
for (const [f, byRule] of Object.entries(baseline))
  for (const [id, n] of Object.entries(byRule)) if ((found[f]?.[id] ?? 0) < n) stale.push(`${f} (${id})`)
if (stale.length) console.log(`ratchet: ${stale.length} baseline entr${stale.length === 1 ? "y" : "ies"} can drop (run --update): ${stale.slice(0, 5).join(", ")}${stale.length > 5 ? ", …" : ""}`)
const summary = Object.entries(totals).sort().map(([id, n]) => `${id} ${n}`).join(", ")
console.log(`DS-USAGE-OK: ${Object.values(totals).reduce((a, b) => a + b, 0)} baselined across ${Object.keys(found).length} files${summary ? ` (${summary})` : ""}`)
