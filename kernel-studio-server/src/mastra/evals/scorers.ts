/**
 * Custom Scorers for Research & Artifact Quality
 *
 * 1. Insight Novelty — Does the research finding add new info vs existing ontology?
 * 2. Evidence Strength — Is the insight backed by sufficient transcript evidence?
 * 3. Diagram Quality — Does the generated diagram follow cognitive load principles?
 */

import { createScorer } from '@mastra/core/evals';

// ── 1. Insight Novelty Scorer ──
// Measures whether agent responses contain genuinely new information
// vs rehashing what's already in the ontology.

export const insightNoveltyScorer = createScorer({
  id: 'insight-novelty',
  description: 'Scores how much new information an agent response contributes beyond existing ontology knowledge.',
  type: 'agent',
})
  .preprocess(({ run }) => {
    const content =
      typeof run.output === 'string'
        ? run.output
        : Array.isArray(run.output)
          ? run.output.map((m: any) => m.content || '').join(' ')
          : '';

    // Extract phrases that indicate novel vs repetitive content
    const noveltyIndicators = [
      'new', 'discovered', 'unexpected', 'surprising', 'contradiction',
      'previously unknown', 'emerging', 'first time', 'novel',
    ];
    const repetitionIndicators = [
      'as mentioned', 'already known', 'confirms', 'consistent with',
      'previously identified', 'as expected', 'aligns with',
    ];

    const contentLower = content.toLowerCase();
    const novelHits = noveltyIndicators.filter(w => contentLower.includes(w)).length;
    const repetitionHits = repetitionIndicators.filter(w => contentLower.includes(w)).length;

    return { content, novelHits, repetitionHits, contentLength: content.length };
  })
  .generateScore(({ results }) => {
    const { novelHits, repetitionHits, contentLength } = results.preprocessStepResult;

    // No content → 0 score
    if (contentLength === 0) return 0;

    // Score based on ratio of novel to repetitive indicators
    const totalHits = novelHits + repetitionHits;
    if (totalHits === 0) return 0.5; // No signals → neutral

    const noveltyRatio = novelHits / totalHits;

    // Scale: 0 (all repetitive) → 1 (all novel)
    return Math.round(noveltyRatio * 100) / 100;
  })
  .generateReason(({ run, results, score }) => {
    const { novelHits, repetitionHits } = results.preprocessStepResult;

    if (score >= 0.7) {
      return `High novelty: ${novelHits} novel indicators vs ${repetitionHits} repetitive. Response contributes new insights.`;
    } else if (score >= 0.4) {
      return `Mixed novelty: ${novelHits} novel vs ${repetitionHits} repetitive. Some new information mixed with existing knowledge.`;
    } else {
      return `Low novelty: ${novelHits} novel vs ${repetitionHits} repetitive. Response mostly rehashes existing ontology.`;
    }
  });

// ── 2. Evidence Strength Scorer ──
// Measures whether claims are backed by transcript references.

export const evidenceStrengthScorer = createScorer({
  id: 'evidence-strength',
  description: 'Scores how well agent responses are backed by transcript evidence and citations.',
  type: 'agent',
})
  .preprocess(({ run }) => {
    const content =
      typeof run.output === 'string'
        ? run.output
        : Array.isArray(run.output)
          ? run.output.map((m: any) => m.content || '').join(' ')
          : '';

    // Count evidence signals
    const quotePattern = /[""].+?[""]|'.+?'/g;
    const transcriptRefPattern = /transcript[-_]\w+/gi;
    const citationPattern = /\[.+?\]/g;
    const evidenceKeywords = ['evidence', 'quote', 'said', 'stated', 'mentioned', 'reported', 'observed'];

    const quotes = (content.match(quotePattern) || []).length;
    const transcriptRefs = (content.match(transcriptRefPattern) || []).length;
    const citations = (content.match(citationPattern) || []).length;
    const keywords = evidenceKeywords.filter(w => content.toLowerCase().includes(w)).length;

    // Count claims (sentences with assertions)
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 10).length;

    return { quotes, transcriptRefs, citations, keywords, sentences };
  })
  .generateScore(({ results }) => {
    const { quotes, transcriptRefs, citations, keywords, sentences } = results.preprocessStepResult;

    if (sentences === 0) return 0;

    // Evidence density = (evidence signals) / (total claims)
    const evidenceSignals = quotes + transcriptRefs + citations + keywords;
    const density = evidenceSignals / sentences;

    // Cap at 1.0, scale so 0.5 signals/sentence = 1.0
    return Math.min(1.0, Math.round(density * 200) / 100);
  })
  .generateReason(({ results }) => {
    const { quotes, transcriptRefs, citations, keywords, sentences } = results.preprocessStepResult;
    const total = quotes + transcriptRefs + citations + keywords;
    return `Found ${total} evidence signals (${quotes} quotes, ${transcriptRefs} transcript refs, ${citations} citations, ${keywords} keywords) across ${sentences} claims.`;
  });

// ── 3. Diagram Quality Scorer ──
// Measures whether a generated diagram follows cognitive load principles.

export const diagramQualityScorer = createScorer({
  id: 'diagram-quality',
  description: 'Scores diagram quality based on cognitive load theory: element count, labeling, structure.',
  type: 'agent',
})
  .preprocess(({ run }) => {
    const content =
      typeof run.output === 'string'
        ? run.output
        : Array.isArray(run.output)
          ? run.output.map((m: any) => m.content || '').join(' ')
          : '';

    // Extract Mermaid content if present
    const mermaidMatch = content.match(/```mermaid\n([\s\S]*?)```/) || content.match(/^(graph|flowchart|erDiagram|sequenceDiagram|stateDiagram|pie|gantt|mindmap|xychart|quadrantChart)/m);
    const mermaidContent = mermaidMatch ? (mermaidMatch[1] || mermaidMatch[0]) : content;

    if (!mermaidContent || mermaidContent.length < 10) {
      return { isDiagram: false, nodeCount: 0, edgeCount: 0, hasLabels: false, hasTitle: false, lineCount: 0 };
    }

    const lines = mermaidContent.split('\n').filter((l: string) => l.trim().length > 0);

    // Count nodes (lines with brackets, parentheses, or definitions)
    const nodePattern = /\w+[\[\(\{<]/g;
    const nodeCount = (mermaidContent.match(nodePattern) || []).length;

    // Count edges (lines with arrows)
    const edgePattern = /-->|---|-\.-|==>|-.->|-->/g;
    const edgeCount = (mermaidContent.match(edgePattern) || []).length;

    // Check for labels on edges
    const labeledEdgePattern = /-->?\|.+?\|/g;
    const labeledEdges = (mermaidContent.match(labeledEdgePattern) || []).length;
    const hasLabels = labeledEdges > 0 || edgeCount === 0;

    // Check for title
    const hasTitle = /title\s+/i.test(mermaidContent) || /---\n.*title:/m.test(mermaidContent);

    return {
      isDiagram: true,
      nodeCount,
      edgeCount,
      hasLabels,
      hasTitle,
      lineCount: lines.length,
      labeledEdgeRatio: edgeCount > 0 ? labeledEdges / edgeCount : 1,
    };
  })
  .generateScore(({ results }) => {
    const { isDiagram, nodeCount, edgeCount, hasLabels, hasTitle, labeledEdgeRatio } = results.preprocessStepResult;

    if (!isDiagram) return 0;

    let score = 0;

    // Cognitive Load: 4±1 chunks rule
    // Ideal: 3-5 nodes, acceptable: 6-8, penalty: 9+
    if (nodeCount >= 3 && nodeCount <= 5) score += 0.3;
    else if (nodeCount >= 1 && nodeCount <= 8) score += 0.2;
    else if (nodeCount > 8 && nodeCount <= 12) score += 0.1;
    // 0 nodes or 12+ nodes: 0 points

    // Data-Ink Ratio: edges should carry meaning (labels)
    score += (labeledEdgeRatio || 0) * 0.25;

    // Has meaningful labels
    if (hasLabels) score += 0.15;

    // Has title
    if (hasTitle) score += 0.15;

    // Non-trivial diagram (not just a single node)
    if (edgeCount > 0) score += 0.15;

    return Math.min(1.0, Math.round(score * 100) / 100);
  })
  .generateReason(({ results, score }) => {
    const { isDiagram, nodeCount, edgeCount, hasLabels, hasTitle } = results.preprocessStepResult;

    if (!isDiagram) return 'No diagram content detected in response.';

    const parts = [`${nodeCount} nodes, ${edgeCount} edges.`];
    if (nodeCount > 8) parts.push('Warning: may exceed cognitive load (4±1 chunks).');
    if (!hasLabels) parts.push('Missing edge labels reduces data-ink ratio.');
    if (!hasTitle) parts.push('Missing title.');
    if (score >= 0.7) parts.push('Good diagram structure.');
    else if (score >= 0.4) parts.push('Acceptable but could improve.');
    else parts.push('Needs significant improvement.');

    return parts.join(' ');
  });
