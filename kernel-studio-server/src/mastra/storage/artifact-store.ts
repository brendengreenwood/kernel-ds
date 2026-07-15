import type { InValue } from '@libsql/client';
import { getDb } from './db.js';

export type ArtifactType = 'diagram' | 'report' | 'matrix' | 'comparison' | 'deck' | 'dashboard';
export type ArtifactFormat = 'mermaid' | 'markdown' | 'json' | 'html';
export type StakeholderLens = 'it_manager' | 'product_manager' | 'executive' | 'design';

export interface Artifact {
  id: string;
  title: string;
  artifactType: ArtifactType;
  format: ArtifactFormat;
  content: string;
  rendered?: string;
  sourceBriefType?: string;
  sourceBriefSnapshot?: string;
  designRationale?: string;
  stakeholderLens?: StakeholderLens;
  version: number;
  parentId?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ArtifactFilters {
  artifactType?: ArtifactType;
  format?: ArtifactFormat;
  stakeholderLens?: StakeholderLens;
  tags?: string[];
  sourceBriefType?: string;
}

function generateId(): string {
  return `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function rowToArtifact(row: Record<string, unknown>): Artifact {
  return {
    id: row.id as string,
    title: row.title as string,
    artifactType: row.artifact_type as ArtifactType,
    format: row.format as ArtifactFormat,
    content: row.content as string,
    rendered: (row.rendered as string) || undefined,
    sourceBriefType: (row.source_brief_type as string) || undefined,
    sourceBriefSnapshot: (row.source_brief_snapshot as string) || undefined,
    designRationale: (row.design_rationale as string) || undefined,
    stakeholderLens: (row.stakeholder_lens as StakeholderLens) || undefined,
    version: Number(row.version),
    parentId: (row.parent_id as string) || undefined,
    tags: row.tags ? JSON.parse(row.tags as string) : undefined,
    createdAt: (row.created_at as string) || undefined,
    updatedAt: (row.updated_at as string) || undefined,
  };
}

export async function saveArtifact(artifact: Omit<Artifact, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<Artifact> {
  const db = getDb();
  const id = generateId();
  const version = 1;

  await db.execute({
    sql: `INSERT INTO artifacts (id, title, artifact_type, format, content, rendered, source_brief_type, source_brief_snapshot, design_rationale, stakeholder_lens, version, parent_id, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      artifact.title,
      artifact.artifactType,
      artifact.format,
      artifact.content,
      artifact.rendered ?? null,
      artifact.sourceBriefType ?? null,
      artifact.sourceBriefSnapshot ?? null,
      artifact.designRationale ?? null,
      artifact.stakeholderLens ?? null,
      version,
      artifact.parentId ?? null,
      artifact.tags ? JSON.stringify(artifact.tags) : null,
    ],
  });

  return { ...artifact, id, version };
}

export async function getArtifact(id: string): Promise<Artifact | null> {
  const db = getDb();
  const rs = await db.execute({
    sql: 'SELECT * FROM artifacts WHERE id = ?',
    args: [id],
  });
  if (rs.rows.length === 0) return null;
  return rowToArtifact(rs.rows[0] as Record<string, unknown>);
}

export async function listArtifacts(filters?: ArtifactFilters): Promise<Artifact[]> {
  const db = getDb();
  const conditions: string[] = [];
  const args: InValue[] = [];

  if (filters?.artifactType) {
    conditions.push('artifact_type = ?');
    args.push(filters.artifactType);
  }
  if (filters?.format) {
    conditions.push('format = ?');
    args.push(filters.format);
  }
  if (filters?.stakeholderLens) {
    conditions.push('stakeholder_lens = ?');
    args.push(filters.stakeholderLens);
  }
  if (filters?.sourceBriefType) {
    conditions.push('source_brief_type = ?');
    args.push(filters.sourceBriefType);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rs = await db.execute({
    sql: `SELECT * FROM artifacts ${where} ORDER BY updated_at DESC`,
    args,
  });
  return rs.rows.map(r => rowToArtifact(r as Record<string, unknown>));
}

export async function updateArtifact(
  id: string,
  updates: Partial<Pick<Artifact, 'title' | 'content' | 'rendered' | 'designRationale' | 'stakeholderLens' | 'tags'>>,
  createNewVersion = true,
): Promise<Artifact | null> {
  const existing = await getArtifact(id);
  if (!existing) return null;

  if (createNewVersion) {
    // Create a new artifact linked to the old one
    const newArtifact = await saveArtifact({
      title: updates.title ?? existing.title,
      artifactType: existing.artifactType,
      format: existing.format,
      content: updates.content ?? existing.content,
      rendered: updates.rendered ?? existing.rendered,
      sourceBriefType: existing.sourceBriefType,
      sourceBriefSnapshot: existing.sourceBriefSnapshot,
      designRationale: updates.designRationale ?? existing.designRationale,
      stakeholderLens: updates.stakeholderLens ?? existing.stakeholderLens,
      parentId: id,
      tags: updates.tags ?? existing.tags,
    });
    // Fix version number
    const db = getDb();
    await db.execute({
      sql: 'UPDATE artifacts SET version = ? WHERE id = ?',
      args: [existing.version + 1, newArtifact.id],
    });
    return { ...newArtifact, version: existing.version + 1, parentId: id };
  }

  // In-place update
  const db = getDb();
  const sets: string[] = ['updated_at = datetime(\'now\')'];
  const args: InValue[] = [];

  if (updates.title !== undefined) { sets.push('title = ?'); args.push(updates.title); }
  if (updates.content !== undefined) { sets.push('content = ?'); args.push(updates.content); }
  if (updates.rendered !== undefined) { sets.push('rendered = ?'); args.push(updates.rendered); }
  if (updates.designRationale !== undefined) { sets.push('design_rationale = ?'); args.push(updates.designRationale); }
  if (updates.stakeholderLens !== undefined) { sets.push('stakeholder_lens = ?'); args.push(updates.stakeholderLens); }
  if (updates.tags !== undefined) { sets.push('tags = ?'); args.push(JSON.stringify(updates.tags)); }

  args.push(id);
  await db.execute({
    sql: `UPDATE artifacts SET ${sets.join(', ')} WHERE id = ?`,
    args,
  });

  return getArtifact(id);
}

export async function deleteArtifact(id: string): Promise<boolean> {
  const db = getDb();
  const rs = await db.execute({
    sql: 'DELETE FROM artifacts WHERE id = ?',
    args: [id],
  });
  return rs.rowsAffected > 0;
}

export async function getArtifactHistory(id: string): Promise<Artifact[]> {
  const history: Artifact[] = [];
  let currentId: string | undefined = id;

  while (currentId) {
    const artifact = await getArtifact(currentId);
    if (!artifact) break;
    history.push(artifact);
    currentId = artifact.parentId;
  }

  return history;
}

export async function getArtifactsByBrief(briefType: string): Promise<Artifact[]> {
  const db = getDb();
  const rs = await db.execute({
    sql: 'SELECT * FROM artifacts WHERE source_brief_type = ? ORDER BY updated_at DESC',
    args: [briefType],
  });
  return rs.rows.map(r => rowToArtifact(r as Record<string, unknown>));
}
