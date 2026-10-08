# Merchant workspace design system

Rules for the scenario workspace, the way `MAP-DESIGN-SYSTEM.md` sets rules for the map. A new panel follows these; it does not re-decide them. All data in v2 is simulated.

## What the workspace is for

A merchant works a **session**: a queue of shipment months per location, updated one after another. At each month they **review, then act**.

- **Review** — what has been happening. *Not defined yet.*
- **Act** — set bids, mark priority, draw priority areas.

## Rules

1. **Nothing goes out until Publish.** Bid edits, the Priority switch and priority areas are draft. A scenario with draft edits shows "Unpublished" in the header and on its navigator row. Moving the posted-bid date is navigation, not an edit.
2. **One scenario in focus.** The header names it on one line; everything else is quieter.
3. **The navigator is a work list, not a menu.** Rows show state (priority, unpublished). Collapsed, it stays usable as calendar tiles.
4. **The map is ground.** Muted base; only marks being decided get color or weight. Map channel rules live in `MAP-DESIGN-SYSTEM.md` — the hue ledger is full, so user-made things (priority areas) use stroke style, not a new hue.
5. **Numbers carry the weight, labels don't.** Panel titles are small all-caps muted labels; field labels are regular weight; values are tabular.
6. **One floating surface.** Every panel, pill and legend over the map uses the same floating-panel recipe; fields inside sit one step below it.
7. **Kernel parts only.** If a part is missing, it goes into Kernel (with a decision record) — not a local patch. Open local patches are tracked in `PATCHES.md`.
8. **Add things only when defined.** Undefined content shows "Not defined yet" or "—", never invented data or formulas.

## Layout

| Region | Holds |
|---|---|
| Rail | Scenarios · Producers · Draw areas |
| Navigator (left) | Location + commodity filters, scenarios by location, soonest shipment first |
| Header (one line) | Location, breadcrumb, updated, Priority, Archive, Publish |
| Map top-left | Pricing panel, Priority areas list, Manage competitors |
| Map top-right | View originators, View producers, Producers card; producers list slides in below |
| Map bottom-left | Legends |

## Objects

Scenario, Priority area (see `PRIORITY-AREAS.md`), Producer (name + bid, simulated).

## Not defined yet

Review content (feedback/performance), competitive zone, bid zones, competitor bids, Compute landscape, Archive, Originators and competitors panels.
