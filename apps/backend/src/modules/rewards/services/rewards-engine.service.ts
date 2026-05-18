import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardRuleEntity } from '../../../database/entities/reward-rule.entity';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import { TransactionContext, RewardCalculationResult } from '../interfaces/rewards.interface';

import { RewardRuleParserService } from './reward-rule-parser.service';
import { ExclusionEngineService } from './exclusion-engine.service';
import { CapTrackingService } from './cap-tracking.service';
import { MilestoneEngineService } from './milestone-engine.service';
import { EffectiveSavingsService } from './effective-savings.service';

@Injectable()
export class RewardsEngineService {
  private readonly logger = new Logger(RewardsEngineService.name);

  constructor(
    @InjectRepository(RewardRuleEntity)
    private readonly ruleRepo: Repository<RewardRuleEntity>,
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
    
    private readonly ruleParser: RewardRuleParserService,
    private readonly exclusionEngine: ExclusionEngineService,
    private readonly capTracker: CapTrackingService,
    private readonly milestoneEngine: MilestoneEngineService,
    private readonly effectiveSavings: EffectiveSavingsService,
  ) {}

  async calculateReward(context: TransactionContext): Promise<RewardCalculationResult> {
    const result: RewardCalculationResult = {
      cardId: context.cardId,
      transactionAmount: context.amount,
      rewardType: 'cashback', // default
      rewardValue: 0,
      effectiveValueInr: 0,
      effectiveRewardRate: 0,
      appliedRules: [],
      excludedRules: [],
      warnings: [],
      confidenceScore: 100,
      isFallback: false,
    };

    const card = await this.cardRepo.findOne({ where: { id: context.cardId } });
    if (!card) {
      result.warnings.push('Card not found');
      result.confidenceScore = 0;
      return result;
    }

    // 1. Exclusions
    const exclusionCheck = await this.exclusionEngine.checkExclusions(context);
    if (exclusionCheck.isExcluded) {
      result.excludedRules.push(exclusionCheck.reason!);
      return result; // 0 reward
    }

    // 2. Fetch Rules ordered by priority (1 is highest)
    const rules = await this.ruleRepo.find({
      where: { cardId: context.cardId, isActive: true },
      order: { priority: 'ASC' }
    });

    let appliedRule = null;
    let computedReward = 0;

    for (const rule of rules) {
      const isMatch = this.ruleParser.evaluateCondition(context, rule.conditions);
      if (isMatch) {
        appliedRule = rule;
        break; // We found the highest priority matching rule
      }
    }

    if (appliedRule) {
      result.appliedRules.push(`Rule matched: ${appliedRule.name}`);
      result.rewardType = appliedRule.reward.type;
      computedReward = (context.amount * appliedRule.reward.rate) / 100;
      
      // Multiplier Support
      if (appliedRule.reward.multiplier) {
        computedReward *= appliedRule.reward.multiplier;
        result.appliedRules.push(`Applied multiplier: ${appliedRule.reward.multiplier}x`);
      }

      // Cap Tracking
      const capResult = this.capTracker.applyCap(context, appliedRule.reward, computedReward);
      if (capResult.capHit) {
        result.capImpact = {
          capType: appliedRule.reward.cap.monthly ? 'monthly' : 'transaction',
          originalReward: computedReward,
          cappedReward: capResult.cappedReward,
          limitRemaining: capResult.limitRemaining,
        };
        result.warnings.push('Reward was capped by card limits.');
        computedReward = capResult.cappedReward;
      }
    } else {
      // 3. Base Reward Fallback
      result.appliedRules.push(`Base Reward Rate Applied`);
      result.rewardType = card.rewardType;
      computedReward = (context.amount * card.baseRewardRate) / 100;
    }

    result.rewardValue = computedReward;

    // 4. Effective Savings Calculation
    result.effectiveValueInr = this.effectiveSavings.calculateEffectiveInr(
      result.rewardValue,
      result.rewardType,
      card.pointValueInr
    );
    result.effectiveRewardRate = this.effectiveSavings.calculateEffectiveRate(
      result.effectiveValueInr,
      context.amount
    );

    // 5. Milestone Tracking
    const milestones = await this.milestoneEngine.calculateMilestoneImpact(context);
    if (milestones.length > 0) {
      result.milestoneProgress = milestones;
      const newlyUnlocked = milestones.filter(m => m.justUnlocked);
      if (newlyUnlocked.length > 0) {
        result.appliedRules.push(`Unlocked Milestone: ${newlyUnlocked.map(m => m.name).join(', ')}`);
      }
    }

    // Confidence adjustment for Unknown Merchants
    if (context.merchantCategory === 'UNKNOWN' || context.normalizedMerchant === 'unknown') {
      result.confidenceScore = 50;
      result.warnings.push('Merchant category is unknown. Defaulting to base rewards. Actual reward may differ.');
    }

    return result;
  }
}
