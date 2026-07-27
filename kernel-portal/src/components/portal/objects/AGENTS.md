The composed workspace surface — renders from the object model, not hand-built pages
Driven by the runtime in ../../../lib/objects (Shell → Workspace → Collection → Record)

shell.tsx — the object shell (activity rail + navigator + canvas + dock), IDE-like anatomy
workspace-obj.tsx, collection.tsx, record.tsx, query.tsx, traversal.tsx, write.tsx, substrate.tsx, designs.tsx — the object-kind surfaces
workspace/ — navigator (lists collections), panel, activity-rail, views; types.ts for view types
_previews/ — small preview cards per object kind used in docs/gallery (collection/query/record/traversal/write)

Resizable regions: navigator 22%/12%min, canvas 50%/30%min, dock 28%/14%min
Status fields resolve tones through the tone resolver — never hardcode status colors (three color axes; see ../../../.. CLAUDE.md)
Agent-authored definitions in ../../../public/definitions drive what renders here — the loader reads them at boot
