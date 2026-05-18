import { Injectable } from '@nestjs/common';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import { SpendingProfile } from '../interfaces/recommendation.interface';

export interface EligibilityResult {
  isEligible: boolean;
  rejectionReason?: string;
  confidencePenalty: number; // 0–30 penalty on confidence score
}

@Injectable()
export class EligibilityEngineService {
  /**
   * Deterministically checks if a card is eligible for the given profile.
   * Uses card minimums stored on CreditCardEntity.
   */
  evaluate(card: CreditCardEntity, profile: SpendingProfile): EligibilityResult {
    // 1. Minimum Salary Check
    if (card.minMonthlyIncome && profile.monthlySalary < card.minMonthlyIncome) {
      return {
        isEligible: false,
        rejectionReason: `Minimum monthly income requirement of ₹${card.minMonthlyIncome.toLocaleString('en-IN')} not met.`,
        confidencePenalty: 0,
      };
    }

    // 2. Minimum Credit Score Check
    if (card.minCreditScore && profile.creditScore && profile.creditScore < card.minCreditScore) {
      return {
        isEligible: false,
        rejectionReason: `Minimum credit score of ${card.minCreditScore} required. Your score: ${profile.creditScore}.`,
        confidencePenalty: 0,
      };
    }

    // 3. Premium Card — No credit score provided (soft rejection, low confidence)
    if (card.cardTier === 'SUPER_PREMIUM' && !profile.creditScore) {
      return {
        isEligible: true, // Still show it, but penalize confidence
        confidencePenalty: 20,
      };
    }

    // 4. Student / Self-Employed restrictions for high-tier cards
    if (
      (profile.employmentType === 'STUDENT') &&
      card.cardTier !== 'ENTRY' && card.cardTier !== 'STANDARD'
    ) {
      return {
        isEligible: false,
        rejectionReason: `This card is not typically offered to students.`,
        confidencePenalty: 0,
      };
    }

    return { isEligible: true, confidencePenalty: 0 };
  }
}
