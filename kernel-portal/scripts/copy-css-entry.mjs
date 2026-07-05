/**
 * design-sync helper: the Vite app build emits a hashed stylesheet
 * (dist/assets/index-*.css) containing the compiled Tailwind utilities and
 * the full Kernel token sheet. Copy it to a stable path for cfg.cssEntry.
 */
import { readdirSync, copyFileSync } from "node:fs"
import { join } from "node:path"

const assets = join(import.meta.dirname, "..", "dist", "assets")
const css = readdirSync(assets).filter((f) => f.endsWith(".css"))
if (css.length !== 1) {
  console.error(`expected exactly one css asset, found: ${css.join(", ")}`)
  process.exit(1)
}
copyFileSync(join(assets, css[0]), join(assets, "..", "kernel.css"))
console.log(`dist/kernel.css ← dist/assets/${css[0]}`)
