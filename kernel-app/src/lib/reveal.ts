import * as React from "react"

/** Opening a row is a small navigation, so the view follows it.

    An expanded row's panel is the answer to the click that opened it, and it is
    taller than the row that spawned it — open one near the bottom of a long
    table and the answer renders below the fold, which reads as nothing having
    happened. Shrinking the panel until it fits is the wrong lever: the panel is
    sized by what it has to say, and the viewport is not a design constraint it
    can be argued down to.

    Two rules keep the scroll from being worse than the problem:

    - It moves only as far as it must. The distance is the smaller of "enough to
      show the panel's bottom" and "enough to put the row at the top" — a panel
      taller than the screen scrolls to the row and stops, rather than running
      the row off the top edge to chase a bottom that will never fit.
    - It does not move at all when the panel is already visible. A view that
      jumps on every click teaches the reader to brace for it.

    Collapsing never scrolls. The row the reader is looking at is the row they
    just closed, and moving the page out from under a close is how a list loses
    someone's place. */

/** Room left above the row, so it does not sit flush against the viewport edge. */
const TOP_GAP = 16
/** Room left below the panel, so its bottom edge is not the screen's. */
const BOTTOM_GAP = 24

/** The bottom of the space a reader can actually see into.

    On a phone the floating bottom nav sits over the last ~77px of the viewport,
    so scrolling a panel's bottom edge to `innerHeight - BOTTOM_GAP` parks it
    behind the bar — measured at 53px of the panel hidden, on a reveal that had
    not reached the end of the page (where the layer's reserved padding would
    have covered it). The usable edge is the bar's top edge.

    Measured rather than tokenised because the bar's height is its content's:
    it is `md:hidden`, and a `display: none` element measures as an all-zero
    rect — which would read as a usable bottom of 0 and scroll the page to
    nowhere. Hence the height check rather than a null check. */
function usableBottom() {
  const rect = document
    .querySelector<HTMLElement>("[data-v2-bottom-nav]")
    ?.getBoundingClientRect()
  return rect && rect.height > 0 ? rect.top : window.innerHeight
}

export function revealRow(row: HTMLElement | null) {
  if (!row) return
  const panel = row.nextElementSibling
  if (!panel) return

  const top = row.getBoundingClientRect().top
  const bottom = panel.getBoundingClientRect().bottom
  const view = usableBottom()

  if (top >= 0 && bottom <= view) return

  const toShowPanel = bottom - view + BOTTOM_GAP
  const toReachTop = top - TOP_GAP
  const delta = Math.min(toShowPanel, toReachTop)
  if (Math.abs(delta) < 2) return

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.scrollBy({ top: delta, behavior: still ? "auto" : "smooth" })
}

/** Reveals the row an id belongs to, once the panel it opened is in the DOM.

    `useLayoutEffect` rather than `useEffect`: the measurement has to happen
    after the panel is laid out and before the browser paints, or the first
    frame shows the old scroll position and the correction reads as a lurch.
    The panel animates in from opacity, not from height, so it measures at its
    full size on that first pass.

    The effect body is a block, never a concise arrow — `window.scrollBy` and
    friends return a promise in current Chrome, and returning one from an effect
    hands React a promise where it expects a cleanup function. That is the same
    fault that blanked the whole app once (register 5.13). */
export function useRevealOnOpen(id: string | null, attr: string) {
  React.useLayoutEffect(() => {
    if (!id) return
    const row = document.querySelector<HTMLElement>(`[${attr}="${CSS.escape(id)}"]`)
    revealRow(row)

    /* Then once more on the next frame, because the panel is not its final
       height yet on the pass above. `useVisibleWidth` pins the inset's width
       from a post-commit effect, and the content rewraps when it lands —
       measured at 602.5px on the layout pass against 651.9px settled, so the
       first reveal scrolled 49px short and left the panel's bottom under the
       bottom bar. The row that opened it looked *already visible* in one case
       and was skipped by the early return entirely, then grew past the bar.

       Both calls, rather than moving the whole thing to a frame later: the
       layout-effect pass is what keeps the correction off-screen in the common
       case, and `revealRow`'s own "already visible" early return makes this
       second call free whenever the first one was right. Cancelled on cleanup
       so a close that lands within the frame cannot scroll after it — closing
       must never move the page. */
    const frame = requestAnimationFrame(() => revealRow(row))
    return () => cancelAnimationFrame(frame)
  }, [id, attr])
}
