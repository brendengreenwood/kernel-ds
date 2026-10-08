# Priority areas

A shape the merchant draws on the map to tell the team which producers to work first.
All data in v2 is simulated.

## Object

**Priority area** — a named shape drawn with the lasso.

| Relationship | Target | Rule |
| --- | --- | --- |
| belongs to | Scenario | Every scenario has its own areas. Areas are not shared across scenarios. |
| contains | Producers | Derived from the shape. Never entered by hand. |
| reaches | Originators | Only on Publish. Who receives it is out of scope (data, not design). |

Not related to pricing or competitors. Drawing an area never changes a bid.

## Lifecycle

- Drawing, renaming, hiding or deleting an area is a **draft edit** of the scenario.
- Nothing reaches originators until **Publish**, together with the scenario's other edits.
- The scenario must show it has unpublished changes.

## Affordances

One **Areas** list per scenario, separate from the map's data layers:

- draw (lasso), name, rename, delete
- hide / show
- select a row to highlight its shape on the map
- producer count per area

## Map channel

The hue ledger is full. Areas use **stroke style** (dashed outline, light fill), not a new hue.

## Session rule

The merchant explores freely; nothing reaches originators until **Publish**.
This covers areas, the Priority switch, and bid edits alike.

## Producers

- A producer row shows **name** and **bid**. Values are simulated; no calculation is modeled.
- A producer may sit in more than one area. No meaning is attached to overlap.
