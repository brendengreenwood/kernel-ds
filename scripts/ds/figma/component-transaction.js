const EXPECTED_FILE_KEY = "du0qpv9XrTt4HEWdPhesUh"
const INPUT = __KERNEL_TRANSACTION_INPUT__

function serial(value) {
  if (value === undefined || typeof value === "symbol") return null
  try { return JSON.parse(JSON.stringify(value)) } catch { return null }
}

function childIndex(node) {
  return node.parent && "children" in node.parent ? node.parent.children.indexOf(node) : -1
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
  }
  return value
}

function fingerprint(value) {
  const text = JSON.stringify(canonical(serial(value)))
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `${text.length}:${(hash >>> 0).toString(16).padStart(8, "0")}`
}

async function relationshipState(node) {
  const mainComponent = node.type === "INSTANCE" ? await node.getMainComponentAsync() : null
  return {
    type: node.type,
    key: "key" in node ? node.key || null : null,
    componentSetId: node.parent?.type === "COMPONENT_SET" ? node.parent.id : null,
    mainComponentId: mainComponent?.id || null,
    componentPropertiesHash: fingerprint("componentPropertyDefinitions" in node ? node.componentPropertyDefinitions : null),
    variantPropertiesHash: fingerprint(node.type === "COMPONENT" ? node.variantProperties : null),
    childIdsHash: fingerprint("children" in node ? node.children.map((child) => child.id) : []),
  }
}

function stateFor(node) {
  const state = {
    name: node.name,
    x: "x" in node ? node.x : null,
    y: "y" in node ? node.y : null,
    width: "width" in node ? node.width : null,
    height: "height" in node ? node.height : null,
    opacity: "opacity" in node ? node.opacity : null,
    parentNodeId: node.parent?.id || null,
    parentIndex: childIndex(node),
    pluginData: Object.fromEntries(node.getPluginDataKeys().map((key) => [key, node.getPluginData(key)])),
    sharedPluginData: {},
  }
  for (const namespace of ["kernel.dsds"]) {
    const values = Object.fromEntries(node.getSharedPluginDataKeys(namespace).map((key) => [key, node.getSharedPluginData(namespace, key)]))
    if (Object.keys(values).length) state.sharedPluginData[namespace] = values
  }
  for (const property of ["description", "fills", "strokes", "effects", "cornerRadius", "boundVariables"]) {
    if (property in node) state[property] = serial(node[property])
  }
  return state
}

async function preconditionsFor(node) {
  return {
    parentNodeId: node.parent?.id || null,
    parentIndex: childIndex(node),
    layoutMode: node.parent && "layoutMode" in node.parent ? node.parent.layoutMode : null,
    layoutSizingHorizontal: "layoutSizingHorizontal" in node ? node.layoutSizingHorizontal : null,
    layoutSizingVertical: "layoutSizingVertical" in node ? node.layoutSizingVertical : null,
    constraints: "constraints" in node ? serial(node.constraints) : null,
    relationships: await relationshipState(node),
  }
}

async function allInventory() {
  await figma.loadAllPagesAsync()
  const pages = figma.root.children.filter((page) => ["Components", "Patterns"].includes(page.name))
  const nodes = []
  for (const page of pages) {
    nodes.push(page)
    page.findAll(() => true).forEach((node) => nodes.push(node))
  }
  return nodes
}

function assertFile() {
  if (figma.fileKey !== EXPECTED_FILE_KEY) throw new Error(`wrong-file:${figma.fileKey || "unknown"}`)
}

async function resolveScopedNodes(entityId, expectNew) {
  const inventory = await allInventory()
  const identityNodes = inventory.filter((node) =>
    ["COMPONENT", "COMPONENT_SET"].includes(node.type) &&
    (node.getSharedPluginData("kernel.dsds", "entityId") || node.getPluginData("entityId")) === entityId)
  if (expectNew) {
    if (identityNodes.length !== 0) throw new Error(`identity-preexists:${entityId}:${identityNodes.length}`)
  } else if (identityNodes.length !== 1) throw new Error(`identity-count:${entityId}:${identityNodes.length}`)
  const scoped = new Map()
  if (!expectNew) {
    const component = identityNodes[0]
    let section = component.parent
    while (section && section.type !== "SECTION") section = section.parent
    if (!section) throw new Error(`missing-section:${entityId}`)
    const acceptance = inventory.filter((node) => node.type === "INSTANCE" && (node.getSharedPluginData("kernel.dsds", "entityId") || node.getPluginData("entityId")) === entityId)
    for (const node of [section, component, ...acceptance]) scoped.set(node.id, { node, role: "scope" })
  }
  for (const candidate of inventory) {
    if (candidate.type !== "SECTION" || scoped.has(candidate.id)) continue
    if (candidate.parent && candidate.parent.type === "PAGE" && candidate.parent.name === "Components") scoped.set(candidate.id, { node: candidate, role: "reflow" })
  }
  return { inventory, nodes: [...scoped.values()] }
}

function same(left, right) { return JSON.stringify(canonical(serial(left))) === JSON.stringify(canonical(serial(right))) }

async function assertRelationships(node, snapshotNode) {
  const current = await relationshipState(node)
  const expected = snapshotNode.preconditions.relationships
  for (const key of ["type", "key", "componentSetId", "mainComponentId", "componentPropertiesHash", "variantPropertiesHash", "childIdsHash"]) {
    if (!same(current[key], expected[key])) throw new Error(`rollback-unsafe-drift:${node.id}:${key}`)
  }
  const parent = node.parent
  if (!parent || parent.id !== snapshotNode.preconditions.parentNodeId) throw new Error(`incompatible-parent:${node.id}`)
  if (snapshotNode.preconditions.parentIndex < 0 || !("children" in parent)) throw new Error(`incompatible-parent-index:${node.id}`)
  if (("layoutMode" in parent ? parent.layoutMode : null) !== snapshotNode.preconditions.layoutMode) throw new Error(`incompatible-layout:${node.id}`)
  for (const key of ["layoutSizingHorizontal", "layoutSizingVertical", "constraints"]) {
    if (!same(key === "constraints" ? node.constraints : node[key], snapshotNode.preconditions[key])) throw new Error(`incompatible-resize:${node.id}:${key}`)
  }
}

async function restoreNode(snapshotNode) {
  const node = await figma.getNodeByIdAsync(snapshotNode.nodeId)
  if (!node || node.removed) throw new Error(`missing-preexisting-node:${snapshotNode.nodeId}`)
  await assertRelationships(node, snapshotNode)
  const state = snapshotNode.state
  if (node.parent && "insertChild" in node.parent && childIndex(node) !== state.parentIndex) node.parent.insertChild(state.parentIndex, node)
  if ("name" in state) node.name = state.name
  if ("opacity" in state && state.opacity !== null && "opacity" in node) node.opacity = state.opacity
  if (state.x !== null && "x" in node) node.x = state.x
  if (state.y !== null && "y" in node) node.y = state.y
  if (state.width !== null && state.height !== null && "resize" in node) node.resize(state.width, state.height)
  for (const key of ["fills", "strokes", "effects", "cornerRadius"]) if (key in state && key in node) node[key] = state[key]
  if ("description" in state && "description" in node) node.description = state.description || ""
  for (const key of node.getPluginDataKeys()) node.setPluginData(key, "")
  for (const [key, value] of Object.entries(state.pluginData || {})) node.setPluginData(key, value)
  for (const [namespace, values] of Object.entries(state.sharedPluginData || {})) {
    for (const key of node.getSharedPluginDataKeys(namespace)) node.setSharedPluginData(namespace, key, "")
    for (const [key, value] of Object.entries(values)) node.setSharedPluginData(namespace, key, value)
  }
}

async function capture() {
  const { inventory, nodes } = await resolveScopedNodes(INPUT.entityId, INPUT.expectNew === true)
  return {
    inventoryNodeIds: inventory.map((node) => node.id).sort(),
    nodes: await Promise.all(nodes.map(async ({ node, role }) => ({
      nodeId: node.id,
      nodeType: node.type,
      role,
      state: stateFor(node),
      preconditions: await preconditionsFor(node),
    }))),
  }
}

async function restore() {
  const current = await allInventory()
  const before = new Set(INPUT.snapshot.inventoryNodeIds)
  const delta = current.filter((node) => node.type !== "PAGE" && !before.has(node.id))
  const deltaIds = new Set(delta.map((node) => node.id))
  const reported = INPUT.reportedCreatedNodeIds || []
  for (const id of reported) if (!deltaIds.has(id)) throw new Error(`created-node-report-mismatch:${id}`)
  const reportedSet = new Set(reported)
  const scopeRoots = new Set(INPUT.snapshot.nodes.filter((snapshotNode) => (snapshotNode.role || "scope") === "scope").map((snapshotNode) => snapshotNode.nodeId))
  const owned = (node) => {
    if (reportedSet.has(node.id)) return true
    for (let parent = node.parent; parent; parent = parent.parent) if (scopeRoots.has(parent.id) || reportedSet.has(parent.id)) return true
    return false
  }
  const ownedDelta = delta.filter(owned)
  const discoveredCreatedNodeIds = ownedDelta.map((node) => node.id).sort()
  let createdNodeAgreementVerdict = "delta-discovered"
  if (reported.length) {
    const discovered = new Set(discoveredCreatedNodeIds)
    const mismatched = [...reported.filter((id) => !discovered.has(id)), ...discoveredCreatedNodeIds.filter((id) => !reportedSet.has(id))]
    if (mismatched.length) throw new Error(`created-node-agreement-mismatch:${mismatched.sort().join(",")}`)
    createdNodeAgreementVerdict = "exact-match"
  }
  const toDelete = ownedDelta.sort((a, b) => b.id.localeCompare(a.id))
  const preservedNodeIds = delta.filter((node) => !owned(node)).map((node) => node.id).sort()
  const deletedNodeIds = []
  for (const node of toDelete) {
    if (node.removed) continue
    deletedNodeIds.push(node.id)
    node.remove()
  }
  for (const snapshotNode of INPUT.snapshot.nodes) await restoreNode(snapshotNode)
  const preserved = new Set(preservedNodeIds)
  const after = await allInventory()
  const residual = after.filter((node) => node.type !== "PAGE" && !before.has(node.id) && !preserved.has(node.id)).map((node) => node.id).sort()
  if (residual.length) throw new Error(`cleanup-residual:${residual.join(",")}`)
  return { deletedNodeIds, discoveredCreatedNodeIds, reportedCreatedNodeIds: reported, createdNodeAgreementVerdict, preservedNodeIds, residualNodeIds: residual, restoredNodeIds: INPUT.snapshot.nodes.map((node) => node.nodeId) }
}

async function verify() {
  const current = await allInventory()
  const currentIds = current.map((node) => node.id).sort()
  const before = new Set(INPUT.snapshot.inventoryNodeIds)
  const deltaNodes = current.filter((node) => node.type !== "PAGE" && !before.has(node.id))
  const reported = INPUT.reportedCreatedNodeIds || []
  const reportedSet = new Set(reported)
  const owned = (node) => {
    if (reportedSet.has(node.id)) return true
    for (let parent = node.parent; parent; parent = parent.parent) if (reportedSet.has(parent.id)) return true
    return false
  }
  const createdNodeIds = deltaNodes.map((node) => node.id).sort()
  let createdNodeAgreementVerdict = "no-creations"
  if (deltaNodes.length || reported.length) {
    const discovered = new Set(createdNodeIds)
    const mismatched = [
      ...reported.filter((id) => !discovered.has(id)),
      ...deltaNodes.filter((node) => !owned(node)).map((node) => node.id),
    ]
    if (mismatched.length) throw new Error(`created-node-agreement-mismatch:${[...new Set(mismatched)].sort().join(",")}`)
    createdNodeAgreementVerdict = "exact-match"
  }
  const deletedNodeIds = INPUT.snapshot.inventoryNodeIds.filter((id) => !currentIds.includes(id))
  for (const snapshotNode of INPUT.snapshot.nodes) {
    const node = await figma.getNodeByIdAsync(snapshotNode.nodeId)
    if (!node || node.removed) throw new Error(`missing-preexisting-node:${snapshotNode.nodeId}`)
    if ((snapshotNode.role || "scope") !== "scope") continue
    await assertRelationships(node, snapshotNode)
    if (!same(stateFor(node), snapshotNode.state)) throw new Error(`state-drift:${snapshotNode.nodeId}`)
  }
  return { currentNodeIds: currentIds, createdNodeIds, deletedNodeIds, createdNodeAgreementVerdict }
}

async function smoke() {
  await figma.loadAllPagesAsync()
  let playground = figma.root.children.find((page) => page.name === "Playground")
  if (!playground) playground = figma.createPage(), playground.name = "Playground"
  let section = playground.children.find((node) => node.type === "SECTION" && node.name === "Transaction Smoke — Disposable")
  if (!section) section = figma.createSection(), section.name = "Transaction Smoke — Disposable", playground.appendChild(section)
  let node = null
  try {
    node = figma.createRectangle()
    node.name = `transaction-smoke-${INPUT.requestId}`
    node.resize(80, 40)
    section.appendChild(node)
    const original = { x: node.x, y: node.y, name: node.name }
    node.x = 24; node.y = 16; node.name = `${node.name}-mutated`
    node.x = original.x; node.y = original.y; node.name = original.name
    if (node.x !== original.x || node.y !== original.y || node.name !== original.name) throw new Error("smoke-restore-failed")
    return { createdNodeId: node.id, restored: true }
  } finally {
    const nodeId = node?.id || null
    if (node && !node.removed) node.remove()
    if (nodeId && await figma.getNodeByIdAsync(nodeId)) throw new Error(`smoke-cleanup-residual:${nodeId}`)
  }
}

assertFile()
let payload
if (INPUT.operation === "capture") payload = await capture()
else if (INPUT.operation === "restore") payload = await restore()
else if (INPUT.operation === "verify") payload = await verify()
else if (INPUT.operation === "smoke-run") payload = await smoke()
else throw new Error(`unknown-operation:${INPUT.operation}`)
return { $schema: "kernel-ds/figma-transaction-response@1", operation: INPUT.operation, requestId: INPUT.requestId, requestHash: INPUT.requestHash, implementationHash: INPUT.implementationHash, fileKey: figma.fileKey, transactionId: INPUT.transactionId, entityId: INPUT.entityId || null, verdict: "pass", payload }
