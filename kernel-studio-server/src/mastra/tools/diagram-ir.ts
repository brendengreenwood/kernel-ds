/**
 * Diagram Intermediate Representation (IR) Schemas
 *
 * LLM outputs structured JSON → deterministic compiler → valid Mermaid syntax.
 */

import { z } from 'zod';

// ─── Shared Primitives ──────────────────────────────────────

export const NodeShapeSchema = z.enum([
  'rectangle', 'rounded', 'circle', 'diamond', 'hexagon',
  'parallelogram', 'cylinder', 'stadium', 'subroutine',
  'asymmetric', 'trapezoid', 'double-circle',
]);
export type NodeShape = z.infer<typeof NodeShapeSchema>;

export const LineTypeSchema = z.enum(['solid', 'dotted', 'dashed', 'thick']);
export type LineType = z.infer<typeof LineTypeSchema>;

export const ArrowTypeSchema = z.enum(['arrow', 'open', 'circle', 'cross', 'none']);
export type ArrowType = z.infer<typeof ArrowTypeSchema>;

export const DirectionSchema = z.enum(['TD', 'LR', 'RL', 'BT']);
export type Direction = z.infer<typeof DirectionSchema>;

export const ThemeSchema = z.enum(['default', 'forest', 'dark', 'neutral']);
export type Theme = z.infer<typeof ThemeSchema>;

export const LookSchema = z.enum(['classic', 'handDrawn']);
export type Look = z.infer<typeof LookSchema>;

export const NodeStyleSchema = z.object({
  fill: z.string().optional(),
  stroke: z.string().optional(),
  textColor: z.string().optional(),
  strokeWidth: z.number().optional(),
}).optional();
export type NodeStyle = z.infer<typeof NodeStyleSchema>;

export const EdgeStyleSchema = z.object({
  lineType: LineTypeSchema.optional(),
  arrowType: ArrowTypeSchema.optional(),
  stroke: z.string().optional(),
}).optional();
export type EdgeStyle = z.infer<typeof EdgeStyleSchema>;

export const ThemeConfigSchema = z.object({
  theme: ThemeSchema.optional(),
  look: LookSchema.optional(),
  direction: DirectionSchema.optional(),
}).optional();
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// ─── Flowchart IR ───────────────────────────────────────────

export const FlowchartNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  shape: NodeShapeSchema.optional(),
  style: NodeStyleSchema,
});

export const FlowchartEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  style: EdgeStyleSchema,
});

export const FlowchartSubgraphSchema = z.object({
  id: z.string(),
  label: z.string(),
  nodeIds: z.array(z.string()),
  style: NodeStyleSchema,
});

export const FlowchartIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  config: ThemeConfigSchema,
  nodes: z.array(FlowchartNodeSchema).min(1),
  edges: z.array(FlowchartEdgeSchema),
  subgraphs: z.array(FlowchartSubgraphSchema).optional(),
});
export type FlowchartIR = z.infer<typeof FlowchartIRSchema>;

// ─── ER Diagram IR ──────────────────────────────────────────

export const CardinalitySchema = z.enum([
  'one', 'zero-or-one', 'many', 'one-or-more', 'zero-or-more',
]);

export const ERAttributeSchema = z.object({
  name: z.string(),
  type: z.string(),
  key: z.enum(['PK', 'FK', 'UK']).optional(),
});

export const EREntitySchema = z.object({
  name: z.string(),
  attributes: z.array(ERAttributeSchema).optional(),
});

export const ERRelationshipSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
  fromCardinality: CardinalitySchema,
  toCardinality: CardinalitySchema,
});

export const ERDiagramIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  entities: z.array(EREntitySchema).min(1),
  relationships: z.array(ERRelationshipSchema),
});
export type ERDiagramIR = z.infer<typeof ERDiagramIRSchema>;

// ─── Sequence Diagram IR ────────────────────────────────────

export const SequenceActorSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['participant', 'actor']).optional(),
});

export const MessageTypeSchema = z.enum(['solid', 'dashed', 'reply', 'async']);

export const SequenceMessageSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
  type: MessageTypeSchema.optional(),
  activate: z.boolean().optional(),
  deactivate: z.boolean().optional(),
});

export const SequenceNoteSchema = z.object({
  over: z.array(z.string()),
  text: z.string(),
  position: z.enum(['left', 'right', 'over']).optional(),
});

export const SequenceBlockSchema: z.ZodType = z.object({
  type: z.enum(['loop', 'alt', 'opt', 'par', 'critical']),
  condition: z.string().optional(),
  messages: z.array(z.lazy(() => SequenceMessageSchema)),
  elseMessages: z.array(z.lazy(() => SequenceMessageSchema)).optional(),
});

export const SequenceDiagramIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  actors: z.array(SequenceActorSchema).min(1),
  messages: z.array(SequenceMessageSchema),
  notes: z.array(SequenceNoteSchema).optional(),
  blocks: z.array(SequenceBlockSchema).optional(),
});
export type SequenceDiagramIR = z.infer<typeof SequenceDiagramIRSchema>;

// ─── State Diagram IR ──────────────────────────────────────

export const StateDiagramStateSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  type: z.enum(['normal', 'start', 'end', 'fork', 'join', 'choice']).optional(),
});

export const StateDiagramTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});

export const StateDiagramIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  states: z.array(StateDiagramStateSchema).min(1),
  transitions: z.array(StateDiagramTransitionSchema),
});
export type StateDiagramIR = z.infer<typeof StateDiagramIRSchema>;

// ─── Pie Chart IR ──────────────────────────────────────────

export const PieSliceSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const PieChartIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  showData: z.boolean().optional(),
  slices: z.array(PieSliceSchema).min(1),
});
export type PieChartIR = z.infer<typeof PieChartIRSchema>;

// ─── Quadrant Chart IR ─────────────────────────────────────

export const QuadrantPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  label: z.string(),
});

export const QuadrantChartIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  xAxisLabel: z.string(),
  yAxisLabel: z.string(),
  quadrant1: z.string().optional(),
  quadrant2: z.string().optional(),
  quadrant3: z.string().optional(),
  quadrant4: z.string().optional(),
  points: z.array(QuadrantPointSchema).min(1),
});
export type QuadrantChartIR = z.infer<typeof QuadrantChartIRSchema>;

// ─── Gantt Chart IR ────────────────────────────────────────

export const GanttTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(['done', 'active', 'crit', 'milestone']).optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  after: z.string().optional(),
});

export const GanttSectionSchema = z.object({
  name: z.string(),
  tasks: z.array(GanttTaskSchema).min(1),
});

export const GanttChartIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  dateFormat: z.string().optional(),
  sections: z.array(GanttSectionSchema).min(1),
});
export type GanttChartIR = z.infer<typeof GanttChartIRSchema>;

// ─── Mindmap IR ────────────────────────────────────────────

export const MindmapNodeSchema: z.ZodType = z.object({
  id: z.string(),
  label: z.string(),
  children: z.array(z.lazy(() => MindmapNodeSchema)).optional(),
});

export const MindmapIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  root: MindmapNodeSchema,
});
export type MindmapIR = z.infer<typeof MindmapIRSchema>;

// ─── XY Chart IR ───────────────────────────────────────────

export const XYSeriesSchema = z.object({
  type: z.enum(['bar', 'line']),
  name: z.string().optional(),
  data: z.array(z.number()),
});

export const XYChartIRSchema = z.object({
  title: z.string(),
  designRationale: z.string(),
  stakeholderLens: z.enum(['it_manager', 'product_manager', 'executive', 'design']).optional(),
  xAxis: z.object({
    label: z.string().optional(),
    values: z.array(z.string()),
  }),
  yAxis: z.object({
    label: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  series: z.array(XYSeriesSchema).min(1),
});
export type XYChartIR = z.infer<typeof XYChartIRSchema>;

// ─── Union Type ────────────────────────────────────────────

export const DiagramIRSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('flowchart'), ...FlowchartIRSchema.shape }),
  z.object({ type: z.literal('erDiagram'), ...ERDiagramIRSchema.shape }),
  z.object({ type: z.literal('sequenceDiagram'), ...SequenceDiagramIRSchema.shape }),
  z.object({ type: z.literal('stateDiagram'), ...StateDiagramIRSchema.shape }),
  z.object({ type: z.literal('pie'), ...PieChartIRSchema.shape }),
  z.object({ type: z.literal('quadrantChart'), ...QuadrantChartIRSchema.shape }),
  z.object({ type: z.literal('gantt'), ...GanttChartIRSchema.shape }),
  z.object({ type: z.literal('mindmap'), ...MindmapIRSchema.shape }),
  z.object({ type: z.literal('xychart'), ...XYChartIRSchema.shape }),
]);
export type DiagramIR = z.infer<typeof DiagramIRSchema>;
