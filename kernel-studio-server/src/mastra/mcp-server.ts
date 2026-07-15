import { MCPServer } from '@mastra/mcp';
import { researchAgent } from './agents/research-agent';
import { artifactAgent } from './agents/artifact-agent';
import { supervisorAgent } from './agents/supervisor-agent';
import { cognitiveResearchWorkflow } from './workflows/cognitive-research-workflow';
import { artifactWorkflow } from './workflows/artifact-workflow';
import { fetchBriefTool } from './tools/artifact-tools';
import { getOntologyTool, queryRelationshipsTool, compareRolePerspectivesTool } from './tools/ontology-tool';
import { searchTranscriptsTool } from './tools/rag-tools';

export const mcpServer = new MCPServer({
  id: 'ux-research-mcp',
  name: 'UX Research & Artifact Server',
  version: '1.0.0',
  description: 'Exposes UX research agents, ontology tools, and artifact generation to MCP clients like Claude Desktop.',
  tools: {
    fetchBriefTool,
    getOntologyTool,
    queryRelationshipsTool,
    compareRolePerspectivesTool,
    searchTranscriptsTool,
  },
  agents: {
    researchAgent,
    artifactAgent,
    supervisorAgent,
  },
  workflows: {
    cognitiveResearchWorkflow,
    artifactWorkflow,
  },
});
