import { Injectable } from '@nestjs/common';
import { RankedCard } from '../interfaces/optimizer.interface';
import { MerchantRouteResult } from './merchant-routing.service';

@Injectable()
export class OptimizerWarningService {
  generate(
    rankedCards: RankedCard[],
    route: MerchantRouteResult,
    amount: number,
  ): string[] {
    const warnings: string[] = [];

    // Low merchant confidence
    if (route.merchantConfidence < 60) {
      warnings.push(
        `Merchant classification confidence is low (${route.merchantConfidence}%). ` +
        `Rewards may vary if the actual category differs.`,
      );
    }

    // Unknown category fallback
    if (route.resolvedCategory === 'UNKNOWN') {
      warnings.push(
        `Merchant category could not be determined. Base reward rate applied. ` +
        `Actual rewards may be higher or lower.`,
      );
    }

    // All cards excluded
    const allExcluded = rankedCards.every(c => c.exclusionsApplied.length > 0 && c.effectiveValueInr === 0);
    if (allExcluded) {
      warnings.push(`This transaction type is excluded from rewards on all your cards.`);
    }

    // Best card has a cap impact
    const bestCard = rankedCards[0];
    if (bestCard?.capImpact?.capHit) {
      warnings.push(
        `Monthly cashback cap applied — reward reduced from ` +
        `₹${bestCard.capImpact.originalReward.toFixed(2)} to ` +
        `₹${bestCard.capImpact.cappedReward.toFixed(2)}.`,
      );
    }

    // Cap nearly exhausted (< 20% remaining)
    if (bestCard?.capImpact && !bestCard.capImpact.capHit) {
      const remainingPct = bestCard.capImpact.limitRemaining / (bestCard.capImpact.limitRemaining + bestCard.effectiveValueInr);
      if (remainingPct < 0.2) {
        warnings.push(`Monthly cap almost exhausted on ${bestCard.cardName}. Consider using an alternative.`);
      }
    }

    // High value transaction — sanity check
    if (amount > 100000) {
      warnings.push(`Large transaction (₹${amount.toLocaleString('en-IN')}) — verify if EMI or special processing applies.`);
    }

    return warnings;
  }
}
