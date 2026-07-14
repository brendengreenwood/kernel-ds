import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { designAgent } from "./agents/design-agent.js";

export const mastra = new Mastra({
  agents: {
    designAgent,
  },
  logger: new PinoLogger({
    name: "kernel-studio-server",
    level: "info",
  }),
  server: {
    cors: {
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "x-mastra-client-type"],
      credentials: false,
    },
  },
});
