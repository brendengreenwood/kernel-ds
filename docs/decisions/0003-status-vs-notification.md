# 0003 — Statuses and notifications are separate systems

Date: 2026-07-03 (recorded retroactively; in force since initial build) · Status: accepted

## Context

UI kits routinely blur "state of a thing" and "outcome of an event" into one
set of success/warning/error colors, which breaks down in a domain where
entities (loads, contracts, settlements) carry long-lived lifecycle states.

## Decision

Two distinct vocabularies that must never be conflated:

- **Statuses** = persistent lifecycle state of a domain entity. Use
  `--status-*` tokens and `<StatusBadge>`.
- **Notifications** = momentary event outcomes. Use `success` / `warning` /
  `info` variants on `Alert` / `Badge`.

## Consequences

- New lifecycle states get `--status-*` tokens (full 50→950 ramp per the
  color convention), not alert variants.
- Reviewers can reject any use of an Alert variant for entity state (or a
  status token for a toast) as a category error, by pointing at this record.
