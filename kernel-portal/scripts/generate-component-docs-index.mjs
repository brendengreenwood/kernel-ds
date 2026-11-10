/**
 * Generate the component-docs barrel (src/lib/component-docs/index.ts).
 *
 * The barrel used to be hand-maintained: every new `<slug>.ts` entity needed a
 * hand-written import AND a hand-written map entry, and forgetting either made
 * `getComponentDoc(slug)` silently return undefined. Now the directory is the
 * registry: every `<slug>.ts` file exporting a `*Doc` const is discovered and
 * wired automatically.
 *
 * Usage (from kernel-portal/):
 *   node scripts/generate-component-docs-index.mjs          # write if stale
 *   node scripts/generate-component-docs-index.mjs --check  # exit 1 if stale
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const docsDir = resolve(here, "../src/lib/component-docs")
const indexFile = resolve(docsDir, "index.ts")

export function buildIndexSource() {
  const files = readdirSync(docsDir)
    .filter((name) => /^[a-z0-9-]+\.ts$/.test(name))
    .filter((name) => name !== "index.ts" && name !== "schema.ts")
    .sort()

  const entries = []
  for (const file of files) {
    const text = readFileSync(resolve(docsDir, file), "utf8")
    const matches = [...text.matchAll(/export const (\w+Doc)\b/g)].map((m) => m[1])
    if (matches.length !== 1) {
      throw new Error(`${file}: expected exactly one exported *Doc const, found ${matches.length}`)
    }
    entries.push({ file, exportName: matches[0] })
  }

  const header = `/**
 * Component-docs barrel — the single registry of component doc entities.
 *
 * GENERATED from the \`<slug>.ts\` files in this directory by
 * \`kernel-portal/scripts/generate-component-docs-index.mjs\`; never hand-edit.
 * Authoring a doc entity is just adding the \`<slug>.ts\` file (exporting one
 * \`*Doc\` const) and regenerating. The parity gate
 * (\`scripts/check-component-docs.mjs\`) fails when this file is stale.
 */`

  const imports = entries
    .map((e) => `import { ${e.exportName} } from "./${e.file}"`)
    .join("\n")
  const map = entries.map((e) => `  [${e.exportName}.slug]: ${e.exportName},`).join("\n")

  return `${header}
import type { ComponentDoc } from "./schema.ts"
${imports}

export const componentDocs: Record<string, ComponentDoc> = {
${map}
}

/** Look up a component doc by its gallery slug. Returns undefined if absent. */
export function getComponentDoc(slug: string): ComponentDoc | undefined {
  return componentDocs[slug]
}

export type { ComponentDoc } from "./schema.ts"
`
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  const expected = buildIndexSource()
  const actual = readFileSync(indexFile, "utf8").replaceAll("\r\n", "\n")
  if (actual === expected) {
    console.log("COMPONENT-DOCS-INDEX-OK: barrel is current")
  } else if (process.argv.includes("--check")) {
    console.error("COMPONENT-DOCS-INDEX-STALE: regenerate with node scripts/generate-component-docs-index.mjs")
    process.exit(1)
  } else {
    writeFileSync(indexFile, expected)
    console.log("COMPONENT-DOCS-INDEX-OK: regenerated src/lib/component-docs/index.ts")
  }
}
