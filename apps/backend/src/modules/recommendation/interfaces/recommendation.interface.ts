// ============================================================
// CARDIQ RECOMMENDATION ENGINE — CORE INTERFACES
// ============================================================

export interface SpendingProfile {
  // Personal
  userId: string;
  age?: number;
  city?: string;
  profession?: string;
  employmentType?: 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS' | 'STUDENT';
  monthlySalary: number;
  annualIncome: number;
  creditScore?: number;
  existingBankRelationships?: string[]; // e.g., ['HDFC', 'SBI']

  // Monthly Spending (in INR)
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

  // Preferences
  preferredRewardType?: 'cashback' | 'points' | 'miles' | 'any';
  preferredBenefits?: string[];
  feeTolerance?: number; // Max annual fee willing to pay (INR)
  premiumPreference?: boolean;
  loungePreference?: boolean;
  travelPreference?: boolean;
  cashbackPreference?: boolean;

  // Existing Wallet
  currentCardIds?: string[];
}

export interface CardScore {
  cardId: string;
  cardName: string;
  issuerName: string;
  annualFee: number;
  rewardType: string;

  // Score Dimensions (0–100 each)
  cashbackAlignment: number;
  travelAlignment: number;
  feeEfficiency: number;
  approvalLikelihood: number;
  benefitCoverage: number;
  lifestyleAlignment: number;
  capImpactPenalty: number;

  totalScore: number; // weighted composite

  estimatedAnnualRewards: number;
  estimatedAnnualValueInr: number;
  feeAdjustedSavings: number;
  effectiveRewardRate: number;

  approvalProbability: number;
  approvalDifficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';

  reasoning: string[];
  warnings: string[];
}

export interface StackRecommendation {
  cards: CardScore[];
  totalAnnualFees: number;
  totalEstimatedValueInr: number;
  netSavings: number;
  categoryAssignments: Record<string, string>; // category -> cardId
  overlapWarnings: string[];
  synergySummary: string;
}

export interface RecommendationResult {
  profileHash: string;
  generatedAt: Date;

  primaryCard: CardScore | null;
  secondaryCard: CardScore | null;
  bestValueCard: CardScore | null;
  bestFreeCard: CardScore | null;
  bestPremiumCard: CardScore | null;
  easiestApprovalCard: CardScore | null;

  optimizedStack: StackRecommendation | null;
  allRankedCards: CardScore[];

  estimatedYearlySavings: number;
  feeAdjustedSavings: number;
  effectiveRewardRate: number;

  categorySavingsBreakdown: {
    category: string;
    monthlySpend: number;
    estimatedMonthlyReward: number;
    bestCard: string;
  }[];

  overlapWarnings: string[];
  inefficiencyWarnings: string[];

  confidenceScore: number;
  ruleCoverageScore: number;
  freshnessScore: number;
  isFallback: boolean;
  fallbackReason?: string;
}
