import { Injectable } from '@nestjs/common';

@Injectable()
export class EffectiveSavingsService {
  
  /**
   * Converts a raw reward (points or miles) into its estimated INR value.
   */
  calculateEffectiveInr(
    rewardValue: number,
    rewardType: 'cashback' | 'points' | 'miles',
    pointValueInr: number
  ): number {
    if (rewardType === 'cashback') {
      return rewardValue; // 1:1
    }
    
    // Points / Miles conversion
    return rewardValue * pointValueInr;
  }

  /**
   * Calculates the effective reward rate (ROI) of a transaction.
   */
  calculateEffectiveRate(effectiveValueInr: number, transactionAmount: number): number {
    if (transactionAmount === 0) return 0;
    return (effectiveValueInr / transactionAmount) * 100;
  }
}
