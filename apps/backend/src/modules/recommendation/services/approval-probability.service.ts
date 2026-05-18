import { Injectable } from '@nestjs/common';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';
import { SpendingProfile } from '../interfaces/recommendation.interface';

export type ApprovalDifficulty = 'easy' | 'moderate' | 'hard' | 'very_hard';

export interface ApprovalEstimate {
  probability: number;         // 0–100
  difficulty: ApprovalDifficulty;
  factors: string[];           // explanations
}

@Injectable()
export class ApprovalProbabilityService {
  estimate(card: CreditCardEntity, profile: SpendingProfile): ApprovalEstimate {
    let score = 50; // Start neutral
    const factors: string[] = [];

    // Credit Score contribution (up to +25 or -25)
    if (profile.creditScore) {
      if (profile.creditScore >= 800) {
        score += 25; factors.push('Excellent credit score (≥800).');
      } else if (profile.creditScore >= 750) {
        score += 15; factors.push('Good credit score (750–799).');
      } else if (profile.creditScore >= 700) {
        score += 5; factors.push('Fair credit score (700–749).');
      } else {
        score -= 20; factors.push('Low credit score may reduce approval chances.');
      }
    } else {
      score -= 5; factors.push('Credit score not provided; using conservative estimate.');
    }

    // Salary vs. minimum requirement
    if (card.minMonthlyIncome) {
      const ratio = profile.monthlySalary / card.minMonthlyIncome;
      if (ratio >= 2) {
        score += 15; factors.push('Income significantly exceeds card minimum.');
      } else if (ratio >= 1.2) {
        score += 8; factors.push('Income comfortably meets card minimum.');
      } else if (ratio >= 1) {
        score += 0; factors.push('Income just meets card minimum.');
      } else {
        score = 0; // Already excluded by eligibility engine, but safety guard
        factors.push('Income below card minimum.');
      }
    } else {
      score += 5; factors.push('No specific income requirement for this card.');
    }

    // Existing banking relationship
    const issuerName = card.issuerName?.toUpperCase() ?? '';
    const relationships = profile.existingBankRelationships?.map(r => r.toUpperCase()) ?? [];
    if (relationships.includes(issuerName)) {
      score += 10; factors.push(`Existing ${card.issuerName} banking relationship boosts approval.`);
    }

    // Card Tier
    if (card.cardTier === 'ENTRY' || card.cardTier === 'STANDARD') {
      score += 10; factors.push('Entry/standard tier cards have higher approval rates.');
    } else if (card.cardTier === 'SUPER_PREMIUM') {
      score -= 10; factors.push('Super-premium cards have selective approval criteria.');
    }

    score = Math.min(98, Math.max(2, score));

    let difficulty: ApprovalDifficulty;
    if (score >= 80) difficulty = 'easy';
    else if (score >= 60) difficulty = 'moderate';
    else if (score >= 40) difficulty = 'hard';
    else difficulty = 'very_hard';

    return { probability: Math.round(score), difficulty, factors };
  }
}
