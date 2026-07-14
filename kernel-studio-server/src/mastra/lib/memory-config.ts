/**
 * Shared Memory Configuration
 *
 * Configures all three memory systems for agents:
 * - Working Memory: persistent structured state across threads
 * - Semantic Recall: vector search across past conversations
 * - Observational Memory: background compression of long sessions
 */
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

// Shared storage — same DB as the Mastra instance
const storage = new LibSQLStore({
  id: 'memory-storage',
  url: 'file:./mastra.db',
});

// Vector store for semantic recall
const vector = new LibSQLVector({
  id: 'memory-vector',
  url: 'file:./mastra.db',
});

// -- Working Memory Templates --

const RESEARCH_WORKING_MEMORY = `# Research Context
- Project:
- Domain:
- Active personas:
- Key tensions identified:
- Current research phase:
- Open questions:
- Transcripts analyzed:
- Last insight:`;

const ARTIFACT_WORKING_MEMORY = `# Artifact Context
- Preferred diagram style:
- Default audience:
- Generated artifacts count:
- Last brief type used:
- Stakeholder lens preference:
- Recurring themes:`;

// -- Memory Factory Functions --

export function createResearchMemory(): Memory {
  return new Memory({
    storage,
    vector,
    embedder: new ModelRouterEmbeddingModel('google/gemini-embedding-001'),
    options: {
      lastMessages: 5,

      semanticRecall: {
        topK: 3,
        messageRange: 2,
        scope: 'resource',
      },

      workingMemory: {
        enabled: true,
        template: RESEARCH_WORKING_MEMORY,
      },

      observationalMemory: {
        model: 'google/gemini-2.5-flash',
      },

      generateTitle: true,
    },
  });
}

export function createArtifactMemory(): Memory {
  return new Memory({
    storage,
    vector,
    embedder: new ModelRouterEmbeddingModel('google/gemini-embedding-001'),
    options: {
      lastMessages: 5,

      semanticRecall: {
        topK: 3,
        messageRange: 2,
        scope: 'resource',
      },

      workingMemory: {
        enabled: true,
        template: ARTIFACT_WORKING_MEMORY,
      },

      observationalMemory: {
        model: 'google/gemini-2.5-flash',
      },

      generateTitle: true,
    },
  });
}

export function createSupervisorMemory(): Memory {
  return new Memory({
    storage,
    vector,
    embedder: new ModelRouterEmbeddingModel('google/gemini-embedding-001'),
    options: {
      lastMessages: 5,

      semanticRecall: {
        topK: 5,
        messageRange: 3,
        scope: 'resource',
      },

      workingMemory: {
        enabled: true,
        template: `# Session Context
- Current task:
- Research status:
- Artifacts generated:
- Pending actions:`,
      },

      observationalMemory: {
        model: 'google/gemini-2.5-flash',
      },

      generateTitle: true,
    },
  });
}
