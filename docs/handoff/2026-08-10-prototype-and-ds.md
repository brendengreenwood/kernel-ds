# Handoff — the v2 prototype and what it owes the design system

**Written 2026-08-10. For an agent picking this repo up on another machine.**

Read this once before touching anything. It is written to be the only document
you need to *start*; everything it says is true as of `feat/workspace-surface`
@ PR #91, and every claim in it points at the file that proves it.

---

## 1. What this repo is

`kernel-ds` is a design system plus its consumers, in one repo:

| Path | What it is | Shipped? |
|---|---|---|
| `packages/ui` | **The design system.** React components + `src/styles.css` (the tokens). | published as `@kernel/ui` |
| `packages/definitions`, `packages/catalog` | The typed inventory + DSDS contract layer. | yes |
| `kernel-portal` | The documentation portal. Netlify deploys this from `main`. | **the shipped surface** |
| `kernel-app` | **The v2 prototype.** A grain-merchandising app. | a *maintained prototype surface* — decision 0068 |
| `kernel-studio-server` | Mastra dev server, generative design agent. | no |

The two things that make this repo unusual, and that you must not un-learn:

**a. The prototype is the design system's forward track** (decision 0056). It
is not a demo and not a throwaway. It is where the v2 look was pressure-tested
against a real domain, and its *documented divergence* from the DS is the
promotion queue. Work goes prototype → register → DS, deliberately, not by
accident.

**b. That divergence is written down, exhaustively, in one file:**
`docs/v2-prototype-drift.md` (~125KB, eight parts). **This register is the
single most important document in the repo for your purposes.** It is
CI-enforced by `scripts/check-drift-register.mjs`. If you change how the
prototype differs from the DS, you change the register in the same commit or
the `prototype` job fails.

---

## 2. Where things stand right now

`main` is healthy and carries everything promoted so far: the v2 token
direction (decisions 0064/0065), the panel furniture, the page plate (0066),
the lime dark-action hue (0067), and the prototype itself as a CI-built
surface (0068).

**`feat/workspace-surface` (PR #91, draft, 23 commits) is the live work.** It
is green on all 8 CI jobs. Deploy preview:
<https://deploy-preview-91--kernel-design-system.netlify.app>

It contains three things:

1. **A workspace** at `/scenarios/:id/edit` — the app's second body shape. A
   navigator recessed under the page, a MapLibre canvas on a plate, a bid dock
   floating over it. Register 5.24–5.26, decision 0069.
2. **A light-mode rebuild.** The page floor and the plate had collapsed to the
   same token, so `/scenarios` and `/producers` drew plate geometry and filled
   it with floor colour. Plate is white, floor is neutral-50. Register 2.6.
3. **A depth and surface pass** — the shadow ramp compressed (2.8), accent made
   relational (2.5), segmented controls unified (3.4), frames and tab panels
   demoted from surfaces back to boundaries.

Nothing on this branch touches `packages/**`. It is entirely prototype-side, by
design: the register is how it reaches the DS.

---

## 3. The promotion queue — what the prototype owes the DS

This is the actual work. Four items, ordered by how settled they are. Each is
argued in full in the register; the section number is the argument, this table
is the triage.

| # | Item | Register | Shape of the decision |
|---|---|---|---|
| 1 | **Categorical palette** — `--series-1..4` | 2.7 | **Least controversial. Start here.** `--chart-1..5` is a *sequential* ramp (one hue walking lightness). Four elevators drawn from it produced three visible lines: chart-1 and chart-4 overplot, chart-3 measures ~1.5:1 on white. Any consumer plotting more than one series hits this immediately. Open: how many members ship, the name, and whether the existing ramp gets renamed to say what it is. |
| 2 | **Route-driven rail collapse** | 5.25 | The DS ships `defaultOpen` and controlled `open`. "This route wants the rail collapsed, and remember what the user had" is a real pattern with three non-obvious bugs in it — all three are documented, because all three happened here. Every consumer will otherwise rebuild it wrong. |
| 3 | **Contextual accent** — `--surface` + `--accent-step` | 2.5, 3.33 | A surface computes its own lift toward the foreground instead of reaching for one global accent that only looked right on one background. Fixes a real failure: the dark accent was `--brand-900`, near-neutral, invisible as a selected state. The mechanism is sound and measured; the question is whether the DS wants accent to be *derived* at all, which is a change to what the token model means. |
| 4 | **Elevation ramp geometry** | 2.8 | The DS ramp doubles offset and blur per rung, so the top rungs paint 20–40px of shade — wider than this app's 15.4px gutter, which means elevation was dictating layout spacing. Compressed to ~1.6×, alphas untouched. **Cheap now, expensive later**: any consumer that has spaced a layout around the current ramp has baked the old footprints into its gutters. Gather the portal's evidence first — it is the surface most likely to actually want the taller rungs. |

Also still open, prototype-side: `/settings` is unbuilt, the four Producers
filter dropdowns are presentational placeholders, and Part 8 lists the rest.
The charting layer is **not** on this queue: the forward curve works on
recharts, and replacing the library is out of scope until somebody asks for
it. 2.7 stands on its own — it is a token gap, and it is true whatever draws
the lines.

**How a promotion actually goes** — the precedent is PR #85, and it is worth
imitating: cut one branch, one commit per coherent change, a decision record in
`docs/decisions/` for anything that shifts convention or direction, a changeset,
the portal's `contrast-audit` run across both themes (it lives in
`kernel-portal/scripts/`, and it is *not* part of `ds:doctor` — a token change
will pass every gate in the repo without it), and the register's rows updated
to carry the commit SHAs. Do not drain the register entry by entry without a
decision behind it.

---

## 4. Getting it running

Node 24 is required — the gate scripts are `.mts`/`.ts` run directly via
`--experimental-strip-types`.

```bash
git clone git@github.com:brendengreenwood/kernel-ds.git
cd kernel-ds
git checkout feat/workspace-surface

npm ci                      # root workspace = packages/* only

# The prototype consumes the DS AT SOURCE (decision 0034): `@` resolves into
# packages/ui/src, whose bare deps live in the ROOT node_modules. Root install
# first, always — this is the single most common way to get a confusing
# module-not-found here.
npm --prefix kernel-app ci
npm --prefix kernel-app run dev      # → localhost:5173
```

The portal and the studio server keep **their own lockfiles** and are installed
separately (`npm --prefix kernel-portal ci`). The root workspace must not
absorb either one.

### The checks, narrowest first

```bash
# prototype only — what CI's `prototype` job runs
npm --prefix kernel-app run typecheck
npm --prefix kernel-app run build
node scripts/check-drift-register.mjs     # register numbering + markers + cited paths

# design system
npm run ui:check && npm run ui:test
npm run catalog:check
npm run ds:doctor                          # 10 checks: catalog integrity, API
                                           # alignment, a11y readiness, docs
                                           # coverage, decision numbering, …

# portal
cd kernel-portal && npm run build && npm run lint
node kernel-portal/scripts/contrast-audit.mjs   # both themes; NOT part of ds:doctor
```

Run the narrowest relevant set. Do not run both applications when one is enough.

---

## 5. Things that will bite you

**The register gate is real.** `check-drift-register.mjs` verifies numbering is
unique/ascending/gapless, the summary counts match the contents, every cited
path exists, every `data-v2-*` marker in the CSS is reconciled against the
register, and decision numbers are unique. It has caught genuine mistakes
repeatedly. If it fails, it is almost always right.

**Decision records are immutable.** Supersede with a new numbered record; never
edit an old one. Next free number is **0070**. `ds:doctor` enforces uniqueness.

**Docs are part of the change, in the same commit.** Append to
`docs/worklog/YYYY-MM.md`, update `docs/STATE.md` if the state moved, add a
decision if convention or direction shifted. See `docs/AGENTS.md` and
`docs/GUIDE.md`. The worklog is append-only — never rewrite an old entry.

**Netlify previews are keyed to exact branch names.** `netlify.toml` has a
per-branch context block that builds `kernel-app` instead of the portal. A
branch with no block **does not fail** — it silently builds the portal, which
looks exactly like a prototype that ignored your commits. New prototype branch
⇒ new context block.

**If you are on Windows** (the original machine was): in-place string edits
break on this repo's CRLF + em-dash content. Write a small Node
read/replace/write script instead. Inline `node -e` with complex quoting, and
shell globbing, are also unreliable — use file-based scripts. Delete any
`tmp-*.mjs` before staging; `git add -A` will otherwise sweep them into the
commit.

**The DS is consumed at source, not built, by the prototype** (decision 0034).
A change in `packages/ui/src` shows up in the prototype's dev server
immediately with no rebuild. That is a feature, and it is also why the prototype
can silently depend on unpublished DS changes — check `git status` in
`packages/` before concluding the prototype "just works".

---

## 6. Where to read next, in order

1. `docs/STATE.md` — current state, in-flight items, open questions.
2. `docs/v2-prototype-drift.md` — **Part 8 first** (the promotion path), then
   the Summary table, then whichever part you are about to touch.
3. `docs/decisions/0056` (prototype is the forward track), `0058` (superseded),
   `0068` (prototype is a surface), `0069` (the workspace).
4. `docs/worklog/2026-08.md` — the last month of reasoning, newest at the end.
5. `CLAUDE.md` and the nearest `AGENTS.md` — conventions, and the narrowest
   commands for the area you are in.

The register and the worklog are written in prose on purpose. They record *why*,
which is the part that does not survive in a diff.
