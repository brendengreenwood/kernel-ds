import { Hono } from 'hono';
import {
  getObservationsByTranscript,
  getObservationsByPersona,
  getObservationsByPerspective,
  listRecentObservations,
  type Perspective,
} from '../../mastra/storage/index.js';

export const observationRoutes = new Hono();

// List with optional filters: ?transcript=, ?persona=, ?perspective=
observationRoutes.get('/', async (c) => {
  const transcript = c.req.query('transcript');
  const persona = c.req.query('persona');
  const perspective = c.req.query('perspective') as Perspective | undefined;

  if (transcript) return c.json(await getObservationsByTranscript(transcript));
  if (persona) return c.json(await getObservationsByPersona(persona));
  if (perspective) return c.json(await getObservationsByPerspective(perspective));

  return c.json(await listRecentObservations(50));
});

// Takeaways for a specific transcript
observationRoutes.get('/transcript/:id', async (c) => {
  const id = c.req.param('id');
  return c.json(await getObservationsByTranscript(id));
});

// Recent observations across all sessions
observationRoutes.get('/recent', async (c) => {
  const limit = Number(c.req.query('limit') || '30');
  return c.json(await listRecentObservations(limit));
});
