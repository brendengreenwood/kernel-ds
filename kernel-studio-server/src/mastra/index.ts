import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { Observability, DefaultExporter, SensitiveDataFilter } from "@mastra/observability";
import { designAgent } from "./agents/design-agent.js";
import { toolsmithAgent } from "./agents/toolsmith-agent.js";
import { cognitiveResearchWorkflow } from "./workflows/cognitive-research-workflow";
import { artifactWorkflow } from "./workflows/artifact-workflow";
import { researchAgent } from "./agents/research-agent";
import { artifactAgent } from "./agents/artifact-agent";
import { supervisorAgent } from "./agents/supervisor-agent";
import { insightNoveltyScorer, evidenceStrengthScorer, diagramQualityScorer } from "./evals/scorers";
import { initDb, seedIfEmpty, seedPersonasIfEmpty } from "./storage/index";
import { briefRoutes } from "./routes/brief-routes";
import { artifactRoutes } from "./routes/artifact-routes";
import { viewerRoutes } from "./routes/viewer-routes";
import { mcpServer } from "./mcp-server.js";

// Initialize research database (creates tables, seeds default ontology)
const dbReady = initDb().then(() => seedIfEmpty()).then(() => seedPersonasIfEmpty());
dbReady.catch(err => console.error('Failed to initialize research database:', err));

export { dbReady };

export const mastra = new Mastra({
  workflows: { cognitiveResearchWorkflow, artifactWorkflow },
  agents: { designAgent, toolsmithAgent, researchAgent, artifactAgent, supervisorAgent },
  scorers: { insightNoveltyScorer, evidenceStrengthScorer, diagramQualityScorer },
  mcpServers: { mcpServer },
  server: {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "x-mastra-client-type"],
      credentials: false,
    },
    apiRoutes: [
      ...briefRoutes,
      ...artifactRoutes,
      ...viewerRoutes,
    ],
  },
  storage: new LibSQLStore({
    id: "mastra-storage",
    // stores observability, scores, ... into persistent file storage
    url: "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: "kernel-studio-server",
    level: "info",
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new DefaultExporter(), // Persists traces to local storage for Mastra Studio
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
