---
"@kernel/ui": major
---

StatusBadge now carries the three real domain lifecycles instead of a generic load/contract list. Added `published` (viz-sky), `archived` (viz-clay), and `accepted` (viz-crop); removed `on_hold`. The ledger is now scenario (draft → published → archived), producer bid (pending → accepted | rejected), and contract (booked → in_transit → delivered → settled, cancelled exits), with `expired` shared. Breaking: any `<StatusBadge status="on_hold">` must migrate — use `cancelled` for dead records or `pending` for bids awaiting action. The `--status-onhold` token is removed; the viz-clay ramp itself is unchanged and now backs `archived`. See decision 0092.
