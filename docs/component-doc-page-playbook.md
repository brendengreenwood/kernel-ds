# Component doc-page playbook

The single reference for how a component documentation page is **structured**,
**laid out**, and **authored**. When you touch anything under
`src/lib/component-docs/` or `src/components/portal/component-doc-sections.tsx`,
`on-this-page.tsx`, or `src/pages/component-page.tsx`, conform to this document
instead of re-deriving the rules. Established by decision 0036; the schema and
parity model come from decision 0035.

This playbook is living reference (it may be revised in place). The immutable
*decision* to adopt it is `docs/decisions/0036-component-doc-page-playbook.md`.

---

## 1. The moving parts

| Concern | Owner | Notes |
|---|---|---|
| What a doc **is** (typed blocks, conformance) | `src/lib/component-docs/schema.ts` | DSDS-forked; decision 0035 |
| One component's content | `src/lib/component-docs/<slug>.ts` | one entity per file, barrelled in `index.ts` |
| Machine-readable claims stay true | `scripts/check-component-docs.mjs` | parity gate; variants/anatomy/api vs source |
| Prose isn't placeholder | `scripts/check-prose-quality.mjs` | staleness gate |
| How a doc **renders** | `src/components/portal/component-doc-sections.tsx` | one section per block kind |
| Section nav | `src/components/portal/on-this-page.tsx` | derives from the renderer, never re-lists |
| Page assembly | `src/pages/component-page.tsx` | preview → doc sections → floating ToC |

The rule that ties them together: **the renderer, the "On this page" nav, and
the parity gate all read the same doc entity.** No component re-lists sections
or re-derives titles — they call shared helpers so the three can't drift.

---

## 2. Content structure — the block set

A `ComponentDoc` is `{ id, name, slug, summary, status?, sourceFiles?, docs[],
metadata?, agentDocs? }`. The `summary` renders as the page lead paragraph.
`docs[]` is an ordered array of typed blocks. Nine block kinds exist; author
them in this **canonical order** (the entity array order *is* the page order
and the ToC order):

1. `useCases` — *When to use* / *When not to use* (green/red paired cards)
2. `guidelines` — *Do* / *Don't* (green/red paired cards, ✓/✕ icons)
3. `variants` — CVA axes → keys. **Parity-gated** against `cva({ variants })`.
4. `states` — interaction states, prose-only
5. `anatomy` — `data-slot` names. **Parity-gated** against `data-slot="…"`.
6. `api` — props table. Prop names are **parity-gated** (name-presence).
7. `accessibility` — role, ARIA, keyboard
8. `examples` — copy-pasteable code (`CodeBlock`)
9. `decisions` — related decision refs

Empty blocks render nothing, so a component only carries the blocks it needs.
Minimal-conformance entities (e.g. `input`) may carry just a `summary` and no
blocks — the page then shows only the preview + demo, and the ToC hides itself.

### Conformance ladder (from `schema.ts`)

- **Minimal** — valid entity with `id + name + slug + summary`.
- **Documented** — Minimal + `status` + at least one block.
- **Complete** — Documented + `api` + `guidelines` + `accessibility` + `metadata`.

Aim for Complete on `ready` components; Documented is the floor for anything on
a page.

### Prose quality bar (voice — decision 0036)

Kernel's own operational-platform voice. Not GitHub's "we"; not placeholder
mad-libs. Every entity must clear the staleness gate:

- **Summary** — one or two sentences: what it is *and why it exists*, with an
  opinionated default where one exists ("Reach for `outline` first…").
- **Guidelines** — 3–5 dos, 2–4 donts. Each carries a *reason*, not just a
  rule. Use concrete ops-domain example copy ("Post contract", "Void ticket").
- **Use cases** — real scenarios, not restatements of the component name.
- **Variant keys** — CVA components should enrich each key with a one-line
  description via the `{ key, description }` shape (backward-compatible with
  plain strings). See `button.ts` for the exemplar.

Second person, contractions, active voice, no passive constructions.

---

## 3. Layout rules (the ones that keep biting)

These are non-obvious and have caused real bugs. Follow them verbatim.

### 3.1 `min-w-0` on every grid and flex text child — **required**

CSS grid and flex items default to `min-width: auto`, which refuses to shrink
below intrinsic content width. A long unbroken string (or a nested two-column
grid) then blows the whole column out and produces horizontal page overflow.

**Every** grid wrapper, grid item, `SectionShell` Card, two-column card, and
flex row that holds prose **must** carry `min-w-0`:

```tsx
<div className="mb-10 grid min-w-0 gap-4">      {/* sections wrapper */}
  <div className="min-w-0">{node}</div>          {/* each section */}
</div>

<Card className="min-w-0 …" />                    {/* SectionShell */}

<div className="grid min-w-0 gap-3 sm:grid-cols-2">  {/* two-column blocks */}
  <div className="min-w-0 rounded-lg border …">
    <li className="flex gap-2">
      <Icon className="shrink-0" />
      <span className="min-w-0">{text}</span>      {/* let long words wrap */}
    </li>
  </div>
</div>
```

Regression check: at any viewport, `document.documentElement.scrollWidth ===
clientWidth`. If the page scrolls sideways, a grid/flex child is missing
`min-w-0`.

### 3.2 Section anchors + scroll clearance

- Each section Card gets `id={docSectionId(kind)}` → `doc-{kind}` and
  `scroll-mt-24`. The sticky header is `h-14` (56px); `scroll-mt-24` (96px)
  keeps the heading clear of it when an anchor jump lands.
- Titles and eyebrows come from the shared `SECTION_TITLE` / `SECTION_EYEBROW`
  maps in the renderer. **Never** hardcode a section title anywhere else.

### 3.3 Section shell

Every block renders inside a `SectionShell` Card: uppercase eyebrow
(`SECTION_EYEBROW[kind]`) + `CardTitle` (`SECTION_TITLE[kind]`) + content.
Guidelines and Use Cases use paired green/red cards
(`border-success-500/30 bg-success-500/5` and the `error-` equivalents) with
`CheckCircle2` / `XCircle` from `@/components/ui/icon`. Tables (`api`,
keyboard) use the `Table` primitive; keyboard keys use `<kbd>` styling.

### 3.4 Page assembly (`component-page.tsx`)

Order: back-link + maturity pill + member pills → **Preview** (framed demo) →
doc sections → live **Demo**. The "On this page" rail is an absolutely
positioned sibling of the doc sections:

```tsx
<div className="relative">
  <ComponentDocSections doc={doc} />
  <div className="pointer-events-none absolute inset-y-0 left-full hidden pl-8 2xl:block">
    <div className="pointer-events-auto sticky top-24 w-52">
      <OnThisPage doc={doc} />
    </div>
  </div>
</div>
```

It's out of normal flow (`absolute`, `pointer-events-none` on the track) so it
can never cause page overflow, and gated to `2xl:` so it only appears when
there's room beside the `max-w-4xl` column. Below `2xl` the page reads fine as
a single column without it.

---

## 4. The "On this page" nav

- Lives in `on-this-page.tsx`. Derives its list from `docSectionNav(doc)`,
  which walks the **same** `renderedBlocks` the renderer uses — so it lists
  exactly the sections that render, in order, and can't drift.
- Hides itself when there are fewer than two sections (a nav of one is noise).
- Scroll-spy via `IntersectionObserver` (`rootMargin: "-96px 0px -55% 0px"`)
  marks the topmost in-view section `aria-current="location"` with a primary
  left-border accent.

If you add a new block kind, you only touch the renderer (a new `case` +
`SECTION_TITLE`/`SECTION_EYEBROW` entries). The ToC picks it up for free.

---

## 5. Adding or changing a doc — checklist

1. **Author the entity** at `src/lib/component-docs/<slug>.ts` in canonical
   block order, clearing the prose bar (§2). Enrich CVA keys with descriptions.
2. **Barrel it** in `index.ts` (`componentDocs` map).
3. **Run the gates**: `node scripts/check-component-docs.mjs` (parity) and
   `node scripts/check-prose-quality.mjs` (staleness) — both must exit 0.
   Ship checks additionally run `--coverage`.
4. **Verify layout**: load `/components/<slug>`, confirm zero horizontal
   overflow (§3.1) and that the ToC lists the right sections.
5. **New block kind?** Add the `case`, the `SECTION_TITLE`/`SECTION_EYEBROW`
   entries, and — if it carries machine-readable claims — a parity rule in the
   gate. Update §2 of this playbook.
6. **Ship ritual** (per `docs/README.md`): worklog entry, `STATE.md` update,
   and a decision doc if the change is a convention/architecture shift.
