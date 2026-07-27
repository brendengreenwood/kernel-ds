The Mastra runtime. index.ts is the config hub — it registers agents, tools, workflows, and storage
Changing a tool signature ripples to the agents here AND the portal chat bridge — keep contracts stable

agents/ — toolsmith (authors object-model + workspace definitions against the ds-bundle), design, research, artifact, supervisor
tools/ — grouped by concern: define-tools (validate/write definitions), ds-bundle-tools (read component docs/design docs), diagram (ir + compiler + tools), artifact, brief, cognition, observation, ontology, persona, quote, rag, transcript. Colocated *.test.ts
workflows/ — artifact-workflow, cognitive-research-workflow (step-based, suspend/resume)
storage/ — libsql-backed stores (db.ts + artifact/evidence/observation/ontology/persona/quote/snapshot/transcript). Colocated *.test.ts
rag/ — transcript-rag (semantic recall)
processors/ — input/output processors on the agent pipeline
evals/ — eval harnesses
routes/, public/ — server routes + static assets
mcp-server.ts — MCP server exposing studio capabilities

Model: agents use an Anthropic Claude model via @ai-sdk/anthropic
Tests: run the focused *.test.ts nearest your change first (e.g. npx vitest run src/mastra/tools/lens-tools.test.ts), then npm test. Typecheck with npm run check
Definition writes must pass validateDefinition before writeDefinition persists them to the portal (../../ kernel-portal/public/definitions) — the write path is manifest-idempotent
