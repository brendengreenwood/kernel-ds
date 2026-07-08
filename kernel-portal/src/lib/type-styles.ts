/**
 * The system's named type roles — the single source of truth.
 *
 * These are the styles the Typography foundation documents (Display, Page
 * title, …). The portal *application* (section headers, foundation pages,
 * example screens) consumes these same strings, so what the system documents
 * and what the app renders cannot drift. Dogfooding, enforced by imports.
 *
 * Tracking tightens as size grows; small caps (overline) open up — see the
 * `kernel-typesetting` skill.
 */
export const typeStyles = {
  display: "text-5xl font-semibold tracking-[-0.025em]",
  pageTitle: "text-3xl font-semibold tracking-[-0.02em]",
  sectionTitle: "text-2xl font-semibold tracking-[-0.015em]",
  cardTitle: "text-lg font-semibold tracking-[-0.01em]",
  body: "text-base leading-relaxed",
  bodySmall: "text-sm leading-relaxed",
  label: "text-sm font-medium",
  caption: "text-xs text-muted-foreground",
  overline: "text-2xs font-semibold uppercase tracking-[0.13em] text-muted-foreground",
  numeric: "font-mono text-sm tabular-nums",
  code: "font-mono text-sm",
} as const

export type TypeRole = keyof typeof typeStyles
