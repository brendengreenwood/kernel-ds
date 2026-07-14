import { Hono } from 'hono';
import {
  getAllEntities, getAllTensions, getAllTools,
  getQuotesByPersona, listTranscripts,
  getAllPersonas, getPersona, getPersonaTree, getPersonaChildren,
} from '../../mastra/storage/index.js';

export const personaRoutes = new Hono();

personaRoutes.get('/', async (c) => {
  const [personas, entities, tensions, tools] = await Promise.all([
    getAllPersonas(), getAllEntities(), getAllTensions(), getAllTools(),
  ]);

  const result = personas.map((p) => {
    const entityCount = entities.filter(e => e.perspectives && p.id in e.perspectives).length;
    const tensionCount = tensions.filter(t => t.roles?.includes(p.id)).length;
    const toolCount = tools.filter(t => t.usageByPersona && p.id in t.usageByPersona).length;
    return {
      id: p.id,
      label: p.label,
      parentId: p.parentId,
      description: p.description,
      entityCount,
      tensionCount,
      toolCount,
      participantCount: p.participantIds?.length || 0,
    };
  });

  return c.json(result);
});

personaRoutes.get('/tree', async (c) => {
  const tree = await getPersonaTree();
  return c.json(tree);
});

personaRoutes.get('/:persona/profile', async (c) => {
  const personaId = c.req.param('persona');
  const persona = await getPersona(personaId);
  if (!persona) return c.json({ error: 'Persona not found' }, 404);

  const children = await getPersonaChildren(personaId);
  const searchIds = [personaId, ...children.map(ch => ch.id)];

  const [entities, tensions, tools, quotes, transcripts] = await Promise.all([
    getAllEntities(), getAllTensions(), getAllTools(),
    Promise.all(searchIds.map(id => getQuotesByPersona(id))).then(a => a.flat()),
    Promise.all(searchIds.map(id => listTranscripts(id))).then(a => a.flat()),
  ]);

  const relevantEntities = entities.filter(e =>
    e.perspectives && searchIds.some(id => id in (e.perspectives || {}))
  );
  const coreEntities = relevantEntities.map(e => {
    const perspId = searchIds.find(id => id in (e.perspectives || {}))!;
    const perspective = e.perspectives?.[perspId];
    return {
      name: e.name, type: e.type,
      primaryConcern: perspective?.primaryConcern,
      painPoints: perspective?.painPoints || [],
      terminology: perspective?.terminology || [],
    };
  });

  const relevantTensions = tensions.filter(t =>
    t.roles?.some(r => searchIds.includes(r))
  );
  const tensionSummaries = relevantTensions.map(t => ({
    description: t.description, tensionType: t.tensionType,
    implications: t.implications ? [t.implications] : [],
  }));

  const relevantTools = tools.filter(t =>
    t.usageByPersona && searchIds.some(id => id in (t.usageByPersona || {}))
  );
  const toolUsage = relevantTools.map(t => {
    const usageId = searchIds.find(id => id in (t.usageByPersona || {}))!;
    const usage = t.usageByPersona?.[usageId];
    return {
      name: t.name, category: t.category,
      frequency: usage?.frequency, proficiency: usage?.proficiency,
      sentiment: usage?.sentiment,
      painPoints: usage?.painPoints || [],
      workarounds: usage?.workarounds || [],
    };
  });

  const topQuotes = quotes.slice(0, 10).map(q => ({
    text: q.text, topic: q.topic, sentiment: q.sentiment,
  }));

  const allPainPoints = [...new Set(coreEntities.flatMap(e => e.painPoints))].slice(0, 5);
  const toolNames = toolUsage.map(t => t.name);
  let dayInTheLife = `The ${persona.label} works across ${coreEntities.length} key domain areas`;
  if (toolNames.length > 0) {
    dayInTheLife += `, using tools like ${toolNames.slice(0, 3).join(', ')}`;
    if (toolNames.length > 3) dayInTheLife += ` and ${toolNames.length - 3} others`;
  }
  dayInTheLife += '.';
  if (allPainPoints.length > 0) {
    dayInTheLife += ` Key frustrations: ${allPainPoints.join('; ')}.`;
  }

  return c.json({
    id: persona.id,
    label: persona.label,
    parentId: persona.parentId,
    description: persona.description,
    motivations: persona.motivations,
    marketContext: persona.marketContext,
    variants: children.map(ch => ({ id: ch.id, label: ch.label, description: ch.description })),
    profile: {
      overview: {
        totalEntitiesReferenced: relevantEntities.length,
        totalTensionsFacing: relevantTensions.length,
        totalToolsUsed: relevantTools.length,
        totalQuotes: quotes.length,
        transcriptsAnalyzed: transcripts.length,
        participantsMapped: persona.participantIds?.length || 0,
      },
      coreEntities, tensions: tensionSummaries, toolUsage, topQuotes, dayInTheLife,
    },
  });
});
