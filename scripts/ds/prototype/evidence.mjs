import { existsSync, readFileSync } from "node:fs"
import { dirname, posix, resolve } from "node:path"
import { spawnSync } from "node:child_process"

const SHA = /^[a-f0-9]{40}$/

function git(root, args) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true })
}

function committedFile(root, commit, path) {
  const result = git(root, ["show", `${commit}:${path.replaceAll("\\", "/")}`])
  return result.status === 0 ? result.stdout : null
}

function commitExists(root, commit) {
  return git(root, ["cat-file", "-e", `${commit}^{commit}`]).status === 0
}

function parseJson(text) {
  try { return JSON.parse(text) } catch { return null }
}

function packageRoot(sourcePath) {
  const parts = sourcePath.replaceAll("\\", "/").split("/")
  return parts.length >= 2 && parts[0] === "packages" ? `${parts[0]}/${parts[1]}` : null
}

function sourceExportsSymbol(source, symbol) {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(?:export\\s+(?:const|let|var|function|class|type|interface|enum)\\s+${escaped}\\b|export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\})`, "m").test(source)
}

function exportedThroughEntry(root, commit, sourcePath, symbol) {
  const packageDir = packageRoot(sourcePath)
  if (!packageDir) return false
  const packageJson = parseJson(committedFile(root, commit, `${packageDir}/package.json`))
  if (!packageJson?.exports) return false
  const entryCandidates = new Set([`${packageDir}/src/index.ts`])
  for (const [key, value] of Object.entries(packageJson.exports)) {
    if (key === "./package.json" || key.endsWith(".json") || key.endsWith(".css")) continue
    const target = typeof value === "string" ? value : value?.import ?? value?.types
    if (!target) continue
    const sourceName = target.replace(/^\.\/dist\//, "").replace(/\.d\.ts$|\.js$/, ".ts")
    entryCandidates.add(posix.join(packageDir, "src", sourceName))
  }
  for (const entry of entryCandidates) {
    const text = committedFile(root, commit, entry)
    if (!text) continue
    if (sourceExportsSymbol(text, symbol)) return true
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const exportMatch = text.match(new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}\\s*from\\s*["'](.+?)["']`))
    const starMatches = [...text.matchAll(/export\s*\*\s*from\s*["'](.+?)["']/g)]
    const candidates = exportMatch ? [exportMatch[1]] : starMatches.map((match) => match[1])
    for (const relative of candidates) {
      const referenced = posix.normalize(posix.join(posix.dirname(entry), relative.endsWith(".ts") ? relative : `${relative}.ts`))
      if (referenced === sourcePath.replaceAll("\\", "/") && sourceExportsSymbol(committedFile(root, commit, referenced) ?? "", symbol)) return true
    }
  }
  return false
}

function parseAcceptance(text, type) {
  if (type === "pr-review-snapshot") return parseJson(text)
  const fields = {}
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^[-*]?\s*([A-Za-z][A-Za-z ]+):\s*(.+)$/)
    if (match) fields[match[1].trim().toLowerCase().replaceAll(" ", "")] = match[2].trim()
  }
  fields.text = text
  return fields
}

export function verifyPromotionEvidence({ root, entities, initiative, concern, acceptance, canonical, requireLiveAcceptance = false }) {
  const unavailable = []
  for (const commit of [acceptance.commit, canonical.commit]) {
    if (!SHA.test(commit ?? "") || !commitExists(root, commit)) unavailable.push(commit)
  }
  if (unavailable.length > 0) {
    return { ok: false, status: "unverifiable-history", issues: [`Commit history is unavailable for ${unavailable.join(", ")}; fetch retained history before promoting`] }
  }

  const issues = []
  const acceptanceText = committedFile(root, acceptance.commit, acceptance.path)
  if (!acceptanceText) issues.push(`Acceptance artifact was not committed at ${acceptance.commit}:${acceptance.path}`)
  if (requireLiveAcceptance) {
    const livePath = resolve(root, acceptance.path)
    if (!existsSync(livePath)) issues.push(`Acceptance artifact is not present at HEAD: ${acceptance.path}`)
    else {
      const liveText = readFileSync(livePath, "utf8")
      if (liveText.replace(/\r\n/g, "\n") !== acceptanceText.replace(/\r\n/g, "\n")) issues.push(`Acceptance artifact at HEAD does not match the committed acceptance at ${acceptance.commit}:${acceptance.path}`)
    }
  }
  const artifact = acceptanceText ? parseAcceptance(acceptanceText, acceptance.type) : null
  const tuple = { initiativeId: initiative.id, concern: concern.concern, scopeKey: initiative.scopeKey, target: canonical.package }
  if (acceptance.type === "conversation-record") {
    if (!artifact?.quote || !artifact?.date || !artifact?.initiativeid || !artifact?.concern || !artifact?.scopekey || !artifact?.target) issues.push("Conversation acceptance is missing exact quote, date, initiative, concern, scope key, or target")
  } else if (acceptance.type === "decision-record") {
    if (!acceptance.heading || !acceptanceText?.includes(acceptance.heading)) issues.push("Decision acceptance heading does not exist in the committed artifact")
    if (!acceptanceText?.includes(initiative.id) || !acceptanceText?.includes(concern.concern) || !acceptanceText?.includes(initiative.scopeKey) || !acceptanceText?.includes(canonical.package)) issues.push("Decision record does not explicitly authorize the promotion tuple")
  } else if (acceptance.type === "pr-review-snapshot") {
    for (const field of ["repository", "reviewId", "reviewer", "submittedCommitSha", "approvalText", "initiativeId", "concern", "scopeKey", "target", "retrievedAt", "sourceUrl"]) {
      if (!artifact?.[field]) issues.push(`PR review snapshot is missing ${field}`)
    }
  } else {
    issues.push(`Unsupported acceptance type ${acceptance.type}`)
  }
  for (const [key, value] of Object.entries(tuple)) {
    const actual = artifact?.[key] ?? artifact?.[key.toLowerCase()]
    if (actual !== value) issues.push(`Acceptance ${key} does not match ${value}`)
  }
  const approval = artifact?.quote ?? artifact?.approvalText ?? ""
  if (!approval.trim() || /^(approved|looks good|lgtm)[.!]?$/i.test(approval.trim())) issues.push("Acceptance text must be exact and tuple-specific, not generic approval")

  const source = committedFile(root, canonical.commit, canonical.sourcePath)
  if (!source) issues.push(`Canonical source did not exist at ${canonical.commit}:${canonical.sourcePath}`)
  const currentEntity = entities.find((item) => item.id === canonical.entityId)
  if (!currentEntity) issues.push(`Unknown canonical entity ${canonical.entityId}`)
  const catalogAtCommit = committedFile(root, canonical.commit, "packages/catalog/src/entities.ts")
  const historicalOwnerMatch = catalogAtCommit?.match(new RegExp(`"id"\\s*:\\s*"${canonical.entityId.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"[\\s\\S]*?"package"\\s*:\\s*"([^"]+)"`))
  const historicalOwner = historicalOwnerMatch?.[1]
  if (!historicalOwner) issues.push(`Catalog entity ${canonical.entityId} did not exist at ${canonical.commit}`)
  else if (historicalOwner !== canonical.package) issues.push(`Catalog owner ${historicalOwner} does not match ${canonical.package}`)
  if (source && canonical.locatorType === "public-export" && !exportedThroughEntry(root, canonical.commit, canonical.sourcePath, canonical.symbol)) {
    issues.push(`Symbol ${canonical.symbol} was not publicly exported from ${canonical.package} at ${canonical.commit}`)
  }
  if (source && canonical.locatorType === "contract-member" && !new RegExp(`\\b${canonical.symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(source)) {
    issues.push(`Contract member ${canonical.symbol} did not exist in ${canonical.sourcePath} at ${canonical.commit}`)
  }
  return { ok: issues.length === 0, status: issues.length === 0 ? "verified" : "invalid", issues }
}

export function acceptancePathIsLive(root, path) {
  return existsSync(resolve(root, path)) && dirname(path).replaceAll("\\", "/") === "docs/prototypes/acceptances"
}
