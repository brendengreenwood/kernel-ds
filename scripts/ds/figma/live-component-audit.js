async function runKernelComponentAudit(input) {
  const schema = "kernel-ds/figma-live-component-audit@1"
  const expectedFileKey = "du0qpv9XrTt4HEWdPhesUh"
  const failures = []
  const records = []
  const layouts = []
  const acceptance = []

  await figma.loadAllPagesAsync()
  const fileKey = figma.fileKey || null
  const componentsPage = figma.root.children.find((page) => page.name === "Components")
  const patternsPage = figma.root.children.find((page) => page.name === "Patterns")
  if (fileKey !== expectedFileKey) failures.push({ code: "wrong-file", expected: expectedFileKey, actual: fileKey })
  if (!componentsPage) failures.push({ code: "missing-components-page" })
  if (input.mode === "full" && !patternsPage) failures.push({ code: "missing-patterns-page" })

  const localVariables = await figma.variables.getLocalVariablesAsync()
  const variablesById = new Map(localVariables.map((variable) => [variable.id, variable]))
  const identityOf = (node) => node.getSharedPluginData("kernel.dsds", "entityId") || node.getPluginData("entityId") || null
  const walk = (node, visit) => {
    visit(node)
    if ("children" in node) for (const child of node.children) walk(child, visit)
  }
  const sectionOf = (node) => {
    let current = node.parent
    while (current && current.type !== "PAGE") {
      if (current.type === "SECTION") return current
      current = current.parent
    }
    return null
  }
  const variableBindings = (node) => {
    const ids = new Set()
    walk(node, (current) => {
      const collect = (value) => {
        if (!value) return
        if (Array.isArray(value)) for (const item of value) collect(item)
        else if (typeof value === "object") {
          if (value.type === "VARIABLE_ALIAS" && value.id) ids.add(value.id)
          for (const nested of Object.values(value)) collect(nested)
        }
      }
      collect(current.boundVariables)
      collect(current.fills)
      collect(current.strokes)
    })
    return [...ids].sort().map((id) => ({ id, name: variablesById.get(id)?.name || null }))
  }

  const propertyName = (name) => name.replace(/#[^#]+$/, "")
  const componentDefinitions = (section) => {
    const definitions = []
    walk(section, (current) => {
      if (current.type !== "COMPONENT_SET" && !(current.type === "COMPONENT" && current.parent?.type !== "COMPONENT_SET")) return
      for (const [rawName, definition] of Object.entries(current.componentPropertyDefinitions || {})) {
        definitions.push({ ownerNodeId: current.id, ownerName: current.name, name: propertyName(rawName), type: definition.type, values: definition.type === "VARIANT" ? [...definition.variantOptions].sort() : null })
      }
    })
    return definitions
  }
  const anatomySlots = (section) => {
    const slots = new Set()
    walk(section, (current) => {
      const slot = current.getSharedPluginData("kernel.dsds", "dataSlot") || current.getPluginData("dataSlot")
      if (slot) slots.add(slot)
    })
    return [...slots].sort()
  }
  const valuesEqual = (actual, expected) => JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
  const roleMatches = (role, names) => {
    if (role === "radius/control") return names.includes("radius/control")
    if (role === "radius/surface") return names.includes("radius/surface")
    if (role === "radius/floating") return names.includes("radius/floating")
    if (role === "radius/modal") return names.includes("radius/modal")
    if (role === "metric/control-height") return names.some((name) => /^control-h(?:-|$)/.test(name))
    if (role === "semantic/fill") return names.some((name) => /^semantic\//.test(name) && !/(?:border|input|ring)$/.test(name))
    if (role === "semantic/stroke") return names.some((name) => /^semantic\/(?:border|input|ring|sidebar-border)$/.test(name))
    return false
  }
  const visualFingerprint = (node) => {
    try {
      const strokes = Array.isArray(node.strokes) ? node.strokes.map((paint) => ({ type: paint.type, visible: paint.visible !== false })) : null
      const effects = Array.isArray(node.effects) ? node.effects.map((effect) => ({ type: effect.type, visible: effect.visible !== false, radius: typeof effect.radius === "number" ? effect.radius : null, offset: effect.offset || null, spread: typeof effect.spread === "number" ? effect.spread : null })) : null
      return JSON.stringify({ strokeCount: strokes ? strokes.filter((paint) => paint.visible).length : null, strokes, strokeWeight: typeof node.strokeWeight === "number" ? node.strokeWeight : null, dashPattern: Array.isArray(node.dashPattern) ? node.dashPattern : null, effects })
    } catch (error) {
      return null
    }
  }
  const accessibilityChecklist = (entityId, node, contract, expectedDesignAxes, failures, anatomyMatched) => {
    const variants = node.type === "COMPONENT_SET" ? node.children.filter((child) => child.type === "COMPONENT") : [node]
    const defaultVariant = variants.find((variant) => /(?:^|,\s*)state=default(?:,|$)/i.test(variant.name || "")) || variants[0] || null
    const focusVariant = variants.find((variant) => /(?:^|,\s*)state=focus(?:,|$)/i.test(variant.name || "")) || null
    const interactive = expectedDesignAxes.length > 0
    const expectsFocus = expectedDesignAxes.some(([, values]) => values.includes("focus"))
    let target
    if (!interactive) target = { verdict: "notApplicable", reason: "non-interactive-contract" }
    else if (defaultVariant && defaultVariant.width >= 24 && defaultVariant.height >= 24) target = { verdict: "pass", evidence: `default-variant:${defaultVariant.id}:${Math.round(defaultVariant.width)}x${Math.round(defaultVariant.height)}` }
    else {
      failures.push({ code: "target-size-below-minimum", entityId, nodeId: defaultVariant ? defaultVariant.id : node.id })
      target = { verdict: "notApplicable", reason: "target-size-below-minimum" }
    }
    const before = defaultVariant ? visualFingerprint(defaultVariant) : null
    const after = focusVariant ? visualFingerprint(focusVariant) : null
    const nonColorDiffers = before !== null && after !== null && before !== after
    let focusState
    if (!expectsFocus) focusState = { verdict: "notApplicable", reason: "no-focus-design-state" }
    else if (focusVariant && nonColorDiffers) focusState = { verdict: "pass", evidence: `focus-variant-with-non-color-indicator:${focusVariant.id}` }
    else if (focusVariant) focusState = { verdict: "notApplicable", reason: "focus-indicator-visibility-requires-deep-audit" }
    else {
      failures.push({ code: "missing-focus-variant", entityId, nodeId: node.id })
      focusState = { verdict: "notApplicable", reason: "missing-live-focus-variant" }
    }
    let nonColor
    if (!focusVariant || !defaultVariant) nonColor = { verdict: "notApplicable", reason: "no-focus-variant-for-comparison" }
    else nonColor = nonColorDiffers
      ? { verdict: "pass", evidence: "focus-variant-stroke-or-effect-differentiation-excluding-color" }
      : { verdict: "notApplicable", reason: "color-only-differentiation-requires-deep-audit" }
    return {
      nameRole: { verdict: "notApplicable", reason: entityId && node.name && anatomyMatched ? "runtime-accessible-name-and-role-not-provable" : "insufficient-static-name-role-evidence" },
      target,
      focusState,
      nonColorDifferentiation: nonColor,
      annotations: contract.notes && contract.notes.length
        ? { verdict: "pass", evidence: contract.notes.join(" ") }
        : { verdict: "notApplicable", reason: "no-runtime-only-claim-in-static-contract" },
    }
  }

  const componentNodes = []
  if (componentsPage) walk(componentsPage, (node) => {
    const entityId = identityOf(node)
    if (entityId && input.entities.includes(entityId) && (node.type === "COMPONENT" || node.type === "COMPONENT_SET")) componentNodes.push(node)
  })

  for (const entityId of input.entities) {
    const matches = componentNodes.filter((node) => identityOf(node) === entityId)
    if (matches.length !== 1) {
      failures.push({ code: matches.length ? "duplicate-identity" : "missing-identity", entityId, count: matches.length })
      continue
    }
    const node = matches[0]
    const section = sectionOf(node)
    const contract = input.contracts[entityId]
    const bindings = variableBindings(section || node)
    const bindingNames = bindings.map((binding) => binding.name).filter(Boolean)
    const legacyRadii = bindings.filter((binding) => /^radius\/(?:sm|md|lg|xl)$/.test(binding.name || ""))
    const definitions = section ? componentDefinitions(section) : []
    const liveSlots = section ? anatomySlots(section) : []
    const expectedCodeAxes = Object.entries(contract.variantAxes || {})
    const expectedDesignAxes = Object.entries(contract.designStateAxes || {})
    const expectedFigmaProperties = Object.entries(contract.figmaProperties || {})
    const variantDefinitions = definitions.filter((definition) => definition.type === "VARIANT")
    const propertyDefinitions = definitions.filter((definition) => definition.type !== "VARIANT")
    const expectedVariantNames = new Set([...expectedCodeAxes, ...expectedDesignAxes].map(([name]) => name.toLowerCase()))
    const expectedPropertyNames = new Set(expectedFigmaProperties.map(([name]) => name.toLowerCase()))
    if (!section) failures.push({ code: "missing-section-ancestry", entityId, nodeId: node.id })
    if (legacyRadii.length) failures.push({ code: "legacy-radius-binding", entityId, bindings: legacyRadii })
    for (const [axis, values] of expectedCodeAxes) {
      const live = variantDefinitions.find((definition) => definition.name.toLowerCase() === axis.toLowerCase())
      if (!live) failures.push({ code: "missing-code-variant-axis", entityId, axis })
      else if (!valuesEqual(live.values, values)) failures.push({ code: "code-variant-values-mismatch", entityId, axis, expected: values, actual: live.values, ownerNodeId: live.ownerNodeId })
    }
    for (const [axis, values] of expectedDesignAxes) {
      const live = variantDefinitions.find((definition) => definition.name.toLowerCase() === axis.toLowerCase())
      if (!live) failures.push({ code: "missing-design-state-axis", entityId, axis })
      else if (!valuesEqual(live.values, values)) failures.push({ code: "design-state-values-mismatch", entityId, axis, expected: values, actual: live.values, ownerNodeId: live.ownerNodeId })
    }
    for (const live of variantDefinitions) if (!expectedVariantNames.has(live.name.toLowerCase())) failures.push({ code: "unexpected-variant-axis", entityId, axis: live.name, ownerNodeId: live.ownerNodeId })
    for (const [name, expected] of expectedFigmaProperties) {
      const live = propertyDefinitions.find((definition) => definition.name.toLowerCase() === name.toLowerCase())
      if (!live) failures.push({ code: "missing-figma-property", entityId, property: name })
      else if (live.type !== expected.type) failures.push({ code: "figma-property-type-mismatch", entityId, property: name, expected: expected.type, actual: live.type, ownerNodeId: live.ownerNodeId })
    }
    for (const live of propertyDefinitions) if (!expectedPropertyNames.has(live.name.toLowerCase())) failures.push({ code: "unexpected-figma-property", entityId, property: live.name, ownerNodeId: live.ownerNodeId })
    const expectedSlots = [...(contract.slots || [])].sort()
    if (!valuesEqual(liveSlots, expectedSlots)) failures.push({ code: "anatomy-slots-mismatch", entityId, expected: expectedSlots, actual: liveSlots })
    const missingTokenRoles = (contract.requiredTokenRoles || []).filter((role) => !roleMatches(role, bindingNames))
    if (missingTokenRoles.length) failures.push({ code: "missing-semantic-token-role", entityId, roles: missingTokenRoles })
    records.push({
      entityId,
      fileKey,
      pageId: componentsPage?.id || null,
      nodeId: node.id,
      nodeType: node.type,
      mainComponentKey: node.key || null,
      sectionId: section?.id || null,
      sectionName: section?.name || null,
      contractHash: contract.contractHash,
      contractEvidence: {
        codeVariantAxes: Object.fromEntries(expectedCodeAxes),
        designStateAxes: Object.fromEntries(expectedDesignAxes),
        figmaProperties: Object.fromEntries(expectedFigmaProperties),
        anatomySlots: liveSlots,
        requiredTokenRoles: contract.requiredTokenRoles || [],
      },
      semanticBindings: bindings,
      accessibility: accessibilityChecklist(entityId, node, contract, expectedDesignAxes, failures, valuesEqual(liveSlots, expectedSlots)),
      auditedAt: input.auditedAt,
    })
  }

  if (input.mode === "full" && componentsPage) {
    const scopedSections = records.map((record) => componentsPage.findOne((node) => node.id === record.sectionId)).filter(Boolean)
    const allSections = componentsPage.children.filter((node) => node.type === "SECTION").sort((a, b) => a.y - b.y || a.x - b.x)
    for (const record of records) {
      const section = scopedSections.find((candidate) => candidate.id === record.sectionId)
      const index = allSections.findIndex((candidate) => candidate.id === record.sectionId)
      const predecessor = index > 0 ? allSections[index - 1] : null
      const gap = predecessor ? section.y - (predecessor.y + predecessor.height) : null
      const xVerdict = section?.x === 0
      const gapVerdict = predecessor ? gap === 160 : true
      if (!xVerdict) failures.push({ code: "section-x-drift", entityId: record.entityId, actual: section?.x })
      if (!gapVerdict) failures.push({ code: "section-gap-drift", entityId: record.entityId, actual: gap })
      layouts.push({ entityId: record.entityId, sectionNodeId: section?.id || null, bounds: section ? { x: section.x, y: section.y, width: section.width, height: section.height } : null, expectedX: 0, predecessorSectionId: predecessor?.id || null, gap, verdict: xVerdict && gapVerdict ? "pass" : "fail" })
    }

    const acceptanceSection = patternsPage?.children.find((node) => node.type === "SECTION" && node.name === "Library Acceptance — @kernel/ui") || null
    if (!acceptanceSection) failures.push({ code: "missing-acceptance-section" })
    for (const record of records) {
      const instances = []
      if (acceptanceSection) walk(acceptanceSection, (node) => {
        if (node.type !== "INSTANCE") return
        const id = node.getSharedPluginData("kernel.dsds", "entityId") || node.getPluginData("entityId")
        if (id === record.entityId) instances.push(node)
      })
      if (instances.length !== 1) {
        failures.push({ code: instances.length ? "duplicate-acceptance-instance" : "missing-acceptance-instance", entityId: record.entityId, count: instances.length })
        continue
      }
      const instance = instances[0]
      const main = await instance.getMainComponentAsync()
      const detached = !main
      if (detached) failures.push({ code: "detached-acceptance-instance", entityId: record.entityId, nodeId: instance.id })
      const mainOwner = main && main.parent && main.parent.type === "COMPONENT_SET" ? main.parent : main
      acceptance.push({ entityId: record.entityId, acceptanceInstanceNodeId: instance.id, mainComponentId: mainOwner?.id || null, mainComponentKey: mainOwner?.key || null, ownerSectionId: acceptanceSection.id, detached, contractHash: record.contractHash, verdict: detached ? "fail" : "pass" })
    }
  }

  return {
    $schema: schema,
    mode: input.mode,
    requestId: input.requestId,
    requestHash: input.requestHash,
    implementationHash: input.implementationHash,
    fileKey,
    fileName: figma.root.name,
    componentsPageId: componentsPage?.id || null,
    patternsPageId: patternsPage?.id || null,
    expected: input.entities.length,
    resolved: records.length,
    records,
    layouts,
    acceptance,
    failures,
    verdict: failures.length === 0 && records.length === input.entities.length ? "pass" : "fail",
  }
}

const __kernelAuditResult = await runKernelComponentAudit(__KERNEL_AUDIT_INPUT__)
return __kernelAuditResult
