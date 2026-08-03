import fs from "node:fs"

const F = "docs/worklog/2026-08.md"
const raw = fs.readFileSync(F, "utf8")
const NL = raw.includes("\r\n") ? "\r\n" : "\n"

const entry = `

## 2026-08-03 (4) — The fold was a scroll problem, not a layout problem

Trimming the roll-up bought 68px and the activity table still opened below the
fold. Kept chasing it with layout and would have kept losing: the panel is sized
by what it has to say, and the viewport is not a constraint it can be argued
down to. The view was pointed at the wrong part of the page, so the view moves.

\`kernel-app/src/lib/reveal.ts\` — \`revealRow\` plus a \`useRevealOnOpen\` hook,
wired into both row tables. It moves the smaller of two distances (enough to
show the panel's bottom, or enough to put the row at the top), does nothing when
the panel is already visible, and never scrolls on collapse.

The clamp is the part worth keeping: a panel taller than the screen scrolls to
the row and stops rather than running the row off the top to chase a bottom that
will never fit. Verified at a forced 380px viewport against a 583px panel — row
lands at 16px and stays.

Second sighting of the Chrome promise-returning-scroll fault (5.13): the effect
body is a block, because a concise arrow would hand React \`window.scrollBy\`'s
promise where it expects a cleanup function. The hook carries the warning in its
own comment now instead of leaving it to be found a third time.

Measured on /scenarios: row 7 from 616px off-screen to 51px with its panel fully
in view; already-visible rows and collapses tested for stillness. On /producers:
row 9 from 833px to 178px, panel bottom 711 of 720.

**Touched:** \`kernel-app/src/lib/reveal.ts\` (new),
\`kernel-app/src/pages/scenarios.tsx\`, \`kernel-app/src/pages/producers.tsx\`,
\`docs/v2-prototype-drift.md\` (5.18).

**Still open:** both tables carry the behaviour separately because they are the
same object built twice (5.5). If that object is ever extracted, this belongs to
it.
`

fs.writeFileSync(F, raw.replace(/\s+$/, "") + entry.replace(/\n/g, NL) + NL)
console.log("worklog appended")
