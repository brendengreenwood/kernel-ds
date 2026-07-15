import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { setDb, initDb } from './db.js';
import {
  addObservation,
  addObservations,
  getObservationsByTranscript,
  getObservationsByPerspective,
  getObservationsByPersona,
  listRecentObservations,
} from './observation-store.js';

beforeEach(async () => {
  const client = createClient({ url: ':memory:' });
  setDb(client);
  await initDb();
});

describe('Observation CRUD', () => {
  it('adds and retrieves a single observation', async () => {
    const id = await addObservation({
      transcriptId: 'transcript-001',
      personaId: 'merchant',
      perspective: 'standard',
      title: 'Contracts require daily review',
      body: 'Business rules mandate that all open contracts are reviewed each morning before trading begins.',
      supportingQuote: 'I have to go through every single contract before I can do anything else.',
    });
    expect(id).toBeGreaterThan(0);

    const obs = await getObservationsByTranscript('transcript-001');
    expect(obs).toHaveLength(1);
    expect(obs[0].title).toBe('Contracts require daily review');
    expect(obs[0].perspective).toBe('standard');
    expect(obs[0].personaId).toBe('merchant');
  });

  it('batch adds 3 observations', async () => {
    const count = await addObservations([
      {
        transcriptId: 'transcript-001',
        personaId: 'merchant',
        perspective: 'standard',
        title: 'Basis drives contract pricing',
        body: 'The expected workflow centers on basis as the primary pricing mechanism.',
      },
      {
        transcriptId: 'transcript-001',
        personaId: 'merchant',
        perspective: 'reality',
        title: 'Spreadsheets replace the system',
        body: 'Merchants maintain shadow spreadsheets because the pricing tool lacks real-time basis data.',
        supportingQuote: 'I always have my own sheet open next to the system.',
      },
      {
        transcriptId: 'transcript-001',
        personaId: 'merchant',
        perspective: 'experience',
        title: 'Constant anxiety about stale data',
        body: 'The fear of pricing on outdated basis creates persistent low-grade stress throughout the trading day.',
      },
    ]);
    expect(count).toBe(3);

    const obs = await getObservationsByTranscript('transcript-001');
    expect(obs).toHaveLength(3);
  });

  it('orders transcript observations: standard → reality → experience', async () => {
    await addObservations([
      { transcriptId: 't1', perspective: 'experience', title: 'E', body: 'e' },
      { transcriptId: 't1', perspective: 'standard', title: 'S', body: 's' },
      { transcriptId: 't1', perspective: 'reality', title: 'R', body: 'r' },
    ]);

    const obs = await getObservationsByTranscript('t1');
    expect(obs.map(o => o.perspective)).toEqual(['standard', 'reality', 'experience']);
  });

  it('filters by perspective across sessions', async () => {
    await addObservations([
      { transcriptId: 't1', perspective: 'standard', title: 'S1', body: 's1' },
      { transcriptId: 't1', perspective: 'reality', title: 'R1', body: 'r1' },
      { transcriptId: 't2', perspective: 'standard', title: 'S2', body: 's2' },
      { transcriptId: 't2', perspective: 'experience', title: 'E2', body: 'e2' },
    ]);

    const standards = await getObservationsByPerspective('standard');
    expect(standards).toHaveLength(2);
    expect(standards.every(o => o.perspective === 'standard')).toBe(true);
  });

  it('filters by persona', async () => {
    await addObservations([
      { transcriptId: 't1', personaId: 'merchant', perspective: 'standard', title: 'S', body: 's' },
      { transcriptId: 't1', personaId: 'merchant', perspective: 'reality', title: 'R', body: 'r' },
      { transcriptId: 't2', personaId: 'csr', perspective: 'standard', title: 'S2', body: 's2' },
    ]);

    const merchantObs = await getObservationsByPersona('merchant');
    expect(merchantObs).toHaveLength(2);
    expect(merchantObs.every(o => o.personaId === 'merchant')).toBe(true);
  });

  it('lists recent observations with limit', async () => {
    for (let i = 0; i < 5; i++) {
      await addObservation({
        transcriptId: `t${i}`,
        perspective: 'standard',
        title: `Title ${i}`,
        body: `Body ${i}`,
      });
    }

    const recent = await listRecentObservations(3);
    expect(recent).toHaveLength(3);
  });

  it('stores and retrieves evidence IDs', async () => {
    await addObservation({
      transcriptId: 't1',
      perspective: 'reality',
      title: 'Test',
      body: 'Test body',
      evidenceIds: [10, 20, 30],
    });

    const obs = await getObservationsByTranscript('t1');
    expect(obs[0].evidenceIds).toEqual([10, 20, 30]);
  });

  it('returns empty array for nonexistent transcript', async () => {
    const obs = await getObservationsByTranscript('nonexistent');
    expect(obs).toEqual([]);
  });
});
