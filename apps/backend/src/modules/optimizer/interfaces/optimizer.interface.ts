// ============================================================
// CARDIQ OPTIMIZER — CORE INTERFACES
// ============================================================

export type PaymentMethod = 'CREDIT' | 'UPI' | 'POS' | 'ECOM' | 'WALLET' | 'EMI';

export interface OptimizationRequest {
  // Transaction Details
  merchantName: string;
  normalizedMerchant?: string;
  merchantCategory?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentNetwork?: string;
  mcc?: string;
  transactionDate?: Date;

  // Transaction Flags
  isUpiTransaction?: boolean;
  isInternational?: boolean;
  isEmiTransaction?: boolean;
  isWalletLoad?: boolean;
  isInsurancePayment?: boolean;
  isFuelPayment?: boolean;
  isUtilityPayment?: boolean;

  // User Context
  userId: string;
  userCardIds: string[]; // Cards the user owns
}

export interface RankedCard {
  rank: number;
  cardId: string;
  cardName: string;
  issuerName: string;
  annualFee: number;
  rewardType: 'cashback' | 'points' | 'miles';

  cashbackAmount: number;
  pointsEarned: number;
  milesEarned: number;
  effectiveValueInr: number;
  effectiveRewardRate: number;

  appliedRules: string[];
  exclusionsApplied: string[];
  warnings: string[];

  capImpact?: {
    capType: string;
    originalReward: number;
    cappedReward: number;
    limitRemaining: number;
    capHit: boolean;
  };

  confidenceScore: number;
  reasoning: string;
}

export interface AlternativeCard {
  cardId: string;
  cardName: string;
  issuerName: string;
  effectiveValueInr: number;
  effectiveRewardRate: number;
  differenceVsBest: number; // negative = worse than best
  tradeoffNote: string;    // "Uncapped but lower rate"
}

export interface OptimizationResult {
  requestId: string;
  merchantName: string;
  merchantCategory: string;
  amount: number;
  currency: string;

  bestCard: RankedCard | null;
  allRankedCards: RankedCard[];
  alternatives: AlternativeCard[];

  globalWarnings: string[];

  confidenceScore: number;
  merchantConfidenceScore: number;
  ruleCoverageScore: number;
  freshnessScore: number;

  isFallback: boolean;
  fallbackReason?: string;

  optimizationTrace: string[];
  generatedAt: Date;
}

export interface BatchOptimizationItem {
  request: OptimizationRequest;
  result: OptimizationResult;
}

export interface BatchOptimizationResult {
  totalTransactions: number;
  totalAmount: number;
  totalEstimatedRewards: number;
  overallEffectiveRate: number;
  items: BatchOptimizationItem[];
  cardUsageSummary: Record<string, { count: number; totalRewards: number }>;
  warnings: string[];
}
