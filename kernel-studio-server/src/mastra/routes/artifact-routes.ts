import { registerApiRoute } from '@mastra/core/server';
import {
  saveArtifact,
  getArtifact,
  listArtifacts,
  updateArtifact,
  deleteArtifact,
  getArtifactHistory,
  type ArtifactType,
  type ArtifactFormat,
  type StakeholderLens,
} from '../storage/artifact-store.js';

export const artifactRoutes = [
  registerApiRoute('/artifacts', {
    method: 'GET',
    openapi: {
      summary: 'List Artifacts',
      description: 'List all artifacts with optional filters',
      tags: ['Artifacts'],
    },
    handler: async (c) => {
      const artifactType = c.req.query('type') as ArtifactType | undefined;
      const format = c.req.query('format') as ArtifactFormat | undefined;
      const stakeholderLens = c.req.query('lens') as StakeholderLens | undefined;
      const artifacts = await listArtifacts({ artifactType, format, stakeholderLens });
      return c.json({ count: artifacts.length, artifacts });
    },
  }),

  registerApiRoute('/artifacts/:id', {
    method: 'GET',
    openapi: {
      summary: 'Get Artifact',
      description: 'Retrieve a single artifact by ID',
      tags: ['Artifacts'],
    },
    handler: async (c) => {
      const id = c.req.param('id');
      const artifact = await getArtifact(id);
      if (!artifact) return c.json({ error: 'Not found' }, 404);
      return c.json(artifact);
    },
  }),

  registerApiRoute('/artifacts', {
    method: 'POST',
    openapi: {
      summary: 'Create Artifact',
      description: 'Save a new artifact',
      tags: ['Artifacts'],
    },
    handler: async (c) => {
      const body = await c.req.json();
      const artifact = await saveArtifact({
        title: body.title,
        artifactType: body.artifactType,
        format: body.format,
        content: body.content,
        rendered: body.rendered,
        sourceBriefType: body.sourceBriefType,
        sourceBriefSnapshot: body.sourceBriefSnapshot,
        designRationale: body.designRationale,
        stakeholderLens: body.stakeholderLens,
        tags: body.tags,
        parentId: body.parentId,
      });
      return c.json(artifact, 201);
    },
  }),

  registerApiRoute('/artifacts/:id', {
    method: 'PUT',
    openapi: {
      summary: 'Update Artifact',
      description: 'Update an existing artifact (creates new version by default)',
      tags: ['Artifacts'],
    },
    handler: async (c) => {
      const id = c.req.param('id');
      const body = await c.req.json();
      const createNewVersion = body.createNewVersion !== false;
      const updated = await updateArtifact(id, {
        title: body.title,
        content: body.content,
        designRationale: body.designRationale,
        stakeholderLens: body.stakeholderLens,
        tags: body.tags,
      }, createNewVersion);
      if (!updated) return c.json({ error: 'Not found' }, 404);
      return c.json(updated);
    },
  }),

  registerApiRoute('/artifacts/:id', {
    method: 'DELETE',
    openapi: {
      summary: 'Delete Artifact',
      description: 'Delete an artifact by ID',
      tags: ['Artifacts'],
    },
    handler: async (c) => {
      const id = c.req.param('id');
      const deleted = await deleteArtifact(id);
      if (!deleted) return c.json({ error: 'Not found' }, 404);
      return c.json({ success: true });
    },
  }),

  registerApiRoute('/artifacts/:id/history', {
    method: 'GET',
    openapi: {
      summary: 'Artifact History',
      description: 'Walk the version chain of an artifact',
      tags: ['Artifacts'],
    },
    handler: async (c) => {
      const id = c.req.param('id');
      const history = await getArtifactHistory(id);
      return c.json({ count: history.length, versions: history });
    },
  }),
];
