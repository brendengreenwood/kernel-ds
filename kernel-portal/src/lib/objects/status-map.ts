import type { Status } from "@/components/ui/status-badge";
import type { ObjectKey } from "./index.ts";

/**
 * Contract row `status` values (`active`, `settled`, `cancelled`, `draft`)
 * do not one-to-one match the shared `StatusBadge` vocabulary. This helper is
 * the single source of truth for that mapping; every Contract preview across
 * the Objects rail must import from here rather than inlining a switch.
 *
 * Amendment A4 (2026-07-17) revises `active → booked` (viz-plum "committed and
 * live") from the earlier `active → pending` (info-blue "waiting"), which read
 * incorrectly for an in-force contract.
 */
export function contractStatus(value: unknown): Status {
  const s = typeof value === "string" ? value : "";
  if (s === "active") return "booked";
  if (s === "settled") return "settled";
  if (s === "cancelled") return "cancelled";
  return "draft";
}

/**
 * Settlement row `status` values (`pending`, `confirmed`, `reversed`) — mapped
 * onto the shared `StatusBadge` vocabulary. `confirmed → settled` (viz-mint
 * "closed out"), `reversed → cancelled` (danger tone), `pending → pending`.
 */
export function settlementStatus(value: unknown): Status {
  const s = typeof value === "string" ? value : "";
  if (s === "confirmed") return "settled";
  if (s === "reversed") return "cancelled";
  if (s === "pending") return "pending";
  return "draft";
}

/**
 * Dispatcher used by generic previews that don't know which object they're
 * rendering. Every Objects rail preview must go through this helper (or a
 * per-object helper above) — never inline the switch in a page.
 */
export function statusForObject(objectKey: ObjectKey, value: unknown): Status {
  if (objectKey === "settlement") return settlementStatus(value);
  return contractStatus(value);
}
