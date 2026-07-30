/**
 * Deterministic output and exit-code tests for the DS lifecycle commands.
 * Mutating commands run against temp copies of __fixtures__ — never the real
 * catalog. Run via: node scripts/ds/__check__.mjs
 */
import { spawnSync } from "node:child_process"
import { cpSync, mkdtempSync, readFileSync, rmSync, readdirSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptsDir, "../..")
const fixturesDir = join(scriptsDir, "__fixtures__")
const cli = join(scriptsDir, "cli.mjs")

let checks = 0
const failures = []

function ds(args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: repoRoot, encoding: "utf8" })
}

function assert(condition, label, detail = "") {
  checks += 1
  if (!condition) failures.push(`${label}${detail ? ` — ${detail}` : ""}`)
}

function tempCopy(fixtureName) {
  const dir = mkdtempSync(join(tmpdir(), "ds-check-"))
  cpSync(join(fixturesDir, fixtureName), dir, { recursive: true })
  return dir
}

// 1. The real catalog file round-trips byte-for-byte through the shared parser.
{
  const { parseCatalogFile, serializeCatalogFile } = await import("./lib/catalog-file.mjs")
  const path = resolve(repoRoot, "packages/catalog/src/entities.ts")
  const original = readFileSync(path, "utf8")
  const roundTripped = serializeCatalogFile(parseCatalogFile(path))
  assert(roundTripped === original, "catalog round-trip", "serialize(parse(entities.ts)) must be byte-identical")
}

// 2/3. ds:add success then collision refusal without mutation.
{
  const dir = tempCopy("catalog-clean")
  const catalogFile = join(dir, "entities.ts")
  const docsDir = join(dir, "docs")
  const first = ds(["add", "--kind", "component", "--name", "Fixture Meter", "--catalog-file", catalogFile, "--docs-dir", docsDir])
  assert(first.status === 0 && first.stdout.includes("DS-ADD-OK"), "add success", first.stdout + first.stderr)
  assert(readFileSync(catalogFile, "utf8").includes('"component.fixture-meter"'), "add registers entity")
  assert(existsSync(join(docsDir, "fixture-meter.ts")), "add scaffolds docs skeleton")

  const before = readFileSync(catalogFile, "utf8")
  const second = ds(["add", "--kind", "component", "--name", "Fixture Meter", "--catalog-file", catalogFile, "--docs-dir", docsDir])
  assert(second.status === 1 && second.stderr.includes("DS-ADD-REFUSED"), "add collision refused", second.stdout + second.stderr)
  assert(readFileSync(catalogFile, "utf8") === before, "add collision leaves catalog untouched")
  rmSync(dir, { recursive: true, force: true })
}

// 4. ds:tag valid write and invalid-taxonomy refusal.
{
  const dir = tempCopy("catalog-clean")
  const catalogFile = join(dir, "entities.ts")
  const valid = ds(["tag", "--entity", "pattern.fixture-flow", "--tag", "ready", "--catalog-file", catalogFile])
  assert(valid.status === 0 && valid.stdout.includes("DS-TAG-OK"), "tag valid", valid.stdout + valid.stderr)

  const before = readFileSync(catalogFile, "utf8")
  const invalid = ds(["tag", "--entity", "pattern.fixture-flow", "--tag", "shiny", "--catalog-file", catalogFile])
  assert(invalid.status === 1 && invalid.stderr.includes("DS-TAG-REFUSED"), "tag invalid taxonomy refused", invalid.stdout + invalid.stderr)
  assert(readFileSync(catalogFile, "utf8") === before, "tag refusal leaves catalog untouched")
  rmSync(dir, { recursive: true, force: true })
}

// 5. ds:relate valid write and broken-target refusal.
{
  const dir = tempCopy("catalog-clean")
  const catalogFile = join(dir, "entities.ts")
  const valid = ds(["relate", "--entity", "component.fixture-button", "--type", "recommendedPatterns", "--target", "pattern.fixture-flow", "--catalog-file", catalogFile])
  assert(valid.status === 0 && valid.stdout.includes("DS-RELATE-OK"), "relate valid", valid.stdout + valid.stderr)

  const before = readFileSync(catalogFile, "utf8")
  const broken = ds(["relate", "--entity", "component.fixture-button", "--type", "dependsOn", "--target", "component.fixture-missing", "--catalog-file", catalogFile])
  assert(broken.status === 1 && broken.stderr.includes("DS-RELATE-REFUSED"), "relate broken target refused", broken.stdout + broken.stderr)
  assert(readFileSync(catalogFile, "utf8") === before, "relate refusal leaves catalog untouched")
  rmSync(dir, { recursive: true, force: true })
}

// 6-9. ds:doctor fixture verdicts: clean passes; each red fixture reports its code.
{
  const clean = ds(["doctor", "--fixture", join(fixturesDir, "catalog-clean")])
  assert(clean.status === 0 && clean.stdout.includes("DS-DOCTOR-OK"), "doctor clean fixture", clean.stdout + clean.stderr)

  const redFixtures = [
    ["catalog-broken-relationship", "missing-relationship-target"],
    ["catalog-stale-generated", "stale-generated"],
    ["catalog-partial-registration", "missing-source"],
  ]
  for (const [fixture, code] of redFixtures) {
    const result = ds(["doctor", "--fixture", join(fixturesDir, fixture)])
    assert(result.status === 1 && result.stderr.includes(code), `doctor detects ${code}`, result.stdout + result.stderr)
  }
}

// 10. ds:changeset deterministic write, idempotent rerun, refusal matrix for
// bump, classification, missing entities, and breaking-without-migration.
{
  const dir = mkdtempSync(join(tmpdir(), "ds-changeset-"))
  const args = ["changeset", "--package", "@kernel/ui", "--bump", "minor", "--summary", "Fixture release note", "--classification", "runtime", "--entities", "component.button", "--dir", dir]
  const first = ds(args)
  assert(first.status === 0 && first.stdout.includes("DS-CHANGESET-OK: wrote"), "changeset write", first.stdout + first.stderr)
  const files = readdirSync(dir)
  assert(files.length === 1 && /^kernel-ui-minor-[0-9a-f]{8}\.md$/.test(files[0]), "changeset deterministic filename", files.join(", "))
  const written = readFileSync(join(dir, files[0]), "utf8")
  assert(written.includes("kernel-ds:release-meta") && written.includes('"classification":"runtime"'), "changeset embeds release metadata", written)

  const rerun = ds(args)
  assert(rerun.status === 0 && rerun.stdout.includes("no write"), "changeset idempotent rerun", rerun.stdout + rerun.stderr)
  assert(readdirSync(dir).length === 1, "changeset rerun adds no files")

  const refusals = [
    [["changeset", "--package", "@kernel/ui", "--bump", "huge", "--summary", "x", "--classification", "docs", "--dir", dir], "invalid bump"],
    [["changeset", "--package", "@kernel/ui", "--bump", "patch", "--summary", "x", "--classification", "vibes", "--dir", dir], "invalid classification"],
    [["changeset", "--package", "@kernel/ui", "--bump", "patch", "--summary", "x", "--classification", "runtime", "--dir", dir], "runtime without entities or package scope"],
    [["changeset", "--package", "@kernel/ui", "--bump", "major", "--summary", "x", "--classification", "api", "--scope", "package", "--breaking", "--dir", dir], "breaking without migration"],
    [["changeset", "--package", "@kernel/ui", "--bump", "patch", "--summary", "x", "--classification", "runtime", "--entities", "component.not-a-thing", "--dir", dir], "unknown catalog entity"],
  ]
  for (const [refusalArgs, label] of refusals) {
    const result = ds(refusalArgs)
    assert(result.status === 1 && result.stderr.includes("DS-CHANGESET-REFUSED"), `changeset refuses ${label}`, result.stdout + result.stderr)
  }
  assert(readdirSync(dir).length === 1, "changeset refusals write nothing")
  rmSync(dir, { recursive: true, force: true })
}

// 10b. Release impact manifest: schema-valid, deterministic, relationship-
// expanded, and hard-failing on breaking-without-migration or missing metadata.
{
  const outA = join(mkdtempSync(join(tmpdir(), "ds-impact-")), "impact.json")
  const outB = join(mkdtempSync(join(tmpdir(), "ds-impact-")), "impact.json")
  const validDir = join(fixturesDir, "changesets-valid")
  const runA = ds(["release-impact", "--dir", validDir, "--out", outA])
  const runB = ds(["release-impact", "--dir", validDir, "--out", outB])
  assert(runA.status === 0 && runA.stdout.includes("RELEASE-IMPACT-OK"), "release-impact green fixture", runA.stdout + runA.stderr)
  assert(runB.status === 0 && readFileSync(outA, "utf8") === readFileSync(outB, "utf8"), "release-impact deterministic output")

  const manifest = JSON.parse(readFileSync(outA, "utf8"))
  const { validateImpactManifest } = await import("./lib/release-meta.mjs")
  assert(validateImpactManifest(manifest).length === 0, "impact manifest schema-valid", validateImpactManifest(manifest).join("; "))
  const definitions = manifest.packages.find((entry) => entry.name === "@kernel/definitions")
  assert(definitions.bump === "minor" && definitions.plannedVersion === "0.1.0", "impact plans definitions minor bump", JSON.stringify(definitions))
  const affected = definitions.changes[0].affectedEntities
  for (const id of ["object.workspace", "object.collection", "object.shell"]) {
    assert(affected.includes(id), `impact expands relationships to ${id}`, affected.join(", "))
  }
  const uiEntry = manifest.packages.find((entry) => entry.name === "@kernel/ui")
  assert(uiEntry.changes[0].classification === "docs" && uiEntry.changes[0].affectedEntities.length === 0, "docs classification exempt from entity expansion", JSON.stringify(uiEntry.changes[0]))

  const breaking = ds(["release-impact", "--dir", join(fixturesDir, "changesets-breaking-no-migration"), "--out", outA])
  assert(breaking.status === 1 && breaking.stderr.includes("migration"), "release-impact fails breaking without migration", breaking.stdout + breaking.stderr)
  const missing = ds(["release-check", "--dir", join(fixturesDir, "changesets-missing-meta")])
  assert(missing.status === 1 && missing.stderr.includes("missing kernel-ds:release-meta"), "release-check fails missing metadata", missing.stdout + missing.stderr)

  // Independent version bumps proven through the changesets dry-run worktree.
  const dryRun = ds(["release-check", "--dir", validDir, "--expect-versions", "@kernel/definitions 0.0.0 -> 0.1.0, @kernel/ui 0.0.0 -> 0.0.1"])
  assert(dryRun.status === 0 && dryRun.stdout.includes("RELEASE-CHECK-OK"), "release-check dry-run versions independently", dryRun.stdout + dryRun.stderr)
}

// 11. AGENTS marker application: prose preserved byte-for-byte, idempotent, appends when absent.
{
  const { applyMarkers, START_MARKER, END_MARKER } = await import("./lib/agents-inventory.mjs")
  const prose = "# Hand-authored\r\n\r\nCurated rules stay curated.\r\n"
  const appended = applyMarkers(prose, ["alpha 1", "beta 2"])
  assert(appended.startsWith(prose), "markers append preserves prose prefix")
  assert(appended.includes(START_MARKER) && appended.includes(END_MARKER), "markers appended")

  const updated = applyMarkers(appended, ["alpha 3"])
  const prefix = updated.slice(0, updated.indexOf(START_MARKER))
  assert(appended.slice(0, appended.indexOf(START_MARKER)) === prefix, "marker update preserves prose outside markers")
  assert(updated.includes("alpha 3") && !updated.includes("beta 2"), "marker section replaced")
  assert(applyMarkers(updated, ["alpha 3"]) === updated, "marker application idempotent")

  let threw = false
  try {
    applyMarkers(`${START_MARKER}\nno end`, ["x"])
  } catch {
    threw = true
  }
  assert(threw, "unbalanced markers rejected")
}

// 12. Skills integrity: real skills pass; the red fixture reports each violation kind.
{
  const green = ds(["skills"])
  assert(green.status === 0 && green.stdout.includes("SKILLS-CHECK-OK"), "skills check green", green.stdout + green.stderr)

  const red = ds(["skills", "--dir", "scripts/ds/__fixtures__/skills-invalid", "--fixtures", "scripts/ds/__fixtures__/skills-invalid/none.json"])
  assert(red.status === 1, "skills red fixture nonzero", red.stdout + red.stderr)
  for (const marker of ["missing path scripts/ds/removed-command.mjs", "unknown npm script \"ds:frobnicate\"", "unknown catalog entity component.nonexistent-thing", "missing required \"## Verification\" section"]) {
    assert(red.stderr.includes(marker), `skills red fixture reports: ${marker}`, red.stderr)
  }
}

// 13. Verify selection matrix: changed paths map to gates, expanded through
// transitive dependents so package changes never skip their consumers.
{
  const { selectGates } = await import("./commands/verify.mjs")
  const matrix = [
    [["scripts/ds/commands/verify.mjs"], ["ds-commands"]],
    [["package.json"], ["ds-commands"]],
    [["packages/catalog/src/entities.ts"], ["catalog", "portal", "studio"]],
    [["packages/ui/src/components/ui/button.tsx"], ["ui", "portal", "studio"]],
    [["packages/definitions/src/object.ts"], ["definitions", "portal", "studio"]],
    [["kernel-portal/src/main.tsx"], ["portal", "studio"]],
    [["kernel-studio-server/src/lib/paths.ts"], ["studio"]],
    [["docs/STATE.md"], []],
    [["packages/ui/api.json", "kernel-studio-server/src/lib/paths.ts"], ["ui", "portal", "studio"]],
  ]
  for (const [paths, expected] of matrix) {
    const ids = selectGates(paths).map((gate) => gate.id)
    assert(
      ids.join(",") === expected.join(","),
      `verify selection for ${paths.join("+")}`,
      `expected [${expected.join(", ")}], got [${ids.join(", ")}]`,
    )
  }
}

// 15. Managed consumers: registry validation, dry-run upgrade planning,
// refusal matrix, apply/restore semantics, and unmanaged-fork fencing.
{
  const consumersFixtures = join(fixturesDir, "consumers")
  const registryArg = ["--registry", "scripts/ds/__fixtures__/consumers/registry.json"]
  const rootArg = ["--root", "scripts/ds/__fixtures__/consumers"]
  const manifestArg = ["--manifest", "scripts/ds/__fixtures__/consumers/impact.json"]

  // Real registry is valid; the invalid fixture reports each violation kind.
  const realRegistry = ds(["consumers"])
  assert(realRegistry.status === 0 && realRegistry.stdout.includes("CONSUMERS-CHECK-OK"), "consumers real registry valid", realRegistry.stdout + realRegistry.stderr)
  const invalid = ds(["consumers", "--registry", "scripts/ds/__fixtures__/consumers/registry-invalid.json"])
  assert(invalid.status === 1, "consumers invalid registry nonzero", invalid.stdout + invalid.stderr)
  for (const marker of [
    "unknown schema",
    'verification command "rm" is not allowlisted',
    "duplicate consumer id",
    "localPath escapes the repository",
    'localPath targets unmanaged path "kernel-app"',
    'package "@kernel/catalog" is not publishable',
    "branch.prefix is required",
    "optIn must be true or false",
  ]) {
    assert(invalid.stderr.includes(marker), `consumers invalid registry reports: ${marker}`, invalid.stderr)
  }

  // Compatible dry-run: dependency, migration, docs, verification, and branch
  // output — and no files written.
  const appManifestPath = join(consumersFixtures, "app/package.json")
  const appBefore = readFileSync(appManifestPath, "utf8")
  const dryRun = ds(["upgrade", "--consumer", "fixture-app", "--dry-run", ...registryArg, ...rootArg, ...manifestArg])
  assert(dryRun.status === 0 && dryRun.stdout.includes("DS-UPGRADE-OK: dry-run plan"), "upgrade dry-run compatible", dryRun.stdout + dryRun.stderr)
  for (const marker of [
    "@kernel/ui: ^0.0.0 -> ^1.0.0",
    "Rename the Button prop `tone` to `variant`",
    "/components/button",
    "node -e process.exit(0)",
    "branch: chore/kernel-ds-upgrade/",
  ]) {
    assert(dryRun.stdout.includes(marker), `upgrade dry-run prints: ${marker}`, dryRun.stdout)
  }
  assert(readFileSync(appManifestPath, "utf8") === appBefore, "upgrade dry-run writes nothing")

  // No-op, unmanaged fork, unknown id, missing opt-in, missing credentials.
  const noop = ds(["upgrade", "--consumer", "fixture-noop", "--dry-run", ...registryArg, ...rootArg, ...manifestArg])
  assert(noop.status === 0 && noop.stdout.includes("DS-UPGRADE-NOOP"), "upgrade no-op detected", noop.stdout + noop.stderr)
  const fork = ds(["upgrade", "--consumer", "kernel-app", "--dry-run", ...registryArg, ...rootArg, ...manifestArg])
  assert(fork.status === 1 && fork.stderr.includes("DS-UPGRADE-REFUSED") && fork.stderr.includes("unmanaged"), "upgrade refuses unmanaged fork", fork.stdout + fork.stderr)
  const forkApply = ds(["upgrade", "--consumer", "kernel-app", "--apply", ...registryArg, ...rootArg, ...manifestArg])
  assert(forkApply.status === 1 && forkApply.stderr.includes("DS-UPGRADE-REFUSED"), "upgrade refuses unmanaged fork even with --apply", forkApply.stdout + forkApply.stderr)
  const unknown = ds(["upgrade", "--consumer", "no-such-app", "--dry-run", ...registryArg, ...rootArg, ...manifestArg])
  assert(unknown.status === 1 && unknown.stderr.includes("DS-UPGRADE-REFUSED"), "upgrade refuses unknown consumer", unknown.stdout + unknown.stderr)
  const notOpted = ds(["upgrade", "--consumer", "fixture-not-opted", "--apply", "--no-install", ...registryArg, ...rootArg, ...manifestArg])
  assert(notOpted.status === 1 && notOpted.stderr.includes("not opted in"), "upgrade apply requires opt-in", notOpted.stdout + notOpted.stderr)
  const remote = ds(["upgrade", "--consumer", "fixture-remote", "--apply", ...registryArg, ...rootArg, ...manifestArg])
  assert(remote.status === 1 && remote.stderr.includes("credentials"), "upgrade apply refuses remote without credentials", remote.stdout + remote.stderr)

  // Apply on temp copies: success updates dependencies; verification failure
  // restores the consumer byte-for-byte and blocks.
  const applyDir = tempCopy("consumers")
  const applyRegistry = ["--registry", join(applyDir, "registry.json"), "--root", applyDir, "--manifest", join(applyDir, "impact.json")]
  const applied = ds(["upgrade", "--consumer", "fixture-app", "--apply", "--no-install", ...applyRegistry])
  assert(applied.status === 0 && applied.stdout.includes("DS-UPGRADE-OK: applied"), "upgrade apply succeeds", applied.stdout + applied.stderr)
  const appliedManifest = JSON.parse(readFileSync(join(applyDir, "app/package.json"), "utf8"))
  assert(appliedManifest.dependencies["@kernel/ui"] === "^1.0.0" && appliedManifest.dependencies["@kernel/definitions"] === "^0.1.0", "upgrade apply updates dependencies", JSON.stringify(appliedManifest.dependencies))

  const failingPath = join(applyDir, "failing-app/package.json")
  const failingBefore = readFileSync(failingPath, "utf8")
  const blocked = ds(["upgrade", "--consumer", "fixture-failing", "--apply", "--no-install", ...applyRegistry])
  assert(blocked.status === 1 && blocked.stderr.includes("DS-UPGRADE-BLOCKED"), "upgrade blocks on verification failure", blocked.stdout + blocked.stderr)
  assert(readFileSync(failingPath, "utf8") === failingBefore, "upgrade failure restores the consumer")
  rmSync(applyDir, { recursive: true, force: true })
}

// 16. ds:release publish mode refuses to start without registry credentials.
{
  const publish = spawnSync(process.execPath, [cli, "release", "--publish"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, NODE_AUTH_TOKEN: "" },
  })
  assert(publish.status === 1 && publish.stderr.includes("DS-RELEASE-REFUSED") && publish.stderr.includes("NODE_AUTH_TOKEN"), "release publish refuses without credentials", publish.stdout + publish.stderr)
}

// 14. Unknown commands exit nonzero with usage.
{
  const unknown = ds(["frobnicate"])
  assert(unknown.status === 1 && unknown.stderr.includes("DS-USAGE"), "unknown command usage", unknown.stdout + unknown.stderr)
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`DS-CHECK-FAILED: ${failure}`)
  process.exit(1)
}
console.log(`DS-CHECK-OK: ${checks} assertions passed`)
