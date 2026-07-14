/**
 * Artifact Generation Workflow
 *
 * Ensures deterministic save after artifact generation.
 * Step 1: Agent reasons about what to create and generates the artifact (LLM + tools)
 * Step 2: Auto-save the generated artifact to the store (deterministic)
 *
 * This replaces the unreliable system-prompt-based "please call save-artifact" pattern
 * with a guaranteed workflow-level save step.
 */

import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { artifactAgent } from '../agents/artifact-agent.js';
import {
  saveArtifact,
  type ArtifactType,
  type ArtifactFormat,
  type StakeholderLens,
} from '../storage/artifact-store.js';

// Input: what the user wants and optional audience lens
const WorkflowInput = z.object({
  request: z.string().describe('What artifact to create, e.g. "Show me entity relationships for the pricing domain"'),
  briefType: z
    .enum([
      'entity-map', 'tension-map', 'tool-ecosystem',
      'persona-comparison', 'persona-profile', 'feature-matrix',
      'research-coverage', 'task-flow',
    ])
    .optional()
    .describe('Specific brief type to use. If omitted, the agent will choose.'),
  audience: z
    .enum(['it_manager', 'product_manager', 'executive', 'design', 'general'])
    .optional()
    .default('general'),
});

// Agent step: generate the artifact
// The agent has full access to fetch-brief, suggest-artifact, and all diagram/report/matrix tools.
// It will produce tool results containing the artifact content.
const generateStep = createStep(artifactAgent, {
  structuredOutput: {
    schema: z.object({
      title: z.string().describe('Title of the generated artifact'),
      artifactType: z.enum(['diagram', 'report', 'matrix', 'comparison', 'deck', 'dashboard']),
      format: z.enum(['mermaid', 'markdown', 'json', 'html']),
      content: z.string().describe('The artifact content (mermaid syntax, markdown, JSON, etc.)'),
      designRationale: z.string().optional().describe('Why this visualization was chosen'),
      stakeholderLens: z
        .enum(['it_manager', 'product_manager', 'executive', 'design'])
        .optional(),
      sourceBriefType: z.string().optional(),
    }),
  },
});

// Deterministic save step — takes the structured output from the agent and persists it
const saveStep = createStep({
  id: 'save-artifact',
  description: 'Persist the generated artifact to the store',
  inputSchema: z.object({
    title: z.string(),
    artifactType: z.enum(['diagram', 'report', 'matrix', 'comparison', 'deck', 'dashboard']),
    format: z.enum(['mermaid', 'markdown', 'json', 'html']),
    content: z.string(),
    designRationale: z.string().optional(),
    stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
    sourceBriefType: z.string().optional(),
  }),
  outputSchema: z.object({
    saved: z.boolean(),
    id: z.string(),
    version: z.number(),
    title: z.string(),
    artifactType: z.string(),
    format: z.string(),
    content: z.string(),
    designRationale: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    const artifact = await saveArtifact({
      title: inputData.title,
      artifactType: inputData.artifactType as ArtifactType,
      format: inputData.format as ArtifactFormat,
      content: inputData.content,
      designRationale: inputData.designRationale,
      stakeholderLens: inputData.stakeholderLens as StakeholderLens | undefined,
      sourceBriefType: inputData.sourceBriefType,
    });
    return {
      saved: true,
      id: artifact.id,
      version: artifact.version,
      title: artifact.title,
      artifactType: artifact.artifactType,
      format: artifact.format,
      content: artifact.content,
      designRationale: artifact.designRationale,
    };
  },
});

export const artifactWorkflow = createWorkflow({
  id: 'artifact-generation',
  description: 'Generates research artifacts (briefs, diagrams, personas) from analyzed UX data: plans the artifact structure, generates content via the artifact agent, and saves versioned output.',
  inputSchema: WorkflowInput,
  outputSchema: z.object({
    saved: z.boolean(),
    id: z.string(),
    version: z.number(),
    title: z.string(),
    artifactType: z.string(),
    format: z.string(),
    content: z.string(),
    designRationale: z.string().optional(),
  }),
})
  .map(async ({ inputData }) => {
    const parts = [];
    if (inputData.briefType) {
      parts.push(`Use the "${inputData.briefType}" brief to fetch data.`);
    }
    if (inputData.audience && inputData.audience !== 'general') {
      parts.push(`Target audience: ${inputData.audience}.`);
    }
    parts.push(inputData.request);
    parts.push(
      'IMPORTANT: After generating the artifact, return a JSON object with title, artifactType, format, content, designRationale, stakeholderLens, and sourceBriefType. Do NOT call save-artifact — the workflow handles saving automatically.',
    );
    return { prompt: parts.join('\n\n') };
  })
  .then(generateStep)
  .then(saveStep)
  .commit();
