import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { MDocument } from '@mastra/rag';
import {
  getTranscript, upsertTranscript, listTranscripts,
  getAllPersonas,
  type TranscriptRow,
} from '../storage/index.js';
import { indexTranscript } from '../rag/transcript-rag.js';

/** Dynamic persona ID — accepts any string from the persona taxonomy. */
export const Persona = z.string().describe('Persona ID from the persona taxonomy (e.g. "merchant", "merchant:crush-plant")');

export type PersonaType = string;

/** Fetch persona labels dynamically from the database. Falls back to using ID as label. */
export async function getPersonaLabels(): Promise<Record<string, string>> {
  const personas = await getAllPersonas();
  const labels: Record<string, string> = {};
  for (const p of personas) {
    labels[p.id] = p.label;
  }
  return labels;
}

const ResearchClassification = z.object({
  dataType: z.enum(['attitudinal', 'behavioral']),
  methodology: z.enum(['qualitative', 'quantitative', 'mixed']),
  phase: z.enum(['discovery', 'definition', 'validation', 'iteration']),
  confidence: z.number().min(0).max(1),
});

const TranscriptMetadata = z.object({
  id: z.string(),
  source: z.string(),
  persona: Persona.describe('The role/persona of the participant'),
  participantId: z.string().optional().describe('Anonymous identifier for the participant'),
  context: z.string().optional(),
  date: z.string().optional(),
  duration: z.number().optional(),
});

const ProcessedTranscript = z.object({
  metadata: TranscriptMetadata,
  classification: ResearchClassification,
  rawContent: z.string(),
  segments: z.array(z.object({
    speaker: z.string(),
    content: z.string(),
    timestamp: z.string().optional(),
    topics: z.array(z.string()).optional(),
  })).optional(),
  extractedTopics: z.array(z.string()),
  keyQuotes: z.array(z.object({
    text: z.string(),
    speaker: z.string(),
    relevance: z.string(),
  })).optional(),
});

function transcriptRowToProcessed(row: TranscriptRow): z.infer<typeof ProcessedTranscript> {
  return {
    metadata: {
      id: row.id,
      source: row.source,
      persona: row.persona as PersonaType,
      participantId: row.participantId,
      context: row.context,
      date: row.date,
      duration: row.duration,
    },
    classification: row.classification as z.infer<typeof ResearchClassification>,
    rawContent: row.rawContent,
    segments: row.segments,
    extractedTopics: row.extractedTopics,
    keyQuotes: row.keyQuotes,
  };
}

export const ingestTranscriptTool = createTool({
  id: 'ingest-transcript',
  description: 'Ingest raw research data (transcript, field notes, session recording notes) and prepare for analysis',
  inputSchema: z.object({
    content: z.string().describe('Raw transcript or research notes content'),
    metadata: TranscriptMetadata,
  }),
  outputSchema: z.object({
    id: z.string(),
    wordCount: z.number(),
    estimatedSegments: z.number(),
    ready: z.boolean(),
  }),
  execute: async ({ content, metadata }) => {
    const wordCount = content.split(/\s+/).length;
    const estimatedSegments = content.split(/\n\n+/).length;

    const row: TranscriptRow = {
      id: metadata.id,
      source: metadata.source,
      persona: metadata.persona,
      participantId: metadata.participantId,
      context: metadata.context,
      date: metadata.date,
      duration: metadata.duration,
      classification: {
        dataType: 'attitudinal',
        methodology: 'qualitative',
        phase: 'discovery',
        confidence: 0.5,
      },
      rawContent: content,
      extractedTopics: [],
    };

    await upsertTranscript(row);

    return {
      id: metadata.id,
      wordCount,
      estimatedSegments,
      ready: true,
    };
  },
});


export const classifyTranscriptTool = createTool({
  id: 'classify-transcript',
  description: 'Classify research data by type (attitudinal/behavioral), methodology (qual/quant), and research phase. This is the "Motivation" step in cognitive processing.',
  inputSchema: z.object({
    transcriptId: z.string(),
    classification: ResearchClassification,
    reasoning: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    classification: ResearchClassification,
    processingRecommendation: z.string(),
  }),
  execute: async ({ transcriptId, classification }) => {
    const row = await getTranscript(transcriptId);
    if (!row) throw new Error(`Transcript ${transcriptId} not found`);

    row.classification = classification;
    await upsertTranscript(row);

    let recommendation = '';
    if (classification.dataType === 'attitudinal' && classification.methodology === 'qualitative') {
      recommendation = 'Deep thematic analysis recommended. Apply JTBD and Mental Model lenses.';
    } else if (classification.dataType === 'behavioral') {
      recommendation = 'Task flow analysis recommended. Apply Task Analysis lens.';
    } else if (classification.phase === 'discovery') {
      recommendation = 'Exploratory analysis. Apply OOUX lens to extract entities and relationships.';
    } else {
      recommendation = 'Validation analysis. Compare against existing ontology for confirmation or contradiction.';
    }

    return {
      success: true,
      classification,
      processingRecommendation: recommendation,
    };
  },
});

export const extractTopicsTool = createTool({
  id: 'extract-topics',
  description: 'Extract main topics and themes from transcript content',
  inputSchema: z.object({
    transcriptId: z.string(),
    topics: z.array(z.string()),
    keyQuotes: z.array(z.object({
      text: z.string(),
      speaker: z.string(),
      relevance: z.string(),
    })).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    topicCount: z.number(),
    quoteCount: z.number(),
  }),
  execute: async ({ transcriptId, topics, keyQuotes }) => {
    const row = await getTranscript(transcriptId);
    if (!row) throw new Error(`Transcript ${transcriptId} not found`);

    row.extractedTopics = topics;
    row.keyQuotes = keyQuotes;
    await upsertTranscript(row);

    return {
      success: true,
      topicCount: topics.length,
      quoteCount: keyQuotes?.length || 0,
    };
  },
});

export const getTranscriptTool = createTool({
  id: 'get-transcript',
  description: 'Retrieve a processed transcript by ID',
  inputSchema: z.object({
    transcriptId: z.string(),
  }),
  outputSchema: ProcessedTranscript,
  execute: async ({ transcriptId }) => {
    const row = await getTranscript(transcriptId);
    if (!row) throw new Error(`Transcript ${transcriptId} not found`);
    return transcriptRowToProcessed(row);
  },
});

export const listTranscriptsTool = createTool({
  id: 'list-transcripts',
  description: 'List all ingested transcripts with their classifications. Can filter by persona.',
  inputSchema: z.object({
    filterByPersona: Persona.optional().describe('Filter transcripts to a specific persona'),
  }),
  outputSchema: z.object({
    count: z.number(),
    transcripts: z.array(z.object({
      id: z.string(),
      source: z.string(),
      persona: Persona,
      personaLabel: z.string(),
      classification: ResearchClassification,
      topicCount: z.number(),
    })),
  }),
  execute: async ({ filterByPersona }) => {
    const PERSONA_LABELS = await getPersonaLabels();
    const rows = await listTranscripts(filterByPersona);

    const result = rows.map(t => ({
      id: t.id,
      source: t.source,
      persona: t.persona as PersonaType,
      personaLabel: PERSONA_LABELS[t.persona] || t.persona,
      classification: t.classification as z.infer<typeof ResearchClassification>,
      topicCount: t.extractedTopics.length,
    }));
    return { count: result.length, transcripts: result };
  },
});

// ── Preprocessing Tool ──
// Heavy lifter: stores, indexes, and deeply analyzes a transcript in one call.
// Returns a rich structured summary so the agent never needs the raw text in context.

const DOMAIN_TOPICS = [
  'pricing', 'basis', 'futures', 'contract', 'elevator', 'delivery',
  'hedge', 'risk', 'market', 'timing', 'storage', 'quality', 'grade',
  'producer', 'customer', 'account', 'relationship', 'position',
  'margin', 'spread', 'offer', 'bid', 'logistics', 'rail', 'barge',
  'truck', 'drying', 'shrink', 'moisture', 'protein', 'test weight',
] as const;

const SIGNAL_PHRASES = [
  'the problem is', 'i wish', 'we always', 'we never', 'pain point',
  'frustrating', 'workaround', 'hack', 'wish list', 'ideal',
  'what if', 'it would be nice', 'struggle', 'bottleneck', 'gap',
  'broken', 'manual', 'spreadsheet', 'error', 'wrong', 'confused',
] as const;

export const preprocessTranscriptTool = createTool({
  id: 'preprocess-transcript',
  description:
    'Store, index, and deeply analyze a transcript in one call. ' +
    'Returns a rich structured summary (topics, speakers, key quotes, classification hint, segments). ' +
    'Call this FIRST when you receive a transcript — it replaces ingest-transcript + index-transcript.',
  inputSchema: z.object({
    content: z.string().describe('Full raw transcript text'),
    source: z.string().describe('Where this transcript came from'),
    persona: Persona.describe('Role of the participant'),
    participantId: z.string().optional().describe('Anonymous participant identifier'),
    context: z.string().optional().describe('Session context notes'),
    date: z.string().optional().describe('Session date (ISO)'),
    duration: z.number().optional().describe('Session duration in minutes'),
  }),
  outputSchema: z.object({
    transcriptId: z.string(),
    stats: z.object({
      wordCount: z.number(),
      segmentCount: z.number(),
      chunkCount: z.number(),
      speakerCount: z.number(),
    }),
    speakers: z.array(z.string()),
    detectedTopics: z.array(z.string()),
    classificationHint: z.object({
      dataType: z.enum(['attitudinal', 'behavioral']),
      methodology: z.enum(['qualitative', 'quantitative', 'mixed']),
      phase: z.enum(['discovery', 'definition', 'validation', 'iteration']),
      reasoning: z.string(),
    }),
    keyQuoteCandidates: z.array(z.object({
      text: z.string(),
      speaker: z.string(),
      reason: z.string(),
    })),
    segmentSummaries: z.array(z.object({
      index: z.number(),
      speaker: z.string(),
      preview: z.string(),
      topicHits: z.array(z.string()),
    })),
    stored: z.boolean(),
    indexed: z.boolean(),
  }),
  execute: async ({ content, source, persona, participantId, context, date, duration }) => {
    const transcriptId = `transcript-${persona}-${Date.now()}`;
    const wordCount = content.split(/\s+/).length;

    // ── 1. Parse segments (speaker turns) ──
    const segmentPattern = /^(?:([A-Z][A-Za-z\s.]+?)\s*[:\-–—])\s*/gm;
    const rawSegments: Array<{ speaker: string; content: string }> = [];
    let lastIndex = 0;
    let lastSpeaker = 'Unknown';

    for (const match of content.matchAll(segmentPattern)) {
      if (match.index! > lastIndex && lastIndex > 0) {
        rawSegments.push({
          speaker: lastSpeaker,
          content: content.slice(lastIndex, match.index!).trim(),
        });
      }
      lastSpeaker = match[1].trim();
      lastIndex = match.index! + match[0].length;
    }
    // Capture final segment
    if (lastIndex < content.length) {
      rawSegments.push({
        speaker: lastSpeaker,
        content: content.slice(lastIndex).trim(),
      });
    }
    // If no speakers detected, treat whole text as one segment
    if (rawSegments.length === 0) {
      rawSegments.push({ speaker: 'Unknown', content });
    }

    const speakers = [...new Set(rawSegments.map(s => s.speaker))];

    // ── 2. Detect domain topics ──
    const contentLower = content.toLowerCase();
    const detectedTopics = DOMAIN_TOPICS.filter(t => contentLower.includes(t));

    // ── 3. Classification hint ──
    const behavioralSignals = ['timing', 'delivery', 'position', 'hedge', 'logistics'].filter(
      t => contentLower.includes(t),
    );
    const attitudinalSignals = ['wish', 'frustrat', 'ideal', 'problem', 'pain', 'struggle'].filter(
      t => contentLower.includes(t),
    );
    const hasNumbers = /\d+%|\$\d+|\d+\s*(bushels?|tons?|loads?)/i.test(content);

    const dataType: 'attitudinal' | 'behavioral' = behavioralSignals.length > attitudinalSignals.length ? 'behavioral' : 'attitudinal';
    const methodology: 'qualitative' | 'quantitative' | 'mixed' = hasNumbers ? 'mixed' : 'qualitative';
    const phase: 'discovery' | 'definition' | 'validation' | 'iteration' = detectedTopics.length <= 3 ? 'discovery' : 'definition';
    const reasoning = [
      `${behavioralSignals.length} behavioral vs ${attitudinalSignals.length} attitudinal signals`,
      hasNumbers ? 'contains quantitative data' : 'qualitative only',
      `${detectedTopics.length} domain topics detected`,
    ].join('; ');

    // ── 4. Extract key quote candidates ──
    const keyQuoteCandidates: Array<{ text: string; speaker: string; reason: string }> = [];

    for (const seg of rawSegments) {
      const lines = seg.content.split(/[.!?]\s+/).filter(l => l.length > 20);
      for (const line of lines) {
        const lineLower = line.toLowerCase();
        const matchedPhrase = SIGNAL_PHRASES.find(p => lineLower.includes(p));
        if (matchedPhrase) {
          keyQuoteCandidates.push({
            text: line.slice(0, 200),
            speaker: seg.speaker,
            reason: `Contains signal phrase: "${matchedPhrase}"`,
          });
        }
      }
    }
    // Cap at 15 quotes to keep the summary bounded
    keyQuoteCandidates.splice(15);

    // ── 5. Build segment summaries ──
    const segmentSummaries = rawSegments.slice(0, 30).map((seg, i) => {
      const segLower = seg.content.toLowerCase();
      return {
        index: i,
        speaker: seg.speaker,
        preview: seg.content.slice(0, 150) + (seg.content.length > 150 ? '…' : ''),
        topicHits: DOMAIN_TOPICS.filter(t => segLower.includes(t)) as string[],
      };
    });

    // ── 6. Store in SQLite ──
    const row: TranscriptRow = {
      id: transcriptId,
      source,
      persona,
      participantId,
      context,
      date,
      duration,
      classification: {
        dataType,
        methodology,
        phase,
        confidence: 0.5,
      },
      rawContent: content,
      segments: rawSegments.slice(0, 50).map(s => ({
        speaker: s.speaker,
        content: s.content,
      })),
      extractedTopics: detectedTopics as string[],
      keyQuotes: keyQuoteCandidates.map(q => ({
        text: q.text,
        speaker: q.speaker,
        relevance: q.reason,
      })),
    };
    await upsertTranscript(row);

    // ── 7. Index into vector store for RAG ──
    const { chunksIndexed } = await indexTranscript({
      transcriptId,
      content,
      persona,
      source,
      date,
      topics: detectedTopics as string[],
    });

    return {
      transcriptId,
      stats: {
        wordCount,
        segmentCount: rawSegments.length,
        chunkCount: chunksIndexed,
        speakerCount: speakers.length,
      },
      speakers,
      detectedTopics: detectedTopics as string[],
      classificationHint: { dataType, methodology, phase, reasoning },
      keyQuoteCandidates,
      segmentSummaries,
      stored: true,
      indexed: chunksIndexed > 0,
    };
  },
});
