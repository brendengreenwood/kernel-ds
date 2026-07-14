import { registerApiRoute } from '@mastra/core/server';
import {
  getAllEntities,
  getAllTensions,
  getAllTools,
  getAllPocFeatures,
  getOpenQuestions,
  getTerminology,
  listPersonaIds,
} from '../storage/index.js';
import { getEvidenceForTarget } from '../storage/evidence-store.js';
import { getQuotesByPersona } from '../storage/quote-store.js';
import { listTranscripts } from '../storage/transcript-store.js';

export const briefRoutes = [
  registerApiRoute('/briefs/entity-map', {
    method: 'GET',
    openapi: {
      summary: 'Entity Map Brief',
      description: 'Top N entities ranked by connection density, grouped by type',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const limit = Number(c.req.query('limit') || '15');
      const minConnections = Number(c.req.query('minConnections') || '0');
      const entities = await getAllEntities();
      const entityMap = new Map(entities.map(e => [e.id, e]));

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

      const filtered = enriched
        .filter(e => e.connectionCount >= minConnections)
        .sort((a, b) => b.connectionCount - a.connectionCount)
        .slice(0, limit);

      const groupCounts = new Map<string, number>();
      for (const e of filtered) {
        groupCounts.set(e.type, (groupCounts.get(e.type) || 0) + 1);
      }

      return c.json({
        entities: filtered,
        groups: Array.from(groupCounts.entries()).map(([type, count]) => ({ type, count })),
        totalEntities: entities.length,
        generatedAt: new Date().toISOString(),
      });
    },
  }),

  registerApiRoute('/briefs/tension-map', {
    method: 'GET',
    openapi: {
      summary: 'Tension Map Brief',
      description: 'Active tensions with severity scores and evidence counts',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const type = c.req.query('type') as 'intra-role' | 'inter-role' | 'system' | undefined;
      const minEvidence = Number(c.req.query('minEvidence') || '0');
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

      let filtered = enriched.filter(t => t.evidenceCount >= minEvidence);
      if (type) filtered = filtered.filter(t => t.tensionType === type);
      filtered.sort((a, b) => b.evidenceCount - a.evidenceCount);

      return c.json({
        tensions: filtered,
        totalTensions: tensions.length,
        generatedAt: new Date().toISOString(),
      });
    },
  }),

  registerApiRoute('/briefs/tool-ecosystem', {
    method: 'GET',
    openapi: {
      summary: 'Tool Ecosystem Brief',
      description: 'Per-persona tool usage with sentiment and PoC candidates',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const persona = c.req.query('persona');
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
          id: t.id, name: t.name, category: t.category,
          isInternal: t.isInternal, isPoc: t.isPoc,
          personas, integratesWith: t.integratesWith, replacedBy: t.replacedBy,
        };
      }).filter(t => !persona || t.personas.length > 0);

      const pocBriefs = pocFeatures.map(f => ({
        id: f.id, name: f.name, description: f.description, status: f.status,
        personasBenefited: f.benefitsByPersona
          ? Object.entries(f.benefitsByPersona)
              .filter(([, b]) => b.benefitLevel !== 'none')
              .map(([name]) => name)
          : [],
      }));

      return c.json({ tools: toolBriefs, pocFeatures: pocBriefs, generatedAt: new Date().toISOString() });
    },
  }),

  registerApiRoute('/briefs/persona-comparison', {
    method: 'GET',
    openapi: {
      summary: 'Persona Comparison Brief',
      description: 'Side-by-side perspective comparison across personas',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const personasParam = c.req.query('personas') || '';
      const personas = personasParam.split(',').filter(Boolean);
      if (personas.length < 2) {
        return c.json({ error: 'Provide at least 2 comma-separated personas' }, 400);
      }

      const entities = await getAllEntities();
      const tensions = await getAllTensions();

      const profiles = personas.map(persona => {
        const relevantEntities = entities.filter(e => e.perspectives && persona in e.perspectives);
        const relevantTensions = tensions.filter(t => t.roles.includes(persona));
        const painPoints = relevantEntities.flatMap(e => e.perspectives?.[persona]?.painPoints || []);
        const concerns = relevantEntities.map(e => e.perspectives?.[persona]?.primaryConcern).filter((c): c is string => !!c);
        return {
          name: persona,
          entityCount: relevantEntities.length,
          tensionCount: relevantTensions.length,
          topPainPoints: [...new Set(painPoints)].slice(0, 5),
          topConcerns: [...new Set(concerns)].slice(0, 5),
        };
      });

      const sharedEntities = entities
        .filter(e => {
          if (!e.perspectives) return false;
          return personas.filter(p => p in e.perspectives!).length >= 2;
        })
        .map(e => ({
          entityName: e.name,
          perspectives: Object.fromEntries(
            personas.filter(p => e.perspectives?.[p]).map(p => [p, e.perspectives![p].primaryConcern])
          ),
        }));

      const conflicts = tensions
        .filter(t => personas.filter(p => t.roles.includes(p)).length >= 2)
        .map(t => ({ topic: t.description, perspectives: Object.fromEntries(personas.filter(p => t.roles.includes(p)).map(p => [p, 'involved'])) }));

      return c.json({ personas: profiles, sharedEntities, conflicts, generatedAt: new Date().toISOString() });
    },
  }),

  registerApiRoute('/briefs/persona-profile/:persona', {
    method: 'GET',
    openapi: {
      summary: 'Persona Profile Brief',
      description: 'Deep single-persona profile aggregated across all lenses',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const persona = c.req.param('persona');
      const [entities, tensions, tools, quotes] = await Promise.all([
        getAllEntities(), getAllTensions(), getAllTools(), getQuotesByPersona(persona),
      ]);

      const coreEntities = entities
        .filter(e => e.perspectives?.[persona])
        .map(e => ({
          name: e.name, type: e.type,
          concern: e.perspectives![persona].primaryConcern,
          painPoints: e.perspectives![persona].painPoints,
        }));

      const personaTensions = tensions.filter(t => t.roles.includes(persona)).map(t => ({
        description: t.description, type: t.tensionType, status: t.status,
      }));

      const toolUsage = tools.filter(t => t.usageByPersona?.[persona]).map(t => ({
        toolName: t.name,
        frequency: t.usageByPersona![persona].frequency,
        sentiment: t.usageByPersona![persona].sentiment,
        painPoints: t.usageByPersona![persona].painPoints,
      }));

      const topQuotes = quotes.slice(0, 10).map(q => ({ text: q.text, topic: q.topic }));
      const allPainPoints = [...new Set(coreEntities.flatMap(e => e.painPoints || []))];

      return c.json({ persona, coreEntities, tensions: personaTensions, toolUsage, topQuotes, allPainPoints, generatedAt: new Date().toISOString() });
    },
  }),

  registerApiRoute('/briefs/feature-matrix', {
    method: 'GET',
    openapi: {
      summary: 'Feature Matrix Brief',
      description: 'PoC features scored by impact, personas affected, and pain points solved',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const sortBy = (c.req.query('sortBy') as 'impact' | 'evidence' | 'personas') || 'impact';
      const pocFeatures = await getAllPocFeatures();

      const scored = pocFeatures.map(f => {
        const benefits = f.benefitsByPersona || {};
        const personasAffected = Object.values(benefits).filter(b => b.benefitLevel !== 'none').length;
        const painPointsSolved = Object.values(benefits).reduce((sum, b) => sum + b.solvedPainPoints.length, 0);
        return {
          id: f.id, name: f.name, description: f.description, status: f.status,
          personasAffected, painPointsSolved, impactScore: personasAffected * 3 + painPointsSolved,
          benefitsByPersona: Object.fromEntries(
            Object.entries(benefits).map(([p, b]) => [p, { benefitLevel: b.benefitLevel, solvedPainPoints: b.solvedPainPoints }])
          ),
        };
      });

      if (sortBy === 'impact') scored.sort((a, b) => b.impactScore - a.impactScore);
      else if (sortBy === 'personas') scored.sort((a, b) => b.personasAffected - a.personasAffected);
      else scored.sort((a, b) => b.painPointsSolved - a.painPointsSolved);

      return c.json({ features: scored, generatedAt: new Date().toISOString() });
    },
  }),

  registerApiRoute('/briefs/research-coverage', {
    method: 'GET',
    openapi: {
      summary: 'Research Coverage Brief',
      description: 'Ontology health metrics, coverage gaps, and evidence density',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const [entities, tensions, tools, pocFeatures, transcripts, openQuestions, terminology] = await Promise.all([
        getAllEntities(), getAllTensions(), getAllTools(), getAllPocFeatures(),
        listTranscripts(), getOpenQuestions(), getTerminology(),
      ]);

      const entityTypeBreakdown: Record<string, number> = {};
      for (const e of entities) entityTypeBreakdown[e.type] = (entityTypeBreakdown[e.type] || 0) + 1;

      const tensionStatusBreakdown: Record<string, number> = {};
      for (const t of tensions) tensionStatusBreakdown[t.status] = (tensionStatusBreakdown[t.status] || 0) + 1;

      const knownPersonas = await listPersonaIds();
      const personaCoverage: Record<string, { entityCount: number; tensionCount: number; quoteCount: number }> = {};
      for (const persona of knownPersonas) {
        const quotes = await getQuotesByPersona(persona);
        personaCoverage[persona] = {
          entityCount: entities.filter(e => e.perspectives?.[persona]).length,
          tensionCount: tensions.filter(t => t.roles.includes(persona)).length,
          quoteCount: quotes.length,
        };
      }

      const gaps: string[] = [];
      for (const persona of knownPersonas) {
        const cov = personaCoverage[persona];
        if (cov.entityCount === 0) gaps.push(`No entity perspectives for ${persona}`);
        if (cov.quoteCount === 0) gaps.push(`No quotes from ${persona}`);
      }
      if (entities.length < 5) gaps.push('Low entity count — ontology may be underdeveloped');
      if (tensions.length === 0) gaps.push('No tensions identified yet');
      if (openQuestions.length > 10) gaps.push(`${openQuestions.length} open questions — many unresolved areas`);

      return c.json({
        entityCount: entities.length, tensionCount: tensions.length,
        toolCount: tools.length, pocFeatureCount: pocFeatures.length,
        transcriptCount: transcripts.length, openQuestionCount: openQuestions.length,
        terminologyCount: Object.keys(terminology).length,
        entityTypeBreakdown, tensionStatusBreakdown, personaCoverage, gaps,
        generatedAt: new Date().toISOString(),
      });
    },
  }),

  registerApiRoute('/briefs/task-flow/:workflowName', {
    method: 'GET',
    openapi: {
      summary: 'Task Flow Brief',
      description: 'Reconstructed workflow with steps, actors, tools, and pain points',
      tags: ['Briefs'],
    },
    handler: async (c) => {
      const workflowName = c.req.param('workflowName');
      const [entities, tensions, tools] = await Promise.all([
        getAllEntities(), getAllTensions(), getAllTools(),
      ]);
      const keyword = workflowName.toLowerCase();

      const relatedEntities = entities.filter(e => {
        if (e.name.toLowerCase().includes(keyword)) return true;
        if (e.perspectives) {
          for (const p of Object.values(e.perspectives)) {
            if (p.workflows?.some(w => w.toLowerCase().includes(keyword))) return true;
          }
        }
        return false;
      }).map(e => ({
        name: e.name, type: e.type,
        role: e.perspectives ? Object.keys(e.perspectives).join(', ') : undefined,
      }));

      const relatedTensions = tensions.filter(t =>
        t.description.toLowerCase().includes(keyword) ||
        t.entities.some(eid => relatedEntities.some(re => re.name === eid))
      ).map(t => ({ description: t.description, roles: t.roles }));

      const relatedTools = tools.filter(t =>
        t.name.toLowerCase().includes(keyword) || t.category.toLowerCase().includes(keyword)
      ).map(t => ({ name: t.name, category: t.category }));

      const painPoints: string[] = [];
      for (const e of entities) {
        if (!e.perspectives) continue;
        for (const p of Object.values(e.perspectives)) {
          if (p.workflows?.some(w => w.toLowerCase().includes(keyword))) {
            painPoints.push(...(p.painPoints || []));
          }
        }
      }

      return c.json({
        workflowName, relatedEntities, relatedTensions, relatedTools,
        painPoints: [...new Set(painPoints)], generatedAt: new Date().toISOString(),
      });
    },
  }),
];
