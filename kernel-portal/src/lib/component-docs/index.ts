/**
 * Component-docs barrel — the single registry of component doc entities.
 *
 * `componentDocs` is keyed by gallery slug; the parity gate
 * (`scripts/check-component-docs.mjs`) and the portal renderer
 * (`ComponentDocSections`) both read from this map. Adding a component's
 * documentation means authoring a `<slug>.ts` entity and registering it here.
 */
import type { ComponentDoc } from "./schema.ts"
import { buttonDoc } from "./button.ts"
import { tabsDoc } from "./tabs.ts"
import { statusBadgeDoc } from "./status-badge.ts"
import { cardDoc } from "./card.ts"
import { scrollAreaDoc } from "./scroll-area.ts"
import { inputDoc } from "./input.ts"

export const componentDocs: Record<string, ComponentDoc> = {
  [buttonDoc.slug]: buttonDoc,
  [tabsDoc.slug]: tabsDoc,
  [statusBadgeDoc.slug]: statusBadgeDoc,
  [cardDoc.slug]: cardDoc,
  [scrollAreaDoc.slug]: scrollAreaDoc,
  [inputDoc.slug]: inputDoc,
}

/** Look up a component doc by its gallery slug. Returns undefined if absent. */
export function getComponentDoc(slug: string): ComponentDoc | undefined {
  return componentDocs[slug]
}

export type { ComponentDoc } from "./schema.ts"
