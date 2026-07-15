import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  getAllEntities,
  getAllTensions,
  getAllTools,
  getAllPocFeatures,
  getTerminology,
  getOpenQuestions,
  getFullOntology,
  type EntityRow,
  type TensionRow,
  type ToolRow,
  type PocFeatureRow,
  listPersonaIds,
} from '../storage/index.js';
import { getEvidenceForTarget } from '../storage/evidence-store.js';
import { getQuotesByPersona } from '../storage/quote-store.js';
import { listTranscripts } from '../storage/transcript-store.js';

// ─── Entity Map Brief ────────────────────────────────────────

export const generateEntityMapBriefTool = createTool({
  id: 'generate-entity-map-brief',
  description: 'Generate a curated entity map brief: top N entities ranked by connection density, grouped by type, with relationship strengths and role annotations. Filters noise entities with fewer than the minimum connections.',
  inputSchema: z.object({
    limit: z.number().optional().default(15).describe('Max entities to include'),
    groupBy: z.enum(['type', 'connections']).optional().default('type'),
    minConnections: z.number().optional().default(0),
  }),
  outputSchema: z.object({
    entities: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      connectionCount: z.number(),
      relationships: z.array(z.object({
        targetId: z.string(),
        targetName: z.string(),
        relation: z.string(),
        strength: z.number().optional(),
      })),
      perspectives: z.record(z.string(), z.object({
        primaryConcern: z.string(),
        painPoints: z.array(z.string()).optional(),
      })).optional(),
      evidenceCount: z.number(),
    })),
    groups: z.array(z.object({ type: z.string(), count: z.number() })),
    totalEntities: z.number(),
    generatedAt: z.string(),
  }),
  execute: async ({ limit, groupBy, minConnections }) => {
    const entities = await getAllEntities();
    const entityMap = new Map(entities.map(e => [e.id, e]));

    // Build connection counts and enrich
    const enriched = await Promise.all(entities.map(async (e) => {
      const rels = e.relationships || [];
      const evidence = await getEvidenceForTarget('entity', e.id);
      return {
        id: e.id,
        name: e.name,
        type: e.type,
        connectionCount: rels.length,
        relationships: rels.map(r => ({
          targetId: r.targetId,
          targetName: entityMap.get(r.targetId)?.name || r.targetId,
          relation: r.relation,
          strength: r.strength,
        })),
        perspectives: e.perspectives ? Object.fromEntries(
          Object.entries(e.perspectives).map(([role, p]) => [role, {
            primaryConcern: p.primaryConcern,
            painPoints: p.painPoints,
          }])
        ) : undefined,
        evidenceCount: evidence.length,
      };
    }));

    // Filter and sort
    const filtered = enriched
      .filter(e => e.connectionCount >= (minConnections ?? 0))
      .sort((a, b) => b.connectionCount - a.connectionCount)
      .slice(0, limit);

    // Group
    const groupCounts = new Map<string, number>();
    for (const e of filtered) {
      const key = e.type;
      groupCounts.set(key, (groupCounts.get(key) || 0) + 1);
    }

    return {
      entities: filtered,
      groups: Array.from(groupCounts.entries()).map(([type, count]) => ({ type, count })),
      totalEntities: entities.length,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Tension Map Brief ───────────────────────────────────────

export const generateTensionMapBriefTool = createTool({
  id: 'generate-tension-map-brief',
  description: 'Generate a tension map brief: active tensions with disputed entities, severity scores, evidence counts, and role mapping. Ranked by evidence strength.',
  inputSchema: z.object({
    type: z.enum(['intra-role', 'inter-role', 'system']).optional(),
    minEvidence: z.number().optional().default(0),
  }),
  outputSchema: z.object({
    tensions: z.array(z.object({
      id: z.string(),
      description: z.string(),
      tensionType: z.string(),
      roles: z.array(z.string()),
      entities: z.array(z.string()),
      status: z.string(),
      evidenceCount: z.number(),
      implications: z.string().optional(),
    })),
    totalTensions: z.number(),
    generatedAt: z.string(),
  }),
  execute: async ({ type, minEvidence }) => {
    const tensions = await getAllTensions();

    const enriched = await Promise.all(tensions.map(async (t) => {
      const evidence = await getEvidenceForTarget('tension', t.id);
      return {
        id: t.id,
        description: t.description,
        tensionType: t.tensionType,
        roles: t.roles,
        entities: t.entities,
        status: t.status,
        evidenceCount: evidence.length + (t.evidence?.length || 0),
        implications: t.implications,
      };
    }));

    let filtered = enriched.filter(t => t.evidenceCount >= (minEvidence ?? 0));
    if (type) filtered = filtered.filter(t => t.tensionType === type);
    filtered.sort((a, b) => b.evidenceCount - a.evidenceCount);

    return {
      tensions: filtered,
      totalTensions: tensions.length,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Tool Ecosystem Brief ────────────────────────────────────

export const generateToolEcosystemBriefTool = createTool({
  id: 'generate-tool-ecosystem-brief',
  description: 'Generate a tool ecosystem brief: per-persona tool usage with sentiment, pain points, integrations, and PoC replacement candidates.',
  inputSchema: z.object({
    persona: z.string().optional().describe('Filter to a specific persona'),
  }),
  outputSchema: z.object({
    tools: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      isInternal: z.boolean(),
      isPoc: z.boolean(),
      personas: z.array(z.object({
        name: z.string(),
        frequency: z.string().optional(),
        sentiment: z.string().optional(),
        painPoints: z.array(z.string()).optional(),
      })),
      integratesWith: z.array(z.string()).optional(),
      replacedBy: z.string().optional(),
    })),
    pocFeatures: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      status: z.string(),
      personasBenefited: z.array(z.string()),
    })),
    generatedAt: z.string(),
  }),
  execute: async ({ persona }) => {
    const tools = await getAllTools();
    const pocFeatures = await getAllPocFeatures();

    const toolBriefs = tools.map(t => {
      const personas = t.usageByPersona
        ? Object.entries(t.usageByPersona)
            .filter(([name]) => !persona || name === persona)
            .map(([name, usage]) => ({
              name,
              frequency: usage.frequency,
              sentiment: usage.sentiment,
              painPoints: usage.painPoints,
            }))
        : [];

      return {
        id: t.id,
        name: t.name,
        category: t.category,
        isInternal: t.isInternal,
        isPoc: t.isPoc,
        personas,
        integratesWith: t.integratesWith,
        replacedBy: t.replacedBy,
      };
    }).filter(t => !persona || t.personas.length > 0);

    const pocBriefs = pocFeatures.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      status: f.status,
      personasBenefited: f.benefitsByPersona
        ? Object.entries(f.benefitsByPersona)
            .filter(([, b]) => b.benefitLevel !== 'none')
            .map(([name]) => name)
        : [],
    }));

    return {
      tools: toolBriefs,
      pocFeatures: pocBriefs,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Persona Comparison Brief ────────────────────────────────

export const generatePersonaComparisonBriefTool = createTool({
  id: 'generate-persona-comparison-brief',
  description: 'Generate a side-by-side persona comparison brief: shared entities, terminology differences, conflicting mental models, and pain point overlap.',
  inputSchema: z.object({
    personas: z.array(z.string()).min(2).describe('Persona IDs to compare'),
  }),
  outputSchema: z.object({
    personas: z.array(z.object({
      name: z.string(),
      entityCount: z.number(),
      tensionCount: z.number(),
      topPainPoints: z.array(z.string()),
      topConcerns: z.array(z.string()),
    })),
    sharedEntities: z.array(z.object({
      entityName: z.string(),
      perspectives: z.record(z.string(), z.string()),
    })),
    conflicts: z.array(z.object({
      topic: z.string(),
      perspectives: z.record(z.string(), z.string()),
    })),
    generatedAt: z.string(),
  }),
  execute: async ({ personas }) => {
    const entities = await getAllEntities();
    const tensions = await getAllTensions();

    // Build per-persona profiles
    const profiles = personas.map(persona => {
      const relevantEntities = entities.filter(e =>
        e.perspectives && Object.keys(e.perspectives).includes(persona)
      );
      const relevantTensions = tensions.filter(t =>
        t.roles.includes(persona)
      );
      const painPoints = relevantEntities.flatMap(e =>
        e.perspectives?.[persona]?.painPoints || []
      );
      const concerns = relevantEntities
        .map(e => e.perspectives?.[persona]?.primaryConcern)
        .filter((c): c is string => !!c);

      return {
        name: persona,
        entityCount: relevantEntities.length,
        tensionCount: relevantTensions.length,
        topPainPoints: [...new Set(painPoints)].slice(0, 5),
        topConcerns: [...new Set(concerns)].slice(0, 5),
      };
    });

    // Find shared entities (entities that have perspectives from 2+ of the requested personas)
    const sharedEntities = entities
      .filter(e => {
        if (!e.perspectives) return false;
        const matchCount = personas.filter(p => p in e.perspectives!).length;
        return matchCount >= 2;
      })
      .map(e => ({
        entityName: e.name,
        perspectives: Object.fromEntries(
          personas
            .filter(p => e.perspectives?.[p])
            .map(p => [p, e.perspectives![p].primaryConcern])
        ),
      }));

    // Find conflicts (tensions that involve 2+ of the requested personas)
    const conflicts = tensions
      .filter(t => {
        const matchCount = personas.filter(p => t.roles.includes(p)).length;
        return matchCount >= 2;
      })
      .map(t => ({
        topic: t.description,
        perspectives: Object.fromEntries(
          personas.filter(p => t.roles.includes(p)).map(p => [p, 'involved'])
        ),
      }));

    return {
      personas: profiles,
      sharedEntities,
      conflicts,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Persona Profile Brief ───────────────────────────────────

export const generatePersonaProfileBriefTool = createTool({
  id: 'generate-persona-profile-brief',
  description: 'Generate a deep single-persona profile brief: core entities, tensions, tool usage, top quotes, and key pain points aggregated across all lenses.',
  inputSchema: z.object({
    persona: z.string(),
  }),
  outputSchema: z.object({
    persona: z.string(),
    coreEntities: z.array(z.object({
      name: z.string(),
      type: z.string(),
      concern: z.string(),
      painPoints: z.array(z.string()).optional(),
    })),
    tensions: z.array(z.object({
      description: z.string(),
      type: z.string(),
      status: z.string(),
    })),
    toolUsage: z.array(z.object({
      toolName: z.string(),
      frequency: z.string().optional(),
      sentiment: z.string().optional(),
      painPoints: z.array(z.string()).optional(),
    })),
    topQuotes: z.array(z.object({
      text: z.string(),
      topic: z.string().optional(),
    })),
    allPainPoints: z.array(z.string()),
    generatedAt: z.string(),
  }),
  execute: async ({ persona }) => {
    const [entities, tensions, tools, quotes] = await Promise.all([
      getAllEntities(),
      getAllTensions(),
      getAllTools(),
      getQuotesByPersona(persona),
    ]);

    const coreEntities = entities
      .filter(e => e.perspectives?.[persona])
      .map(e => ({
        name: e.name,
        type: e.type,
        concern: e.perspectives![persona].primaryConcern,
        painPoints: e.perspectives![persona].painPoints,
      }));

    const personaTensions = tensions
      .filter(t => t.roles.includes(persona))
      .map(t => ({
        description: t.description,
        type: t.tensionType,
        status: t.status,
      }));

    const toolUsage = tools
      .filter(t => t.usageByPersona?.[persona])
      .map(t => ({
        toolName: t.name,
        frequency: t.usageByPersona![persona].frequency,
        sentiment: t.usageByPersona![persona].sentiment,
        painPoints: t.usageByPersona![persona].painPoints,
      }));

    const topQuotes = quotes.slice(0, 10).map(q => ({
      text: q.text,
      topic: q.topic,
    }));

    const allPainPoints = [
      ...new Set(coreEntities.flatMap(e => e.painPoints || [])),
    ];

    return {
      persona,
      coreEntities,
      tensions: personaTensions,
      toolUsage,
      topQuotes,
      allPainPoints,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Feature Matrix Brief ────────────────────────────────────

export const generateFeatureMatrixBriefTool = createTool({
  id: 'generate-feature-matrix-brief',
  description: 'Generate a feature prioritization matrix brief: PoC features scored by personas affected × pain points solved × evidence strength.',
  inputSchema: z.object({
    sortBy: z.enum(['impact', 'evidence', 'personas']).optional().default('impact'),
  }),
  outputSchema: z.object({
    features: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      status: z.string(),
      personasAffected: z.number(),
      painPointsSolved: z.number(),
      impactScore: z.number(),
      benefitsByPersona: z.record(z.string(), z.object({
        benefitLevel: z.string(),
        solvedPainPoints: z.array(z.string()),
      })).optional(),
    })),
    generatedAt: z.string(),
  }),
  execute: async ({ sortBy }) => {
    const pocFeatures = await getAllPocFeatures();

    const scored = pocFeatures.map(f => {
      const benefits = f.benefitsByPersona || {};
      const personasAffected = Object.values(benefits).filter(b => b.benefitLevel !== 'none').length;
      const painPointsSolved = Object.values(benefits).reduce((sum, b) => sum + b.solvedPainPoints.length, 0);
      const impactScore = personasAffected * 3 + painPointsSolved;

      return {
        id: f.id,
        name: f.name,
        description: f.description,
        status: f.status,
        personasAffected,
        painPointsSolved,
        impactScore,
        benefitsByPersona: Object.fromEntries(
          Object.entries(benefits).map(([persona, b]) => [persona, {
            benefitLevel: b.benefitLevel,
            solvedPainPoints: b.solvedPainPoints,
          }])
        ),
      };
    });

    if (sortBy === 'impact') scored.sort((a, b) => b.impactScore - a.impactScore);
    else if (sortBy === 'personas') scored.sort((a, b) => b.personasAffected - a.personasAffected);
    else scored.sort((a, b) => b.painPointsSolved - a.painPointsSolved);

    return {
      features: scored,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Research Coverage Brief ─────────────────────────────────

export const generateResearchCoverageBriefTool = createTool({
  id: 'generate-research-coverage-brief',
  description: 'Generate a research coverage brief: ontology health including entity count, evidence density per topic, transcript count, coverage gaps, and terminology depth.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    entityCount: z.number(),
    tensionCount: z.number(),
    toolCount: z.number(),
    pocFeatureCount: z.number(),
    transcriptCount: z.number(),
    openQuestionCount: z.number(),
    terminologyCount: z.number(),
    entityTypeBreakdown: z.record(z.string(), z.number()),
    tensionStatusBreakdown: z.record(z.string(), z.number()),
    personaCoverage: z.record(z.string(), z.object({
      entityCount: z.number(),
      tensionCount: z.number(),
      quoteCount: z.number(),
    })),
    gaps: z.array(z.string()),
    generatedAt: z.string(),
  }),
  execute: async () => {
    const [entities, tensions, tools, pocFeatures, transcripts, openQuestions, terminology] = await Promise.all([
      getAllEntities(),
      getAllTensions(),
      getAllTools(),
      getAllPocFeatures(),
      listTranscripts(),
      getOpenQuestions(),
      getTerminology(),
    ]);

    // Entity type breakdown
    const entityTypeBreakdown: Record<string, number> = {};
    for (const e of entities) {
      entityTypeBreakdown[e.type] = (entityTypeBreakdown[e.type] || 0) + 1;
    }

    // Tension status breakdown
    const tensionStatusBreakdown: Record<string, number> = {};
    for (const t of tensions) {
      tensionStatusBreakdown[t.status] = (tensionStatusBreakdown[t.status] || 0) + 1;
    }

    // Persona coverage
    const knownPersonas = await listPersonaIds();
    const personaCoverage: Record<string, { entityCount: number; tensionCount: number; quoteCount: number }> = {};

    for (const persona of knownPersonas) {
      const entityCount = entities.filter(e => e.perspectives?.[persona]).length;
      const tensionCount = tensions.filter(t => t.roles.includes(persona)).length;
      const quotes = await getQuotesByPersona(persona);
      personaCoverage[persona] = { entityCount, tensionCount, quoteCount: quotes.length };
    }

    // Identify gaps
    const gaps: string[] = [];
    for (const persona of knownPersonas) {
      const cov = personaCoverage[persona];
      if (cov.entityCount === 0) gaps.push(`No entity perspectives for ${persona}`);
      if (cov.quoteCount === 0) gaps.push(`No quotes from ${persona}`);
    }
    if (entities.length < 5) gaps.push('Low entity count — ontology may be underdeveloped');
    if (tensions.length === 0) gaps.push('No tensions identified yet');
    if (openQuestions.length > 10) gaps.push(`${openQuestions.length} open questions — many unresolved areas`);

    return {
      entityCount: entities.length,
      tensionCount: tensions.length,
      toolCount: tools.length,
      pocFeatureCount: pocFeatures.length,
      transcriptCount: transcripts.length,
      openQuestionCount: openQuestions.length,
      terminologyCount: Object.keys(terminology).length,
      entityTypeBreakdown,
      tensionStatusBreakdown,
      personaCoverage,
      gaps,
      generatedAt: new Date().toISOString(),
    };
  },
});

// ─── Task Flow Brief ─────────────────────────────────────────

export const generateTaskFlowBriefTool = createTool({
  id: 'generate-task-flow-brief',
  description: 'Generate a task flow brief for a named workflow: reconstructs steps, actors, tools, decision branches, and pain points from entity relationships and evidence.',
  inputSchema: z.object({
    workflowName: z.string().describe('Name or keyword of the workflow to reconstruct'),
  }),
  outputSchema: z.object({
    workflowName: z.string(),
    relatedEntities: z.array(z.object({
      name: z.string(),
      type: z.string(),
      role: z.string().optional(),
    })),
    relatedTensions: z.array(z.object({
      description: z.string(),
      roles: z.array(z.string()),
    })),
    relatedTools: z.array(z.object({
      name: z.string(),
      category: z.string(),
    })),
    painPoints: z.array(z.string()),
    generatedAt: z.string(),
  }),
  execute: async ({ workflowName }) => {
    const [entities, tensions, tools] = await Promise.all([
      getAllEntities(),
      getAllTensions(),
      getAllTools(),
    ]);

    const keyword = workflowName.toLowerCase();

    // Find entities related to this workflow by name, attributes, or workflows
    const relatedEntities = entities.filter(e => {
      if (e.name.toLowerCase().includes(keyword)) return true;
      if (e.type === 'process' && e.name.toLowerCase().includes(keyword)) return true;
      // Check if any persona's workflows mention this
      if (e.perspectives) {
        for (const p of Object.values(e.perspectives)) {
          if (p.workflows?.some(w => w.toLowerCase().includes(keyword))) return true;
        }
      }
      return false;
    }).map(e => ({
      name: e.name,
      type: e.type,
      role: e.perspectives
        ? Object.keys(e.perspectives).join(', ')
        : undefined,
    }));

    // Find tensions related to this workflow
    const relatedTensions = tensions.filter(t =>
      t.description.toLowerCase().includes(keyword) ||
      t.entities.some(eid => relatedEntities.some(re => re.name === eid))
    ).map(t => ({
      description: t.description,
      roles: t.roles,
    }));

    // Find tools related to this workflow
    const relatedTools = tools.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.category.toLowerCase().includes(keyword)
    ).map(t => ({
      name: t.name,
      category: t.category,
    }));

    // Aggregate pain points
    const painPoints: string[] = [];
    for (const e of entities) {
      if (!e.perspectives) continue;
      for (const p of Object.values(e.perspectives)) {
        if (p.workflows?.some(w => w.toLowerCase().includes(keyword))) {
          painPoints.push(...(p.painPoints || []));
        }
      }
    }

    return {
      workflowName,
      relatedEntities,
      relatedTensions,
      relatedTools,
      painPoints: [...new Set(painPoints)],
      generatedAt: new Date().toISOString(),
    };
  },
});

// Export all brief tools as array for easy registration
export const briefTools = [
  generateEntityMapBriefTool,
  generateTensionMapBriefTool,
  generateToolEcosystemBriefTool,
  generatePersonaComparisonBriefTool,
  generatePersonaProfileBriefTool,
  generateFeatureMatrixBriefTool,
  generateResearchCoverageBriefTool,
  generateTaskFlowBriefTool,
];
