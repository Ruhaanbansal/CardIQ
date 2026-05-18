import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardRuleEntity } from '../../../database/entities/reward-rule.entity';
import { RewardMilestoneEntity } from '../../../database/entities/reward-milestone.entity';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import { RewardsEngineService } from './rewards-engine.service';
import { TransactionContext } from '../interfaces/rewards.interface';

export interface CategoryAllocation {
  category: string;
  monthlyAmount: number;
}

export interface AnnualSimulationInput {
  cardId: string;
  userId: string;
  monthlySpend: number;
  categoryAllocations: CategoryAllocation[];
}

export interface AnnualSimulationResult {
  cardId: string;
  annualSpend: number;
  totalCashbackOrPoints: number;
  totalEffectiveValueInr: number;
  annualFee: number;
  joiningFee: number;
  feeAdjustedSavings: number;
  effectiveAnnualRewardRate: number;
  categoryBreakdown: {
    category: string;
    annualSpend: number;
    estimatedReward: number;
    estimatedValueInr: number;
  }[];
  milestoneProjections: {
    name: string;
    targetAmount: number;
    projectedToUnlock: boolean;
    monthsToUnlock: number | null;
  }[];
  warnings: string[];
}

@Injectable()
export class AnnualSimulationService {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
    @InjectRepository(RewardMilestoneEntity)
    private readonly milestoneRepo: Repository<RewardMilestoneEntity>,
    private readonly rewardsEngine: RewardsEngineService,
  ) {}

  async simulateAnnual(input: AnnualSimulationInput): Promise<AnnualSimulationResult> {
    const card = await this.cardRepo.findOne({ where: { id: input.cardId } });
    if (!card) throw new Error(`Card ${input.cardId} not found`);

    const milestones = await this.milestoneRepo.find({ where: { cardId: input.cardId, isActive: true } });

    const annualSpend = input.monthlySpend * 12;
    const categoryBreakdown = [];
    let totalEffectiveValueInr = 0;

    // Simulate one transaction per category per month, aggregate annually
    for (const allocation of input.categoryAllocations) {
      const mockTx: TransactionContext = {
        merchantName: `${allocation.category}_merchant`,
        normalizedMerchant: `${allocation.category}_merchant`,
        merchantCategory: allocation.category,
        amount: allocation.monthlyAmount,
        currency: 'INR',
        paymentMethod: 'ECOM',
        transactionDate: new Date(),
        userId: input.userId,
        cardId: input.cardId,
        monthlySpend: input.monthlySpend,
        categoryMonthlySpend: { [allocation.category]: allocation.monthlyAmount },
        merchantMonthlySpend: {},
        yearlySpend: annualSpend,
      };

      const monthlyResult = await this.rewardsEngine.calculateReward(mockTx);
      const annualEstimate = monthlyResult.effectiveValueInr * 12;
      totalEffectiveValueInr += annualEstimate;

      categoryBreakdown.push({
        category: allocation.category,
        annualSpend: allocation.monthlyAmount * 12,
        estimatedReward: monthlyResult.rewardValue * 12,
        estimatedValueInr: annualEstimate,
      });
    }

    // Milestone Projection
    const milestoneProjections = milestones.map(m => {
      const targetAmount = Number(m.targetAmount);
      const projectedToUnlock = annualSpend >= targetAmount;
      const monthsToUnlock = !projectedToUnlock
        ? Math.ceil(targetAmount / input.monthlySpend)
        : null;

      return {
        name: m.name,
        targetAmount,
        projectedToUnlock,
        monthsToUnlock,
      };
    });

    const annualFee = Number(card.annualFee || 0);
    const joiningFee = Number(card.joiningFee || 0);
    const feeAdjustedSavings = totalEffectiveValueInr - annualFee;

    const warnings: string[] = [];
    if (feeAdjustedSavings < 0) {
      warnings.push(`This card's annual fee (₹${annualFee}) may not be justified for your spending profile.`);
    }

    return {
      cardId: input.cardId,
      annualSpend,
      totalCashbackOrPoints: totalEffectiveValueInr,
      totalEffectiveValueInr,
      annualFee,
      joiningFee,
      feeAdjustedSavings,
      effectiveAnnualRewardRate: annualSpend > 0 ? (totalEffectiveValueInr / annualSpend) * 100 : 0,
      categoryBreakdown,
      milestoneProjections,
      warnings,
    };
  }
}
