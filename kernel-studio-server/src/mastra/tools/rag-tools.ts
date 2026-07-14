/**
 * RAG Tools for Research Agent
 *
 * Semantic search across indexed transcripts.
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { indexTranscript, searchTranscripts, getIndexStats } from '../rag/transcript-rag.js';

export const searchTranscriptsTool = createTool({
  id: 'search-transcripts',
  description: 'Semantic search across indexed transcript chunks. Returns relevant passages ranked by similarity.',
  inputSchema: z.object({
    query: z.string().describe('Natural language search query'),
    topK: z.number().optional().default(5).describe('Number of results to return'),
    persona: z.string().optional().describe('Filter by persona (merchant, gom, csr, sar)'),
    transcriptId: z.string().optional().describe('Filter by specific transcript ID'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      text: z.string(),
      score: z.number(),
      transcriptId: z.string(),
      persona: z.string(),
      source: z.string(),
    })),
    query: z.string(),
    totalResults: z.number(),
  }),
  execute: async ({ query, topK, persona, transcriptId }) => {
    const results = await searchTranscripts({
      query,
      topK,
      filter: {
        persona: persona || undefined,
        transcriptId: transcriptId || undefined,
      },
    });

    return {
      results: results.map(r => ({
        text: r.text,
        score: r.score,
        transcriptId: (r.metadata.transcriptId as string) || '',
        persona: (r.metadata.persona as string) || '',
        source: (r.metadata.source as string) || '',
      })),
      query,
      totalResults: results.length,
    };
  },
});

export const indexTranscriptTool = createTool({
  id: 'index-transcript',
  description: 'Index a transcript into the vector store for semantic search. Call this after ingesting a new transcript.',
  inputSchema: z.object({
    transcriptId: z.string(),
    content: z.string(),
    persona: z.string(),
    source: z.string(),
    topics: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    indexed: z.boolean(),
    chunksIndexed: z.number(),
    transcriptId: z.string(),
  }),
  execute: async ({ transcriptId, content, persona, source, topics }) => {
    const result = await indexTranscript({
      transcriptId,
      content,
      persona,
      source,
      topics,
    });

    return {
      indexed: true,
      chunksIndexed: result.chunksIndexed,
      transcriptId,
    };
  },
});

export const ragStatsTool = createTool({
  id: 'rag-index-stats',
  description: 'Check if the transcript vector index exists and has data.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    exists: z.boolean(),
    description: z.string(),
  }),
  execute: async () => {
    return await getIndexStats();
  },
});
