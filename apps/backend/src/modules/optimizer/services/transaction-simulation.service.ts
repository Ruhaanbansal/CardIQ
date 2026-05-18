import { Injectable } from '@nestjs/common';
import { RewardsEngineService } from '../../rewards/services/rewards-engine.service';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import { OptimizationRequest, RankedCard } from '../interfaces/optimizer.interface';
import { MerchantRouteResult } from './merchant-routing.service';
import { TransactionContext } from '../../rewards/interfaces/rewards.interface';

@Injectable()
export class TransactionSimulationService {
  constructor(private readonly rewardsEngine: RewardsEngineService) {}

  /**
   * Runs the full rewards engine for a given card against this transaction.
   * Returns a partially-built RankedCard (without rank/reasoning — added later).
   */
  async simulate(
    card: CreditCardEntity,
    request: OptimizationRequest,
    route: MerchantRouteResult,
  ): Promise<Omit<RankedCard, 'rank' | 'reasoning'>> {
    const ctx: TransactionContext = {
      merchantName: request.merchantName,
      normalizedMerchant: route.normalizedMerchant,
      merchantCategory: route.resolvedCategory,
      amount: request.amount,
      currency: request.currency,
      paymentMethod: request.paymentMethod,
      mcc: route.resolvedMcc,
      transactionDate: request.transactionDate ?? new Date(),
      userId: request.userId,
      cardId: card.id,
      // For cap simulation we default to 0 additional prior spend.
      // In a future phase these will be pulled from the user's transaction ledger.
      monthlySpend: 0,
      categoryMonthlySpend: {},
      merchantMonthlySpend: {},
      yearlySpend: 0,
    };

    const result = await this.rewardsEngine.calculateReward(ctx);

    return {
      cardId: card.id,
      cardName: card.cardName,
      issuerName: card.issuerName,
      annualFee: Number(card.annualFee ?? 0),
      rewardType: result.rewardType,
      cashbackAmount: result.rewardType === 'cashback' ? result.rewardValue : 0,
      pointsEarned:   result.rewardType === 'points'   ? result.rewardValue : 0,
      milesEarned:    result.rewardType === 'miles'    ? result.rewardValue : 0,
      effectiveValueInr: result.effectiveValueInr,
      effectiveRewardRate: result.effectiveRewardRate,
      appliedRules: result.appliedRules,
      exclusionsApplied: result.excludedRules,
      warnings: result.warnings,
      capImpact: result.capImpact,
      confidenceScore: result.confidenceScore,
    };
  }
}
