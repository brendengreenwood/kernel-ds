App chrome + doc/gallery/foundations pages + the objects/ workspace. Composes ui/ primitives

app-shell.tsx / app-sidebar.tsx — the shell: collapsible sidebar groups (Components/Elements/Patterns/Marks) + search. A new nav section adds a rail entry here AND a <Route> in main.tsx (decision 0011 — every rail item is its own page; no single-scroll, no scrollspy)
component-doc-sections.tsx — the doc-entity renderer (9 block kinds → carded sections, green/red Do/Don't, definition rows, kbd keyboard tables). Overlines use typeStyles.overline; the exported renderInlineCode() styles backtick terms
section.tsx — page section wrapper; lead accepts React.ReactNode
on-this-page.tsx — sticky right-rail TOC (IntersectionObserver scroll-spy), visible ≥2xl
foundations.tsx + *-foundation.tsx — token showcases (color/type/spacing/shadow/motion/icons/a11y/layout). MUST stay in sync when index.css tokens change
install.tsx, doc-pager.tsx, gallery-nav.tsx — install snippets, prev/next, gallery nav

Overlines: use typeStyles.overline (or cn(typeStyles.overline, colorOverride)), never a hand-rolled uppercase+tracking recipe — check-style-fidelity.mjs enforces this
Radius: rounded-lg (maps to --radius), never rounded-xl/2xl

objects/ — the composed workspace surface (see objects/AGENTS.md if present): navigator (collections) + canvas (data table) + dock (record detail + chat). Driven by the object-model runtime in ../../lib/objects
