import { copyFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
await copyFile(resolve(packageDir, "src/styles.css"), resolve(packageDir, "dist/styles.css"))
