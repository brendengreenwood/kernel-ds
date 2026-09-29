#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const portalRoot = resolve(here, "..");
const repoRoot = resolve(portalRoot, "..");
const stylesPath = resolve(repoRoot, "packages/ui/src/styles.css");
const srcDir = resolve(portalRoot, "src");

const expectedAliases = new Map([
  ["--radius-sm", "var(--radius-control)"],
  ["--radius-md", "var(--radius-control)"],
  ["--radius-lg", "var(--radius-surface)"],
  ["--radius-xl", "var(--radius-modal)"],
]);

const expectedRoleValues = new Map([
  ["--radius-control", "0.25rem"],
  ["--radius-surface", "0.5rem"],
  ["--radius-floating", "0.5rem"],
  ["--radius-modal", "0.5rem"],
]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, acc);
    else if (/\.tsx$/.test(path) && !/__check__/.test(path)) acc.push(path);
  }
  return acc;
}

function validateAliases(styles) {
  const failures = [];
  for (const [token, expected] of expectedAliases) {
    const match = styles.match(new RegExp(`${token.replace("--", "--")}:\\s*([^;]+);`));
    if (!match || match[1].trim() !== expected) {
      failures.push(`${token} must resolve to ${expected}`);
    }
  }
  return failures;
}

const styles = readFileSync(stylesPath, "utf8");
const failures = validateAliases(styles);
for (const [token, expected] of expectedRoleValues) {
  const match = styles.match(new RegExp(`${token}:\\s*([^;]+);`));
  if (!match || match[1].trim() !== expected) {
    failures.push(`${token} must equal ${expected}`);
  }
}
const counts = { sm: 0, md: 0, lg: 0, xl: 0, full: 0, explicit: 0 };
const genericRadiusRe = /\brounded-(sm|md|lg|xl|full)\b/g;
const explicitRoleRe = /rounded(?:-[trbl])?-\[var\(--radius-(?:control|surface|floating|modal)\)\]/g;

for (const file of walk(srcDir)) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(genericRadiusRe)) counts[match[1]] += 1;
  counts.explicit += [...source.matchAll(explicitRoleRe)].length;
}

const demoSource = readFileSync(resolve(srcDir, "components/portal/section.tsx"), "utf8");
if (!demoSource.includes("rounded-[var(--radius-surface)] border bg-card p-8")) {
  failures.push("portal Demo surface must use --radius-surface explicitly");
}

const shellSource = readFileSync(resolve(srcDir, "../src/pages/portal-layout.tsx"), "utf8");
if (/rounded-t-(?:sm|md|lg|xl)/.test(shellSource)) {
  failures.push("portal shell header must not add an interior corner radius");
}

if (failures.length > 0) {
  console.error("GEOMETRY-ROLES FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const relStyles = relative(portalRoot, stylesPath).split("\\").join("/");
console.log(
  `GEOMETRY-ROLES-OK: ${relStyles} control=4px, surface/floating/modal=8px; aliases sm/md→control, lg→surface, xl→modal; portal inventory sm=${counts.sm}, md=${counts.md}, lg=${counts.lg}, xl=${counts.xl}, full=${counts.full}, explicit=${counts.explicit}`,
);
