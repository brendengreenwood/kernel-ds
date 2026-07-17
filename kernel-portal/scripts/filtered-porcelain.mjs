#!/usr/bin/env node
// Shell-agnostic working-tree cleanliness gate for the
// ds-object-centric-restructure plan set.
//
// Runs `git status --porcelain` in the repo root, then filters the
// output against a committed allow-list of paths that are session-local
// to the plan set (plan files, progress file, amendments file, proof
// artifacts) and to three pre-existing untracked files at the repo root.
//
// Exit 0 with no output if every remaining line is allow-listed;
// exit 1 and print the offenders to stderr otherwise.
//
// Contract:
//  - RegExp allow-list (anchored) — matched with `regex.test(path)`.
//  - Assumes git porcelain v1 format (no renames, no quoted paths) in
//    the allow-listed regions. A future robustness pass could adopt
//    `--porcelain -z` and NUL-split.
//  - Git prints forward-slash paths on Windows, so no separator
//    normalization is required.

import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import path from "node:path"

// Repo root: this file lives at kernel-portal/scripts/filtered-porcelain.mjs,
// so three "../" hops reach the repo root regardless of the caller's cwd.
const here = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(here), "..", "..")

const ALLOW = [
  // Bare-directory case: git folds entirely-untracked dirs to a single
  // `.mastracode/` line until something inside is tracked. Since the
  // plan files, progress file, and proof artifacts are session-local
  // and never committed, `.mastracode/` stays untracked in aggregate.
  /^\.mastracode\/?$/,
  /^\.mastracode\/plans\/ds-object-centric-restructure\//,
  /^\.mastracode\/plans\/ds-object-centric-restructure\.progress\.md$/,
  /^\.mastracode\/plans\/ds-object-centric-restructure\.amendments\.md$/,
  /^\.mastracode\/plans\/ds-object-centric-restructure\.proof(\/|$)/,
  /^\.mastracode\/plans\/ds-object-centric-restructure\.md$/,
  /^docs\/agent-efficiency-notes\.md$/,
  /^studio-dev\.err\.log$/,
  /^studio-dev\.out\.log$/,
]

let stdout = ""
try {
  stdout = execSync("git status --porcelain", {
    cwd: repoRoot,
    encoding: "utf8",
  })
} catch (err) {
  console.error("filtered-porcelain: git status failed:", err.message)
  process.exit(2)
}

const offenders = []
for (const rawLine of stdout.split(/\r?\n/)) {
  if (rawLine.length === 0) continue
  // Porcelain v1 format: two-char status + one space + path.
  const line = rawLine.length >= 3 ? rawLine.slice(3) : rawLine
  if (ALLOW.some((rx) => rx.test(line))) continue
  offenders.push(rawLine)
}

if (offenders.length === 0) {
  process.exit(0)
}

for (const l of offenders) {
  console.error(l)
}
process.exit(1)
