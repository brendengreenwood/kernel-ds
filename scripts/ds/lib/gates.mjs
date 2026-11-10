import { resolve } from "node:path"
import { repoRoot, runNode, runNpm } from "./context.mjs"

/**
 * The single gate manifest. Every check that guards the repo is declared
 * here once, with:
 *   - which verify gate (changed-path group) it belongs to
 *   - how to run it locally (npm script or node script, with cwd)
 *   - whether CI must also run it (`ci: needle` — a literal command fragment
 *     that must appear in .github/workflows/ci.yml; ds:doctor's
 *     `gate-coverage` check fails when a declared needle is missing, so a
 *     gate added here cannot silently stay out of CI)
 *   - `ciOnly: true` for checks too heavy for path-triggered local verify
 *     (they still count for CI coverage)
 *
 * ds:verify consumes this manifest for selection AND execution; doctor
 * consumes it for CI-coverage diagnosis. Before this file the registry
 * lived four times (ci.yml, verify.mjs, doctor, AGENTS prose) and the
 * copies drifted — verify's portal gate ran 3 of CI's 14 portal checks.
 */
export const gateManifest = [
  {
    id: "ds-commands",
    match: /^(scripts\/ds\/|package\.json$)/,
    dependents: [],
    checks: [
      { id: "ds-check", npm: ["run", "ds:check"], ci: "npm run ds:check" },
    ],
  },
  {
    id: "catalog",
    match: /^packages\/catalog\//,
    dependents: ["portal", "studio"],
    checks: [
      { id: "catalog-test", npm: ["run", "catalog:test"], ci: "npm run catalog:test" },
      { id: "catalog-check", npm: ["run", "catalog:check"], ci: "npm run catalog:check" },
      { id: "catalog-integrity", node: "kernel-portal/scripts/check-catalog.mjs", ci: "node kernel-portal/scripts/check-catalog.mjs" },
    ],
  },
  {
    id: "ui",
    match: /^packages\/ui\//,
    dependents: ["portal", "studio"],
    checks: [
      { id: "ui-styles-check", node: "packages/ui/scripts/generate-styles.mjs", args: ["--check"], ci: "node packages/ui/scripts/generate-styles.mjs --check" },
      { id: "ui-build", npm: ["run", "ui:build"], ci: "npm run ui:build" },
      { id: "ui-test", npm: ["run", "ui:test"], ci: "npm run ui:test" },
      { id: "ui-check", npm: ["run", "ui:check"], ci: "npm run ui:check" },
    ],
  },
  {
    id: "definitions",
    match: /^packages\/definitions\//,
    dependents: ["portal", "studio"],
    checks: [
      { id: "definitions-build", npm: ["run", "definitions:build"], ci: "npm run definitions:build" },
      { id: "definitions-test", npm: ["run", "definitions:test"], ci: "npm run definitions:test" },
      { id: "definitions-check", npm: ["run", "definitions:check"], ci: "npm run definitions:check" },
    ],
  },
  {
    id: "portal",
    match: /^kernel-portal\//,
    dependents: ["studio"],
    cwd: "kernel-portal",
    checks: [
      { id: "portal-build", npm: ["run", "build"], ci: "npm run build" },
      { id: "portal-lint", npm: ["run", "lint"], ci: "npm run lint" },
      { id: "portal-css", node: "kernel-portal/scripts/check-portal-css.mjs", ci: "node scripts/check-portal-css.mjs" },
      { id: "portal-boot", node: "kernel-portal/scripts/check-portal-boot.mjs", ci: "node scripts/check-portal-boot.mjs", ciOnly: true },
      { id: "component-docs", node: "kernel-portal/scripts/check-component-docs.mjs", ci: "node scripts/check-component-docs.mjs" },
      { id: "doc-coverage", node: "kernel-portal/scripts/check-component-docs.mjs", args: ["--coverage"], ci: "node scripts/check-component-docs.mjs --coverage" },
      { id: "prose-quality", node: "kernel-portal/scripts/check-prose-quality.mjs", ci: "node scripts/check-prose-quality.mjs" },
      { id: "style-fidelity", node: "kernel-portal/scripts/check-style-fidelity.mjs", ci: "node scripts/check-style-fidelity.mjs" },
      { id: "pane-usage", node: "kernel-portal/scripts/check-pane-usage.mjs", ci: "node scripts/check-pane-usage.mjs" },
      { id: "ds-usage", node: "kernel-portal/scripts/check-ds-usage.mjs", ci: "node scripts/check-ds-usage.mjs" },
      { id: "status-map", node: "kernel-portal/scripts/check-status-map.mjs", ci: "node scripts/check-status-map.mjs" },
      { id: "composition", node: "kernel-portal/scripts/emit-composition.mjs", ci: "node scripts/emit-composition.mjs" },
      { id: "doc-schema-assertions", node: "kernel-portal/src/lib/component-docs/__check__.mts", ci: "node --experimental-strip-types src/lib/component-docs/__check__.mts" },
      { id: "object-model-assertions", node: "kernel-portal/src/lib/objects/__check__.mts", ci: "node --experimental-strip-types src/lib/objects/__check__.mts" },
      { id: "marks-assertions", node: "packages/ui/src/components/ui/marks/__check__.mjs", cwd: ".", ci: "node packages/ui/src/components/ui/marks/__check__.mjs" },
    ],
  },
  {
    id: "studio",
    match: /^kernel-studio-server\//,
    dependents: [],
    cwd: "kernel-studio-server",
    checks: [
      { id: "studio-check", npm: ["run", "check"], ci: "npm run check" },
      { id: "studio-test", npm: ["test"], ci: "npm test" },
    ],
  },
]

/** Resolve a check's working directory ("." = repo root; group cwd is the default). */
function checkCwd(group, check) {
  const dir = check.cwd ?? group.cwd ?? "."
  return resolve(repoRoot, dir)
}

/** Run one check; returns the spawn result. npm checks declare full arg arrays. */
export function runCheck(group, check) {
  const cwd = checkCwd(group, check)
  if (check.npm) return runNpm(check.npm, { cwd })
  if (check.node) return runNode(resolve(repoRoot, check.node), check.args ?? [], { cwd })
  throw new Error(`gate check ${check.id} declares no runner`)
}

/** Every check in the manifest whose `ci` needle must appear in ci.yml. */
export function ciNeedles() {
  const needles = []
  for (const group of gateManifest) {
    for (const check of group.checks) {
      if (check.ci) needles.push({ gate: group.id, check: check.id, needle: check.ci })
    }
  }
  return needles
}
