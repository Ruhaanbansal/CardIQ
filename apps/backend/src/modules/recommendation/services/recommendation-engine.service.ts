import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import {
  SpendingProfile,
  RecommendationResult,
  CardScore,
} from '../interfaces/recommendation.interface';

import { ProfileAnalysisService } from './profile-analysis.service';
import { EligibilityEngineService } from './eligibility-engine.service';
import { ApprovalProbabilityService } from './approval-probability.service';
import { RankingEngineService } from './ranking-engine.service';
import { StackRecommendationService } from './stack-recommendation.service';
import { OverlapDetectionService } from './overlap-detection.service';
import { RecommendationExplainabilityService } from './recommendation-explainability.service';
import { AnnualSimulationService } from '../../rewards/services/annual-simulation.service';

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
    private readonly profileAnalyzer: ProfileAnalysisService,
    private readonly eligibilityEngine: EligibilityEngineService,
    private readonly approvalEstimator: ApprovalProbabilityService,
    private readonly rankingEngine: RankingEngineService,
    private readonly stackEngine: StackRecommendationService,
    private readonly overlapDetector: OverlapDetectionService,
    private readonly explainability: RecommendationExplainabilityService,
    private readonly annualSimulation: AnnualSimulationService,
  ) {}

  async generate(profile: SpendingProfile): Promise<RecommendationResult> {
    const profileHash = this.hashProfile(profile);
    const startTime = Date.now();

    // ── STEP 1: Analyze spending profile ────────────────────
    const analysis = this.profileAnalyzer.analyze(profile);

    // ── STEP 2: Fetch all active cards ──────────────────────
    const allCards = await this.cardRepo.find({ where: { isActive: true } });

    if (allCards.length === 0) {
      return this.buildFallbackResult(profileHash, 'No active cards found in database.');
    }

    // ── STEP 3 & 4: Filter by eligibility, then score ───────
    const scoredCards: CardScore[] = [];
    const overallWarnings: string[] = [];

    for (const card of allCards) {
      // Eligibility gate
      const eligibility = this.eligibilityEngine.evaluate(card, profile);
      if (!eligibility.isEligible) {
        this.logger.debug(`Card ${card.cardName} excluded: ${eligibility.rejectionReason}`);
        continue;
      }

      // Annual simulation for this card
      let annualValueInr = 0;
      try {
        const simulation = await this.annualSimulation.simulateAnnual({
          cardId: card.id,
          userId: profile.userId,
          monthlySpend: analysis.totalMonthlySpend,
          categoryAllocations: analysis.categories.map(c => ({
            category: c.category,
            monthlyAmount: c.monthlyAmount,
          })),
        });
        annualValueInr = simulation.totalEffectiveValueInr;
      } catch (err) {
        this.logger.warn(`Annual simulation failed for card ${card.id}: ${(err as Error).message}`);
        // Fallback: estimate from base rate
        annualValueInr = analysis.totalAnnualSpend * (Number(card.baseRewardRate) / 100);
      }

      // Approval probability
      const approvalEstimate = this.approvalEstimator.estimate(card, profile);

      // Weighted ranking score
      const scored = this.rankingEngine.scoreCard(
        card, profile, analysis, approvalEstimate, annualValueInr,
      );

      // Eligibility confidence penalty
      scored.confidenceScore = 100 - eligibility.confidencePenalty;

      // Explainability
      scored.reasoning = [
        ...this.explainability.explain(scored, profile, analysis, scoredCards.length + 1),
        ...scored.reasoning,
      ];

      scoredCards.push(scored);
    }

    if (scoredCards.length === 0) {
      return this.buildFallbackResult(profileHash, 'No eligible cards for this profile.');
    }

    // ── STEP 5: Sort by totalScore desc ─────────────────────
    scoredCards.sort((a, b) => b.totalScore - a.totalScore);

    // ── STEP 6: Build speciality buckets ────────────────────
    const bestFreeCard = scoredCards.find(c => c.annualFee === 0) ?? null;
    const bestPremiumCard = scoredCards.find(c => c.annualFee > 5000) ?? null;
    const easiestApprovalCard = [...scoredCards].sort((a, b) => b.approvalProbability - a.approvalProbability)[0] ?? null;

    // ── STEP 7: Stack optimization ───────────────────────────
    const optimizedStack = this.stackEngine.buildOptimalStack(scoredCards, profile, analysis);

    // ── STEP 8: Overlap detection on top-3 cards ────────────
    const topThree = scoredCards.slice(0, 3);
    const overlap = this.overlapDetector.analyze(topThree);

    // ── STEP 9: Category savings breakdown ──────────────────
    const primaryCard = scoredCards[0];
    const categorySavingsBreakdown = analysis.categories.map(cat => ({
      category: cat.category,
      monthlySpend: cat.monthlyAmount,
      estimatedMonthlyReward: (cat.monthlyAmount * (primaryCard.effectiveRewardRate / 100)),
      bestCard: primaryCard.cardName,
    }));

    // ── STEP 10: Confidence scoring ──────────────────────────
    const missingRules = scoredCards.filter(c => c.estimatedAnnualRewards === 0).length;
    const ruleCoverage = 100 - Math.min(50, (missingRules / scoredCards.length) * 100);
    const latencyMs = Date.now() - startTime;
    const freshnessScore = latencyMs < 500 ? 100 : 80;

    return {
      profileHash,
      generatedAt: new Date(),
      primaryCard: scoredCards[0] ?? null,
      secondaryCard: scoredCards[1] ?? null,
      bestValueCard: scoredCards.find(c => c.feeAdjustedSavings === Math.max(...scoredCards.map(x => x.feeAdjustedSavings))) ?? null,
      bestFreeCard,
      bestPremiumCard,
      easiestApprovalCard,
      optimizedStack,
      allRankedCards: scoredCards,
      estimatedYearlySavings: primaryCard.estimatedAnnualValueInr,
      feeAdjustedSavings: primaryCard.feeAdjustedSavings,
      effectiveRewardRate: primaryCard.effectiveRewardRate,
      categorySavingsBreakdown,
      overlapWarnings: [...overlap.warnings, ...overallWarnings],
      inefficiencyWarnings: overlap.inefficiencies,
      confidenceScore: Math.round(ruleCoverage),
      ruleCoverageScore: Math.round(ruleCoverage),
      freshnessScore,
      isFallback: false,
    };
  }

  private buildFallbackResult(profileHash: string, reason: string): RecommendationResult {
    return {
      profileHash,
      generatedAt: new Date(),
      primaryCard: null,
      secondaryCard: null,
      bestValueCard: null,
      bestFreeCard: null,
      bestPremiumCard: null,
      easiestApprovalCard: null,
      optimizedStack: null,
      allRankedCards: [],
      estimatedYearlySavings: 0,
      feeAdjustedSavings: 0,
      effectiveRewardRate: 0,
      categorySavingsBreakdown: [],
      overlapWarnings: [],
      inefficiencyWarnings: [],
      confidenceScore: 0,
      ruleCoverageScore: 0,
      freshnessScore: 0,
      isFallback: true,
      fallbackReason: reason,
    };
  }

  private hashProfile(profile: SpendingProfile): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(profile))
      .digest('hex')
      .substring(0, 16);
  }
}
