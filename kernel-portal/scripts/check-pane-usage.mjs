#!/usr/bin/env node
/**
 * Floating panes must come from @kernel/ui panes.tsx (decision 0083).
 * Flags hand-rolled floating panels: an `absolute` element combining a
 * translucent card fill with backdrop blur, or pane-like arbitrary
 * top-[..]/left-[..] positioning on a card surface. Ratcheted: the baseline
 * file records known offenders per file; counts may only go down.
 *   node scripts/check-pane-usage.mjs            check
 *   node scripts/check-pane-usage.mjs --update   rewrite baseline
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs"
import { join, relative, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, "..", "..")
const roots = ["kernel-portal/src", "packages/ui/src"]
const allow = new Set(["packages/ui/src/components/ui/panes.tsx"])
const baselinePath = join(here, "pane-usage-baseline.json")

const classAttr = /className=(?:"([^"]*)"|\{[^}]*?["'`]([^"'`]*)["'`])/g
function offences(cls) {
  if (!/(^|\s)absolute(\s|$)/.test(cls)) return false
  const card = /\bbg-(card|popover|background)\/\d+/.test(cls)
  const blur = /\bbackdrop-blur/.test(cls)
  const arbitraryPos = /\b(top|left)-\[/.test(cls) && /\bbg-(card|popover)/.test(cls)
  return (card && blur) || arbitraryPos
}

function walk(dir, out) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.tsx$/.test(e.name)) out.push(p)
  }
  return out
}

const found = {}
for (const r of roots) {
  for (const f of walk(join(repo, r), [])) {
    const rel = relative(repo, f).replaceAll("\\", "/")
    if (allow.has(rel)) continue
    const src = readFileSync(f, "utf8")
    let n = 0
    for (const m of src.matchAll(classAttr)) if (offences(m[1] ?? m[2] ?? "")) n++
    if (n) found[rel] = n
  }
}

if (process.argv.includes("--update")) {
  writeFileSync(baselinePath, JSON.stringify(found, null, 2) + "\n")
  console.log(`PANE-USAGE baseline written: ${Object.keys(found).length} files`)
  process.exit(0)
}

const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {}
const errors = []
for (const [f, n] of Object.entries(found)) {
  const allowed = baseline[f] ?? 0
  if (n > allowed) errors.push(`${f}: ${n} hand-rolled floating pane(s), baseline ${allowed} — use PaneCanvas/FloatingPane/PaneStack from @kernel/ui`)
}
const stale = Object.keys(baseline).filter((f) => (found[f] ?? 0) < baseline[f])
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
if (stale.length) console.log(`ratchet: lower baseline for ${stale.join(", ")} (run --update)`)
console.log(`PANE-USAGE-OK: ${Object.values(found).reduce((a, b) => a + b, 0)} baselined, ${Object.keys(found).length} files`)
