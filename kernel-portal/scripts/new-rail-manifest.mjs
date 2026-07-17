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
 *     inside <Section>; the walk script maps "h1" to level: 2. Both
 *     legacy pages that ship a real <h1> (overview, studio) also
 *     satisfy the check because getByRole matches the heading role at
 *     any level when narrowed by exact name — but for consistency, the
 *     walk uses level: 2.
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
]
