/**
 * Rate Limit Guard — Processor + Utility
 *
 * Proactively prevents 30K input tokens/min org rate limit from firing.
 *
 * How it works:
 * 1. RateLimitGuardProcessor (processInputStep): estimates input token count
 *    at each agentic loop step, records usage, and dynamically switches to
 *    fallback model when budget pressure is detected.
 * 2. chooseModel(): standalone function for agent model config — returns
 *    fallback model during cooldown.
 * 3. recordRateLimitHit(): call externally if a 429 is caught.
 */

import type {
  ProcessInputStepArgs,
  ProcessInputStepResult,
} from '@mastra/core/processors';

const PRIMARY_MODEL = 'anthropic/claude-sonnet-4-20250514';
const FALLBACK_MODEL = 'anthropic/claude-3-5-haiku-20241022';
const COOLDOWN_MS = 65_000;
const TOKEN_LIMIT_PER_MINUTE = 200_000;
const BUDGET_THRESHOLD = 0.8; // switch at 80% usage (160K)

let lastRateLimitHit = 0;
const tokenLog: { timestamp: number; tokens: number }[] = [];

/** Call when a 429 rate limit error is caught externally */
export function recordRateLimitHit(): void {
  lastRateLimitHit = Date.now();
  console.log(`[rate-limit-guard] 429 hit. Falling back to ${FALLBACK_MODEL} for ${COOLDOWN_MS / 1000}s`);
}

/** Record token usage for rolling window tracking */
export function recordTokenUsage(tokens: number): void {
  tokenLog.push({ timestamp: Date.now(), tokens });
  const cutoff = Date.now() - COOLDOWN_MS;
  while (tokenLog.length > 0 && tokenLog[0].timestamp < cutoff) {
    tokenLog.shift();
  }
}

/** Get tokens used in the last 60 seconds */
export function getRecentTokenUsage(): number {
  const cutoff = Date.now() - 60_000;
  return tokenLog
    .filter(e => e.timestamp >= cutoff)
    .reduce((sum, e) => sum + e.tokens, 0);
}

/** Check if we're in cooldown */
export function isInCooldown(): boolean {
  if (Date.now() - lastRateLimitHit < COOLDOWN_MS) return true;
  return getRecentTokenUsage() > TOKEN_LIMIT_PER_MINUTE * BUDGET_THRESHOLD;
}

/** Choose model — use as agent model config */
export function chooseModel(): string {
  if (isInCooldown()) {
    return FALLBACK_MODEL;
  }
  return PRIMARY_MODEL;
}

/** Rough token estimate: ~4 chars per token */
function estimateTokens(messages: Array<{ content: unknown }>, systemMessages?: unknown[]): number {
  let charCount = 0;
  for (const msg of messages) {
    if (typeof msg.content === 'string') {
      charCount += msg.content.length;
    } else if (typeof msg.content === 'object' && msg.content !== null) {
      charCount += JSON.stringify(msg.content).length;
    }
  }
  if (systemMessages) {
    charCount += JSON.stringify(systemMessages).length;
  }
  return Math.ceil(charCount / 4);
}

/**
 * Rate Limit Guard Processor
 *
 * Runs at each step of the agentic loop. Estimates input tokens,
 * records usage, and switches to fallback model if budget pressure detected.
 */
export const rateLimitGuardProcessor = {
  id: 'rate-limit-guard' as const,

  async processInputStep(
    args: ProcessInputStepArgs,
  ): Promise<ProcessInputStepResult | undefined> {
    const { messages, systemMessages } = args;
    const estimatedTokens = estimateTokens(messages, systemMessages);

    recordTokenUsage(estimatedTokens);

    const recentUsage = getRecentTokenUsage();
    if (recentUsage > TOKEN_LIMIT_PER_MINUTE * BUDGET_THRESHOLD) {
      console.log(
        `[rate-limit-guard] Budget pressure: ${recentUsage}/${TOKEN_LIMIT_PER_MINUTE} tokens in window. Switching to ${FALLBACK_MODEL}`,
      );
      return { model: FALLBACK_MODEL };
    }

    return undefined;
  },
};
