import type { Status } from "@/components/ui/status-badge";
import type { ObjectModel, StatusTone } from "./types.ts";
import { contractModel } from "./contract.ts";
import { settlementModel } from "./settlement.ts";
// Imported via the barrel (not registry.ts directly) so evaluating this
// module also seeds the static objects into the runtime registry.
import { getObjectModel } from "./index.ts";

/**
 * The single tone → StatusBadge mapping. Every status badge across the
 * Objects rail derives from a model-declared `ObjectStatus.tone` through
 * this map — never from a per-object switch.
 *
 * Amendment A4 (2026-07-17): `active → booked` (viz-plum "committed and
 * live"), never `pending` (info-blue "waiting"), which read incorrectly
 * for an in-force contract.
 */
export const toneToStatus: Record<StatusTone, Status> = {
  draft: "draft",
  active: "booked",
  success: "settled",
  warning: "pending",
  danger: "cancelled",
  neutral: "draft",
};

/**
 * Generic status path: resolve a row's raw status value against the
 * model's declared statuses, then map the declared tone onto the shared
 * `StatusBadge` vocabulary. Unknown keys fall back to `"draft"` silently
 * (recorded follow-up on the board — no logging here).
 */
export function statusFromModel(model: ObjectModel, value: unknown): Status {
  const entry = model.statuses.find((s) => s.key === value);
  if (!entry) return "draft";
  return toneToStatus[entry.tone];
}

/**
 * Contract convenience wrapper — kept so existing callers don't change.
 * Delegates to the generic path; contract.ts declares `active` with tone
 * `"active"`, so this still maps active → booked per Amendment A4.
 */
export function contractStatus(value: unknown): Status {
  return statusFromModel(contractModel, value);
}

/**
 * Settlement convenience wrapper — kept so existing callers don't change.
 * settlement.ts declares `confirmed → success` (settled), `reversed →
 * danger` (cancelled), `pending → warning` (pending).
 */
export function settlementStatus(value: unknown): Status {
  return statusFromModel(settlementModel, value);
}

/**
 * Dispatcher used by generic previews that don't know which object they're
 * rendering. Any registered object key works — the model is looked up in
 * the runtime registry and delegated to the generic path. Every Objects
 * rail preview must go through this helper (or a per-object helper above)
 * — never inline the switch in a page.
 */
export function statusForObject(objectKey: string, value: unknown): Status {
  const model = getObjectModel(objectKey);
  if (!model) return "draft";
  return statusFromModel(model, value);
}

/**
 * Label path (decision 0031): the model's declared status label is the
 * display truth for badge text; tones remain the color truth. Returns
 * `undefined` for unknown status keys so `StatusBadge` falls back to its
 * default vocabulary — consistent with the silent-unknown tone fallback
 * above (recorded follow-up on the board).
 */
export function statusLabelFromModel(
  model: ObjectModel,
  value: unknown,
): string | undefined {
  const entry = model.statuses.find((s) => s.key === value);
  return entry?.label;
}

/**
 * Registry-lookup twin of `statusForObject` for generic previews. Unknown
 * object keys return `undefined` → badge default label fallback.
 */
export function statusLabelForObject(
  objectKey: string,
  value: unknown,
): string | undefined {
  const model = getObjectModel(objectKey);
  if (!model) return undefined;
  return statusLabelFromModel(model, value);
}
