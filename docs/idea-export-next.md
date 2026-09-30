# Idea export — next work items

A queue of ideas proven or scoped in kernel-ds for the work-owned design system to pick up. Ideas, not code: read the cited sources, then implement in your own repo and record your own decision.

**Read first:** `docs/idea-export-geometry.md` (geometry roles — already picked up).

**Do them in this order** (each builds on the one before, so PRs won't conflict):

1. Semantic status tokens
2. Catalog registration gate
3. Adopt DSDS 0.21.x as the contract format
4. CI checks for hand-rolled UI and bad primitive usage
5. Code-backed docs gate

**Rules for every item**

- Every gate is a **ratchet**: record a baseline count, fail only when the count rises. Nothing blocks CI on day one.
- **Show baseline counts and proposed mappings before turning anything on or migrating components.**
- Write a decision record for each item, citing the kernel-ds sources.
- Ask the design-system owner before merging anything that changes shared tokens or primitives.

---

## 1. Semantic status tokens

**Problem.** Status colors exist only as numbered scales (`success-600`, `warning-700`). Every developer picks their own step, so the same meaning renders differently from screen to screen.

**Do**

1. Define `--success`, `--success-foreground` and `--success-muted` in both the light and dark themes, each mapped to a scale step. Repeat for `warning`, `info` and `error`. Keep `destructive` as shadcn defines it.
2. Register them in Tailwind `@theme inline` as `--color-success` and so on, so that `bg-success`, `text-success-foreground` and `bg-success-muted` exist. If a token isn't in `@theme`, people hard-code colors instead.
3. Contrast-check each foreground against its background in both themes. The target is WCAG AA, 4.5:1.
4. Move badges, alerts, toasts and status indicators onto the new tokens.
5. Add a ratchet gate that fails on numbered status classes outside the primitives folder.
6. For every token, write a "use when / don't use when" line, not just its value.

**Token rules to follow**

- Three tiers: primitives, then semantic tokens, then optional component tokens. Themes remap only the semantic tier.
- Name tokens by role, not by appearance: `warning`, not `amber`.
- Every background gets a `-foreground` pair.
- Add a token only when a real use needs it. When you remove one, keep a deprecated alias for one release.

**Sources:** `packages/ui/src/styles.css` (both `@theme inline` blocks), `docs/decisions/0073-semantic-geometry-compatibility-aliases.md` (alias-then-migrate pattern).

---

## 2. Catalog registration gate

**Problem.** New components and patterns get hand-rolled with no record, owner or guidance. As a result, agents can't discover what already exists.

**Do**

1. Write a script that maps every component and pattern `.tsx` file to a catalog/DSDS entry. It fails CI on unregistered files, as a ratchet.
2. Each entry needs an ID, kind, owner, maturity, and use-when/don't-use-when guidance.
3. Put the catalog under **CODEOWNERS**, so that new entries need design-system approval. If agents can register entries freely, they will register slop.
4. Add an `AGENTS.md` rule: *query the catalog before creating any component, and compose existing entries instead of hand-rolling new ones.*

**Sources:** `packages/catalog/src`, `kernel-portal/scripts/check-catalog.mjs`, `docs/decisions/0057-catalog-kinds-are-a-level-ladder.md`.

---

## 3. Adopt DSDS 0.21.x as the component contract format

**Context.** kernel-ds maps to DSDS 0.15.2, but the spec is now at 0.21.1, which is a near-total rewrite. **Start directly on 0.21.x. Don't port the kernel-ds 0.15-era mapping.**

**Do**

1. Pin **0.21.1**, vendor the bundled schema, and validate every DSDS file in CI. Don't follow "latest"; the spec is still a draft.
2. The entry kinds are `system`, `token`, `theme`, `component` and `entry`. Model patterns, foundations and guides as `entry` or as a namespaced custom kind. Don't invent new top-level kinds.
3. Token entries point at the DTCG source and never restate values. Each one carries when-to-use and how-to-use guidance.
4. Component entries use `sourceFiles`/imports instead of restated prop tables. They list variants and states as **traits** (`traitType: variant | state`) and declare composition rules as **combos**. For example, a Dialog requires a DialogTitle.
5. Put agent-only `must` and `must-not` rules in `guidelines` sections with audience `agent`. For example: "must compose existing entries" and "must-not use a raw `<button>` outside primitives."
6. Add ratcheted gates for:
   - every component or pattern having an entry
   - code using only the declared traits
   - combos being satisfied
   - files validating against the pinned schema
7. Put the DSDS files under CODEOWNERS.

**Why this matters.** DSDS enforces nothing by itself. What makes it the enforcement surface is agents building from it, plus gates that check code against it.

**Sources:** `docs/figma/DSDS-AGENT-HANDOFF.md`, `docs/decisions/0080-separate-code-public-contracts-from-figma-design-states.md` (strict code-public contracts map onto traits + sourceFiles).

---

## 4. CI checks for hand-rolled UI and bad primitive usage

Documentation doesn't stop sloppy UI; gates do. Use oxlint or ESLint, ast-grep, and a small Node script.

1. **Lock the primitives folder.** Use CODEOWNERS on `components/ui/`.
2. **Ban raw elements outside the primitives.** That means `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`, and `role="button"` on a `div`.
3. **Detect primitives recreated with classes** by matching combinations of classes, not single classes:

   | Class combination | Should be |
   |---|---|
   | `rounded-* border bg-card p-*` | Card or panel |
   | `inline-flex … h-9 px-4` | Button |
   | `fixed inset-0 bg-black/50` | Dialog overlay |
   | `animate-spin` on an SVG | Spinner |

4. **Ban escape hatches:**
   - arbitrary values such as `rounded-[13px]` or `p-[7px]`
   - hex, rgb or hsl colors in `className` or `style`
   - raw palette classes such as `bg-gray-100`

   The only exception is a counted `// ds-allow: <reason>` comment.
5. **Catch bad usage of the primitive libraries:**
   - no `@radix-ui/*` or `@base-ui/*` imports outside `components/ui/`
   - no duplicate wrappers like `MyButton.tsx`
   - no missing required children, such as `DialogContent` without `DialogTitle`
6. **Ratchet** every check against a baseline.

**Sources:** `kernel-portal/scripts/check-geometry-roles.mjs` (the class-inventory and ratchet approach).

---

## 5. Code-backed docs gate

**Problem.** Portal docs drift from the code, or describe behavior that doesn't exist. That is worse than no docs.

**Rule.** Every documented claim must point at something real: a token value, prop, variant, slot, gate script, decision, or rendered demo of the actual component.

- If it is **backed**, keep it.
- If it is **stale**, fix it.
- If it is **unbacked**, cut it.

Where possible, generate the docs from code rather than writing them by hand.

**Gate**

- Fail when a pattern doc has empty `sourceFiles`.
- Fail when a component doc lists a state that isn't in the code or the declared design-state axes.

**Findings from the kernel-ds audit** (these show what the gate catches):

**Geometry page**
- The "legacy" card is drawn with a class that now aliases to the 8px surface role, so it displays the wrong thing.
- The reset control is a hand-rolled button instead of the system Button.
- Control heights are missing from the page.

**Button docs**
- The "Loading" and "Inactive" states have no code behind them. Move both to guidelines.
- The press-nudge description names the wrong ARIA attribute: the code skips the nudge on `aria-haspopup`, not `aria-expanded`.
- The automatic optical icon padding is real behavior but isn't documented.

**Filtering pattern**
- `sourceFiles` is empty even though a real demo exists.
- It names Input, Select and ToggleGroup only in prose, not as linked entries.
- The guidance is generic; nothing ties it to real code.

**Sources:** `kernel-portal/src/lib/component-docs/` (`button.ts`, `filtering.ts`), `kernel-portal/src/components/portal/geometry-foundation.tsx`, `kernel-portal/src/components/portal/filters.tsx`, `packages/ui/src/components/ui/button.tsx`.

---

## Excluded

This file leaves out keys and secrets, service and file identifiers, PR references, personal names, and product or employer context. Figma library migration details are omitted too: that work was dropped as too heavy, and the only lesson kept is to use the catalog ID as the join key between code, docs and design.
