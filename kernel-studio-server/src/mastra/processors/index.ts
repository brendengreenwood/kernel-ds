/**
 * Processors for Research & Artifact Agents
 *
 * Input:
 * - PromptInjectionDetector: Protect against adversarial inputs
 * - ResearchQueryNormalizer: Standardize persona names and entity references
 *
 * Output:
 * - TokenLimiterProcessor: Ensure responses stay within budget
 */

import {
  PromptInjectionDetector,
  TokenLimiterProcessor,
  type InputProcessorOrWorkflow,
  type OutputProcessorOrWorkflow,
  type ProcessInputArgs,
  type ProcessInputResult,
} from '@mastra/core/processors';
import { rateLimitGuardProcessor } from '../lib/rate-limit-guard.js';

// ── Built-in: Prompt Injection Detection ──

export const promptInjectionDetector = new PromptInjectionDetector({
  model: 'anthropic/claude-haiku-3-5-20241022',
  threshold: 0.8,
  strategy: 'rewrite',
  detectionTypes: ['injection', 'jailbreak', 'system-override'],
});

// ── Built-in: Token Limiter ──

export const tokenLimiter = new TokenLimiterProcessor({
  limit: 4000,
  strategy: 'truncate',
});

// ── Custom: Research Query Normalizer ──
// Standardizes persona names and entity references in user messages

const PERSONA_ALIASES: Record<string, string> = {
  'grain merchant': 'merchant',
  'merchandiser': 'merchant',
  'originator': 'grain_origination_merchant',
  'grain origination manager': 'grain_origination_merchant',
  'grain origination': 'grain_origination_merchant',
  'customer service rep': 'csr',
  'customer service': 'csr',
  'service rep': 'csr',
  'sales admin': 'strategic_account_rep',
  'sales administrator': 'strategic_account_rep',
  'admin rep': 'strategic_account_rep',
};

export const researchQueryNormalizer = {
  id: 'research-query-normalizer' as const,
  async processInput(args: ProcessInputArgs): Promise<ProcessInputResult> {
    const { messages } = args;
    return messages.map(msg => {
      if (typeof msg.content !== 'object' || typeof (msg.content as any).content !== 'string') {
        return msg;
      }

      let normalized = (msg.content as any).content as string;

      for (const [alias, canonical] of Object.entries(PERSONA_ALIASES)) {
        const regex = new RegExp(`\\b${alias}\\b`, 'gi');
        normalized = normalized.replace(regex, canonical);
      }

      return {
        ...msg,
        content: {
          ...(msg.content as any),
          content: normalized,
        },
      };
    });
  },
};

// ── Processor sets for agents ──

export const researchInputProcessors: InputProcessorOrWorkflow[] = [
  rateLimitGuardProcessor,
  researchQueryNormalizer,
  promptInjectionDetector,
];

export const researchOutputProcessors: OutputProcessorOrWorkflow[] = [
  tokenLimiter,
];

export const artifactInputProcessors: InputProcessorOrWorkflow[] = [
  rateLimitGuardProcessor,
  promptInjectionDetector,
];

export const artifactOutputProcessors: OutputProcessorOrWorkflow[] = [
  tokenLimiter,
];
