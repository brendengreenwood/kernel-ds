import { copyFile, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const sourceIndex = await readFile(resolve(packageDir, "src/index.ts"), "utf8")
const declarationIndex = sourceIndex
  .replace(/^\/\/.*\n/, "// Generated declaration entry. Do not edit.\n")
  .replaceAll('../../../kernel-portal/src/', './types/')
await writeFile(resolve(packageDir, "dist/index.d.ts"), declarationIndex)
await writeFile(resolve(packageDir, "dist/marks.d.ts"), 'export * from "./types/components/ui/marks/index"\n')
await writeFile(resolve(packageDir, "dist/icon.d.ts"), 'export * from "./types/components/ui/icon"\n')
await writeFile(resolve(packageDir, "dist/utils.d.ts"), 'export * from "./types/lib/utils"\n')
await copyFile(resolve(packageDir, "../../kernel-portal/src/index.css"), resolve(packageDir, "dist/styles.css"))
