import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
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
import {
  getAllEntities,
  getAllTensions,
  getAllTools,
  getAllPocFeatures,
  getOpenQuestions,
  getTerminology,
} from '../storage/index.js';
import { getEvidenceForTarget } from '../storage/evidence-store.js';
import { getQuotesByPersona } from '../storage/quote-store.js';
import { listTranscripts } from '../storage/transcript-store.js';

// ─── Fetch Brief ─────────────────────────────────────────────

export const fetchBriefTool = createTool({
  id: 'fetch-brief',
  description: 'Fetch a curated brief from the research system. Briefs are pre-digested views of the ontology optimized for artifact generation. Available types: entity-map, tension-map, tool-ecosystem, persona-comparison, persona-profile, feature-matrix, research-coverage, task-flow.',
  inputSchema: z.object({
    briefType: z.enum([
      'entity-map', 'tension-map', 'tool-ecosystem',
      'persona-comparison', 'persona-profile', 'feature-matrix',
      'research-coverage', 'task-flow',
    ]),
    params: z.object({
      limit: z.number().optional(),
      minConnections: z.number().optional(),
      type: z.string().optional(),
      minEvidence: z.number().optional(),
      persona: z.string().optional(),
      personas: z.array(z.string()).optional(),
      sortBy: z.string().optional(),
      workflowName: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ briefType, params }) => {
    switch (briefType) {
      case 'entity-map': {
        const limit = params?.limit ?? 15;
        const minConnections = params?.minConnections ?? 0;
        const entities = await getAllEntities();
        const entityMap = new Map(entities.map(e => [e.id, e]));
        const enriched = await Promise.all(entities.map(async (e) => {
          const rels = e.relationships || [];
          const evidence = await getEvidenceForTarget('entity', e.id);
          return {
            id: e.id, name: e.name, type: e.type,
            connectionCount: rels.length,
            relationships: rels.map(r => ({
              targetId: r.targetId,
              targetName: entityMap.get(r.targetId)?.name || r.targetId,
              relation: r.relation, strength: r.strength,
            })),
            perspectives: e.perspectives ? Object.fromEntries(
              Object.entries(e.perspectives).map(([role, p]) => [role, {
                primaryConcern: p.primaryConcern, painPoints: p.painPoints,
              }])
            ) : undefined,
            evidenceCount: evidence.length,
          };
        }));
        return {
          briefType: 'entity-map',
          data: enriched
            .filter(e => e.connectionCount >= minConnections)
            .sort((a, b) => b.connectionCount - a.connectionCount)
            .slice(0, limit),
          totalEntities: entities.length,
        };
      }

      case 'tension-map': {
        const tensions = await getAllTensions();
        const minEvidence = params?.minEvidence ?? 0;
        const enriched = await Promise.all(tensions.map(async (t) => {
          const evidence = await getEvidenceForTarget('tension', t.id);
          return {
            id: t.id, description: t.description, tensionType: t.tensionType,
            roles: t.roles, entities: t.entities, status: t.status,
            evidenceCount: evidence.length + (t.evidence?.length || 0),
            implications: t.implications,
          };
        }));
        let filtered = enriched.filter(t => t.evidenceCount >= minEvidence);
        if (params?.type) filtered = filtered.filter(t => t.tensionType === params.type);
        filtered.sort((a, b) => b.evidenceCount - a.evidenceCount);
        return { briefType: 'tension-map', data: filtered, totalTensions: tensions.length };
      }

      case 'tool-ecosystem': {
        const tools = await getAllTools();
        const pocFeatures = await getAllPocFeatures();
        const persona = params?.persona;
        const toolBriefs = tools.map(t => {
          const personas = t.usageByPersona
            ? Object.entries(t.usageByPersona)
                .filter(([name]) => !persona || name === persona)
                .map(([name, usage]) => ({
                  name, frequency: usage.frequency,
                  sentiment: usage.sentiment, painPoints: usage.painPoints,
                }))
            : [];
          return {
            id: t.id, name: t.name, category: t.category,
            isInternal: t.isInternal, isPoc: t.isPoc,
            personas, integratesWith: t.integratesWith, replacedBy: t.replacedBy,
          };
        }).filter(t => !persona || t.personas.length > 0);
        return { briefType: 'tool-ecosystem', data: { tools: toolBriefs, pocFeatures } };
      }

      case 'persona-comparison': {
        const personas = params?.personas || [];
        const entities = await getAllEntities();
        const tensions = await getAllTensions();
        const profiles = personas.map(persona => {
          const relevant = entities.filter(e => e.perspectives && persona in e.perspectives);
          const relTensions = tensions.filter(t => t.roles.includes(persona));
          const painPoints = relevant.flatMap(e => e.perspectives?.[persona]?.painPoints || []);
          return {
            name: persona, entityCount: relevant.length, tensionCount: relTensions.length,
            topPainPoints: [...new Set(painPoints)].slice(0, 5),
          };
        });
        const shared = entities.filter(e => {
          if (!e.perspectives) return false;
          return personas.filter(p => p in e.perspectives!).length >= 2;
        }).map(e => ({
          entityName: e.name,
          perspectives: Object.fromEntries(
            personas.filter(p => e.perspectives?.[p]).map(p => [p, e.perspectives![p].primaryConcern])
          ),
        }));
        return { briefType: 'persona-comparison', data: { profiles, sharedEntities: shared } };
      }

      case 'persona-profile': {
        const persona = params?.persona || '';
        const [entities, tensions, tools, quotes] = await Promise.all([
          getAllEntities(), getAllTensions(), getAllTools(), getQuotesByPersona(persona),
        ]);
        return {
          briefType: 'persona-profile',
          data: {
            persona,
            coreEntities: entities.filter(e => e.perspectives?.[persona]).map(e => ({
              name: e.name, type: e.type,
              concern: e.perspectives![persona].primaryConcern,
              painPoints: e.perspectives![persona].painPoints,
            })),
            tensions: tensions.filter(t => t.roles.includes(persona)).map(t => ({
              description: t.description, type: t.tensionType, status: t.status,
            })),
            toolUsage: tools.filter(t => t.usageByPersona?.[persona]).map(t => ({
              toolName: t.name,
              frequency: t.usageByPersona![persona].frequency,
              sentiment: t.usageByPersona![persona].sentiment,
              painPoints: t.usageByPersona![persona].painPoints,
            })),
            topQuotes: quotes.slice(0, 10).map(q => ({ text: q.text, topic: q.topic })),
          },
        };
      }

      case 'feature-matrix': {
        const pocFeatures = await getAllPocFeatures();
        const scored = pocFeatures.map(f => {
          const benefits = f.benefitsByPersona || {};
          const personasAffected = Object.values(benefits).filter(b => b.benefitLevel !== 'none').length;
          const painPointsSolved = Object.values(benefits).reduce((sum, b) => sum + b.solvedPainPoints.length, 0);
          return {
            id: f.id, name: f.name, description: f.description, status: f.status,
            personasAffected, painPointsSolved, impactScore: personasAffected * 3 + painPointsSolved,
          };
        });
        scored.sort((a, b) => b.impactScore - a.impactScore);
        return { briefType: 'feature-matrix', data: scored };
      }

      case 'research-coverage': {
        const [entities, tensions, tools, pocFeatures, transcripts, openQuestions, terminology] = await Promise.all([
          getAllEntities(), getAllTensions(), getAllTools(), getAllPocFeatures(),
          listTranscripts(), getOpenQuestions(), getTerminology(),
        ]);
        const entityTypeBreakdown: Record<string, number> = {};
        for (const e of entities) entityTypeBreakdown[e.type] = (entityTypeBreakdown[e.type] || 0) + 1;
        const tensionStatusBreakdown: Record<string, number> = {};
        for (const t of tensions) tensionStatusBreakdown[t.status] = (tensionStatusBreakdown[t.status] || 0) + 1;
        return {
          briefType: 'research-coverage',
          data: {
            entityCount: entities.length, tensionCount: tensions.length,
            toolCount: tools.length, pocFeatureCount: pocFeatures.length,
            transcriptCount: transcripts.length, openQuestionCount: openQuestions.length,
            terminologyCount: Object.keys(terminology).length,
            entityTypeBreakdown, tensionStatusBreakdown,
          },
        };
      }

      case 'task-flow': {
        const workflowName = params?.workflowName || '';
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
        }).map(e => ({ name: e.name, type: e.type }));
        return {
          briefType: 'task-flow',
          data: {
            workflowName, relatedEntities,
            relatedTensions: tensions.filter(t => t.description.toLowerCase().includes(keyword))
              .map(t => ({ description: t.description, roles: t.roles })),
            relatedTools: tools.filter(t => t.name.toLowerCase().includes(keyword) || t.category.toLowerCase().includes(keyword))
              .map(t => ({ name: t.name, category: t.category })),
          },
        };
      }
    }
  },
});

// ─── Suggest Artifact ────────────────────────────────────────

export const suggestArtifactTool = createTool({
  id: 'suggest-artifact',
  description: 'Analyze intent and brief data to recommend the best artifact type, format, and stakeholder lens. Returns a recommendation with reasoning.',
  inputSchema: z.object({
    intent: z.string().describe('What the user wants to communicate or understand'),
    briefType: z.string().describe('Which brief was fetched'),
    dataShape: z.string().describe('Description of the data shape: entities with relationships, sequential workflow, tensions/conflicts, metrics/numbers, etc.'),
    audience: z.enum(['it_manager', 'product_manager', 'executive', 'design', 'general']).optional().default('general'),
    elementCount: z.number().optional().describe('Number of primary elements in the data'),
  }),
  execute: async ({ intent, briefType, dataShape, audience, elementCount }) => {
    const recommendations: Array<{
      artifactType: ArtifactType;
      format: ArtifactFormat;
      toolToCall: string;
      reasoning: string;
      shouldSplit: boolean;
    }> = [];

    // Decision logic based on data shape → map to typed diagram tools
    if (dataShape.includes('relationship') || dataShape.includes('entities')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: audience === 'executive' ? 'generate-mindmap' : 'generate-er-diagram',
        reasoning: audience === 'executive'
          ? 'Executive audience benefits from simplified mindmap over technical ER diagrams'
          : 'Entity-relationship diagram best shows connections and cardinality between domain concepts',
        shouldSplit: (elementCount || 0) > 12,
      });
    }

    if (dataShape.includes('workflow') || dataShape.includes('sequential') || dataShape.includes('process')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: dataShape.includes('actor') ? 'generate-sequence-diagram' : 'generate-flowchart',
        reasoning: dataShape.includes('actor')
          ? 'Sequence diagram shows temporal ordering and actor handoffs clearly'
          : 'Flowchart shows process flow with decision branches and loops',
        shouldSplit: false,
      });
    }

    if (dataShape.includes('tension') || dataShape.includes('conflict')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: 'generate-flowchart',
        reasoning: 'Color-coded flowchart with subgraphs per role effectively shows inter-role tensions and disputed entities. Use config.direction="LR", subgraphs per role, and styled conflict nodes.',
        shouldSplit: false,
      });
    }

    if (dataShape.includes('comparison') || dataShape.includes('prioritization')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: 'generate-quadrant-chart',
        reasoning: 'Quadrant chart positions items on 2 axes, revealing priority groupings naturally',
        shouldSplit: false,
      });
    }

    if (dataShape.includes('breakdown') || dataShape.includes('proportion')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: (elementCount || 0) <= 6 ? 'generate-pie-chart' : 'generate-xy-chart',
        reasoning: (elementCount || 0) <= 6
          ? 'Pie chart effectively shows proportional breakdown for small category counts'
          : 'Bar chart better than pie for 7+ categories — pie becomes unreadable',
        shouldSplit: false,
      });
    }

    if (dataShape.includes('timeline') || dataShape.includes('roadmap') || dataShape.includes('phases')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: 'generate-gantt-chart',
        reasoning: 'Gantt chart shows temporal phases, dependencies, and milestones',
        shouldSplit: false,
      });
    }

    if (dataShape.includes('hierarchy') || dataShape.includes('decomposition')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: 'generate-mindmap',
        reasoning: 'Mindmap shows parent-child relationships in freeform tree — intuitive for hierarchical data',
        shouldSplit: false,
      });
    }

    if (dataShape.includes('state') || dataShape.includes('lifecycle') || dataShape.includes('status')) {
      recommendations.push({
        artifactType: 'diagram',
        format: 'mermaid',
        toolToCall: 'generate-state-diagram',
        reasoning: 'State diagram shows transitions between states — ideal for lifecycle and status workflows',
        shouldSplit: false,
      });
    }

    // If no specific diagram match, recommend based on brief type
    if (recommendations.length === 0) {
      if (briefType === 'research-coverage') {
        recommendations.push({
          artifactType: 'report',
          format: 'markdown',
          toolToCall: 'generate-markdown-report',
          reasoning: 'Research coverage is best communicated as a structured report with metrics and gap analysis.',
          shouldSplit: false,
        });
      } else if (briefType === 'feature-matrix') {
        recommendations.push({
          artifactType: 'matrix',
          format: 'json',
          toolToCall: 'generate-matrix',
          reasoning: 'Feature comparison is most effective as a structured matrix with color-coded impact cells.',
          shouldSplit: false,
        });
      } else if (briefType === 'persona-profile') {
        recommendations.push({
          artifactType: 'report',
          format: 'markdown',
          toolToCall: 'generate-markdown-report',
          reasoning: 'Persona profiles require narrative structure with quotes and context — best as markdown report.',
          shouldSplit: false,
        });
      } else {
        recommendations.push({
          artifactType: 'diagram',
          format: 'mermaid',
          toolToCall: 'generate-flowchart',
          reasoning: 'Default to flowchart for general data visualization — most versatile diagram type.',
          shouldSplit: (elementCount || 0) > 12,
        });
      }
    }

    return {
      recommendations,
      splitWarning: (elementCount || 0) > 12
        ? `Data has ${elementCount} elements — exceeds 12-element cognitive limit. Consider splitting into multiple artifacts.`
        : null,
      lensAdvice: audience !== 'general'
        ? `Applying ${audience} lens: adjust language, visual density, and emphasis accordingly.`
        : 'No specific audience lens — using general-purpose design principles.',
    };
  },
});

// ─── Generate Markdown Report ────────────────────────────────

export const generateMarkdownReportTool = createTool({
  id: 'generate-markdown-report',
  description: 'Generate a structured Markdown report following inverted-pyramid structure: key finding first, evidence below.',
  inputSchema: z.object({
    title: z.string(),
    markdown: z.string().describe('Complete markdown content'),
    designRationale: z.string(),
    stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  }),
  execute: async ({ title, markdown, designRationale, stakeholderLens }) => {
    return {
      title,
      format: 'markdown' as const,
      artifactType: 'report' as const,
      content: markdown,
      designRationale,
      stakeholderLens,
    };
  },
});

// ─── Generate Matrix ─────────────────────────────────────────

export const generateMatrixTool = createTool({
  id: 'generate-matrix',
  description: 'Generate a structured JSON matrix for table rendering. Rows and columns with typed cells.',
  inputSchema: z.object({
    title: z.string(),
    columns: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(['text', 'number', 'status', 'list']).optional(),
    })),
    rows: z.array(z.record(z.string(), z.unknown())),
    designRationale: z.string(),
    stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  }),
  execute: async ({ title, columns, rows, designRationale, stakeholderLens }) => {
    return {
      title,
      format: 'json' as const,
      artifactType: 'matrix' as const,
      content: JSON.stringify({ columns, rows }, null, 2),
      designRationale,
      stakeholderLens,
    };
  },
});

// ─── Generate Deck ───────────────────────────────────────────

export const generateDeckTool = createTool({
  id: 'generate-deck',
  description: 'Generate a Markdown slide deck with one-insight-per-slide structure. Each slide has a visual anchor and 3-line takeaway.',
  inputSchema: z.object({
    title: z.string(),
    slides: z.array(z.object({
      heading: z.string(),
      content: z.string().describe('Markdown content for this slide'),
      speakerNotes: z.string().optional(),
    })),
    designRationale: z.string(),
    stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  }),
  execute: async ({ title, slides, designRationale, stakeholderLens }) => {
    const markdown = slides.map((s, i) =>
      `---\n\n## ${s.heading}\n\n${s.content}${s.speakerNotes ? `\n\n<!-- Speaker notes: ${s.speakerNotes} -->` : ''}`
    ).join('\n\n');
    return {
      title,
      format: 'markdown' as const,
      artifactType: 'deck' as const,
      content: markdown,
      designRationale,
      stakeholderLens,
    };
  },
});

// ─── Save Artifact ───────────────────────────────────────────

export const saveArtifactTool = createTool({
  id: 'save-artifact',
  description: 'Save an artifact to the store with full metadata including design rationale.',
  inputSchema: z.object({
    title: z.string(),
    artifactType: z.enum(['diagram', 'report', 'matrix', 'comparison', 'deck', 'dashboard']),
    format: z.enum(['mermaid', 'markdown', 'json', 'html']),
    content: z.string(),
    designRationale: z.string().optional(),
    sourceBriefType: z.string().optional(),
    stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
    tags: z.array(z.string()).optional(),
    parentId: z.string().optional(),
  }),
  execute: async ({ title, artifactType, format, content, designRationale, sourceBriefType, stakeholderLens, tags, parentId }) => {
    const artifact = await saveArtifact({
      title,
      artifactType: artifactType as ArtifactType,
      format: format as ArtifactFormat,
      content,
      designRationale,
      sourceBriefType,
      stakeholderLens: stakeholderLens as StakeholderLens | undefined,
      tags,
      parentId,
    });
    return { saved: true, id: artifact.id, version: artifact.version };
  },
});

// ─── List Artifacts ──────────────────────────────────────────

export const listArtifactsTool = createTool({
  id: 'list-artifacts',
  description: 'List all artifacts with optional filters by type, format, lens, or tags.',
  inputSchema: z.object({
    artifactType: z.enum(['diagram', 'report', 'matrix', 'comparison', 'deck', 'dashboard']).optional(),
    format: z.enum(['mermaid', 'markdown', 'json', 'html']).optional(),
    stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  }),
  execute: async ({ artifactType, format, stakeholderLens }) => {
    const artifacts = await listArtifacts({
      artifactType: artifactType as ArtifactType | undefined,
      format: format as ArtifactFormat | undefined,
      stakeholderLens: stakeholderLens as StakeholderLens | undefined,
    });
    return {
      count: artifacts.length,
      artifacts: artifacts.map(a => ({
        id: a.id, title: a.title, artifactType: a.artifactType,
        format: a.format, version: a.version,
        stakeholderLens: a.stakeholderLens, tags: a.tags,
        createdAt: a.createdAt, updatedAt: a.updatedAt,
      })),
    };
  },
});

// ─── Get Artifact ────────────────────────────────────────────

export const getArtifactTool = createTool({
  id: 'get-artifact',
  description: 'Retrieve a single artifact by ID, including full content and design rationale.',
  inputSchema: z.object({
    id: z.string(),
  }),
  execute: async ({ id }) => {
    const artifact = await getArtifact(id);
    if (!artifact) return { found: false, error: `Artifact ${id} not found` };
    return { found: true, artifact };
  },
});

// ─── Update Artifact ─────────────────────────────────────────

export const updateArtifactTool = createTool({
  id: 'update-artifact',
  description: 'Update an existing artifact. Creates a new version by default, linked to the original.',
  inputSchema: z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    designRationale: z.string().optional(),
    tags: z.array(z.string()).optional(),
    createNewVersion: z.boolean().optional().default(true),
  }),
  execute: async ({ id, title, content, designRationale, tags, createNewVersion }) => {
    const updated = await updateArtifact(id, { title, content, designRationale, tags }, createNewVersion);
    if (!updated) return { success: false, error: `Artifact ${id} not found` };
    return { success: true, id: updated.id, version: updated.version, parentId: updated.parentId };
  },
});

// ─── Delete Artifact ─────────────────────────────────────────

export const deleteArtifactTool = createTool({
  id: 'delete-artifact',
  description: 'Delete an artifact by ID.',
  inputSchema: z.object({
    id: z.string(),
  }),
  execute: async ({ id }) => {
    const deleted = await deleteArtifact(id);
    return { success: deleted };
  },
});

// ─── Get Artifact History ────────────────────────────────────

export const getArtifactHistoryTool = createTool({
  id: 'get-artifact-history',
  description: 'Walk the version chain of an artifact to see all previous versions.',
  inputSchema: z.object({
    id: z.string(),
  }),
  execute: async ({ id }) => {
    const history = await getArtifactHistory(id);
    return {
      count: history.length,
      versions: history.map(a => ({
        id: a.id, title: a.title, version: a.version,
        parentId: a.parentId, createdAt: a.createdAt,
        designRationale: a.designRationale,
      })),
    };
  },
});
