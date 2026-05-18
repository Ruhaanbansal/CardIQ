// Frontend-facing types mirroring backend interfaces
export interface SpendingProfile {
  userId: string;
  monthlySalary: number;
  annualIncome: number;
  creditScore?: number;
  monthlyOnlineShopping: number;
  monthlyDining: number;
  monthlyGroceries: number;
  monthlyTravel: number;
  monthlyFuel: number;
  monthlyUtilities: number;
  monthlySubscriptions: number;
  monthlyEntertainment: number;
  monthlyUpi: number;
  monthlyInternational: number;
  monthlyInsurance: number;
  monthlyEducation: number;
  monthlyRent: number;
  monthlyOther: number;
  preferredRewardType?: 'cashback' | 'points' | 'miles' | 'any';
  feeTolerance?: number;
  premiumPreference?: boolean;
  loungePreference?: boolean;
  travelPreference?: boolean;
  cashbackPreference?: boolean;
}

export interface CardScore {
  cardId: string;
  cardName: string;
  issuerName: string;
  annualFee: number;
  rewardType: string;
  totalScore: number;
  estimatedAnnualValueInr: number;
  feeAdjustedSavings: number;
  effectiveRewardRate: number;
  approvalProbability: number;
  approvalDifficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
  reasoning: string[];
  warnings: string[];
}

export interface RecommendationResult {
  profileHash: string;
  generatedAt: string;
  primaryCard: CardScore | null;
  secondaryCard: CardScore | null;
  bestFreeCard: CardScore | null;
  bestPremiumCard: CardScore | null;
  easiestApprovalCard: CardScore | null;
  allRankedCards: CardScore[];
  estimatedYearlySavings: number;
  feeAdjustedSavings: number;
  effectiveRewardRate: number;
  overlapWarnings: string[];
  inefficiencyWarnings: string[];
  confidenceScore: number;
  isFallback: boolean;
}
