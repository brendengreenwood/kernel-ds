/**
 * Sample alien object — an Incident, defined as a JSON STRING.
 *
 * Deliberately a string constant, not an object literal: the point of the
 * fixture is that it round-trips through `parseObjectModel` exactly the
 * way an agent-authored payload would (studio `defineObject`, next plan).
 * Deliberately non-grain: it exercises the generic status path with tones
 * the trade domain never uses together, an association to a target that
 * is not registered (`runbook` — previews null-guard), and rows WITHOUT
 * coords so the deterministic derivation kicks in.
 *
 * No TSX anywhere knows about Incidents; the Designs page registers this
 * blob at runtime and the full suite derives.
 */
export const incidentJson = JSON.stringify({
  model: {
    key: "incident",
    label: "Incident",
    plural: "Incidents",
    fields: [
      { key: "id", label: "ID", type: "text", sample: "INC-1042" },
      { key: "title", label: "Title", type: "text", sample: "API latency spike" },
      { key: "service", label: "Service", type: "text", sample: "pricing-api" },
      { key: "detected", label: "Detected", type: "date", sample: "2026-07-12" },
      { key: "impactedUsers", label: "Impacted users", type: "number", sample: 1240 },
      { key: "status", label: "Status", type: "status", sample: "open" },
      { key: "runbookId", label: "Runbook", type: "ref", sample: "RB-7" },
    ],
    statuses: [
      { key: "open", label: "Open", tone: "danger" },
      { key: "mitigating", label: "Mitigating", tone: "warning" },
      { key: "resolved", label: "Resolved", tone: "success" },
      { key: "postmortem", label: "Postmortem", tone: "neutral" },
    ],
    associations: [
      // Nothing grain-shaped; "runbook" is not a registered object —
      // previews null-guard unregistered targets.
      { key: "runbook", label: "Runbook", targetObjectKey: "runbook" },
    ],
  },
  rows: [
    // No coord on any row — parseObjectModel must derive them.
    {
      id: "INC-1042",
      title: "API latency spike",
      service: "pricing-api",
      detected: "2026-07-12",
      impactedUsers: 1240,
      status: "open",
      runbookId: "RB-7",
    },
    {
      id: "INC-1043",
      title: "Webhook delivery failures",
      service: "notifications",
      detected: "2026-07-12",
      impactedUsers: 310,
      status: "mitigating",
      runbookId: "RB-3",
    },
    {
      id: "INC-1044",
      title: "Search index drift",
      service: "search",
      detected: "2026-07-13",
      impactedUsers: 88,
      status: "mitigating",
      runbookId: "RB-11",
    },
    {
      id: "INC-1045",
      title: "Login CAPTCHA loop",
      service: "auth",
      detected: "2026-07-14",
      impactedUsers: 5400,
      status: "resolved",
      runbookId: "RB-2",
    },
    {
      id: "INC-1046",
      title: "Stale dashboard tiles",
      service: "analytics",
      detected: "2026-07-15",
      impactedUsers: 42,
      status: "resolved",
      runbookId: "RB-9",
    },
    {
      id: "INC-1047",
      title: "Duplicate email sends",
      service: "notifications",
      detected: "2026-07-15",
      impactedUsers: 2100,
      status: "postmortem",
      runbookId: "RB-3",
    },
    {
      id: "INC-1048",
      title: "Cold-start timeouts",
      service: "pricing-api",
      detected: "2026-07-16",
      impactedUsers: 660,
      status: "open",
      runbookId: "RB-7",
    },
  ],
})
