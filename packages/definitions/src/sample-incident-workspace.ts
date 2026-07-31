/**
 * Sample alien WORKSPACE — an Incident ops preset, defined as a JSON
 * STRING (decision 0032).
 *
 * Deliberately a string constant, not an object literal: the fixture
 * round-trips through `parseWorkspacePreset` exactly the way an
 * agent-authored payload would. Paired with `sample-incident.json.ts`
 * (the alien object), the two documents are a complete tool — an
 * object plus a workspace — that no TSX anywhere knows about.
 *
 * Deliberate exercises:
 * - icon `alert` is NOT in the rail icon registry → fallback glyph
 *   (`data-slot="rail-icon-fallback"`), never a crash.
 * - groupByOptions use the Incident model's real fields (`service`,
 *   `status`) — the grouped navigator derives genuine groups with
 *   counts from a runtime-registered object.
 * - objectKey `incident` is not registered until the demo button
 *   registers it — the preset itself never touches the registry
 *   (preset-binds-keys-host-binds-data).
 */
export const incidentWorkspaceJson = JSON.stringify({
  key: "incident-ops",
  label: "Incident ops",
  modes: [
    {
      key: "incident",
      label: "Incidents",
      icon: "alert",
      objectKey: "incident",
      navigator: {
        idiom: "grouped",
        groupByOptions: ["service", "status"],
        defaultGroupBy: "service",
      },
      canvasViews: ["spatial", "table"],
      dockPanels: [{ title: "Inspector", views: ["record", "write"] }],
    },
    {
      key: "incident-query",
      label: "Incident queries",
      icon: "search",
      objectKey: "incident",
      navigator: {
        idiom: "queries",
        savedQueries: [
          "Open incidents by service",
          "Postmortems missing runbooks",
        ],
      },
      canvasViews: ["query"],
      dockPanels: [{ title: "Inspector", views: ["record", "write"] }],
    },
  ],
})
