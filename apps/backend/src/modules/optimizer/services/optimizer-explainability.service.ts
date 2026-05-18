import { Injectable } from '@nestjs/common';
import { RankedCard, AlternativeCard } from '../interfaces/optimizer.interface';
import { MerchantRouteResult } from './merchant-routing.service';

@Injectable()
export class OptimizerExplainabilityService {
  /**
   * Produces a full ordered trace of the optimization decision for debugging and UI display.
   */
  buildTrace(
    route: MerchantRouteResult,
    rankedCards: RankedCard[],
    alternatives: AlternativeCard[],
  ): string[] {
    const trace: string[] = [];
    const best = rankedCards[0];

    trace.push(`[1] Merchant resolved to: "${route.normalizedMerchant}" (category: ${route.resolvedCategory}, confidence: ${route.merchantConfidence}%)`);
    trace.push(`[2] ${rankedCards.length} eligible card(s) found in your wallet.`);

    if (!best) {
      trace.push('[3] No card could generate a reward for this transaction. Zero rewards returned.');
      return trace;
    }

    trace.push(`[3] Cards simulated through rewards engine individually.`);

    if (best.exclusionsApplied.length > 0) {
      trace.push(`[4] Exclusions applied to top card: ${best.exclusionsApplied.join('; ')}`);
    } else {
      trace.push(`[4] No exclusions triggered.`);
    }

    if (best.appliedRules.length > 0) {
      trace.push(`[5] Rules applied: ${best.appliedRules.join(' | ')}`);
    }

    if (best.capImpact) {
      trace.push(
        `[6] Cap simulation: reward reduced from ₹${best.capImpact.originalReward.toFixed(2)} ` +
        `to ₹${best.capImpact.cappedReward.toFixed(2)} (${best.capImpact.capType} cap).`
      );
    } else {
      trace.push(`[6] No cap limits reached.`);
    }

    trace.push(
      `[7] Best card selected: ${best.cardName} with ₹${best.effectiveValueInr.toFixed(2)} ` +
      `effective value (${best.effectiveRewardRate.toFixed(2)}% rate).`
    );

    if (alternatives.length > 0) {
      trace.push(
        `[8] ${alternatives.length} alternative(s) available. ` +
        `Best alternative: ${alternatives[0].cardName} — ${alternatives[0].tradeoffNote}`
      );
    }

    return trace;
  }
}
