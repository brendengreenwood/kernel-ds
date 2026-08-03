import fs from "node:fs"

const F = "docs/v2-prototype-drift.md"
const raw = fs.readFileSync(F, "utf8")
const NL = raw.includes("\r\n") ? "\r\n" : "\n"
const fix = (t) => t.replace(/\r?\n/g, NL)

const anchor = fix(`\`data-v2-meter\` is an anatomy hook with no rule behind it yet: the meter is
still utilities, and the marker exists so a probe can address it by name.

---`)

const entry = fix(`\`data-v2-meter\` is an anatomy hook with no rule behind it yet: the meter is
still utilities, and the marker exists so a probe can address it by name.

**5.18 — Opening a row moves the view to it.** \`kernel-app/src/lib/reveal.ts\`.
An expanded row's panel is the answer to the click that opened it, and it is
several times the height of the row that spawned it. Open one low in a long
table and the answer renders below the fold, which reads as nothing having
happened — the reader clicks again, and closes it.

The alternative was shrinking the panel until it fits, which is the wrong lever:
the panel is sized by what it has to say, and the viewport is not a design
constraint that can be argued down to. Trimming the roll-up (5.15) bought 68px
and the table still opened below the fold. Scroll is the honest fix, because the
problem is not that the panel is too big, it is that the view is pointed at the
wrong part of the page.

Three rules keep the scroll from being worse than the problem:

- **It moves the smaller of two distances** — enough to show the panel's bottom,
  or enough to put the row at the top. A panel taller than the screen scrolls to
  the row and stops, rather than running the row off the top edge to chase a
  bottom that will never fit. Measured at a forced 380px viewport with a 583px
  panel: the row lands at 16px from the top and stays there.
- **It does not move when the panel is already visible.** A view that jumps on
  every click teaches the reader to brace for it.
- **Collapsing never scrolls.** The row the reader is looking at is the row they
  just closed, and moving the page out from under a close is how a list loses
  someone's place.

\`useLayoutEffect\`, not \`useEffect\`: the measurement has to land after the panel
is laid out and before the browser paints, or the first frame shows the old
position and the correction reads as a lurch. The panel animates from opacity
rather than from height, so it measures at full size on that pass.

The effect body is a block, never a concise arrow. \`window.scrollBy\` returns a
promise in current Chrome, and a concise arrow would hand React that promise
where it expects a cleanup function — the exact fault that blanked the whole app
in 5.13. Second instance of the same shape, which is why the hook carries the
warning in its own comment rather than leaving it to be rediscovered a third
time.

Both row tables use it — \`data-scenario-row\` and \`data-producer-row\` — because
the two tables are the same object built twice (5.5), and a behaviour that
exists on one of them is a bug on the other.

*Promotion:* the DS has no expanding-row object to hang this on. If 5.5 is ever
promoted, this is part of what that object does, not a page's local flourish.

---`)

if (!raw.includes(anchor)) throw new Error("anchor missing: 5.17 tail")
fs.writeFileSync(F, raw.replace(anchor, entry).replace(
  fix("| 5 | App-level convention departures | 17 | mixed — see each entry |"),
  fix("| 5 | App-level convention departures | 18 | mixed — see each entry |")
))
console.log("5.18 written")
