/**
 * RAG Pipeline for Transcript Semantic Search
 *
 * Indexes transcript content into vector store for semantic retrieval.
 * Replaces keyword-based transcript search with embedding-powered search.
 */

import { embedMany, embed } from 'ai';
import { MDocument } from '@mastra/rag';
import { LibSQLVector } from '@mastra/libsql';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

const INDEX_NAME = 'transcript_chunks';

// Shared vector store — same DB as the Mastra instance
const vector = new LibSQLVector({
  id: 'rag-vector',
  url: 'file:./mastra.db',
});

// Lazy-init embedder so missing API key doesn't crash on import
let _embedder: ModelRouterEmbeddingModel | null = null;
function getEmbedder(): ModelRouterEmbeddingModel {
  if (!_embedder) {
    _embedder = new ModelRouterEmbeddingModel('google/gemini-embedding-001');
  }
  return _embedder;
}

/**
 * Index a transcript into the vector store.
 * Chunks the content and stores embeddings with metadata.
 */
export async function indexTranscript(opts: {
  transcriptId: string;
  content: string;
  persona: string;
  source: string;
  date?: string;
  topics?: string[];
}): Promise<{ chunksIndexed: number }> {
  const doc = MDocument.fromText(opts.content);

  const chunks = await doc.chunk({
    strategy: 'recursive',
    maxSize: 512,
    overlap: 50,
  });

  if (chunks.length === 0) {
    return { chunksIndexed: 0 };
  }

  const { embeddings } = await embedMany({
    values: chunks.map(chunk => chunk.text),
    model: getEmbedder(),
  });

  // Build metadata for each chunk
  const metadata = chunks.map((_chunk, i) => ({
    transcriptId: opts.transcriptId,
    persona: opts.persona,
    source: opts.source,
    date: opts.date || new Date().toISOString(),
    topics: opts.topics?.join(',') || '',
    chunkIndex: i,
  }));

  await vector.upsert({
    indexName: INDEX_NAME,
    vectors: embeddings,
    metadata,
  });

  return { chunksIndexed: chunks.length };
}

/**
 * Search indexed transcripts by semantic similarity.
 */
export async function searchTranscripts(opts: {
  query: string;
  topK?: number;
  filter?: {
    persona?: string;
    transcriptId?: string;
  };
}): Promise<Array<{
  text: string;
  score: number;
  metadata: Record<string, any>;
}>> {
  const { embedding } = await embed({
    value: opts.query,
    model: getEmbedder(),
  });

  const filter: Record<string, any> = {};
  if (opts.filter?.persona) filter.persona = opts.filter.persona;
  if (opts.filter?.transcriptId) filter.transcriptId = opts.filter.transcriptId;

  const results = await vector.query({
    indexName: INDEX_NAME,
    queryVector: embedding,
    topK: opts.topK || 5,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  });

  return results.map(r => ({
    text: r.metadata?.text as string || '',
    score: r.score || 0,
    metadata: r.metadata || {},
  }));
}

/**
 * Check if the vector index exists and has data.
 */
export async function getIndexStats(): Promise<{ exists: boolean; description: string }> {
  const indexes = await vector.listIndexes();
  const exists = indexes.includes(INDEX_NAME);
  return {
    exists,
    description: exists ? `Index "${INDEX_NAME}" exists` : `Index "${INDEX_NAME}" not found`,
  };
}
