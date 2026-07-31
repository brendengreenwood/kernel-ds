// CSS content gate: proves the built stylesheet contains @kernel/ui
// component utilities, not just portal-local ones.
//
// Tailwind v4 excludes node_modules from automatic content detection, so if
// the design-system CSS ever loses its `@source` registration the build
// still succeeds and the boot smoke still passes — but every utility used
// only by the packaged components (Sidebar data-attr variants,
// --sidebar-width, peer-data state styling) silently disappears and the
// portal ships unstyled chrome. This gate reproduces that exact failure.
//
// Usage: node scripts/check-portal-css.mjs   (after `npm run build`)
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const assetsDir = fileURLToPath(new URL("../dist/assets", import.meta.url))

// Sentinels chosen because they are emitted only when Tailwind scans the
// @kernel/ui component code (absent from the regression build, present after
// @source registration in @kernel/ui styles.css).
const sentinels = ["--sidebar-width", "group-data-", "peer-data-"]

function fail(message) {
  console.error(`PORTAL-CSS-FAILED: ${message}`)
  process.exit(1)
}

let cssFiles = []
try {
  cssFiles = readdirSync(assetsDir).filter((name) => name.endsWith(".css"))
} catch {
  fail(`could not read ${assetsDir} — run \`npm run build\` first`)
}
if (cssFiles.length === 0) fail(`no .css files in ${assetsDir} — run \`npm run build\` first`)

const css = cssFiles.map((name) => readFileSync(join(assetsDir, name), "utf8")).join("\n")
const missing = sentinels.filter((sentinel) => !css.includes(sentinel))
if (missing.length > 0) {
  fail(
    `built CSS (${cssFiles.join(", ")}) is missing @kernel/ui component utilities: ${missing.join(", ")}. ` +
      "Tailwind is not scanning the packaged components — check the @source directive in @kernel/ui styles.css.",
  )
}

console.log(
  `PORTAL-CSS-OK: ${cssFiles.join(", ")} contains all ${sentinels.length} component-utility sentinels`,
)
