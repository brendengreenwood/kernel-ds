import fs from "node:fs"

const read = (p) => fs.readFileSync(p, "utf8")
const edit = (p, pairs) => {
  let s = read(p)
  const NL = s.includes("\r\n") ? "\r\n" : "\n"
  const fix = (t) => t.replace(/\r?\n/g, NL)
  for (const [rawFind, rawNext] of pairs) {
    const find = fix(rawFind)
    if (!s.includes(find)) throw new Error(`anchor missing in ${p}: ${rawFind.slice(0, 50)}`)
    s = s.split(find).join(fix(rawNext))
  }
  fs.writeFileSync(p, s)
}

const toggleBefore = `  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })`

const toggleAfter = (attr) => `  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  // Only an open is worth following: see lib/reveal.
  const [opened, setOpened] = React.useState<string | null>(null)
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      setOpened(next.has(id) ? id : null)
      return next
    })
  useRevealOnOpen(opened, "${attr}")`

/* --------------------------------------------------------- scenarios.tsx -- */

edit("kernel-app/src/pages/scenarios.tsx", [
  [`import { basis, bushelsShort } from "@app/lib/format"`, `import { basis, bushelsShort } from "@app/lib/format"
import { useRevealOnOpen } from "@app/lib/reveal"`],
  [toggleBefore, toggleAfter("data-scenario-row")],
  [
    `                <TableRow
                  onClick={() => toggle(s.id)}
                  data-state={expanded.has(s.id) ? "selected" : undefined}`,
    `                <TableRow
                  data-scenario-row={s.id}
                  onClick={() => toggle(s.id)}
                  data-state={expanded.has(s.id) ? "selected" : undefined}`,
  ],
])

/* --------------------------------------------------------- producers.tsx -- */

edit("kernel-app/src/pages/producers.tsx", [
  [toggleBefore, toggleAfter("data-producer-row")],
  [
    `                  <TableRow
                    onClick={() => toggle(p.id)}
                    data-state={expanded.has(p.id) ? "selected" : undefined}`,
    `                  <TableRow
                    data-producer-row={p.id}
                    onClick={() => toggle(p.id)}
                    data-state={expanded.has(p.id) ? "selected" : undefined}`,
  ],
])

const prod = read("kernel-app/src/pages/producers.tsx")
if (!prod.includes("@app/lib/reveal")) {
  const NL = prod.includes("\r\n") ? "\r\n" : "\n"
  const anchor = prod.match(/^import .*@app\/lib\/format.*$/m)
  if (!anchor) throw new Error("producers: no format import to anchor on")
  fs.writeFileSync(
    "kernel-app/src/pages/producers.tsx",
    prod.replace(anchor[0], `${anchor[0]}${NL}import { useRevealOnOpen } from "@app/lib/reveal"`)
  )
}

console.log("wired")
