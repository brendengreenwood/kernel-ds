// Reassemble packages/ui/src/styles.css from the ordered partials in
// src/styles/. The partials are the source of truth; the monolith is the
// generated artifact every consumer keeps reading (Tailwind entry, dist copy,
// token parsers, audits). Concatenation is verbatim — the generator adds only
// the header banner, so the compiled CSS is unchanged.
//
//   node scripts/generate-styles.mjs           regenerate styles.css
//   node scripts/generate-styles.mjs --check   exit 1 if styles.css is stale
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const partialsDir = resolve(packageDir, "src/styles");
const outFile = resolve(packageDir, "src/styles.css");

const HEADER = `/* GENERATED from ./styles/*.css — the partials are the source of truth.
   Edit those, then regenerate (node packages/ui/scripts/generate-styles.mjs
   or npm run ds:generate); never hand-edit this file. */
`;

export function buildStylesSource() {
  const partials = readdirSync(partialsDir)
    .filter((name) => name.endsWith(".css"))
    .sort();
  if (partials.length === 0) throw new Error(`no partials found in ${partialsDir}`);
  const body = partials
    .map((name) => readFileSync(resolve(partialsDir, name), "utf8"))
    .join("");
  return HEADER + body;
}

const expected = buildStylesSource();
const current = readFileSync(outFile, "utf8");

if (process.argv.includes("--check")) {
  if (current.replaceAll("\r\n", "\n") !== expected.replaceAll("\r\n", "\n")) {
    console.error("STYLES-STALE: src/styles.css does not match src/styles/*.css; run node packages/ui/scripts/generate-styles.mjs");
    process.exit(1);
  }
  console.log("STYLES-OK: styles.css matches the partials");
} else {
  if (current === expected) {
    console.log("STYLES-OK: styles.css already current");
  } else {
    writeFileSync(outFile, expected);
    console.log(`STYLES-OK: regenerated styles.css from ${readdirSync(partialsDir).filter((n) => n.endsWith(".css")).length} partials`);
  }
}
