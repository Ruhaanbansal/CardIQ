import { Injectable } from '@nestjs/common';
import { CardScore } from '../interfaces/recommendation.interface';

export interface OverlapAnalysis {
  warnings: string[];
  inefficiencies: string[];
}

@Injectable()
export class OverlapDetectionService {
  analyze(cards: CardScore[]): OverlapAnalysis {
    const warnings: string[] = [];
    const inefficiencies: string[] = [];

    const rewardTypes = cards.map(c => c.rewardType);
    const premiumCards = cards.filter(c => c.annualFee > 5000);

    // Duplicate reward type
    const typeCounts = rewardTypes.reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > 1) {
        warnings.push(`${count} cards in your stack earn '${type}' rewards — this creates redundancy.`);
      }
    }

    // Multiple premium cards
    if (premiumCards.length > 1) {
      const totalPremiumFees = premiumCards.reduce((s, c) => s + c.annualFee, 0);
      warnings.push(
        `You have ${premiumCards.length} premium cards with ₹${totalPremiumFees.toLocaleString('en-IN')} in combined annual fees. ` +
        `Consider whether the benefits justify the cost.`
      );
    }

    // Fee inefficiency
    const inefficientCards = cards.filter(c => c.feeAdjustedSavings < 0);
    for (const card of inefficientCards) {
      inefficiencies.push(
        `${card.cardName} may not recover its ₹${card.annualFee.toLocaleString('en-IN')} fee based on your spending profile.`
      );
    }

    return { warnings, inefficiencies };
  }
}
