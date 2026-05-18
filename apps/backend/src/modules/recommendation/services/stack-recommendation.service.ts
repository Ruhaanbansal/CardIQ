import { Injectable } from '@nestjs/common';
import { CardScore, StackRecommendation } from '../interfaces/recommendation.interface';
import { SpendingProfile } from '../interfaces/recommendation.interface';
import { ProfileAnalysis } from './profile-analysis.service';

@Injectable()
export class StackRecommendationService {
  /**
   * Builds an optimized 2-card stack to maximize category coverage.
   * The algorithm is deterministic: sorted by score, then by category complementarity.
   */
  buildOptimalStack(
    rankedCards: CardScore[],
    profile: SpendingProfile,
    analysis: ProfileAnalysis,
  ): StackRecommendation | null {
    if (rankedCards.length < 2) return null;

    const primary = rankedCards[0];
    const overlapWarnings: string[] = [];

    // Find the best COMPLEMENT: highest scoring card with a different reward type
    // so we cover different categories without overlap
    const secondary = rankedCards.slice(1).find(c => c.rewardType !== primary.rewardType) 
      ?? rankedCards[1];

    // Overlap Detection: Both premium / same reward type
    if (primary.rewardType === secondary.rewardType) {
      overlapWarnings.push(
        `Both cards offer '${primary.rewardType}' rewards — consider a travel + cashback combination for better coverage.`
      );
    }

    // Simple category assignment heuristic
    const categoryAssignments: Record<string, string> = {};
    for (const cat of analysis.topThreeCategories) {
      const isTravel = cat === 'travel' || cat === 'international';
      if (isTravel && secondary.rewardType === 'miles') {
        categoryAssignments[cat] = secondary.cardId;
      } else {
        categoryAssignments[cat] = primary.cardId;
      }
    }

    const totalAnnualFees = primary.annualFee + secondary.annualFee;
    const totalEstimatedValueInr = primary.estimatedAnnualValueInr + secondary.estimatedAnnualValueInr;
    const netSavings = totalEstimatedValueInr - totalAnnualFees;

    const synergySummary =
      `Use ${primary.cardName} for ${analysis.dominantCategory} and ` +
      `${secondary.cardName} for complementary spending to maximize rewards.`;

    return {
      cards: [primary, secondary],
      totalAnnualFees,
      totalEstimatedValueInr,
      netSavings,
      categoryAssignments,
      overlapWarnings,
      synergySummary,
    };
  }
}
