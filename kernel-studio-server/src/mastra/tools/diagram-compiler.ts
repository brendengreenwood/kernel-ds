/**
 * Diagram Compiler — converts typed IR objects into valid Mermaid syntax.
 *
 * Pure functions: IR in, Mermaid string out. No LLM involved.
 */

import type {
  FlowchartIR,
  ERDiagramIR,
  SequenceDiagramIR,
  StateDiagramIR,
  PieChartIR,
  QuadrantChartIR,
  GanttChartIR,
  MindmapIR,
  XYChartIR,
  DiagramIR,
  NodeShape,
  LineType,
  ThemeConfig,
} from './diagram-ir.js';

// ─── Utilities ───────────────────────────────────────────────

/** Mermaid reserved words that cannot be used as bare node IDs */
const RESERVED = new Set([
  'end', 'subgraph', 'graph', 'flowchart', 'style', 'class', 'click',
  'default', 'linkstyle', 'classDef', 'direction', 'accTitle', 'accDescr',
]);

/** Sanitize a string into a safe Mermaid node ID */
function safeId(s: string): string {
  let id = s
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
  if (RESERVED.has(id.toLowerCase())) {
    id = `n_${id}`;
  }
  return id;
}

/** Escape a label for use inside Mermaid double-quotes */
function esc(s: string): string {
  return s.replace(/"/g, '#quot;').replace(/\n/g, '<br/>');
}

/** Generate frontmatter if config is provided */
function frontmatter(config?: ThemeConfig | null): string {
  if (!config) return '';
  const parts: string[] = [];
  if (config.theme) parts.push(`    theme: ${config.theme}`);
  if (config.look) parts.push(`    look: ${config.look}`);
  if (parts.length === 0) return '';
  return `---\nconfig:\n${parts.join('\n')}\n---\n`;
}

/** Build inline style for a node */
function nodeStyleLine(nodeId: string, style?: { fill?: string; stroke?: string; textColor?: string; strokeWidth?: number } | null): string {
  if (!style) return '';
  const props: string[] = [];
  if (style.fill) props.push(`fill:${style.fill}`);
  if (style.stroke) props.push(`stroke:${style.stroke}`);
  if (style.textColor) props.push(`color:${style.textColor}`);
  if (style.strokeWidth) props.push(`stroke-width:${style.strokeWidth}px`);
  if (props.length === 0) return '';
  return `    style ${nodeId} ${props.join(',')}`;
}

// ─── Node Shape Wrappers ─────────────────────────────────────

function wrapShape(id: string, label: string, shape?: NodeShape | null): string {
  const l = esc(label);
  switch (shape) {
    case 'rounded':       return `${id}("${l}")`;
    case 'stadium':       return `${id}(["${l}"])`;
    case 'circle':        return `${id}(("${l}"))`;
    case 'diamond':       return `${id}{"${l}"}`;
    case 'hexagon':       return `${id}{{"${l}"}}`;
    case 'parallelogram': return `${id}[/"${l}"/]`;
    case 'trapezoid':     return `${id}[/"${l}"\\]`;
    case 'cylinder':      return `${id}[("${l}")]`;
    case 'subroutine':    return `${id}[["${l}"]]`;
    case 'asymmetric':    return `${id}>"${l}"]`;
    case 'double-circle': return `${id}((("${l}")))`;
    case 'rectangle':
    default:              return `${id}["${l}"]`;
  }
}

// ─── Edge Arrow Syntax ───────────────────────────────────────

function edgeArrow(style?: { lineType?: LineType | null; arrowType?: string | null } | null): string {
  const line = style?.lineType;
  switch (line) {
    case 'dotted':  return '-.->';
    case 'dashed':  return '-.->';
    case 'thick':   return '==>';
    default:        return '-->';
  }
}

// ─── Flowchart ───────────────────────────────────────────────

export function compileFlowchart(ir: FlowchartIR): string {
  const direction = ir.config?.direction ?? 'TD';
  const lines: string[] = [];
  lines.push(frontmatter(ir.config));
  lines.push(`flowchart ${direction}`);

  const styles: string[] = [];

  // Subgraphs
  if (ir.subgraphs) {
    for (const sg of ir.subgraphs) {
      lines.push(`    subgraph ${safeId(sg.id)}["${esc(sg.label)}"]`);
      for (const nodeId of sg.nodeIds) {
        const node = ir.nodes.find(n => n.id === nodeId);
        if (node) {
          const sid = safeId(node.id);
          lines.push(`        ${wrapShape(sid, node.label, node.shape)}`);
          const s = nodeStyleLine(sid, node.style);
          if (s) styles.push(s);
        }
      }
      lines.push('    end');
    }
  }

  // Standalone nodes
  const subgraphNodeIds = new Set(ir.subgraphs?.flatMap(sg => sg.nodeIds) ?? []);
  for (const node of ir.nodes) {
    if (subgraphNodeIds.has(node.id)) continue;
    const sid = safeId(node.id);
    lines.push(`    ${wrapShape(sid, node.label, node.shape)}`);
    const s = nodeStyleLine(sid, node.style);
    if (s) styles.push(s);
  }

  // Edges
  for (const edge of ir.edges) {
    const arrow = edgeArrow(edge.style);
    const label = edge.label ? `|"${esc(edge.label)}"|` : '';
    lines.push(`    ${safeId(edge.from)} ${arrow}${label} ${safeId(edge.to)}`);
  }

  // Styles
  lines.push(...styles);

  return lines.join('\n');
}

// ─── ER Diagram ──────────────────────────────────────────────

function cardinalitySymbol(c: string): string {
  switch (c) {
    case 'one':          return '||';
    case 'zero-or-one':  return '|o';
    case 'many':         return '}|';
    case 'one-or-more':  return '}|';
    case 'zero-or-more': return '}o';
    default:             return '||';
  }
}

export function compileERDiagram(ir: ERDiagramIR): string {
  const lines: string[] = ['erDiagram'];

  for (const entity of ir.entities) {
    lines.push(`    ${safeId(entity.name)} {`);
    if (entity.attributes) {
      for (const attr of entity.attributes) {
        const key = attr.key ? ` ${attr.key}` : '';
        lines.push(`        ${attr.type} ${safeId(attr.name)}${key}`);
      }
    }
    lines.push('    }');
  }

  for (const rel of ir.relationships) {
    const from = cardinalitySymbol(rel.fromCardinality);
    const to = cardinalitySymbol(rel.toCardinality);
    lines.push(`    ${safeId(rel.from)} ${from}--${to} ${safeId(rel.to)} : "${esc(rel.label)}"`);
  }

  return lines.join('\n');
}

// ─── Sequence Diagram ────────────────────────────────────────

function seqArrow(type?: string | null): string {
  switch (type) {
    case 'dashed':  return '-->>';
    case 'reply':   return '-->>';
    case 'async':   return '->>+';
    default:        return '->>';
  }
}

interface SequenceBlock {
  type: string;
  condition?: string;
  messages: Array<{ from: string; to: string; label: string; type?: string }>;
  elseMessages?: Array<{ from: string; to: string; label: string; type?: string }>;
}

export function compileSequenceDiagram(ir: SequenceDiagramIR): string {
  const lines: string[] = ['sequenceDiagram'];

  // Declare actors
  for (const actor of ir.actors) {
    const keyword = actor.type === 'actor' ? 'actor' : 'participant';
    lines.push(`    ${keyword} ${safeId(actor.id)} as ${esc(actor.label)}`);
  }

  // Main messages
  for (const msg of ir.messages) {
    const arrow = seqArrow(msg.type);
    lines.push(`    ${safeId(msg.from)}${arrow}${safeId(msg.to)}: ${esc(msg.label)}`);
    if (msg.activate) lines.push(`    activate ${safeId(msg.to)}`);
    if (msg.deactivate) lines.push(`    deactivate ${safeId(msg.from)}`);
  }

  // Blocks (loop, alt, opt, par, etc.)
  if (ir.blocks) {
    for (const rawBlock of ir.blocks) {
      const block = rawBlock as SequenceBlock;
      const condition = block.condition ? ` ${esc(block.condition)}` : '';
      lines.push(`    ${block.type}${condition}`);
      for (const msg of block.messages) {
        const arrow = seqArrow(msg.type);
        lines.push(`        ${safeId(msg.from)}${arrow}${safeId(msg.to)}: ${esc(msg.label)}`);
      }
      if (block.elseMessages && block.elseMessages.length > 0) {
        lines.push('    else');
        for (const msg of block.elseMessages) {
          const arrow = seqArrow(msg.type);
          lines.push(`        ${safeId(msg.from)}${arrow}${safeId(msg.to)}: ${esc(msg.label)}`);
        }
      }
      lines.push('    end');
    }
  }

  // Notes
  if (ir.notes) {
    for (const note of ir.notes) {
      const pos = note.position ?? 'over';
      const overStr = note.over.map(safeId).join(',');
      if (pos === 'over') {
        lines.push(`    Note over ${overStr}: ${esc(note.text)}`);
      } else if (pos === 'left') {
        lines.push(`    Note left of ${overStr}: ${esc(note.text)}`);
      } else {
        lines.push(`    Note right of ${overStr}: ${esc(note.text)}`);
      }
    }
  }

  return lines.join('\n');
}

// ─── State Diagram ───────────────────────────────────────────

export function compileStateDiagram(ir: StateDiagramIR): string {
  const lines: string[] = ['stateDiagram-v2'];

  for (const state of ir.states) {
    if (state.type === 'start' || state.type === 'end') continue;
    if (state.type === 'fork' || state.type === 'join') {
      lines.push(`    state ${safeId(state.id)} <<fork>>`);
    } else if (state.type === 'choice') {
      lines.push(`    state ${safeId(state.id)} <<choice>>`);
    } else if (state.label && state.label !== state.id) {
      lines.push(`    state "${esc(state.label)}" as ${safeId(state.id)}`);
    }
  }

  for (const t of ir.transitions) {
    const from = ir.states.find(s => s.id === t.from);
    const to = ir.states.find(s => s.id === t.to);
    const fromStr = from?.type === 'start' ? '[*]' : safeId(t.from);
    const toStr = to?.type === 'end' ? '[*]' : safeId(t.to);
    if (t.label) {
      lines.push(`    ${fromStr} --> ${toStr} : ${esc(t.label)}`);
    } else {
      lines.push(`    ${fromStr} --> ${toStr}`);
    }
  }

  return lines.join('\n');
}

// ─── Pie Chart ───────────────────────────────────────────────

export function compilePieChart(ir: PieChartIR): string {
  const lines: string[] = [];
  lines.push(ir.showData ? 'pie showData' : 'pie');
  if (ir.title) lines.push(`    title ${esc(ir.title)}`);
  for (const slice of ir.slices) {
    lines.push(`    "${esc(slice.label)}" : ${slice.value}`);
  }
  return lines.join('\n');
}

// ─── Quadrant Chart ──────────────────────────────────────────

export function compileQuadrantChart(ir: QuadrantChartIR): string {
  const lines: string[] = ['quadrantChart'];
  if (ir.title) lines.push(`    title ${esc(ir.title)}`);
  lines.push(`    x-axis "${esc(ir.xAxisLabel)}"`);
  lines.push(`    y-axis "${esc(ir.yAxisLabel)}"`);
  if (ir.quadrant1) lines.push(`    quadrant-1 "${esc(ir.quadrant1)}"`);
  if (ir.quadrant2) lines.push(`    quadrant-2 "${esc(ir.quadrant2)}"`);
  if (ir.quadrant3) lines.push(`    quadrant-3 "${esc(ir.quadrant3)}"`);
  if (ir.quadrant4) lines.push(`    quadrant-4 "${esc(ir.quadrant4)}"`);
  for (const point of ir.points) {
    lines.push(`    "${esc(point.label)}": [${point.x.toFixed(2)}, ${point.y.toFixed(2)}]`);
  }
  return lines.join('\n');
}

// ─── Gantt Chart ─────────────────────────────────────────────

export function compileGanttChart(ir: GanttChartIR): string {
  const lines: string[] = ['gantt'];
  if (ir.title) lines.push(`    title ${esc(ir.title)}`);
  if (ir.dateFormat) lines.push(`    dateFormat ${ir.dateFormat}`);

  for (const section of ir.sections) {
    lines.push(`    section ${esc(section.name)}`);
    for (const task of section.tasks) {
      const meta: string[] = [];
      if (task.status) meta.push(task.status);
      if (task.id) meta.push(task.id);
      if (task.after) meta.push(`after ${task.after}`);
      else if (task.startDate) meta.push(task.startDate);
      if (task.duration) meta.push(task.duration);
      lines.push(`        ${esc(task.label)} : ${meta.join(', ')}`);
    }
  }

  return lines.join('\n');
}

// ─── Mindmap ─────────────────────────────────────────────────

interface MindmapNode {
  label: string;
  children?: MindmapNode[];
}

function compileMindmapNode(node: MindmapNode, depth: number): string[] {
  const indent = '    '.repeat(depth);
  const lines: string[] = [`${indent}${esc(node.label)}`];
  if (node.children) {
    for (const child of node.children) {
      lines.push(...compileMindmapNode(child, depth + 1));
    }
  }
  return lines;
}

export function compileMindmap(ir: MindmapIR): string {
  const lines: string[] = ['mindmap'];
  lines.push(...compileMindmapNode(ir.root as MindmapNode, 1));
  return lines.join('\n');
}

// ─── XY Chart ────────────────────────────────────────────────

export function compileXYChart(ir: XYChartIR): string {
  const lines: string[] = ['xychart-beta'];
  if (ir.title) lines.push(`    title "${esc(ir.title)}"`);

  const categories = ir.xAxis.values.map(v => `"${esc(v)}"`).join(', ');
  lines.push(`    x-axis [${categories}]`);

  if (ir.yAxis) {
    if (ir.yAxis.min !== undefined && ir.yAxis.max !== undefined) {
      const label = ir.yAxis.label ? `"${esc(ir.yAxis.label)}" ` : '';
      lines.push(`    y-axis ${label}${ir.yAxis.min} --> ${ir.yAxis.max}`);
    } else if (ir.yAxis.label) {
      lines.push(`    y-axis "${esc(ir.yAxis.label)}"`);
    }
  }

  for (const s of ir.series) {
    const data = s.data.join(', ');
    lines.push(`    ${s.type} [${data}]`);
  }

  return lines.join('\n');
}

// ─── Dispatcher ──────────────────────────────────────────────

export function compileDiagram(ir: DiagramIR): string {
  switch (ir.type) {
    case 'flowchart':       return compileFlowchart(ir);
    case 'erDiagram':       return compileERDiagram(ir);
    case 'sequenceDiagram': return compileSequenceDiagram(ir);
    case 'stateDiagram':    return compileStateDiagram(ir);
    case 'pie':             return compilePieChart(ir);
    case 'quadrantChart':   return compileQuadrantChart(ir);
    case 'gantt':           return compileGanttChart(ir);
    case 'mindmap':         return compileMindmap(ir);
    case 'xychart':         return compileXYChart(ir);
  }
}
