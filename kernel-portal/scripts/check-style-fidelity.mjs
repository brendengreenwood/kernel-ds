#!/usr/bin/env node
/**
 * Style-fidelity drift guard (decision 0037).
 *
 * The design system has one overline recipe (`typeStyles.overline`) and one
 * radius scale (Tailwind `rounded-*` mapped to `--radius`). Hand-rolled
 * `uppercase tracking-*` treatments and `rounded-xl/2xl/[...]` hardcodes drift
 * away from those single sources of truth. This gate catches the drift.
 *
 * Two rules, scanning every `src/**\/*.tsx`:
 *
 *   1. OVERLINE — a line that combines `uppercase` with a `tracking-` utility
 *      is a hand-rolled overline unless it routes through `typeStyles.overline`.
 *      Such lines must be consolidated (`typeStyles.overline` or
 *      `cn(..., typeStyles.overline, colorOverride)`).
 *
 *   2. RADIUS — `rounded-xl`, `rounded-2xl`, `rounded-3xl`, or an arbitrary
 *      `rounded-[...]` bypasses the `--radius` scale. Use `rounded-lg` / `-md`
 *      / `-sm` instead.
 *
 * Deliberate one-offs live in ALLOWLIST below, keyed by a path fragment +
 * a substring that must appear on the offending line. Keep the list short and
 * justified — every entry is a documented exception, not a TODO.
 *
 * Exit 0 with a one-line OK when clean; exit 1 with an enumeration otherwise.
 * Shell-agnostic (Windows-safe): pure text scan, no TS transpile needed.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const portalRoot = resolve(here, "..");
const srcDir = resolve(portalRoot, "src");

/**
 * Scope: portal chrome, pages, and studio surfaces we author. The shadcn
 * primitives under `components/ui/` are vendored — they legitimately compute
 * radii from `--radius` (e.g. `rounded-[min(var(--radius-md),10px)]`) and are
 * not part of the overline/radius convention this gate enforces.
 */
const IN_SCOPE = [
  "src/components/portal/",
  "src/pages/",
  "src/studio/",
];

/**
 * Deliberate exceptions. Each entry: a path fragment (posix-normalized) and a
 * `needle` that must appear on the flagged line for the exception to apply.
 * Matching a path fragment alone is too broad — the needle keeps each waiver
 * scoped to the exact one-off it was written for.
 */
const ALLOWLIST = [
  // Type-scale demo intentionally shows different radii/tracking as samples.
  { path: "components/portal/foundations.tsx", needle: "tracking-[-0.03em]" },
  { path: "components/portal/foundations.tsx", needle: "rounded-xl" },
  // Maturity micro-badge: a deliberately tiny inline pill, not a section overline.
  { path: "components/portal/section.tsx", needle: "text-[9.5px]" },
  // Motion warning micro-badge: inline pill inside a caption.
  { path: "components/portal/motion-foundation.tsx", needle: "text-[9.5px]" },
  // Demo mini-navs replicate a compact app-shell rail at a smaller scale.
  { path: "components/portal/flows.tsx", needle: "tracking-[0.12em]" },
  { path: "components/portal/nav-patterns.tsx", needle: "tracking-[0.12em]" },
  // Table `<thead>` headers are a table convention, sized per table density.
  { path: "components/portal/tables.tsx", needle: "text-xs font-semibold uppercase" },
  { path: "components/portal/objects/shell.tsx", needle: "thead" },
  { path: "components/portal/objects/_previews/", needle: "thead" },
  { path: "components/portal/objects/_previews/", needle: "<dt" },
  { path: "components/portal/objects/_previews/record-preview.tsx", needle: "uppercase tracking-wide" },
  { path: "components/portal/objects/_previews/traversal-preview.tsx", needle: "uppercase tracking-wide" },
  { path: "components/portal/objects/_previews/write-preview.tsx", needle: "uppercase tracking-wide" },
  { path: "components/portal/objects/workspace/navigator.tsx", needle: "text-[9.5px]" },
  // UI-primitive keyboard-shortcut hints: `tracking-widest`, no `uppercase`.
  { path: "components/ui/", needle: "tracking-widest" },
  // `default` micro-tag beside a variant badge — an inline label, not a section overline.
  { path: "components/portal/component-doc-sections.tsx", needle: "text-[10px] uppercase" },
  // Legend swatches: a deliberate 3px chip radius (matches the ui/ chart swatch convention).
  { path: "components/portal/dashboard.tsx", needle: "rounded-[3px]" },
];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (/\.tsx$/.test(p) && !/__check__/.test(p)) acc.push(p);
  }
  return acc;
}

const toPosix = (p) => p.split("\\").join("/");

function isAllowlisted(relPath, line) {
  const posix = toPosix(relPath);
  return ALLOWLIST.some((e) => posix.includes(e.path) && line.includes(e.needle));
}

// A line is an overline candidate when it uppercases text AND tracks it.
const overlineRe = /\buppercase\b/;
const trackingRe = /\btracking-\[?[\w.-]+\]?/;
// Named radius steps above the scale (xl/2xl/3xl) always drift.
const namedRadiusRe = /\brounded-(?:xl|2xl|3xl)\b/;
// Arbitrary radius values drift UNLESS they derive from the token
// (`var(--radius...)`, `calc(...)`, `inherit`, `min(var(--radius...`).
const arbitraryRadiusRe = /\brounded-\[([^\]]+)\]/g;
const tokenDerived = (val) => /var\(|--radius|calc\(|inherit/.test(val);

function hasRadiusHardcode(line) {
  if (namedRadiusRe.test(line)) return true;
  let m;
  arbitraryRadiusRe.lastIndex = 0;
  while ((m = arbitraryRadiusRe.exec(line)) !== null) {
    if (!tokenDerived(m[1])) return true;
  }
  return false;
}

const offenders = [];

for (const file of walk(srcDir)) {
  const relPath = relative(portalRoot, file);
  if (!IN_SCOPE.some((prefix) => toPosix(relPath).startsWith(prefix))) continue;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const lineNo = i + 1;

    // Rule 1: overline drift.
    if (overlineRe.test(line) && trackingRe.test(line)) {
      const usesSystem = line.includes("typeStyles.overline");
      if (!usesSystem && !isAllowlisted(relPath, line)) {
        offenders.push({
          rule: "overline",
          file: toPosix(relPath),
          line: lineNo,
          text: line.trim(),
        });
      }
    }

    // Rule 2: radius hardcode.
    if (hasRadiusHardcode(line) && !isAllowlisted(relPath, line)) {
      offenders.push({
        rule: "radius",
        file: toPosix(relPath),
        line: lineNo,
        text: line.trim(),
      });
    }
  });
}

if (offenders.length === 0) {
  console.log("STYLE-FIDELITY OK — 0 overline drifts, 0 radius hardcodes");
  process.exit(0);
}

console.error(`STYLE-FIDELITY: ${offenders.length} violation(s)\n`);
for (const o of offenders) {
  const snippet = o.text.length > 120 ? o.text.slice(0, 117) + "..." : o.text;
  console.error(`  [${o.rule}] ${o.file}:${o.line}`);
  console.error(`      ${snippet}`);
}
console.error(
  "\nRoute overlines through `typeStyles.overline` and radii through the " +
    "`rounded-{sm,md,lg}` scale. Deliberate one-offs go in the ALLOWLIST in " +
    "scripts/check-style-fidelity.mjs (path fragment + line needle)."
);
process.exit(1);
