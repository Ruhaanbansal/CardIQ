import { Injectable } from '@nestjs/common';
import { CardScore, SpendingProfile } from '../interfaces/recommendation.interface';
import { ProfileAnalysis } from './profile-analysis.service';

@Injectable()
export class RecommendationExplainabilityService {
  /**
   * Generates a plain-English summary of why a card was recommended.
   */
  explain(
    card: CardScore,
    profile: SpendingProfile,
    analysis: ProfileAnalysis,
    rank: number,
  ): string[] {
    const explanations: string[] = [];

    if (rank === 1) {
      explanations.push(
        `Ranked #1 overall with a composite score of ${card.totalScore.toFixed(1)}/100 for your profile.`,
      );
    }

    // Category dominance
    const dominant = analysis.categories[0];
    if (dominant) {
      explanations.push(
        `${dominant.percentageOfTotal.toFixed(0)}% of your monthly spending is on ${dominant.category}, ` +
        `where this card performs strongly.`,
      );
    }

    // Effective rate
    if (card.effectiveRewardRate > 2) {
      explanations.push(
        `Effective reward rate of ${card.effectiveRewardRate.toFixed(2)}% translates to ` +
        `₹${card.estimatedAnnualValueInr.toLocaleString('en-IN')} in annual rewards.`,
      );
    }

    // Fee justification
    if (card.annualFee > 0 && card.feeAdjustedSavings > 0) {
      explanations.push(
        `Annual fee of ₹${card.annualFee.toLocaleString('en-IN')} is justified — ` +
        `net savings after fee: ₹${card.feeAdjustedSavings.toLocaleString('en-IN')}.`,
      );
    } else if (card.annualFee === 0) {
      explanations.push('No annual fee — zero cost to hold this card.');
    }

    // Travel alignment
    if (analysis.isTraveler && card.rewardType === 'miles') {
      explanations.push('Airline miles reward structure aligns with your frequent travel.');
    }

    // Approval ease
    if (card.approvalDifficulty === 'easy') {
      explanations.push(`High approval probability (${card.approvalProbability}%) for your profile.`);
    }

    return explanations;
  }
}
