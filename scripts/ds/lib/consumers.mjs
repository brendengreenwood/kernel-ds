import { readFileSync } from "node:fs"
import { isAbsolute, normalize, resolve, sep } from "node:path"
import { repoRoot } from "./context.mjs"

export const consumerRegistrySchemaId = "kernel-ds/consumer-registry@1"
export const defaultRegistryFile = resolve(repoRoot, "scripts/ds/consumers.json")

/** Packages a consumer may subscribe to — the publishable set only. */
export const subscribablePackages = ["@kernel/definitions", "@kernel/ui"]

/** Verification commands must start with one of these binaries. */
export const verificationAllowlist = ["npm", "npx", "node"]

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const remotePattern = /^github:[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/

export function loadRegistry(path = defaultRegistryFile) {
  return JSON.parse(readFileSync(path, "utf8"))
}

function relativePathIssues(where, rawPath, unmanagedPaths) {
  const issues = []
  if (typeof rawPath !== "string" || !rawPath) {
    return [`${where}: localPath must be a non-empty string`]
  }
  if (isAbsolute(rawPath) || /^[A-Za-z]:/.test(rawPath)) {
    issues.push(`${where}: localPath must be repository-relative, not absolute`)
  }
  const normalized = normalize(rawPath)
  if (normalized === ".." || normalized.startsWith(`..${sep}`)) {
    issues.push(`${where}: localPath escapes the repository`)
  }
  const posix = normalized.split(sep).join("/")
  for (const unmanaged of unmanagedPaths) {
    if (posix === unmanaged || posix.startsWith(`${unmanaged}/`)) {
      issues.push(`${where}: localPath targets unmanaged path "${unmanaged}" (decision 0036)`)
    }
  }
  return issues
}

/**
 * Structural + policy validation for the managed-consumer registry.
 * Managed entries are strictly opt-in targets; the unmanaged list is a policy
 * fence (the decision-0036 fork must always be present in it) and can never be
 * referenced by a managed entry's id or paths.
 */
export function validateRegistry(registry) {
  const issues = []
  if (registry.schema !== consumerRegistrySchemaId) {
    issues.push(`unknown schema "${registry.schema}"; expected "${consumerRegistrySchemaId}"`)
  }
  if (!Array.isArray(registry.consumers) || !Array.isArray(registry.unmanaged)) {
    return [...issues, "consumers and unmanaged must both be arrays"]
  }

  const unmanagedIds = new Set()
  const unmanagedPaths = []
  for (const entry of registry.unmanaged) {
    const where = `unmanaged ${entry.id ?? "<missing id>"}`
    if (typeof entry.id !== "string" || !idPattern.test(entry.id)) issues.push(`${where}: id must be kebab-case`)
    else unmanagedIds.add(entry.id)
    if (typeof entry.path !== "string" || !entry.path) issues.push(`${where}: path is required`)
    else unmanagedPaths.push(entry.path)
    if (typeof entry.reason !== "string" || !entry.reason.trim()) issues.push(`${where}: reason is required`)
  }
  if (!unmanagedIds.has("kernel-app")) {
    issues.push('policy: the decision-0036 "kernel-app" fork must be listed as unmanaged')
  }

  const seen = new Set()
  for (const consumer of registry.consumers) {
    const where = `consumer ${consumer.id ?? "<missing id>"}`
    if (typeof consumer.id !== "string" || !idPattern.test(consumer.id)) {
      issues.push(`${where}: id must be kebab-case`)
    } else if (seen.has(consumer.id)) {
      issues.push(`${where}: duplicate consumer id`)
    } else {
      seen.add(consumer.id)
    }
    if (unmanagedIds.has(consumer.id)) {
      issues.push(`${where}: id collides with an unmanaged fork; enrolling requires an explicit user amendment`)
    }
    const local = consumer.repository === "local"
    if (!local && !remotePattern.test(consumer.repository ?? "")) {
      issues.push(`${where}: repository must be "local" or "github:owner/repo"`)
    }
    if (local) {
      issues.push(...relativePathIssues(where, consumer.localPath, unmanagedPaths))
    }
    if (!Array.isArray(consumer.packages) || consumer.packages.length === 0) {
      issues.push(`${where}: packages must be a non-empty array`)
    } else {
      for (const name of consumer.packages) {
        if (!subscribablePackages.includes(name)) {
          issues.push(`${where}: package "${name}" is not publishable (${subscribablePackages.join(", ")})`)
        }
      }
    }
    if (typeof consumer.branch?.base !== "string" || !consumer.branch.base) {
      issues.push(`${where}: branch.base is required`)
    }
    if (typeof consumer.branch?.prefix !== "string" || !consumer.branch.prefix) {
      issues.push(`${where}: branch.prefix is required`)
    }
    if (!Array.isArray(consumer.verification) || consumer.verification.length === 0) {
      issues.push(`${where}: verification commands are required`)
    } else {
      for (const command of consumer.verification) {
        const binary = String(command).trim().split(/\s+/)[0]
        if (!verificationAllowlist.includes(binary)) {
          issues.push(`${where}: verification command "${binary}" is not allowlisted (${verificationAllowlist.join(", ")})`)
        }
      }
    }
    if (typeof consumer.optIn !== "boolean") {
      issues.push(`${where}: optIn must be true or false`)
    }
  }
  return issues
}

/**
 * Resolve a consumer id against the registry. Returns { consumer } for a
 * managed entry, { unmanaged } when the id names a decision-0036 fork, and
 * {} when the id is unknown.
 */
export function resolveConsumer(registry, id) {
  const unmanaged = registry.unmanaged.find((entry) => entry.id === id)
  if (unmanaged) return { unmanaged }
  const consumer = registry.consumers.find((entry) => entry.id === id)
  if (consumer) return { consumer }
  return {}
}
