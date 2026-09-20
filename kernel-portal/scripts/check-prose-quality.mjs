#!/usr/bin/env node
/**
 * Prose-quality gate.
 *
 * Flags placeholder and mad-lib prose in component doc entities so a
 * scaffolded entity cannot ship reading like a template:
 *   - placeholder-token: TODO / TBD / FIXME / XXX / lorem ipsum
 *   - filler-phrase:     "goes here", "fill in", "to be written", "coming
 *                        soon", "add description", "dummy text", ...
 *   - template-token:    {{mustache}} and bracketed metavariables like
 *                        [component] / [name] / [action] left in prose
 *   - empty-prose:       empty or whitespace-only prose fields
 *   - duplicate-prose:   the same sentence pasted into multiple guidance
 *                        slots of one entity (the mad-lib tell). Scoped to
 *                        guidelines / use cases / states — prop descriptions
 *                        and keyboard actions legitimately repeat.
 *
 * Only prose fields are scanned — summaries, guidelines, use cases, states,
 * prop/example descriptions. Code snippets (`examples[].code`), prop
 * names/types, variant keys and anatomy slots are identifiers, not prose,
 * and are deliberately exempt (code legitimately contains TODO-able text).
 *
 * Modeled on `check-component-docs.mjs`: collect `offenders[]`, print an
 * enumeration to stderr and `exit 1` on any offender, one-line OK on
 * success. Exit 2 = doc barrel failed to import (broken must not pass as
 * clean). Shell-agnostic (Windows-safe).
 */
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

// The doc entities are TypeScript; importing them needs type-stripping.
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
const docsBarrel = resolve(portalRoot, "src", "lib", "component-docs", "index.ts");

const offenders = [];

/* ------------------------------------------------------------------ *
 * Load doc entities. "No barrel yet" is a clean exit 0; an import that
 * throws is exit 2 (a broken module must not pass as clean).
 * ------------------------------------------------------------------ */
let componentDocs = {};
if (existsSync(docsBarrel)) {
  try {
    const mod = await import(pathToFileURL(docsBarrel).href);
    componentDocs = mod.componentDocs ?? {};
  } catch (err) {
    console.error("check-prose-quality: failed to import doc entities:");
    console.error(`  ${String(err && err.stack ? err.stack : err)}`);
    process.exit(2);
  }
}

/* ------------------------------------------------------------------ *
 * Rules. Each is deterministic — a regex over a prose string. The word
 * "placeholder" alone is NOT flagged: doc prose legitimately discusses
 * input placeholder text. Uppercase markers are matched case-sensitively
 * so prose about "todo lists" stays legal.
 * ------------------------------------------------------------------ */
const RULES = [
  { rule: "placeholder-token", re: /\blorem ipsum\b/i },
  { rule: "placeholder-token", re: /\b(?:TODO|TBD|FIXME|XXX)\b/ },
  {
    rule: "filler-phrase",
    re: /\b(?:goes here|fill (?:this |me )?in\b|to be (?:written|determined|filled in)|coming soon|add (?:a )?description|description here|insert \w+ here|replace (?:this|me)\b|dummy text|sample text here|some text here)/i,
  },
  { rule: "template-token", re: /\{\{[^}]*\}\}/ },
  {
    rule: "template-token",
    re: /\[(?:component|name|thing|noun|verb|action|value|title|text|x)\]/i,
  },
];

/**
 * Prose slots collected per entity: [path, text, dedupe]. `dedupe` marks
 * guidance slots where a repeated sentence is a mad-lib tell; prop
 * descriptions and keyboard actions legitimately repeat (two forwarded
 * props, Enter/Space doing the same thing) and are pattern-checked only.
 */
function proseFields(doc) {
  const out = [["summary", doc.summary, true]];
  (doc.docs ?? []).forEach((block, bi) => {
    const at = (leaf) => `docs[${bi}](${block.kind}).${leaf}`;
    switch (block.kind) {
      case "guidelines":
        block.dos.forEach((t, i) => out.push([at(`dos[${i}]`), t, true]));
        block.donts.forEach((t, i) => out.push([at(`donts[${i}]`), t, true]));
        break;
      case "useCases":
        block.use.forEach((t, i) => out.push([at(`use[${i}]`), t, true]));
        block.dontUse.forEach((t, i) => out.push([at(`dontUse[${i}]`), t, true]));
        break;
      case "api":
        block.props.forEach((p, i) => {
          if (typeof p.description === "string")
            out.push([at(`props[${i}].description`), p.description, false]);
        });
        break;
      case "variants":
        block.groups.forEach((g, gi) =>
          g.keys.forEach((k, ki) => {
            if (typeof k === "object" && typeof k.description === "string")
              out.push([at(`groups[${gi}].keys[${ki}].description`), k.description, false]);
          }),
        );
        break;
      case "states":
        block.items.forEach((s, i) =>
          out.push([at(`items[${i}].description`), s.description, true]),
        );
        break;
      case "accessibility":
        (block.keyboardInteractions ?? []).forEach((k, i) =>
          out.push([at(`keyboardInteractions[${i}].action`), k.action, false]),
        );
        break;
      case "examples":
        // Titles and descriptions are prose; `code` is deliberately exempt.
        block.items.forEach((ex, i) => {
          out.push([at(`items[${i}].title`), ex.title, false]);
          if (typeof ex.description === "string")
            out.push([at(`items[${i}].description`), ex.description, true]);
        });
        break;
      default:
        break; // anatomy slots, decision refs, agentDocs: identifiers, not prose
    }
  });
  return out;
}

let fieldsScanned = 0;
for (const [id, doc] of Object.entries(componentDocs)) {
  const fields = proseFields(doc);
  const seen = new Map(); // normalized text -> first path (duplicate-prose)
  for (const [path, text, dedupe] of fields) {
    fieldsScanned += 1;
    if (typeof text !== "string" || text.trim().length === 0) {
      offenders.push({ rule: "empty-prose", entity: id, path, text: String(text) });
      continue;
    }
    for (const { rule, re } of RULES) {
      const m = text.match(re);
      if (m) offenders.push({ rule, entity: id, path, text: m[0] });
    }
    // Mad-lib tell: the same sentence pasted into multiple guidance slots.
    // Short strings ("Yes", state names) repeat legitimately; require length.
    const norm = text.trim().toLowerCase();
    if (dedupe && norm.length >= 20) {
      if (seen.has(norm)) {
        offenders.push({
          rule: "duplicate-prose",
          entity: id,
          path,
          text: `duplicates ${seen.get(norm)}: "${text.trim().slice(0, 60)}"`,
        });
      } else {
        seen.set(norm, path);
      }
    }
  }
}

if (offenders.length > 0) {
  console.error(`check-prose-quality: ${offenders.length} violation(s):`);
  for (const o of offenders) {
    console.error(`  [${o.rule}] ${o.entity} ${o.path}: ${o.text}`);
  }
  process.exit(1);
}

console.log(
  `PROSE-QUALITY-OK: ${Object.keys(componentDocs).length} entities, ${fieldsScanned} prose fields, 0 violations`,
);
