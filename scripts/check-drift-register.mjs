/* Consistency gate for docs/v2-prototype-drift.md.
 *
 * The register is the promotion queue (decision 0056), so its numbers are
 * citations: entries reference each other by number, and this branch has now
 * hit collision-by-parallel-track three times — decisions 0040-0043, register
 * row 3.18, and Part 5's doubled 5.10/5.11. Each one was found by hand during
 * a merge. This finds them before the merge.
 *
 * Decision filenames are checked here too. That collision is what this gate was
 * written about and it was the one instance the gate could not see, which is
 * how it went uncounted at three when it was really four.
 *
 * Also checks that the modification layer and its documentation agree: every
 * `data-v2-*` marker in v2-layer.css must appear in the register, and every
 * source path the register cites must still exist.
 *
 *   node scripts/check-drift-register.mjs
 */
import fs from "node:fs"

const REG = "docs/v2-prototype-drift.md"
const CSS = "kernel-app/src/v2-layer.css"
const DECISIONS = "docs/decisions"

const doc = fs.readFileSync(REG, "utf8")
const lines = doc.split(/\r?\n/)
const problems = []
const fail = (m) => problems.push(m)

if (lines.some((l) => /^(<<<<<<<|=======|>>>>>>>)/.test(l))) fail("unresolved conflict markers")

/* Numbering: unique, ascending, no gaps. A register read by number should be
   readable in number order. */
const series = [
  { name: "Part 3 rules", re: /^\| 3\.(\d+) \|/ },
  { name: "Part 4 sections", re: /^## 4\.(\d+) / },
  { name: "Part 5 entries", re: /^\*\*5\.(\d+)/ },
]
for (const { name, re } of series) {
  const ns = lines.map((l) => l.match(re)).filter(Boolean).map((m) => Number(m[1]))
  if (!ns.length) { fail(`${name}: none found — did the format change?`); continue }
  const dupes = [...new Set(ns.filter((n, i) => ns.indexOf(n) !== i))]
  if (dupes.length) fail(`${name}: duplicate ${dupes.join(", ")} — two tracks minted the same number`)
  if (ns.some((n, i) => i && n < ns[i - 1])) fail(`${name}: out of numeric order`)
  for (let i = ns[0]; i < ns.at(-1); i++)
    if (!ns.includes(i)) fail(`${name}: gap at ${name[5]}.${i} — retired entries stay in place, struck through`)
}

/* The summary table is the first thing anyone reads; it must not lie. */
const rules = lines.filter((l) => /^\| 3\.\d+ \|/.test(l)).length
const entries = lines.filter((l) => /^\*\*5\.\d+/.test(l)).length
const dsChanges = lines.filter((l) => /^## 4\.\d+ /.test(l)).length
const sum3 = lines.find((l) => l.startsWith("| 3 | Modification layer")) ?? ""
const sum4 = lines.find((l) => l.startsWith("| 4 | **DS source changes**")) ?? ""
const sum5 = lines.find((l) => l.startsWith("| 5 | App-level")) ?? ""
if (!sum3.includes(`${rules} rule groups`)) fail(`summary claims a different rule count than the ${rules} rows present`)
if (!sum4.includes(`| ${dsChanges} |`)) fail(`summary claims a different Part 4 count than the ${dsChanges} sections present`)
if (!sum5.includes(`| ${entries} |`)) fail(`summary claims a different Part 5 count than the ${entries} entries present`)

/* Part 4 is the cherry-pick list, so its index is the part someone actually
   shops from. It stopped at 4.6 while five more sections sat below it — an
   index that silently stops short hides exactly the newest fixes. */
const p4Index = lines.filter((l) => /^\| 4\.(\d+) \|/.test(l)).map((l) => Number(l.match(/^\| 4\.(\d+) \|/)[1]))
for (const l of lines.filter((l) => /^## 4\.(\d+) /.test(l))) {
  const n = Number(l.match(/^## 4\.(\d+) /)[1])
  if (!p4Index.includes(n)) fail(`Part 4 section 4.${n} is missing from the index table`)
}
for (const n of p4Index)
  if (!lines.some((l) => l.startsWith(`## 4.${n} `))) fail(`Part 4 index lists 4.${n}, which has no section`)

for (const l of lines.filter((l) => /^\| 3\.\d+ \|/.test(l)))
  if ((l.match(/\|/g) || []).length !== 5) fail(`malformed table row: ${l.slice(0, 44)}…`)

/* Cross-references. Matched only in citation form, so contrast ratios like
   5.79:1 are not mistaken for entry numbers. */
const cites = [
  ...doc.matchAll(/\(([35])\.(\d+)\)/g),
  ...doc.matchAll(/(?:see|per|in|and) ([35])\.(\d+)(?![\d:.])/g),
  ...doc.matchAll(/\b([35])\.(\d+)'s/g),
]
for (const [, part, n] of cites) {
  const found = part === "3"
    ? lines.some((l) => l.startsWith(`| 3.${n} |`))
    : lines.some((l) => l.startsWith(`**5.${n}`))
  if (!found) fail(`dangling reference to ${part}.${n}`)
}

/* The layer and its documentation must describe the same set of markers. */
if (fs.existsSync(CSS)) {
  const css = fs.readFileSync(CSS, "utf8")
  for (const m of [...new Set(css.match(/data-v2-[a-z-]+/g) ?? [])].sort())
    if (!doc.includes(m)) fail(`marker ${m} is in the layer but not the register`)
}

for (const p of [...new Set(doc.match(/kernel-app\/src\/[A-Za-z0-9/._-]+/g) ?? [])])
  if (!fs.existsSync(p)) fail(`register cites a path that no longer exists: ${p}`)

/* Decision numbers. Two tracks minting the same number is only visible as two
   files sharing a prefix, and nothing else in the repo looks. */
if (fs.existsSync(DECISIONS)) {
  const byNumber = new Map()
  for (const f of fs.readdirSync(DECISIONS).filter((f) => f.endsWith(".md"))) {
    const m = f.match(/^(\d{4})-/)
    if (!m) { fail(`decision file is not numbered: ${f}`); continue }
    byNumber.set(m[1], [...(byNumber.get(m[1]) ?? []), f])
  }
  for (const [n, files] of byNumber)
    if (files.length > 1) fail(`decision ${n} exists ${files.length} times: ${files.join(", ")}`)

  /* A heading that disagrees with its filename sends a reader to the wrong
     record, which is how a renumber half-lands. */
  for (const [n, [f]] of byNumber) {
    if (byNumber.get(n).length > 1) continue
    const head = fs.readFileSync(`${DECISIONS}/${f}`, "utf8").split(/\r?\n/)[0]
    if (!head.startsWith(`# ${n} `)) fail(`decision ${f} opens with "${head.slice(0, 40)}…", not # ${n}`)
  }
}

if (problems.length) {
  console.error(`drift register: ${problems.length} problem(s)\n`)
  for (const p of problems) console.error("  - " + p)
  process.exit(1)
}
console.log(
  `drift register consistent — ${rules} rule groups, ${dsChanges} DS source changes, ${entries} app-level entries`
)
console.log(`decision numbers unique — ${fs.readdirSync(DECISIONS).filter((f) => f.endsWith(".md")).length} records`)
