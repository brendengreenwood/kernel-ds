#!/usr/bin/env node
/**
 * Amendment A4 enforcement (segments 04+):
 *
 *   1. `active` must never map to `pending` under `src/components/portal/objects/**`
 *      (semantic regression from Amendment A4, 2026-07-17).
 *   2. The contract-status mapping lives in exactly one file:
 *      `src/lib/objects/status-map.ts`. No inline duplicates in the objects/ pages.
 *
 * Exit 0 with no output when both invariants hold; exit 1 with an
 * enumeration of offending lines otherwise. Shell-agnostic (Windows-safe).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const objectsPagesDir = resolve(here, "..", "src", "components", "portal", "objects");
const statusMapPath = resolve(here, "..", "src", "lib", "objects", "status-map.ts");

/** Recursively collect files under `dir` matching `predicate`. */
function walk(dir, predicate, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, predicate, acc);
    else if (predicate(p)) acc.push(p);
  }
  return acc;
}

const isSource = (p) => /\.(t|j)sx?$/.test(p) && !/__check__/.test(p);

const offenders = [];

// Invariant 1: no `active` → `pending` mapping in any objects/ page.
const activePendingRe = /["']active["']\s*(?:\)\s*|.{0,32}?)\breturn\s+["']pending["']/;
for (const file of walk(objectsPagesDir, isSource)) {
  const src = readFileSync(file, "utf8");
  const lines = src.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (activePendingRe.test(line)) {
      offenders.push({
        rule: "A4-active-pending",
        file: relative(repoRoot, file),
        line: i + 1,
        text: line.trim(),
      });
    }
  });
}

// Invariant 2: the `s === "active"` → `booked` switch must appear in exactly
// one file — `status-map.ts`. Any occurrence under objects/ pages is a
// duplicate that must be removed.
const inlineSwitchRe = /s\s*===\s*["']active["']/;
for (const file of walk(objectsPagesDir, isSource)) {
  const src = readFileSync(file, "utf8");
  const lines = src.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (inlineSwitchRe.test(line)) {
      offenders.push({
        rule: "A4-duplicate-switch",
        file: relative(repoRoot, file),
        line: i + 1,
        text: line.trim(),
      });
    }
  });
}

// Sanity check: the canonical helper still exists and returns `booked` for
// `active`. This guards against someone silently reverting the helper.
try {
  const canonical = readFileSync(statusMapPath, "utf8");
  if (!/["']active["']\s*\)\s*return\s+["']booked["']/.test(canonical)) {
    offenders.push({
      rule: "A4-helper-missing-active-booked",
      file: relative(repoRoot, statusMapPath),
      line: 0,
      text: "status-map.ts does not map active → booked",
    });
  }
} catch (err) {
  offenders.push({
    rule: "A4-helper-missing",
    file: relative(repoRoot, statusMapPath),
    line: 0,
    text: String(err.message || err),
  });
}

if (offenders.length > 0) {
  console.error("check-status-map: Amendment A4 violation(s):");
  for (const o of offenders) {
    console.error(`  [${o.rule}] ${o.file}:${o.line} — ${o.text}`);
  }
  process.exit(1);
}

process.exit(0);
