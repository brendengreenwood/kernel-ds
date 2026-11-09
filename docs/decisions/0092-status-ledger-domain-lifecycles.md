# 0092 — The status ledger carries the three domain lifecycles

Date: 2026-11-09
Status: accepted

## Decision

`StatusBadge` and the `--status-*` tokens model the three lifecycles the product
actually has, instead of a generic load/contract list:

- **Scenario**: `draft` → `published` → `archived`, with `expired` when the
  shipment window ends (Pricing scenario domain, DOMAIN.md 2026-11-07).
- **Producer bid**: `pending` → `accepted` | `rejected`, with `expired` when the
  offer lapses.
- **Contract**: `booked` → `in_transit` → `delivered` → `settled`, with
  `cancelled` as the exit.

12 statuses total. `expired` is shared across lifecycles.

## Changes

- Added `published` (viz-sky-500), `archived` (viz-clay-500), `accepted`
  (viz-crop-500).
- Removed `on_hold`. Its viz-clay hue transfers to `archived`; the color ramp
  itself is untouched — hues are held for future statuses, never deleted.
- The portal's Pricing scenario page previously faked `published` by rendering
  `settled` with an overridden label — the exact local-patch the library rule
  forbids. It now uses the real status.

## Why

The flagship domain page lying about its own lifecycle was the clearest signal
the ledger was wrong. Statuses are a contract with the live kernel-app theme
(decision 0089 pattern): if a lifecycle state doesn't exist in the ledger, the
consumer invents a mapping, and every invented mapping drifts.

## Migration

`on_hold` consumers: use `cancelled` for dead records, `pending` for bids
awaiting action. `settled`-with-label-"Published" fakes: use `published`.
