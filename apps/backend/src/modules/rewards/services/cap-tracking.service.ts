import { Injectable } from '@nestjs/common';
import { TransactionContext, RewardAction } from '../interfaces/rewards.interface';

export interface CapResult {
  cappedReward: number;
  originalReward: number;
  limitRemaining: number;
  capHit: boolean;
}

@Injectable()
export class CapTrackingService {
  
  /**
   * Applies monthly cap limits to a computed reward.
   */
  applyCap(
    context: TransactionContext,
    action: RewardAction,
    computedReward: number
  ): CapResult {
    const result: CapResult = {
      originalReward: computedReward,
      cappedReward: computedReward,
      limitRemaining: 9999999, // Infinite by default
      capHit: false,
    };

    if (!action.cap) return result;

    // Handle per-transaction cap
    if (action.cap.perTransaction && computedReward > action.cap.perTransaction) {
      result.cappedReward = action.cap.perTransaction;
      result.capHit = true;
      // We still process monthly cap if it exists, but the base is now the tx cap
      computedReward = result.cappedReward;
    }

    // Handle monthly cap
    if (action.cap.monthly) {
      // NOTE: In a real system, 'monthlySpend' might need to track EXACTLY how much reward has been yielded this month.
      // For this simplified logic, we assume we know the "reward accumulated this month" 
      // or we derive it from category spend * rate. 
      // Here, we estimate accumulated reward based on category spend if it's a category cap.
      // E.g., if cap is 5000, and previous spend yielded 4800, only 200 is available.
      
      // MOCK: Assuming the context passes the pre-calculated accumulated reward for this specific rule.
      // Since context currently only has monthlySpend, we will estimate accumulated reward:
      // (This is why the ledger is important, but we are keeping API purely functional for Phase 4)
      const accumulatedRewardThisMonth = (context.monthlySpend * action.rate) / 100; // Simplified estimation
      
      const availableCap = Math.max(0, action.cap.monthly - accumulatedRewardThisMonth);
      result.limitRemaining = availableCap;

      if (computedReward > availableCap) {
        result.cappedReward = availableCap;
        result.capHit = true;
      }
    }

    return result;
  }
}
