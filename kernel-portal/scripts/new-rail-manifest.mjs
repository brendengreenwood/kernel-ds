/**
 * New-rail walk manifest (object-centric restructure).
 *
 * Each row is a page in the new Objects rail. The walk script
 * (`.mastracode/plans/ds-object-centric-restructure.proof/scripts/walk-new-rail.mjs`)
 * iterates over these rows and asserts the manifest's page-specific
 * string is present in the target locator.
 *
 * `within` values (see amendment A2 — the field name is semantic, not markup literal):
 *   - "h1": target the page's title heading. Portal convention is <h2>
 *     inside <Section>; the walk script maps "h1" to level: 2. Pages that
 *     ship a real <h1> (overview, studio) will NOT satisfy this — the
 *     walk filters strictly to level: 2. If a future manifest row points
 *     at such a page, add a separate `within: "pageTitleLevel1"` mapping
 *     to the walk (do not silently widen the level filter).
 *   - "main": target any text inside <main>, not the sidebar.
 *
 * Segments 03–06 append rows. Do not reorder existing rows — the walk
 * script iterates in list order and screenshots use the slug as filename.
 */
export const newRailManifest = [
  {
    slug: "substrate",
    path: "/substrate",
    assertion: { text: "Substrate", within: "h1" },
  },
  {
    slug: "shell",
    path: "/shell",
    assertion: { text: "Shell", within: "h1" },
  },
  {
    slug: "workspace-obj",
    path: "/workspace-obj",
    assertion: { text: "Workspace", within: "h1" },
  },
]
