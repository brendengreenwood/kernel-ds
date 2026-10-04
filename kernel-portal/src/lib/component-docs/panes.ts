import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** Panes — floating pane primitives (decision 0083); parity-verified against source. */
export const panesDoc: ComponentDoc = parseComponentDoc({
  id: "panes",
  name: "Panes",
  slug: "panes",
  summary:
    "Controls that float over a canvas — a map, a chart, a diagram — instead of sitting beside it. PaneCanvas owns the 8px inset and measures its own width, FloatingPane is the surface, PaneStack is an edge column where the newest pane goes on top, PanePill opens a pane and says what it is set to, and FilterDock is a row of those pills along the bottom. Below the canvas threshold the same panes become a bottom bar with full-width panes above it.",
  status: "experimental",
  sourceFiles: ["panes.tsx"],
  metadata: { owner: "ds", kind: "component" },
  docs: [
    {
      kind: "useCases",
      use: [
        "A full-bleed map or chart whose controls should not shrink it — filters, a legend, a selected-item detail.",
        "Several independent detail panes on one edge, where opening a second pushes the first down instead of covering it.",
        "A row of filters whose closed pills still state the current setting, such as \"3 of 4 facilities\".",
      ],
      dontUse: [
        "A page of forms, tables or cards — those are connected panels; use PanelShell and PanelGroup.",
        "A single transient choice anchored to a button — that is a Popover or DropdownMenu.",
        "A blocking task — that is a Dialog or Sheet.",
      ],
    },
    {
      kind: "guidelines",
      dos: [
        "Put every pane inside one PaneCanvas so inset, gap and the sheet switch come from one place.",
        "Set the canvas threshold from the canvas's real minimum, not the window — app chrome takes a share of the window.",
        "Write pill labels as the current setting, and pass applied when it differs from the default so the closed pill shows the outline and dot.",
        "Read --pane-reserve-left and --pane-reserve-right to move canvas controls (zoom, attribution) clear of an open column.",
      ],
      donts: [
        "Don't hand-position a floating panel with absolute top-[..] classes; the pane usage gate flags it.",
        "Don't let a pane's scrollbar sit on its border — FloatingPane's body already keeps it inside the padding.",
        "Don't wrap pane triggers in a pointer-events-none layer without giving the opened pane pointer events back; FilterDock does this for you.",
      ],
    },
    {
      kind: "anatomy",
      slots: ["pane-canvas", "floating-pane", "floating-pane-body", "pane-stack", "pane-pill-bar", "pane-pill", "filter-dock", "pane-corner"],
    },
    {
      kind: "api",
      props: [
        { name: "threshold", type: "number", default: "1120", description: "PaneCanvas — canvas width in px below which panes switch to the sheet layout." },
        { name: "side", type: "\"left\" | \"right\" | \"top\" | \"bottom\"", default: "\"bottom\"", description: "FloatingPane — the edge the pane slides in from. PaneStack takes left or right for the edge it occupies." },
        { name: "title", type: "React.ReactNode", description: "FloatingPane — heading that also names the pane for assistive tech." },
        { name: "onClose", type: "() => void", description: "FloatingPane — shows a close button in the header." },
        { name: "applied", type: "boolean", default: "false", description: "PanePill and FilterDock items — the setting differs from its default; the closed pill gets an outline and dot." },
        { name: "items", type: "FilterDockItem[]", description: "FilterDock — one entry per pill: key, label, applied, title, content, paneClassName." },
        { name: "corner", type: "\"top-left\" | \"top-right\" | \"bottom-left\" | \"bottom-right\"", description: "PaneCorner — where free-standing panes or pills sit." },
      ],
    },
    {
      kind: "examples",
      items: [
        {
          title: "A canvas with a right-hand stack and a filter dock",
          description: "Newest pane on top; the dock's open pane floats above its pill.",
          language: "tsx",
          code: `const panes = usePaneOrder<"regions" | "pairs">()

<PaneCanvas>
  <Map />
  <PaneStack side="right">
    <PanePillBar aria-label="Panels">
      <PanePill active={panes.isOpen("regions")} onClick={() => panes.toggle("regions")}>Regions</PanePill>
    </PanePillBar>
    {panes.order.map((k) => (
      <FloatingPane key={k} side="right" title={k} onClose={() => panes.close(k)}>…</FloatingPane>
    ))}
  </PaneStack>
  <FilterDock items={[{ key: "type", label: "3 of 4 facilities", applied: true, content: <Checks /> }]} />
</PaneCanvas>`,
        },
      ],
    },
    {
      kind: "decisions",
      refs: [
        { number: 71, title: "Internal-tool connected geometry" },
        { number: 83, title: "Floating pane roles" },
      ],
    },
  ],
})
