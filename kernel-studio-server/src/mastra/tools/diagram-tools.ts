/**
 * Typed Diagram Generation Tools
 *
 * Each tool accepts a Zod-validated IR schema, compiles to Mermaid syntax.
 */

import { createTool } from '@mastra/core/tools';

import {
  FlowchartIRSchema,
  ERDiagramIRSchema,
  SequenceDiagramIRSchema,
  StateDiagramIRSchema,
  PieChartIRSchema,
  QuadrantChartIRSchema,
  GanttChartIRSchema,
  MindmapIRSchema,
  XYChartIRSchema,
} from './diagram-ir.js';

import {
  compileFlowchart,
  compileERDiagram,
  compileSequenceDiagram,
  compileStateDiagram,
  compilePieChart,
  compileQuadrantChart,
  compileGanttChart,
  compileMindmap,
  compileXYChart,
} from './diagram-compiler.js';

export const generateFlowchartTool = createTool({
  id: 'generate-flowchart',
  description: 'Generate a flowchart from nodes, edges, and optional subgraphs.',
  inputSchema: FlowchartIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, config, nodes, edges, subgraphs }) => {
    const content = compileFlowchart({ title, designRationale, stakeholderLens, config, nodes, edges, subgraphs });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'flowchart', content, designRationale, stakeholderLens };
  },
});

export const generateERDiagramTool = createTool({
  id: 'generate-er-diagram',
  description: 'Generate an ER diagram from entities with attributes and relationships.',
  inputSchema: ERDiagramIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, entities, relationships }) => {
    const content = compileERDiagram({ title, designRationale, stakeholderLens, entities, relationships });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'erDiagram', content, designRationale, stakeholderLens };
  },
});

export const generateSequenceDiagramTool = createTool({
  id: 'generate-sequence-diagram',
  description: 'Generate a sequence diagram from actors, messages, and optional blocks.',
  inputSchema: SequenceDiagramIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, actors, messages, blocks, notes }) => {
    const content = compileSequenceDiagram({ title, designRationale, stakeholderLens, actors, messages, blocks, notes });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'sequenceDiagram', content, designRationale, stakeholderLens };
  },
});

export const generateStateDiagramTool = createTool({
  id: 'generate-state-diagram',
  description: 'Generate a state diagram from states and transitions.',
  inputSchema: StateDiagramIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, states, transitions }) => {
    const content = compileStateDiagram({ title, designRationale, stakeholderLens, states, transitions });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'stateDiagram-v2', content, designRationale, stakeholderLens };
  },
});

export const generatePieChartTool = createTool({
  id: 'generate-pie-chart',
  description: 'Generate a pie chart from labeled slices with values.',
  inputSchema: PieChartIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, showData, slices }) => {
    const content = compilePieChart({ title, designRationale, stakeholderLens, showData, slices });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'pie', content, designRationale, stakeholderLens };
  },
});

export const generateQuadrantChartTool = createTool({
  id: 'generate-quadrant-chart',
  description: 'Generate a quadrant chart with axis labels and data points (x/y 0-1).',
  inputSchema: QuadrantChartIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, xAxisLabel, yAxisLabel, quadrant1, quadrant2, quadrant3, quadrant4, points }) => {
    const content = compileQuadrantChart({ title, designRationale, stakeholderLens, xAxisLabel, yAxisLabel, quadrant1, quadrant2, quadrant3, quadrant4, points });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'quadrantChart', content, designRationale, stakeholderLens };
  },
});

export const generateGanttChartTool = createTool({
  id: 'generate-gantt-chart',
  description: 'Generate a Gantt chart from sections with tasks.',
  inputSchema: GanttChartIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, dateFormat, sections }) => {
    const content = compileGanttChart({ title, designRationale, stakeholderLens, dateFormat, sections });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'gantt', content, designRationale, stakeholderLens };
  },
});

export const generateMindmapTool = createTool({
  id: 'generate-mindmap',
  description: 'Generate a mindmap from a recursive tree of nodes.',
  inputSchema: MindmapIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, root }) => {
    const content = compileMindmap({ title, designRationale, stakeholderLens, root });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'mindmap', content, designRationale, stakeholderLens };
  },
});

export const generateXYChartTool = createTool({
  id: 'generate-xy-chart',
  description: 'Generate a bar/line chart from categories and data series.',
  inputSchema: XYChartIRSchema,
  execute: async ({ title, designRationale, stakeholderLens, xAxis, yAxis, series }) => {
    const content = compileXYChart({ title, designRationale, stakeholderLens, xAxis, yAxis, series });
    return { title, format: 'mermaid' as const, artifactType: 'diagram' as const, diagramType: 'xychart-beta', content, designRationale, stakeholderLens };
  },
});
