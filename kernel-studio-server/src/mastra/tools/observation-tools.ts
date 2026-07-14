import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  addObservations,
  getObservationsByTranscript,
  getObservationsByPerspective,
  getObservationsByPersona,
  listRecentObservations,
  type Perspective,
} from '../storage/index.js';

const ObservationOutput = z.object({
  id: z.number().optional(),
  transcriptId: z.string(),
  personaId: z.string().optional(),
  perspective: z.enum(['standard', 'reality', 'experience']),
  title: z.string(),
  body: z.string(),
  supportingQuote: z.string().optional(),
  evidenceIds: z.array(z.number()).optional(),
  createdAt: z.string().optional(),
});

export const generateSessionTakeawaysTool = createTool({
  id: 'generate-session-takeaways',
  description: `After completing transcript analysis, call this to distill your findings into three perspective statements:
- **The Standard** (normative): What is supposed to happen — business rules, system design, expected workflows
- **The Reality** (situational): What actually happens — workarounds, constraints, ground truth from the session
- **The Experience** (existential): How it feels — frustrations, motivations, emotional relationship to the work

Each takeaway should have a punchy title (5-8 words) and a 1-2 sentence body. Include the best supporting quote from the transcript.`,
  inputSchema: z.object({
    transcriptId: z.string().describe('The transcript these takeaways summarize'),
    personaId: z.string().optional().describe('Primary persona from the session'),
    takeaways: z.array(z.object({
      perspective: z.enum(['standard', 'reality', 'experience']),
      title: z.string().describe('Punchy headline, 5-8 words'),
      body: z.string().describe('1-2 sentence elaboration'),
      supportingQuote: z.string().optional().describe('Best quote backing this up'),
      evidenceIds: z.array(z.number()).optional().describe('IDs of evidence_sources that support this'),
    })).length(3).describe('Exactly 3 takeaways: one standard, one reality, one experience'),
  }),
  outputSchema: z.object({
    savedCount: z.number(),
    takeaways: z.array(ObservationOutput),
    message: z.string(),
  }),
  execute: async ({ transcriptId, personaId, takeaways }) => {
    const observations = takeaways.map(t => ({
      transcriptId,
      personaId,
      perspective: t.perspective,
      title: t.title,
      body: t.body,
      supportingQuote: t.supportingQuote,
      evidenceIds: t.evidenceIds,
    }));

    const count = await addObservations(observations);

    // Retrieve the saved observations to return with IDs
    const saved = await getObservationsByTranscript(transcriptId);

    return {
      savedCount: count,
      takeaways: saved,
      message: `Session takeaways saved: The Standard / The Reality / The Experience`,
    };
  },
});

export const getSessionTakeawaysTool = createTool({
  id: 'get-session-takeaways',
  description: 'Retrieve session takeaways (triperspectival observations). Filter by transcript, persona, or perspective.',
  inputSchema: z.object({
    filterBy: z.enum(['transcript', 'persona', 'perspective', 'recent']).describe('What to filter by'),
    value: z.string().optional().describe('The filter value (not needed for "recent")'),
    limit: z.number().optional().describe('Max results for "recent" filter (default 30)'),
  }),
  outputSchema: z.object({
    count: z.number(),
    observations: z.array(ObservationOutput),
  }),
  execute: async ({ filterBy, value, limit }) => {
    let observations;
    switch (filterBy) {
      case 'transcript':
        observations = await getObservationsByTranscript(value!);
        break;
      case 'persona':
        observations = await getObservationsByPersona(value!);
        break;
      case 'perspective':
        observations = await getObservationsByPerspective(value! as Perspective);
        break;
      case 'recent':
        observations = await listRecentObservations(limit ?? 30);
        break;
    }
    return { count: observations.length, observations };
  },
});
