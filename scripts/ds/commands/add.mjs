import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { relative, resolve } from "node:path"
import { entityKinds, packageOwners } from "../../../packages/catalog/src/taxonomy.ts"
import { parseFlags, requireFlags } from "../lib/args.mjs"
import { catalogEntitiesFile, fail, repoRoot } from "../lib/context.mjs"
import { parseCatalogFile, writeCatalogFile } from "../lib/catalog-file.mjs"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toSlug(name) {
  return name
    .trim()
    .replaceAll(/[^a-zA-Z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .toLowerCase()
}

function toCamel(slug) {
  return slug.replaceAll(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
}

function docsSkeleton(name, slug, kind) {
  return `import { parseComponentDoc, type ComponentDoc } from "./schema.ts"

/** ${name} — component doc entity; parity-verified against source. */
export const ${toCamel(slug)}Doc: ComponentDoc = parseComponentDoc({
  id: "${slug}",
  name: "${name}",
  slug: "${slug}",
  summary: "TODO: describe ${name} — what it is, when to reach for it, and what to use instead.",
  status: "experimental",
  sourceFiles: [],
  metadata: { owner: "ds", kind: "${kind}" },
  docs: [],
})
`
}

/**
 * Scaffold a new catalog entity plus optional docs skeleton. Never overwrites:
 * an existing entity id or docs file refuses the whole operation before any
 * write happens.
 */
export async function add(argv) {
  const { flags } = parseFlags(argv)
  if (!requireFlags(flags, ["kind", "name"], "ds:add")) return

  const kind = flags.kind
  const name = flags.name
  const slug = flags.slug ?? toSlug(name)
  const packageOwner = flags.package ?? (kind === "component" ? "@kernel/ui" : "kernel-portal")
  const catalogFile = resolve(repoRoot, flags["catalog-file"] ?? catalogEntitiesFile)
  const docsDir = flags["docs-dir"] ? resolve(repoRoot, flags["docs-dir"]) : undefined

  if (!entityKinds.includes(kind)) {
    return fail("DS-ADD-REFUSED", `unknown kind "${kind}"; expected one of ${entityKinds.join(", ")}`)
  }
  if (!packageOwners.includes(packageOwner)) {
    return fail("DS-ADD-REFUSED", `unknown package "${packageOwner}"; expected one of ${packageOwners.join(", ")}`)
  }
  if (!slugPattern.test(slug)) {
    return fail("DS-ADD-REFUSED", `invalid slug "${slug}"; expected lowercase kebab-case`)
  }

  const id = `${kind}.${slug}`
  const parsed = parseCatalogFile(catalogFile)
  if (parsed.entities.some((entity) => entity.id === id)) {
    return fail("DS-ADD-REFUSED", `catalog entity ${id} already exists; refusing to overwrite`)
  }

  const docsFile = docsDir ? resolve(docsDir, `${slug}.ts`) : undefined
  if (docsFile && existsSync(docsFile)) {
    return fail("DS-ADD-REFUSED", `docs file ${relative(repoRoot, docsFile)} already exists; refusing to overwrite`)
  }

  const entity = {
    id,
    name,
    kind,
    maturity: "experimental",
    accessibility: "pending",
    package: packageOwner,
    tags: [kind, "experimental"],
    capabilities: [],
    relationships: [],
    documentation: {
      slug,
      ...(docsFile ? { sourceFile: relative(repoRoot, docsFile).replaceAll("\\", "/") } : {}),
      portalAnchor: flags.anchor ?? (kind === "component" ? `c-${slug}` : `${kind}-${slug}`),
    },
    ai: {
      bundleCategory: kind === "component" ? "general" : "design",
      guidanceSource: "component-docs",
    },
    sourceFiles: [],
  }

  parsed.entities.push(entity)
  writeCatalogFile(parsed)
  if (docsFile) {
    mkdirSync(docsDir, { recursive: true })
    writeFileSync(docsFile, docsSkeleton(name, slug, kind))
  }

  console.log(`DS-ADD-OK: registered ${id}${docsFile ? ` and scaffolded ${relative(repoRoot, docsFile).replaceAll("\\", "/")}` : ""}`)
  console.log("DS-ADD-NEXT: fill in docs blocks, add sourceFiles, then run npm run ds:generate and npm run ds:doctor")
}
