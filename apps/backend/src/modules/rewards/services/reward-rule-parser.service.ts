import { Injectable } from '@nestjs/common';
import { TransactionContext, RuleCondition } from '../interfaces/rewards.interface';

@Injectable()
export class RewardRuleParserService {
  
  /**
   * Evaluates if a given transaction context matches the JSON DSL rule condition.
   * Returns true if all provided conditions in the rule match the context.
   */
  evaluateCondition(context: TransactionContext, condition: RuleCondition): boolean {
    if (!condition) return true; // Empty conditions apply to everything

    // 1. Merchant Match (Exact or slug)
    if (condition.merchant && condition.merchant.length > 0) {
      if (!condition.merchant.includes(context.normalizedMerchant) && !condition.merchant.includes(context.merchantName)) {
        return false;
      }
    }

    // 2. Category Match
    if (condition.category && condition.category.length > 0) {
      if (!context.merchantCategory || !condition.category.includes(context.merchantCategory)) {
        return false;
      }
    }

    // 3. MCC Match
    if (condition.mcc && condition.mcc.length > 0) {
      if (!context.mcc || !condition.mcc.includes(context.mcc)) {
        return false;
      }
    }

    // 4. Payment Method Match
    if (condition.paymentMethod && condition.paymentMethod.length > 0) {
      if (!condition.paymentMethod.includes(context.paymentMethod)) {
        return false;
      }
    }

    // 5. Amount Constraints
    if (condition.minAmount !== undefined && context.amount < condition.minAmount) {
      return false;
    }
    if (condition.maxAmount !== undefined && context.amount > condition.maxAmount) {
      return false;
    }

    // 6. Inline Exclusions (Overrides inside the rule itself)
    if (condition.excludedCategories && condition.excludedCategories.length > 0) {
      if (context.merchantCategory && condition.excludedCategories.includes(context.merchantCategory)) {
        return false;
      }
    }

    return true;
  }
}
