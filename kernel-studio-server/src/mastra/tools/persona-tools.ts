import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  getAllEntities, getAllTensions, getAllTools,
  getQuotesByPersona,
  listTranscripts,
  getPersona,
  getPersonaTree,
  getPersonaLineage,
  getPersonaChildren,
  getAllPersonas,
  upsertPersona,
  addParticipantToPersona,
  type PersonaRow,
} from '../storage/index.js';

// ─── Get Persona Tree ──────────────────────────────────────────────

export const getPersonaTreeTool = createTool({
  id: 'get-persona-tree',
  description: 'Get the full persona taxonomy as a tree. Shows all root personas and their variants/sub-personas. Use this to understand what persona types are known and where gaps exist.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    tree: z.array(z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().nullable(),
      childCount: z.number(),
      children: z.array(z.object({
        id: z.string(),
        label: z.string(),
        description: z.string().nullable(),
        marketContext: z.record(z.string(), z.unknown()).nullable(),
        motivations: z.array(z.string()).nullable(),
        participantCount: z.number(),
      })),
    })),
    totalPersonas: z.number(),
  }),
  execute: async () => {
    const tree = await getPersonaTree();
    return {
      tree: tree.map(root => ({
        id: root.id,
        label: root.label,
        description: root.description,
        childCount: root.children.length,
        children: root.children.map(child => ({
          id: child.id,
          label: child.label,
          description: child.description,
          marketContext: child.marketContext,
          motivations: child.motivations,
          participantCount: child.participantIds?.length || 0,
        })),
      })),
      totalPersonas: tree.reduce((sum, root) => sum + 1 + root.children.length, 0),
    };
  },
});

// ─── Create Persona Variant ────────────────────────────────────────

export const createPersonaVariantTool = createTool({
  id: 'create-persona-variant',
  description: 'Create a new persona variant when you discover a distinct context, market type, or operating pattern within an existing persona. For example, a "crush-plant merchant" vs a "competitive-market merchant" — same base role but fundamentally different constraints and motivations.',
  inputSchema: z.object({
    id: z.string()
      .describe('Unique ID for this variant. Use parent:context format, e.g. "merchant:crush-plant"'),
    label: z.string()
      .describe('Human-readable label, e.g. "Crush Plant Merchant"'),
    parentId: z.string()
      .describe('The parent persona ID this is a variant of, e.g. "merchant"'),
    description: z.string()
      .describe('What makes this variant distinct from the parent and other variants'),
    marketContext: z.record(z.string(), z.unknown()).optional()
      .describe('Market characteristics: competitive landscape, margins, volume patterns, regulatory context'),
    motivations: z.array(z.string()).optional()
      .describe('What drives this persona variant — primary goals and concerns'),
    mentalModels: z.record(z.string(), z.unknown()).optional()
      .describe('How this variant thinks about the domain — key frameworks and mental shortcuts'),
    evidence: z.string().optional()
      .describe('What transcript or observation led to discovering this variant'),
  }),
  outputSchema: z.object({
    created: z.boolean(),
    persona: z.object({
      id: z.string(),
      label: z.string(),
      parentId: z.string(),
    }),
    lineage: z.array(z.string()),
    siblingCount: z.number(),
  }),
  execute: async ({ id, label, parentId, description, marketContext, motivations, mentalModels, evidence }) => {
    // Verify parent exists
    const parent = await getPersona(parentId);
    if (!parent) throw new Error(`Parent persona "${parentId}" not found. Use get-persona-tree to see available personas.`);

    const attrs: Record<string, unknown> = {};
    if (evidence) attrs.discoveryEvidence = evidence;

    await upsertPersona({
      id,
      label,
      parentId,
      description,
      marketContext: marketContext || null,
      motivations: motivations || null,
      mentalModels: mentalModels || null,
      attributes: Object.keys(attrs).length > 0 ? attrs : null,
      participantIds: null,
    });

    const lineage = await getPersonaLineage(id);
    const siblings = await getPersonaChildren(parentId);

    return {
      created: true,
      persona: { id, label, parentId },
      lineage: lineage.map(p => p.label),
      siblingCount: siblings.length,
    };
  },
});

// ─── Update Persona Attributes ─────────────────────────────────────

export const updatePersonaAttributesTool = createTool({
  id: 'update-persona-attributes',
  description: 'Update a persona\'s attributes as you learn more. Can update description, market context, motivations, mental models, or free-form attributes. Merges with existing data.',
  inputSchema: z.object({
    personaId: z.string().describe('The persona ID to update'),
    description: z.string().optional().describe('Updated description'),
    marketContext: z.record(z.string(), z.unknown()).optional().describe('Market context to merge'),
    motivations: z.array(z.string()).optional().describe('Motivations to add (appended to existing)'),
    mentalModels: z.record(z.string(), z.unknown()).optional().describe('Mental models to merge'),
    attributes: z.record(z.string(), z.unknown()).optional().describe('Free-form attributes to merge'),
  }),
  outputSchema: z.object({
    updated: z.boolean(),
    personaId: z.string(),
    label: z.string(),
  }),
  execute: async ({ personaId, description, marketContext, motivations, mentalModels, attributes }) => {
    const persona = await getPersona(personaId);
    if (!persona) throw new Error(`Persona "${personaId}" not found`);

    if (description) persona.description = description;
    if (marketContext) persona.marketContext = { ...(persona.marketContext || {}), ...marketContext };
    if (motivations) {
      const existing = persona.motivations || [];
      const newOnes = motivations.filter(m => !existing.includes(m));
      persona.motivations = [...existing, ...newOnes];
    }
    if (mentalModels) persona.mentalModels = { ...(persona.mentalModels || {}), ...mentalModels };
    if (attributes) persona.attributes = { ...(persona.attributes || {}), ...attributes };

    await upsertPersona(persona);

    return { updated: true, personaId, label: persona.label };
  },
});

// ─── Classify Participant ──────────────────────────────────────────

export const classifyParticipantTool = createTool({
  id: 'classify-participant',
  description: 'Map a specific research participant to their most specific persona variant. If no existing variant fits, note what makes them different — this is a signal to create a new variant.',
  inputSchema: z.object({
    participantId: z.string().describe('Unique identifier for the participant'),
    personaId: z.string().describe('The persona (or variant) to assign them to'),
    confidence: z.number().min(0).max(1).describe('How confident are you in this classification (0-1)'),
    notes: z.string().optional().describe('Why this classification, or what makes them distinctive'),
    suggestNewVariant: z.boolean().optional().describe('Set true if this participant doesn\'t quite fit any existing variant'),
  }),
  outputSchema: z.object({
    classified: z.boolean(),
    participantId: z.string(),
    personaId: z.string(),
    personaLabel: z.string(),
    lineage: z.array(z.string()),
  }),
  execute: async ({ participantId, personaId, confidence, notes, suggestNewVariant }) => {
    const persona = await getPersona(personaId);
    if (!persona) throw new Error(`Persona "${personaId}" not found`);

    await addParticipantToPersona(personaId, participantId);

    // Store classification metadata in attributes
    if (notes || confidence < 1 || suggestNewVariant) {
      const attrs = persona.attributes || {};
      const classifications = (attrs.participantClassifications as Record<string, unknown>) || {};
      classifications[participantId] = {
        confidence,
        notes: notes || null,
        suggestNewVariant: suggestNewVariant || false,
        classifiedAt: new Date().toISOString(),
      };
      persona.attributes = { ...attrs, participantClassifications: classifications };
      await upsertPersona(persona);
    }

    const lineage = await getPersonaLineage(personaId);

    return {
      classified: true,
      participantId,
      personaId,
      personaLabel: persona.label,
      lineage: lineage.map(p => p.label),
    };
  },
});

// ─── Compare Persona Variants ──────────────────────────────────────

export const comparePersonaVariantsTool = createTool({
  id: 'compare-persona-variants',
  description: 'Compare two personas or persona variants to highlight what differentiates them. Useful for understanding how sub-segments within a role diverge in their context, motivations, and concerns.',
  inputSchema: z.object({
    personaA: z.string().describe('First persona ID'),
    personaB: z.string().describe('Second persona ID'),
  }),
  outputSchema: z.object({
    comparison: z.object({
      personaA: z.object({ id: z.string(), label: z.string(), lineage: z.array(z.string()) }),
      personaB: z.object({ id: z.string(), label: z.string(), lineage: z.array(z.string()) }),
      sharedAncestor: z.string().nullable(),
      aDescription: z.string().nullable(),
      bDescription: z.string().nullable(),
      motivationOverlap: z.array(z.string()),
      motivationOnlyA: z.array(z.string()),
      motivationOnlyB: z.array(z.string()),
      entityPerspectiveDiffs: z.array(z.object({
        entityName: z.string(),
        aConcern: z.string().optional(),
        bConcern: z.string().optional(),
      })),
      tensionDiff: z.object({
        shared: z.number(),
        onlyA: z.number(),
        onlyB: z.number(),
      }),
    }),
  }),
  execute: async ({ personaA, personaB }) => {
    const [a, b] = await Promise.all([getPersona(personaA), getPersona(personaB)]);
    if (!a) throw new Error(`Persona "${personaA}" not found`);
    if (!b) throw new Error(`Persona "${personaB}" not found`);

    const [lineageA, lineageB] = await Promise.all([
      getPersonaLineage(personaA),
      getPersonaLineage(personaB),
    ]);

    // Find shared ancestor
    const idsA = new Set(lineageA.map(p => p.id));
    let sharedAncestor: string | null = null;
    for (const p of lineageB) {
      if (idsA.has(p.id) && p.id !== personaA && p.id !== personaB) {
        sharedAncestor = p.label;
      }
    }
    // Direct parent-child counts too
    if (a.parentId === personaB) sharedAncestor = b.label;
    if (b.parentId === personaA) sharedAncestor = a.label;

    // Motivation comparison
    const moA = new Set(a.motivations || []);
    const moB = new Set(b.motivations || []);
    const motivationOverlap = [...moA].filter(m => moB.has(m));
    const motivationOnlyA = [...moA].filter(m => !moB.has(m));
    const motivationOnlyB = [...moB].filter(m => !moA.has(m));

    // Entity perspective diffs
    const entities = await getAllEntities();
    const entityDiffs = entities
      .filter(e => {
        const persp = e.perspectives || {};
        return personaA in persp || personaB in persp;
      })
      .map(e => ({
        entityName: e.name,
        aConcern: e.perspectives?.[personaA]?.primaryConcern,
        bConcern: e.perspectives?.[personaB]?.primaryConcern,
      }))
      .filter(d => d.aConcern !== d.bConcern);

    // Tension comparison
    const tensions = await getAllTensions();
    const tensionsA = tensions.filter(t => t.roles?.includes(personaA));
    const tensionsB = tensions.filter(t => t.roles?.includes(personaB));
    const tensionIdsA = new Set(tensionsA.map(t => t.id));
    const tensionIdsB = new Set(tensionsB.map(t => t.id));
    const sharedTensions = [...tensionIdsA].filter(id => tensionIdsB.has(id));

    return {
      comparison: {
        personaA: { id: a.id, label: a.label, lineage: lineageA.map(p => p.label) },
        personaB: { id: b.id, label: b.label, lineage: lineageB.map(p => p.label) },
        sharedAncestor,
        aDescription: a.description,
        bDescription: b.description,
        motivationOverlap,
        motivationOnlyA,
        motivationOnlyB,
        entityPerspectiveDiffs: entityDiffs,
        tensionDiff: {
          shared: sharedTensions.length,
          onlyA: tensionsA.length - sharedTensions.length,
          onlyB: tensionsB.length - sharedTensions.length,
        },
      },
    };
  },
});

// ─── Generate Persona Profile (updated to support dynamic personas) ─

export const generatePersonaProfileTool = createTool({
  id: 'generate-persona-profile',
  description: 'Generate a comprehensive persona profile document synthesizing all research data for a specific role — entities, tensions, tool usage, quotes, perspectives, and variant information.',
  inputSchema: z.object({
    persona: z.string()
      .describe('The persona ID to generate a profile for (use get-persona-tree to see available IDs)'),
  }),
  outputSchema: z.object({
    persona: z.string(),
    label: z.string(),
    lineage: z.array(z.string()),
    variantCount: z.number(),
    profile: z.object({
      description: z.string().nullable(),
      motivations: z.array(z.string()),
      marketContext: z.record(z.string(), z.unknown()).nullable(),
      mentalModels: z.record(z.string(), z.unknown()).nullable(),
      overview: z.object({
        totalEntitiesReferenced: z.number(),
        totalTensionsFacing: z.number(),
        totalToolsUsed: z.number(),
        totalQuotes: z.number(),
        transcriptsAnalyzed: z.number(),
        participantsMapped: z.number(),
      }),
      coreEntities: z.array(z.object({
        name: z.string(),
        type: z.string(),
        primaryConcern: z.string().optional(),
        painPoints: z.array(z.string()),
        terminology: z.array(z.string()),
      })),
      tensions: z.array(z.object({
        description: z.string(),
        tensionType: z.string(),
        implications: z.array(z.string()),
      })),
      toolEcosystem: z.array(z.object({
        name: z.string(),
        category: z.string(),
        frequency: z.string().optional(),
        proficiency: z.string().optional(),
        sentiment: z.string().optional(),
        painPoints: z.array(z.string()),
        workarounds: z.array(z.string()),
      })),
      topQuotes: z.array(z.object({
        text: z.string(),
        topic: z.string().optional(),
        sentiment: z.string().optional(),
      })),
      dayInTheLife: z.string(),
    }),
  }),
  execute: async ({ persona: personaId }) => {
    const personaRecord = await getPersona(personaId);
    const label = personaRecord?.label || personaId;

    // Collect persona IDs to search: this persona + all its variants
    const searchIds = [personaId];
    const children = await getPersonaChildren(personaId);
    for (const child of children) {
      searchIds.push(child.id);
    }

    const lineage = await getPersonaLineage(personaId);

    // Gather data across all IDs in this persona's subtree
    const [entities, tensions, tools, allQuotes, allTranscripts] = await Promise.all([
      getAllEntities(),
      getAllTensions(),
      getAllTools(),
      Promise.all(searchIds.map(id => getQuotesByPersona(id))).then(arrs => arrs.flat()),
      Promise.all(searchIds.map(id => listTranscripts(id))).then(arrs => arrs.flat()),
    ]);

    // Filter entities that have perspectives for any of the search IDs
    const relevantEntities = entities.filter(e =>
      e.perspectives && searchIds.some(id => id in (e.perspectives || {}))
    );

    const coreEntities = relevantEntities.map(e => {
      // Use most specific perspective available
      const perspId = searchIds.find(id => id in (e.perspectives || {}))!;
      const perspective = e.perspectives?.[perspId];
      return {
        name: e.name,
        type: e.type,
        primaryConcern: perspective?.primaryConcern,
        painPoints: perspective?.painPoints || [],
        terminology: perspective?.terminology || [],
      };
    });

    const relevantTensions = tensions.filter(t =>
      t.roles?.some(r => searchIds.includes(r))
    );

    const tensionSummaries = relevantTensions.map(t => ({
      description: t.description,
      tensionType: t.tensionType,
      implications: t.implications ? [t.implications] : [],
    }));

    const relevantTools = tools.filter(t =>
      t.usageByPersona && searchIds.some(id => id in (t.usageByPersona || {}))
    );

    const toolEcosystem = relevantTools.map(t => {
      const usageId = searchIds.find(id => id in (t.usageByPersona || {}))!;
      const usage = t.usageByPersona?.[usageId];
      return {
        name: t.name,
        category: t.category,
        frequency: usage?.frequency,
        proficiency: usage?.proficiency,
        sentiment: usage?.sentiment,
        painPoints: usage?.painPoints || [],
        workarounds: usage?.workarounds || [],
      };
    });

    const topQuotes = allQuotes.slice(0, 10).map(q => ({
      text: q.text,
      topic: q.topic,
      sentiment: q.sentiment,
    }));

    // Day in the life
    const allPainPoints = coreEntities.flatMap(e => e.painPoints);
    const allWorkarounds = toolEcosystem.flatMap(t => t.workarounds);
    const toolNames = toolEcosystem.map(t => t.name);
    const tensionDescriptions = tensionSummaries.map(t => t.description);

    let dayInTheLife = `## A Day in the Life of a ${label}\n\n`;
    dayInTheLife += `The ${label} works across ${coreEntities.length} key domain areas`;

    if (toolNames.length > 0) {
      dayInTheLife += `, using tools like ${toolNames.slice(0, 3).join(', ')}`;
      if (toolNames.length > 3) dayInTheLife += ` and ${toolNames.length - 3} others`;
    }
    dayInTheLife += '.\n\n';

    if (personaRecord?.motivations?.length) {
      dayInTheLife += `### Key Motivations\n`;
      personaRecord.motivations.forEach(m => { dayInTheLife += `- ${m}\n`; });
      dayInTheLife += '\n';
    }

    if (allPainPoints.length > 0) {
      dayInTheLife += `### Key Frustrations\n`;
      [...new Set(allPainPoints)].slice(0, 5).forEach(p => { dayInTheLife += `- ${p}\n`; });
      dayInTheLife += '\n';
    }

    if (tensionDescriptions.length > 0) {
      dayInTheLife += `### Tensions They Navigate\n`;
      tensionDescriptions.slice(0, 3).forEach(t => { dayInTheLife += `- ${t}\n`; });
      dayInTheLife += '\n';
    }

    if (allWorkarounds.length > 0) {
      dayInTheLife += `### Workarounds They've Developed\n`;
      [...new Set(allWorkarounds)].slice(0, 5).forEach(w => { dayInTheLife += `- ${w}\n`; });
      dayInTheLife += '\n';
    }

    if (topQuotes.length > 0) {
      dayInTheLife += `### In Their Own Words\n`;
      topQuotes.slice(0, 3).forEach(q => { dayInTheLife += `> "${q.text}"\n\n`; });
    }

    return {
      persona: personaId,
      label,
      lineage: lineage.map(p => p.label),
      variantCount: children.length,
      profile: {
        description: personaRecord?.description || null,
        motivations: personaRecord?.motivations || [],
        marketContext: personaRecord?.marketContext || null,
        mentalModels: personaRecord?.mentalModels || null,
        overview: {
          totalEntitiesReferenced: relevantEntities.length,
          totalTensionsFacing: relevantTensions.length,
          totalToolsUsed: relevantTools.length,
          totalQuotes: allQuotes.length,
          transcriptsAnalyzed: allTranscripts.length,
          participantsMapped: personaRecord?.participantIds?.length || 0,
        },
        coreEntities,
        tensions: tensionSummaries,
        toolEcosystem,
        topQuotes,
        dayInTheLife,
      },
    };
  },
});
