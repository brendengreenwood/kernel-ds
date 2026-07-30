#!/usr/bin/env node
/**
 * Kernel DS lifecycle CLI — AUTHOR → GENERATE → VERIFY → RELEASE → PROPAGATE.
 * Every subcommand is noninteractive and flag-driven so agents and CI can run
 * them deterministically. Root scripts map ds:<name> onto these subcommands.
 */
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

if (!process.execArgv.includes("--experimental-strip-types")) {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--disable-warning=ExperimentalWarning", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: "inherit" },
  )
  process.exit(result.status ?? 1)
}

const commands = {
  add: () => import("./commands/add.mjs").then((module) => module.add),
  tag: () => import("./commands/tag.mjs").then((module) => module.tag),
  relate: () => import("./commands/relate.mjs").then((module) => module.relate),
  generate: () => import("./commands/generate.mjs").then((module) => module.generate),
  verify: () => import("./commands/verify.mjs").then((module) => module.verify),
  doctor: () => import("./commands/doctor.mjs").then((module) => module.doctor),
  changeset: () => import("./commands/changeset.mjs").then((module) => module.changeset),
  pack: () => import("./commands/pack.mjs").then((module) => module.pack),
}

const [name, ...args] = process.argv.slice(2)
const load = commands[name]
if (!load) {
  console.error(`DS-USAGE: unknown command "${name ?? ""}". Commands: ${Object.keys(commands).join(", ")}`)
  process.exit(1)
}

const command = await load()
await command(args)
