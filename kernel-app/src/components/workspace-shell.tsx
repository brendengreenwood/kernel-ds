import { Outlet } from "react-router-dom"

/** The workspace body.
 *
 *  The page body puts one plate on the canvas and scrolls a document inside
 *  it. A workspace is a different shape: the work is a single object, it
 *  fills the viewport, and nothing scrolls but the lists beside it. So the
 *  body is laid out rather than flowed, and the elevation ladder explains
 *  itself:
 *
 *    rail + navigator   on the canvas, recessed — they CHOOSE the work
 *    canvas plate       the one raised surface — it IS the work
 *    dock               above the plate, casting onto it — it ACTS on the work
 *
 *  Navigator before, dock after. The asymmetry is the point: chrome that
 *  picks a subject sits under it, chrome that edits the subject sits over it.
 *
 *  The rail is not here because it is not ours — it belongs to the frame
 *  above, shared with the page body, which is what lets it animate between
 *  the two rather than being rebuilt at the boundary. All this level owns is
 *  the frame's shape: full height, and nothing scrolls but the navigator's
 *  list and the dock's body. */
export function WorkspaceShell() {
  return <Outlet />
}
