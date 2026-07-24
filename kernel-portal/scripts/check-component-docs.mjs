#!/usr/bin/env node
/**
 * Component-docs parity gate (decision 0035).
 *
 * Cross-checks each component doc entity against its component source so a
 * documented claim cannot silently drift from the code:
 *   - variants: documented `variants` groups vs `cva({ variants: {...} })` keys
 *   - anatomy:  documented slots vs `data-slot="..."` literals in source
 *   - api:      documented prop names present as string literals in source
 *
 * Modeled on `check-status-map.mjs`: collect `offenders[]`, print an
 * enumeration to stderr, `process.exit(1)` on any offender, silent `exit 0`
 * otherwise. Two modes:
 *   default      — per-entity parity (only entities that exist are checked)
 *   --coverage   — additionally require every `ready` component to have a doc
 *
 * Exit codes: 0 = clean, 1 = parity/coverage offender(s), 2 = import failure
 * (a broken doc module must not pass as clean). Shell-agnostic (Windows-safe).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

// The doc entities are TypeScript; importing them needs type-stripping.
// If not already running with the flag, re-exec ourselves with it so the
// gate can be invoked simply as `node scripts/check-component-docs.mjs`.
if (!process.execArgv.some((a) => a.includes("experimental-strip-types"))) {
  const r = spawnSync(
    process.execPath,
    ["--experimental-strip-types", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: "inherit" },
  );
  process.exit(r.status ?? 1);
}

const here = dirname(fileURLToPath(import.meta.url));
const portalRoot = resolve(here, "..");
const uiDir = resolve(portalRoot, "src", "components", "ui");
const docsBarrel = resolve(portalRoot, "src", "lib", "component-docs", "index.ts");
const metaFile = resolve(portalRoot, "src", "lib", "component-meta.ts");

const coverageMode = process.argv.includes("--coverage");
const offenders = [];

/* ------------------------------------------------------------------ *
 * Load doc entities. The barrel and entities import only `schema.ts`
 * (zod) — no React — so `--experimental-strip-types` imports them
 * cleanly. "No barrel yet" is a clean exit 0; an import that throws is
 * exit 2 (broken module, not clean).
 * ------------------------------------------------------------------ */
let componentDocs = {};
if (existsSync(docsBarrel)) {
  try {
    const mod = await import(pathToFileURL(docsBarrel).href);
    componentDocs = mod.componentDocs ?? {};
  } catch (err) {
    console.error("check-component-docs: failed to import doc entities:");
    console.error(`  ${String(err && err.stack ? err.stack : err)}`);
    process.exit(2);
  }
}

/** Resolve an entity's source file(s) relative to src/components/ui. */
function sourceFilesFor(doc) {
  const files = doc.sourceFiles && doc.sourceFiles.length > 0
    ? doc.sourceFiles
    : [`${doc.slug}.tsx`];
  return files.map((f) => resolve(uiDir, f));
}

/**
 * Extract cva variant axes → keys from a source string using brace-counting
 * (not `defaultVariants` as a delimiter, so nested `{ }` in class strings
 * don't truncate an axis block). Returns a Map<axis, Set<key>> merged across
 * every `variants: { ... }` block in the file (a file may hold more than one
 * cva, e.g. list + trigger).
 */
function extractCvaVariants(src) {
  const axes = new Map();
  let searchFrom = 0;
  for (;;) {
    const idx = src.indexOf("variants:", searchFrom);
    if (idx === -1) break;
    // find the opening brace of the variants object
    const open = src.indexOf("{", idx);
    if (open === -1) break;
    // brace-match to find the matching close
    let depth = 0;
    let end = -1;
    for (let i = open; i < src.length; i++) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) break;
    const body = src.slice(open + 1, end);
    parseAxisBlocks(body, axes);
    searchFrom = end + 1;
  }
  return axes;
}

/**
 * Parse a variants-object body: `axisName: { key: "...", key2: "..." }`.
 * Uses brace-counting per axis so class-string values with `{}` are safe.
 */
function parseAxisBlocks(body, axes) {
  const axisRe = /([A-Za-z_$][\w$]*)\s*:\s*\{/g;
  let m;
  while ((m = axisRe.exec(body)) !== null) {
    const axis = m[1];
    const open = body.indexOf("{", m.index);
    let depth = 0;
    let end = -1;
    for (let i = open; i < body.length; i++) {
      const ch = body[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end === -1) continue;
    const axisBody = body.slice(open + 1, end);
    const keys = extractKeys(axisBody);
    if (!axes.has(axis)) axes.set(axis, new Set());
    for (const k of keys) axes.get(axis).add(k);
    axisRe.lastIndex = end + 1;
  }
}

/**
 * Extract top-level keys from an axis body. A key is an identifier or quoted
 * string immediately followed by `:` at brace-depth 0.
 */
function extractKeys(axisBody) {
  const keys = [];
  let depth = 0;
  let i = 0;
  const n = axisBody.length;
  while (i < n) {
    const ch = axisBody[i];
    if (ch === "{" || ch === "[" || ch === "(") { depth++; i++; continue; }
    if (ch === "}" || ch === "]" || ch === ")") { depth--; i++; continue; }
    if (depth === 0) {
      // quoted key
      if (ch === '"' || ch === "'") {
        const close = axisBody.indexOf(ch, i + 1);
        if (close === -1) break;
        const after = axisBody.slice(close + 1).match(/^\s*:/);
        if (after) keys.push(axisBody.slice(i + 1, close));
        i = close + 1;
        continue;
      }
      // bare identifier key
      const idMatch = axisBody.slice(i).match(/^([A-Za-z_$][\w$-]*)\s*:/);
      if (idMatch) {
        keys.push(idMatch[1]);
        i += idMatch[0].length;
        continue;
      }
    }
    i++;
  }
  return keys;
}

/** Extract all `data-slot="..."` literal values from a source string. */
function extractDataSlots(src) {
  const slots = new Set();
  const re = /data-slot=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src)) !== null) slots.add(m[1]);
  return slots;
}

/* ------------------------------------------------------------------ *
 * Per-entity parity.
 * ------------------------------------------------------------------ */
for (const [slug, doc] of Object.entries(componentDocs)) {
  const files = sourceFilesFor(doc);
  const missing = files.filter((f) => !existsSync(f));
  if (missing.length > 0) {
    for (const f of missing) {
      offenders.push({
        rule: "source-missing",
        entity: slug,
        detail: `source file not found: ${f}`,
      });
    }
    continue;
  }

  const srcAll = files.map((f) => readFileSync(f, "utf8")).join("\n");
  const cvaAxes = extractCvaVariants(srcAll);
  const dataSlots = extractDataSlots(srcAll);

  for (const block of doc.docs ?? []) {
    if (block.kind === "variants") {
      for (const group of block.groups) {
        const sourceKeys = cvaAxes.get(group.axis);
        if (!sourceKeys) {
          offenders.push({
            rule: "variant-axis-not-in-source",
            entity: slug,
            detail: `documented axis "${group.axis}" has no cva variants block in source`,
          });
          continue;
        }
        for (const key of group.keys) {
          if (!sourceKeys.has(key)) {
            offenders.push({
              rule: "variant-key-mismatch",
              entity: slug,
              detail: `documented ${group.axis} key "${key}" not in source (source: ${[...sourceKeys].join(", ")})`,
            });
          }
        }
      }
    } else if (block.kind === "anatomy") {
      for (const slot of block.slots) {
        if (!dataSlots.has(slot)) {
          offenders.push({
            rule: "slot-mismatch",
            entity: slug,
            detail: `documented slot "${slot}" not found as data-slot in source (source: ${[...dataSlots].join(", ")})`,
          });
        }
      }
    } else if (block.kind === "api") {
      for (const prop of block.props) {
        // weak name-presence: the prop name must appear as a literal token
        const nameRe = new RegExp(`\\b${prop.name.replace(/[^\w$]/g, "")}\\b`);
        if (!nameRe.test(srcAll)) {
          offenders.push({
            rule: "prop-name-absent",
            entity: slug,
            detail: `documented prop "${prop.name}" not present in source`,
          });
        }
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * Coverage mode — every `ready` component must have a doc entity.
 * Resolves component names → slugs via componentMeta anchors and the
 * documented entities. A `SLUG_ALIASES` map handles shared-slug cases
 * where a componentMeta entry maps to another entity's slug.
 * ------------------------------------------------------------------ */
const SLUG_ALIASES = {
  // shared gallery slug: Resizable is documented inside the scroll-area entity
  resizable: "scroll-area",
};

if (coverageMode) {
  // read the `ready` component names from componentMeta source (no React import)
  const metaSrc = readFileSync(metaFile, "utf8");
  const readyNames = [];
  const entryRe = /\{\s*name:\s*"([^"]+)"[^}]*maturity:\s*"ready"[^}]*\}/g;
  let m;
  while ((m = entryRe.exec(metaSrc)) !== null) readyNames.push(m[1]);

  const documentedSlugs = new Set(Object.keys(componentDocs));
  const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  for (const name of readyNames) {
    const slug = toSlug(name);
    const resolved = SLUG_ALIASES[slug] ?? slug;
    if (!documentedSlugs.has(resolved) && !documentedSlugs.has(slug)) {
      offenders.push({
        rule: "coverage-missing-doc",
        entity: slug,
        detail: `ready component "${name}" has no doc entity`,
      });
    }
  }
}

/* ------------------------------------------------------------------ */
if (offenders.length > 0) {
  console.error("check-component-docs: parity violation(s):");
  for (const o of offenders) {
    console.error(`  [${o.rule}] ${o.entity} — ${o.detail}`);
  }
  process.exit(1);
}

const count = Object.keys(componentDocs).length;
console.log(
  `check-component-docs: ${count} entit${count === 1 ? "y" : "ies"} checked, 0 violations${coverageMode ? " (coverage mode)" : ""}`,
);
process.exit(0);
