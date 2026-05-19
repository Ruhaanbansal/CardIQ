import { Injectable } from '@nestjs/common';
import { RewardType } from '@cardiq/shared-types';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import { SpendingProfile, CardScore } from '../interfaces/recommendation.interface';
import { ProfileAnalysis } from './profile-analysis.service';
import { ApprovalEstimate } from './approval-probability.service';

// ── Weighting constants (must sum to 100) ──────────────────
const WEIGHTS = {
  cashbackAlignment:  28,
  travelAlignment:    12,
  feeEfficiency:      18,
  approvalLikelihood: 16,
  benefitCoverage:    20,
  lifestyleAlignment:  6,
};

@Injectable()
export class RankingEngineService {

  scoreCard(
    card: CreditCardEntity,
    profile: SpendingProfile,
    analysis: ProfileAnalysis,
    approvalEstimate: ApprovalEstimate,
    estimatedAnnualValueInr: number,
  ): CardScore {
    const annualFee = Number(card.annualFee || 0);
    const feeAdjustedSavings = estimatedAnnualValueInr - annualFee;
    const reasoning: string[] = [];
    const warnings: string[] = [];

    // Normalize card rewardType for comparison with profile preference strings
    const rewardTypeLower = String(card.rewardType).toLowerCase()
      .replace('reward_points', 'points')
      .replace('airmiles', 'miles')
      .replace('cobrand_points', 'points');

    // ── 1. Cashback / Rewards Alignment (0–100) ──────────────
    let cashbackAlignment = 50; // baseline
    if (profile.preferredRewardType === rewardTypeLower || profile.preferredRewardType === 'any') {
      cashbackAlignment += 30;
    }
    // Boost if estimated annual rewards > 1% of spend
    const effectiveRate = analysis.totalAnnualSpend > 0
      ? (estimatedAnnualValueInr / analysis.totalAnnualSpend) * 100
      : 0;
    cashbackAlignment += Math.min(20, effectiveRate * 4); // up to +20 for 5%+ rate
    cashbackAlignment = Math.min(100, cashbackAlignment);

    if (effectiveRate > 3) reasoning.push(`Strong ${effectiveRate.toFixed(1)}% effective reward rate on your spending.`);

    // ── 2. Travel Alignment (0–100) ───────────────────────────
    let travelAlignment = 0;
    if (analysis.isTraveler) {
      if (card.rewardType === RewardType.AIRMILES) { travelAlignment = 90; reasoning.push('Airline miles card matches your travel-heavy profile.'); }
      else if (card.rewardType === RewardType.REWARD_POINTS) { travelAlignment = 60; }
      else { travelAlignment = 20; }
    } else {
      travelAlignment = card.rewardType === RewardType.AIRMILES ? 10 : 50;
    }

    // ── 3. Fee Efficiency (0–100) ────────────────────────────
    let feeEfficiency: number;
    if (annualFee === 0) {
      feeEfficiency = 80;
      reasoning.push('Zero annual fee — every rupee of rewards is pure gain.');
    } else {
      const feeRatio = estimatedAnnualValueInr / (annualFee || 1);
      feeEfficiency = Math.min(100, Math.max(0, feeRatio * 25));
      if (feeRatio < 1) {
        warnings.push(`Annual fee of ₹${annualFee.toLocaleString('en-IN')} may not be fully recovered with your spending.`);
      }
    }

    // ── 4. Approval Likelihood (0–100) ───────────────────────
    const approvalLikelihood = approvalEstimate.probability;

    // ── 5. Benefit Coverage (0–100) ──────────────────────────
    let benefitCoverage = 40;
    if (profile.loungePreference && (card as any).hasLoungeAccess) benefitCoverage += 30;
    if (profile.travelPreference && card.rewardType === RewardType.AIRMILES) benefitCoverage += 20;
    if (profile.cashbackPreference && card.rewardType === RewardType.CASHBACK) benefitCoverage += 20;
    benefitCoverage = Math.min(100, benefitCoverage);

    // ── 6. Lifestyle Alignment (0–100) ────────────────────────
    let lifestyleAlignment = 50;
    if (profile.premiumPreference && (card.cardTier === 'PREMIUM' || card.cardTier === 'SUPER_PREMIUM')) {
      lifestyleAlignment = 85; reasoning.push('Premium card aligns with your stated preference.');
    } else if (!profile.premiumPreference && (card.cardTier === 'ENTRY' || card.cardTier === 'STANDARD')) {
      lifestyleAlignment = 75;
    }

    // ── Weighted Total Score ──────────────────────────────────
    const totalScore =
      (cashbackAlignment  * WEIGHTS.cashbackAlignment  / 100) +
      (travelAlignment    * WEIGHTS.travelAlignment    / 100) +
      (feeEfficiency      * WEIGHTS.feeEfficiency      / 100) +
      (approvalLikelihood * WEIGHTS.approvalLikelihood / 100) +
      (benefitCoverage    * WEIGHTS.benefitCoverage    / 100) +
      (lifestyleAlignment * WEIGHTS.lifestyleAlignment / 100);

    return {
      cardId: card.id,
      cardName: card.cardName,
      issuerName: card.issuerName,
      annualFee,
      rewardType: card.rewardType,
      cashbackAlignment,
      travelAlignment,
      feeEfficiency,
      approvalLikelihood,
      benefitCoverage,
      lifestyleAlignment,
      capImpactPenalty: 0,
      totalScore: Math.round(totalScore * 10) / 10,
      estimatedAnnualRewards: estimatedAnnualValueInr,
      estimatedAnnualValueInr,
      feeAdjustedSavings,
      effectiveRewardRate: effectiveRate,
      approvalProbability: approvalEstimate.probability,
      approvalDifficulty: approvalEstimate.difficulty,
      reasoning,
      warnings,
    };
  }
}
