import { Injectable } from '@nestjs/common';
import {
  OptimizerExplanationContext,
  RecommendationSummaryContext,
} from '../interfaces/ai.interface';

@Injectable()
export class ContextBuilderService {
  /**
   * Builds a structured natural-language context for optimizer explanations.
   * This is injected into the AI prompt so it explains DETERMINISTIC outputs.
   */
  buildOptimizerContext(ctx: OptimizerExplanationContext): string {
    const alternatives = ctx.alternatives
      .slice(0, 2)
      .map(a => `  - ${a.cardName}: ${a.tradeoffNote}`)
      .join('\n');

    const warnings = ctx.warnings.length > 0
      ? `Warnings: ${ctx.warnings.join('; ')}`
      : 'No warnings.';

    return `
TRANSACTION DETAILS (Deterministic — Do NOT alter these numbers):
- Merchant: ${ctx.merchantName}
- Amount: ₹${ctx.amount.toLocaleString('en-IN')}
- Best Card: ${ctx.bestCardName}
- Effective Reward Rate: ${ctx.effectiveRate.toFixed(2)}%
- Rules Applied: ${ctx.appliedRules.join(', ') || 'Base reward rate'}
- ${warnings}
${alternatives ? `\nAlternatives Considered:\n${alternatives}` : ''}
`.trim();
  }

  /**
   * Builds a context block for recommendation summaries.
   */
  buildRecommendationContext(ctx: RecommendationSummaryContext): string {
    return `
RECOMMENDATION DATA (Deterministic — Do NOT alter these numbers):
- Top Card: ${ctx.primaryCardName}
- Estimated Annual Rewards: ₹${ctx.estimatedYearlySavings.toLocaleString('en-IN')}
- Effective Reward Rate: ${ctx.effectiveRewardRate.toFixed(2)}%
- Fee-Adjusted Savings: ₹${ctx.feeAdjustedSavings.toLocaleString('en-IN')}
- Why Recommended: ${ctx.reasonings.slice(0, 3).join(' | ')}
${ctx.stackSynergy ? `- Stack Synergy: ${ctx.stackSynergy}` : ''}
${ctx.warnings.length > 0 ? `- Warnings: ${ctx.warnings.join('; ')}` : ''}
`.trim();
  }
}
