import { Agent } from '@mastra/core/agent';
import { createArtifactMemory } from '../lib/memory-config.js';
import { artifactInputProcessors, artifactOutputProcessors } from '../processors/index.js';

import { chooseModel } from '../lib/rate-limit-guard.js';

import {
  fetchBriefTool,
  generateMarkdownReportTool,
  generateMatrixTool,
  generateDeckTool,
  saveArtifactTool,
} from '../tools/artifact-tools.js';

import {
  generateFlowchartTool,
  generateERDiagramTool,
  generateSequenceDiagramTool,
  generateStateDiagramTool,
  generatePieChartTool,
  generateQuadrantChartTool,
  generateGanttChartTool,
  generateMindmapTool,
  generateXYChartTool,
} from '../tools/diagram-tools.js';

export const artifactAgent = new Agent({
  id: 'artifact-agent',
  name: 'Artifact Agent',
  description: 'Transforms UX research data into visual artifacts — diagrams, reports, matrices, and slide decks. Expert in information design, cognitive load theory, and stakeholder-appropriate visualization.',
  model: () => chooseModel(),
  instructions: `You are an expert in visual communication and information design. You transform UX research data into compelling diagrams, reports, and matrices.

## Key Rules

- Never exceed 12 primary nodes in one diagram — split if needed
- Every visual element must convey information — no decoration
- Group related items visually, use consistent color/shape for categories
- Title should state the key insight, not just the data source
- Always include design_rationale explaining your visualization choice

## Diagram Selection

| Data Shape | Tool |
|---|---|
| Entities + relationships | generate-er-diagram |
| Sequential flow with actors | generate-sequence-diagram |
| Process with branches | generate-flowchart |
| State transitions | generate-state-diagram |
| Role conflicts / tensions | generate-flowchart (subgraphs per role) |
| Timeline / roadmap | generate-gantt-chart |
| Priority / comparison | generate-quadrant-chart |
| Hierarchy / taxonomy | generate-mindmap |
| Proportional breakdown (≤8) | generate-pie-chart |
| Metrics / trends | generate-xy-chart |

## Workflow

1. Use fetch-brief to get curated data from the research system
2. Choose the best diagram type from the table above
3. Generate using the typed tool — provide structured JSON (nodes, edges, labels, styles)
4. Save with save-artifact including your design rationale

## Brief Types

entity-map, tension-map, tool-ecosystem, persona-comparison, persona-profile, feature-matrix, research-coverage, task-flow`,
  tools: {
    'fetch-brief': fetchBriefTool,
    'generate-flowchart': generateFlowchartTool,
    'generate-er-diagram': generateERDiagramTool,
    'generate-sequence-diagram': generateSequenceDiagramTool,
    'generate-state-diagram': generateStateDiagramTool,
    'generate-pie-chart': generatePieChartTool,
    'generate-quadrant-chart': generateQuadrantChartTool,
    'generate-gantt-chart': generateGanttChartTool,
    'generate-mindmap': generateMindmapTool,
    'generate-xy-chart': generateXYChartTool,
    'generate-markdown-report': generateMarkdownReportTool,
    'generate-matrix': generateMatrixTool,
    'generate-deck': generateDeckTool,
    'save-artifact': saveArtifactTool,
  },

  memory: createArtifactMemory(),
  inputProcessors: artifactInputProcessors,
  outputProcessors: artifactOutputProcessors,
});
