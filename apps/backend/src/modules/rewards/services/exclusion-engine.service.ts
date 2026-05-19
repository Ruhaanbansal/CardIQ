import { Injectable } from '@nestjs/common';
import { TransactionContext } from '../interfaces/rewards.interface';
import { RewardExclusionEntity } from '../../../database/entities/reward-exclusion.entity';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export interface ExclusionResult {
  isExcluded: boolean;
  reason?: string;
}

@Injectable()
export class ExclusionEngineService {
  constructor(
    @InjectRepository(RewardExclusionEntity)
    private readonly exclusionRepo: Repository<RewardExclusionEntity>,
  ) {}

  /**
   * Checks if a transaction is excluded based on database rules.
   */
  async checkExclusions(context: TransactionContext): Promise<ExclusionResult> {
    // We would normally cache this fetch globally per card
    const exclusions = await this.exclusionRepo.find({
      where: [
        { cardId: context.cardId, isActive: true },
        { cardId: IsNull(), isActive: true } // Global exclusions (e.g. Wallet loads across all cards by law)
      ]
    });

    for (const exclusion of exclusions) {
      // Check Category
      if (exclusion.category === context.merchantCategory) {
        return {
          isExcluded: true,
          reason: `Category '${exclusion.category}' is excluded from rewards for this card.`
        };
      }

      // Check MCC
      if (context.mcc && exclusion.specificMccs?.includes(context.mcc)) {
        return {
          isExcluded: true,
          reason: `MCC '${context.mcc}' is excluded from rewards.`
        };
      }

      // Check Specific Merchant
      if (exclusion.specificMerchants?.includes(context.normalizedMerchant)) {
        return {
          isExcluded: true,
          reason: `Merchant '${context.normalizedMerchant}' is explicitly excluded.`
        };
      }
    }

    return { isExcluded: false };
  }
}
