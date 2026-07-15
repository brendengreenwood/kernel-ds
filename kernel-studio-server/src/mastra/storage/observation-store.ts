import { getDb } from './db.js';

export type Perspective = 'standard' | 'reality' | 'experience';

export interface Observation {
  id?: number;
  transcriptId: string;
  personaId?: string;
  perspective: Perspective;
  title: string;
  body: string;
  supportingQuote?: string;
  evidenceIds?: number[];
  createdAt?: string;
}

export async function addObservation(obs: Observation): Promise<number> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO observations (transcript_id, persona_id, perspective, title, body, supporting_quote, evidence_ids)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      obs.transcriptId,
      obs.personaId ?? null,
      obs.perspective,
      obs.title,
      obs.body,
      obs.supportingQuote ?? null,
      obs.evidenceIds ? JSON.stringify(obs.evidenceIds) : null,
    ],
  });
  return Number(result.lastInsertRowid);
}

export async function addObservations(observations: Observation[]): Promise<number> {
  let count = 0;
  for (const obs of observations) {
    await addObservation(obs);
    count++;
  }
  return count;
}

export async function getObservationsByTranscript(transcriptId: string): Promise<Observation[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM observations WHERE transcript_id = ?
          ORDER BY CASE perspective WHEN 'standard' THEN 1 WHEN 'reality' THEN 2 WHEN 'experience' THEN 3 END`,
    args: [transcriptId],
  });
  return result.rows.map(rowToObservation);
}

export async function getObservationsByPerspective(perspective: Perspective): Promise<Observation[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM observations WHERE perspective = ? ORDER BY created_at DESC',
    args: [perspective],
  });
  return result.rows.map(rowToObservation);
}

export async function getObservationsByPersona(personaId: string): Promise<Observation[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM observations WHERE persona_id = ?
          ORDER BY created_at DESC, CASE perspective WHEN 'standard' THEN 1 WHEN 'reality' THEN 2 WHEN 'experience' THEN 3 END`,
    args: [personaId],
  });
  return result.rows.map(rowToObservation);
}

export async function listRecentObservations(limit = 30): Promise<Observation[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM observations ORDER BY created_at DESC LIMIT ?',
    args: [limit],
  });
  return result.rows.map(rowToObservation);
}

function rowToObservation(row: Record<string, unknown>): Observation {
  return {
    id: Number(row.id),
    transcriptId: row.transcript_id as string,
    personaId: row.persona_id as string | undefined,
    perspective: row.perspective as Perspective,
    title: row.title as string,
    body: row.body as string,
    supportingQuote: row.supporting_quote as string | undefined,
    evidenceIds: row.evidence_ids ? JSON.parse(row.evidence_ids as string) : undefined,
    createdAt: row.created_at as string | undefined,
  };
}
