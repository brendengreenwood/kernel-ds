import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { validateCatalog } from "../../../packages/catalog/src/schema.ts"
import { parseFlags } from "../lib/args.mjs"
import { catalogEntitiesFile, repoRoot, runNode } from "../lib/context.mjs"
import { parseCatalogFile } from "../lib/catalog-file.mjs"

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

/**
 * Diagnosis registry. Fixture-safe checks run against a `--fixture <dir>`
 * mini-repo (entities.ts plus optional expected/generated adapter files);
 * real checks inspect the actual repository. Later phases register more
 * checks here (AGENTS inventory freshness, skill integrity).
 */
export const doctorChecks = [
  {
    id: "catalog-validate",
    fixtureSafe: true,
    run: ({ entities }) =>
      validateCatalog(entities).map((issue) => ({ code: issue.code, message: issue.message })),
  },
  {
    id: "source-files",
    fixtureSafe: true,
    run: ({ entities, root }) => {
      const violations = []
      for (const entity of entities) {
        for (const path of [entity.documentation.sourceFile, ...entity.sourceFiles].filter(Boolean)) {
          if (!existsSync(resolve(root, path))) {
            violations.push({ code: "missing-source", message: `${entity.id} references missing source ${path}` })
          }
        }
      }
      return violations
    },
  },
  {
    id: "generated-adapter",
    fixtureSafe: true,
    run: ({ fixture, root }) => {
      if (fixture) {
        const expectedFile = resolve(root, "component-meta.expected.ts")
        if (!existsSync(expectedFile)) return []
        const generatedFile = resolve(root, "component-meta.generated.ts")
        const generated = existsSync(generatedFile) ? readFileSync(generatedFile, "utf8") : ""
        // Normalize CRLF so checkouts with core.autocrlf=true compare identically.
        if (generated.replaceAll("\r\n", "\n") !== readFileSync(expectedFile, "utf8").replaceAll("\r\n", "\n")) {
          return [{ code: "stale-generated", message: "portal lifecycle adapter is stale; run npm run ds:generate" }]
        }
        return []
      }
      const result = runNode(resolve(repoRoot, "packages/catalog/scripts/generate-portal-adapter.mjs"), ["--check"], { capture: true })
      if (result.status !== 0) {
        return [{ code: "stale-generated", message: "portal lifecycle adapter is stale; run npm run ds:generate" }]
      }
      return []
    },
  },
  {
    id: "ui-api-alignment",
    fixtureSafe: false,
    run: ({ entities }) => {
      const violations = []
      const api = readJson(resolve(repoRoot, "packages/ui/api.json"))
      const catalogModules = new Set()
      for (const entity of entities) {
        for (const path of entity.sourceFiles) {
          const match = /^packages\/ui\/src\/components\/ui\/([a-z0-9-]+)\.tsx$/.exec(path)
          if (match) catalogModules.add(match[1])
        }
      }
      for (const module of api.modules) {
        if (module.catalogBacked && !catalogModules.has(module.module)) {
          violations.push({ code: "missing-catalog-entry", message: `@kernel/ui module ${module.module} claims catalog backing but no entity references it` })
        }
      }
      const apiModules = new Set(api.modules.map((module) => module.module))
      for (const module of catalogModules) {
        if (!apiModules.has(module)) {
          violations.push({ code: "undocumented-export", message: `catalog references @kernel/ui module ${module} missing from api.json; rebuild @kernel/ui` })
        }
      }
      return violations
    },
  },
  {
    id: "a11y-readiness",
    fixtureSafe: true,
    run: ({ entities }) => {
      const violations = []
      for (const entity of entities) {
        if (entity.maturity !== "ready") continue
        if (entity.accessibility !== "reviewed") {
          violations.push({ code: "missing-a11y-review", message: `${entity.id} is ready without an accessibility review` })
        }
        if (!entity.capabilities.includes("documented")) {
          violations.push({ code: "missing-documentation", message: `${entity.id} is ready without the documented capability` })
        }
      }
      return violations
    },
  },
  {
    id: "version-alignment",
    fixtureSafe: false,
    run: () => {
      const violations = []
      const packagesDir = resolve(repoRoot, "packages")
      const versions = new Map()
      for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const manifest = readJson(resolve(packagesDir, entry.name, "package.json"))
        versions.set(manifest.name, manifest.version)
        // Packages version independently through Changesets (segment 5); the
        // invariant is a valid plain semver version, not identical versions.
        if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) {
          violations.push({
            code: "version-mismatch",
            message: `${manifest.name} has invalid version "${manifest.version}"; expected plain semver`,
          })
        }
      }
      for (const app of ["kernel-portal", "kernel-studio-server"]) {
        const manifest = readJson(resolve(repoRoot, app, "package.json"))
        for (const [name, spec] of Object.entries(manifest.dependencies ?? {})) {
          if (!name.startsWith("@kernel/")) continue
          const target = spec.startsWith("file:") ? resolve(repoRoot, app, spec.slice(5)) : undefined
          if (target && !existsSync(target)) {
            violations.push({ code: "version-mismatch", message: `${app} depends on ${name} at missing path ${spec}` })
          }
          if (!versions.has(name)) {
            violations.push({ code: "version-mismatch", message: `${app} depends on unknown workspace package ${name}` })
          }
        }
      }
      return violations
    },
  },
  {
    id: "agents-freshness",
    fixtureSafe: false,
    run: async () => {
      const { collectStaleAgents } = await import("./agents.mjs")
      return (await collectStaleAgents()).map((file) => ({
        code: "stale-agents",
        message: `${file} generated inventory section is stale; run npm run agents:generate`,
      }))
    },
  },
  {
    id: "skill-integrity",
    fixtureSafe: false,
    run: async () => {
      const { collectSkillViolations } = await import("./skills.mjs")
      return collectSkillViolations().map((message) => ({ code: "invalid-skill", message }))
    },
  },
  {
    id: "workspace-membership",
    fixtureSafe: false,
    run: () => {
      const rootManifest = readJson(resolve(repoRoot, "package.json"))
      if (!Array.isArray(rootManifest.workspaces) || !rootManifest.workspaces.includes("packages/*")) {
        return [{ code: "workspace-drift", message: "root package.json no longer declares the packages/* workspace" }]
      }
      return []
    },
  },
  {
    id: "decision-records",
    fixtureSafe: true,
    run: ({ root }) => {
      /* Two tracks minting the same decision number is only visible as two
       * files sharing a prefix, and nothing else in the repo looks. It has
       * happened three times now (0040–0043 on the prototype track, then
       * 0053/0054 twice in one week), each found by hand during a merge.
       * Ported from the prototype's check-drift-register.mjs so main finds
       * the collision before a reader does. */
      const dir = resolve(root, "docs/decisions")
      if (!existsSync(dir)) return []
      const violations = []
      const byNumber = new Map()
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
        const match = /^(\d{4})-/.exec(file)
        if (!match) {
          violations.push({ code: "unnumbered-decision", message: `decision file is not NNNN-slug numbered: ${file}` })
          continue
        }
        byNumber.set(match[1], [...(byNumber.get(match[1]) ?? []), file])
      }
      for (const [number, files] of byNumber) {
        if (files.length > 1) {
          violations.push({ code: "duplicate-decision-number", message: `decision ${number} exists ${files.length} times: ${files.join(", ")}` })
          continue
        }
        /* A heading that disagrees with its filename sends a reader to the
           wrong record, which is how a renumber half-lands. */
        const heading = readFileSync(resolve(dir, files[0]), "utf8").split(/\r?\n/)[0]
        if (!heading.startsWith(`# ${number} `)) {
          violations.push({ code: "decision-heading-mismatch", message: `${files[0]} opens with "${heading.slice(0, 40)}", not # ${number}` })
        }
      }
      return violations
    },
  },
]

/** Report actionable design-system health violations; nonzero when any exist. */
export async function doctor(argv) {
  const { flags } = parseFlags(argv)
  const fixture = flags.fixture ? resolve(repoRoot, flags.fixture) : undefined
  const root = fixture ?? repoRoot
  const entitiesFile = fixture ? resolve(fixture, "entities.ts") : catalogEntitiesFile
  const { entities } = parseCatalogFile(entitiesFile)

  const selected = doctorChecks.filter((check) => (fixture ? check.fixtureSafe : true))
  const violations = []
  for (const check of selected) {
    for (const violation of await check.run({ entities, root, fixture: Boolean(fixture) })) {
      violations.push({ check: check.id, ...violation })
    }
  }

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`DS-DOCTOR ${violation.code}: ${violation.message}`)
    }
    console.error(`DS-DOCTOR-FAILED: ${violations.length} violations across ${selected.length} checks`)
    process.exitCode = 1
    return
  }
  console.log(`DS-DOCTOR-OK: ${selected.length} checks, 0 violations`)
}
