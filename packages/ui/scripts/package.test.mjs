import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { assertExplicitExports, assertNoPrivateSource, assertReactPeerOnly } from "./package-contract.mjs"

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")

test("publishes an explicit export map", async () => {
  const manifest = JSON.parse(await readFile(resolve(packageDir, "package.json"), "utf8"))
  assert.doesNotThrow(() => assertExplicitExports(manifest.exports))
  assert.throws(() => assertExplicitExports({ "./*": "./dist/*.js" }), /Wildcard package export/)
})

test("rejects private source and duplicate React fixtures", () => {
  assert.throws(() => assertNoPrivateSource("// ../../kernel-portal/src/lib/utils.ts"), /Private source/)
  assert.throws(() => assertReactPeerOnly({ dependencies: { react: "19.2.7" }, peerDependencies: { react: "^19", "react-dom": "^19" } }), /peer-only/)
})

test("generates a catalog-backed API inventory", async () => {
  const api = JSON.parse(await readFile(resolve(packageDir, "api.json"), "utf8"))
  assert.ok(api.modules.length >= 60)
  assert.ok(api.modules.filter(({ catalogBacked }) => catalogBacked).length >= 55)
  assert.equal(new Set(api.modules.map(({ module }) => module)).size, api.modules.length)
})

test("resolves one peer React in a clean fixture", { timeout: 120_000 }, async () => {
  const temp = await mkdtemp(resolve(tmpdir(), "kernel-ui-peer-"))
  try {
    const npmCli = process.env.npm_execpath
    assert.ok(npmCli)
    const pack = JSON.parse(execFileSync(process.execPath, [npmCli, "pack", "--json"], { cwd: packageDir, encoding: "utf8" }))
    const tarball = resolve(packageDir, pack[0].filename).replaceAll("\\", "/")
    await writeFile(resolve(temp, "package.json"), JSON.stringify({ private: true, dependencies: { "@kernel/ui": `file:${tarball}`, react: "19.2.7", "react-dom": "19.2.7" } }))
    execFileSync(process.execPath, [npmCli, "install", "--ignore-scripts"], { cwd: temp, stdio: "pipe" })
    const tree = JSON.parse(execFileSync(process.execPath, [npmCli, "ls", "react", "--json"], { cwd: temp, encoding: "utf8" }))
    const versions = new Set()
    const visit = (node) => {
      if (node.dependencies?.react?.version) versions.add(node.dependencies.react.version)
      for (const dependency of Object.values(node.dependencies ?? {})) visit(dependency)
    }
    visit(tree)
    assert.deepEqual([...versions], ["19.2.7"])
    await rm(resolve(packageDir, pack[0].filename), { force: true })
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
})
