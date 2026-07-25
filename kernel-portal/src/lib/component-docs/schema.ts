/**
 * Component documentation schema — a DSDS-forked structured layer for
 * documenting design-system components (decision 0035).
 *
 * We fork DSDS's *structural* patterns (typed document blocks, conformance
 * levels, an extensions escape hatch) while keeping human content as plain
 * strings/markdown and reusing our existing `Maturity` model. Each component
 * doc is a `ComponentDoc` entity carrying a `docs` array of typed `DocBlock`s.
 * A parity gate (`scripts/check-component-docs.mjs`) cross-checks the
 * machine-readable blocks (variants, anatomy, api) against the component
 * source so documented claims cannot silently drift.
 */

import { z } from "zod"

/** Reuse the lifecycle taxonomy from the component registry. */
export const maturitySchema = z.enum(["experimental", "ready", "deprecated"])
export type Maturity = z.infer<typeof maturitySchema>

/* ------------------------------------------------------------------ *
 * Document blocks — a discriminated union on `kind`.
 * Eight typed kinds. Human prose lives in string fields (markdown-ready);
 * machine-checkable structure lives in typed arrays the gate reads.
 * ------------------------------------------------------------------ */

const guidelinesBlock = z.object({
  kind: z.literal("guidelines"),
  dos: z.array(z.string()),
  donts: z.array(z.string()),
})

const apiBlock = z.object({
  kind: z.literal("api"),
  props: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      default: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
})

/**
 * A variant key is either a bare identifier or an object pairing the key with
 * a one-line purpose (Primer-style per-variant guidance). The parity gate and
 * renderer normalize via `variantKeyName` so both forms are interchangeable.
 */
const variantKey = z.union([
  z.string(),
  z.object({ key: z.string(), description: z.string() }),
])

/** Normalize a variant key (string | {key,description}) to its key string. */
export function variantKeyName(k: z.infer<typeof variantKey>): string {
  return typeof k === "string" ? k : k.key
}

const variantsBlock = z.object({
  kind: z.literal("variants"),
  groups: z.array(
    z.object({
      axis: z.string(),
      keys: z.array(variantKey),
      defaultKey: z.string().optional(),
    }),
  ),
})

const anatomyBlock = z.object({
  kind: z.literal("anatomy"),
  slots: z.array(z.string()),
})

const statesBlock = z.object({
  kind: z.literal("states"),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
})

const accessibilityBlock = z.object({
  kind: z.literal("accessibility"),
  role: z.string().optional(),
  ariaAttributes: z.array(z.string()).optional(),
  keyboardInteractions: z
    .array(z.object({ key: z.string(), action: z.string() }))
    .optional(),
})

const useCasesBlock = z.object({
  kind: z.literal("useCases"),
  use: z.array(z.string()),
  dontUse: z.array(z.string()),
})

const decisionsBlock = z.object({
  kind: z.literal("decisions"),
  refs: z.array(z.object({ number: z.number(), title: z.string() })),
})

/**
 * A usage example — a titled, copy-pasteable code snippet. `code` is the
 * exact source an engineer can paste; `description` frames when to use it.
 * Machine-readable so the ds-bundle can hand agents real working code.
 */
const examplesBlock = z.object({
  kind: z.literal("examples"),
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      code: z.string(),
      language: z.string().optional(),
    }),
  ),
})

export const docBlockSchema = z.discriminatedUnion("kind", [
  guidelinesBlock,
  apiBlock,
  variantsBlock,
  anatomyBlock,
  statesBlock,
  accessibilityBlock,
  useCasesBlock,
  decisionsBlock,
  examplesBlock,
])
export type DocBlock = z.infer<typeof docBlockSchema>
export type DocBlockKind = DocBlock["kind"]

/**
 * Agent document blocks — machine-facing docs. Schema-present so scaling to
 * richer agent content later needs no breaking change; content is deferred
 * (permissive placeholder this segment).
 */
export const agentDocBlockSchema = z.object({
  kind: z.string(),
  data: z.unknown().optional(),
})
export type AgentDocBlock = z.infer<typeof agentDocBlockSchema>

/* ------------------------------------------------------------------ *
 * The entity.
 * ------------------------------------------------------------------ */

export const componentDocSchema = z.object({
  /** stable id, matches the gallery cluster slug */
  id: z.string(),
  /** display name (e.g. "Button") */
  name: z.string(),
  /** route/gallery slug (usually === id) */
  slug: z.string(),
  /** one-line human summary */
  summary: z.string(),
  /** lifecycle status, reusing the Maturity taxonomy */
  status: maturitySchema.optional(),
  /**
   * Component source file(s) this doc describes, relative to
   * `src/components/ui/`. Defaults to `${slug}.tsx` when omitted; the
   * shared-slug case (scroll-area) lists both files. The parity gate reads
   * these to resolve which source(s) to cross-check.
   */
  sourceFiles: z.array(z.string()).optional(),
  /** typed human-facing document blocks */
  docs: z.array(docBlockSchema).default([]),
  /** machine-facing docs (schema-present, content-deferred) */
  agentDocs: z.array(agentDocBlockSchema).optional(),
  /** free-form key/value metadata */
  metadata: z.record(z.string(), z.string()).optional(),
  /** vendor-namespaced escape hatch (DSDS pattern) */
  extensions: z.record(z.string(), z.unknown()).optional(),
})
export type ComponentDoc = z.infer<typeof componentDocSchema>

/** Parse and validate an untyped input into a `ComponentDoc`. */
export function parseComponentDoc(input: unknown): ComponentDoc {
  return componentDocSchema.parse(input)
}

/* ------------------------------------------------------------------ *
 * Conformance levels (DSDS pattern).
 *  - Minimal:    a valid entity with id + name + slug + summary.
 *  - Documented: Minimal + status + at least one doc block.
 *  - Complete:   Documented + api + guidelines + accessibility + metadata.
 * ------------------------------------------------------------------ */

export type Conformance = "minimal" | "documented" | "complete"

function hasBlock(doc: ComponentDoc, kind: DocBlockKind): boolean {
  return doc.docs.some((b) => b.kind === kind)
}

/** Classify a doc's conformance level (highest satisfied wins). */
export function conformance(doc: ComponentDoc): Conformance {
  const isMinimal =
    doc.id.length > 0 &&
    doc.name.length > 0 &&
    doc.slug.length > 0 &&
    doc.summary.length > 0
  if (!isMinimal) {
    // parse guarantees the fields exist; empty strings fail Minimal intent.
    return "minimal"
  }

  const isDocumented = doc.status !== undefined && doc.docs.length >= 1
  if (!isDocumented) return "minimal"

  const isComplete =
    hasBlock(doc, "api") &&
    hasBlock(doc, "guidelines") &&
    hasBlock(doc, "accessibility") &&
    doc.metadata !== undefined
  if (isComplete) return "complete"

  return "documented"
}
