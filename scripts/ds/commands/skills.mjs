import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { parseFlags } from "../lib/args.mjs"
import { repoRoot } from "../lib/context.mjs"
import { parseCatalogFile } from "../lib/catalog-file.mjs"
import { catalogEntitiesFile } from "../lib/context.mjs"

const REPO_PATH_ROOTS = ["packages/", "scripts/", "kernel-portal/", "kernel-studio-server/", "docs/", ".agents/", "ds-bundle/"]
const PRIVATE_LEAKS = ["@kernel/ui/src", "kernel-portal/src/components/ui"]
const ENTITY_REF = /^(component|pattern|element|object|domain)\.[a-z0-9]+(?:-[a-z0-9]+)*$/

function knownNpmScripts() {
  const names = new Set(["test", "install", "ci"])
  for (const manifestPath of ["package.json", "kernel-portal/package.json", "kernel-studio-server/package.json"]) {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, manifestPath), "utf8"))
    for (const script of Object.keys(manifest.scripts ?? {})) names.add(script)
  }
  return names
}

function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content)
  if (!match) return undefined
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":")
    if (separator > 0) fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }
  return fields
}

function backtickTokens(content) {
  return [...content.matchAll(/`([^`\n]+)`/g)].map((match) => match[1])
}

/** Statically validate one skill file; returns violation messages. */
function validateSkill(name, content, context) {
  const violations = []
  const frontmatter = parseFrontmatter(content)
  if (!frontmatter) {
    violations.push(`${name}: missing frontmatter block`)
    return violations
  }
  if (frontmatter.name !== name) violations.push(`${name}: frontmatter name "${frontmatter.name ?? ""}" does not match directory`)
  if (!frontmatter.description) violations.push(`${name}: frontmatter description is empty`)
  if (!/^##\s+Verification/m.test(content)) violations.push(`${name}: missing required "## Verification" section`)

  for (const leak of PRIVATE_LEAKS) {
    if (content.includes(leak)) violations.push(`${name}: references private path "${leak}"`)
  }

  for (const token of backtickTokens(content)) {
    if (REPO_PATH_ROOTS.some((root) => token.startsWith(root)) && !token.includes("<") && !token.includes("*")) {
      if (!existsSync(resolve(repoRoot, token))) violations.push(`${name}: references missing path ${token}`)
    }
    if (ENTITY_REF.test(token) && !context.entityIds.has(token)) {
      violations.push(`${name}: references unknown catalog entity ${token}`)
    }
  }

  for (const match of content.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)) {
    if (!context.scripts.has(match[1])) violations.push(`${name}: references unknown npm script "${match[1]}"`)
  }

  return violations
}

function loadSkills(skillsDir) {
  const skills = []
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = resolve(skillsDir, entry.name, "SKILL.md")
    if (!existsSync(file)) continue
    skills.push({ name: entry.name, content: readFileSync(file, "utf8") })
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

function triggerHits(request, frontmatter) {
  if (!frontmatter?.triggers) return 0
  const lowered = request.toLowerCase()
  return frontmatter.triggers
    .split(",")
    .map((trigger) => trigger.trim().toLowerCase())
    .filter((trigger) => trigger.length > 0 && lowered.includes(trigger)).length
}

/** Validate repo-owned skills plus request-fixture selection; returns violations. */
export function collectSkillViolations({ skillsDir, fixturesFile } = {}) {
  const dir = skillsDir ?? resolve(repoRoot, ".agents/skills")
  const context = {
    scripts: knownNpmScripts(),
    entityIds: new Set(parseCatalogFile(catalogEntitiesFile).entities.map((entity) => entity.id)),
  }
  // Strict integrity rules apply to the DS lifecycle skills; legacy kernel-*
  // skills predate the verification-section and path conventions.
  const skills = loadSkills(dir).filter((skill) => skill.name.startsWith("kernel-ds-"))
  const violations = []
  for (const skill of skills) {
    violations.push(...validateSkill(skill.name, skill.content, context))
  }

  const requestsFile = fixturesFile ?? resolve(repoRoot, "scripts/ds/__fixtures__/skill-requests.json")
  if (existsSync(requestsFile)) {
    const fixtures = JSON.parse(readFileSync(requestsFile, "utf8"))
    for (const fixture of fixtures) {
      const scored = skills.map((skill) => ({ name: skill.name, hits: triggerHits(fixture.request, parseFrontmatter(skill.content)) }))
      const expected = scored.find((entry) => entry.name === fixture.expect)
      if (!expected) {
        violations.push(`fixture "${fixture.request}": expected skill ${fixture.expect} does not exist`)
        continue
      }
      const best = Math.max(...scored.map((entry) => entry.hits))
      const winners = scored.filter((entry) => entry.hits === best && best > 0)
      if (expected.hits === 0 || winners.length !== 1 || winners[0].name !== fixture.expect) {
        violations.push(
          `fixture "${fixture.request}": expected ${fixture.expect} to win uniquely (hits: ${scored.filter((entry) => entry.hits > 0).map((entry) => `${entry.name}=${entry.hits}`).join(", ") || "none"})`,
        )
      }
    }
  }

  return violations
}

/** `skills --check` — static skill integrity + request-fixture selection. */
export async function skills(argv) {
  const { flags } = parseFlags(argv)
  const violations = collectSkillViolations({
    skillsDir: flags.dir ? resolve(repoRoot, flags.dir) : undefined,
    fixturesFile: flags.fixtures ? resolve(repoRoot, flags.fixtures) : undefined,
  })
  if (violations.length > 0) {
    for (const violation of violations) console.error(`SKILLS-INVALID: ${violation}`)
    console.error(`SKILLS-CHECK-FAILED: ${violations.length} violations`)
    process.exitCode = 1
    return
  }
  console.log("SKILLS-CHECK-OK: repo-owned skills are valid")
}
