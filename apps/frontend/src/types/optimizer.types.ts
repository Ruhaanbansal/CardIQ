// Frontend-facing types mirroring backend interfaces

export type PaymentMethod = 'CREDIT' | 'UPI' | 'POS' | 'ECOM' | 'WALLET' | 'EMI';

export interface OptimizationRequest {
  merchantName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  userId: string;
  userCardIds: string[];
  isUpiTransaction?: boolean;
  isInternational?: boolean;
  isFuelPayment?: boolean;
  isWalletLoad?: boolean;
  merchantCategory?: string;
}

export interface RankedCard {
  rank: number;
  cardId: string;
  cardName: string;
  issuerName: string;
  annualFee: number;
  rewardType: string;
  cashbackAmount: number;
  effectiveValueInr: number;
  effectiveRewardRate: number;
  appliedRules: string[];
  warnings: string[];
  confidenceScore: number;
  reasoning: string;
}

export interface AlternativeCard {
  cardId: string;
  cardName: string;
  issuerName: string;
  effectiveValueInr: number;
  effectiveRewardRate: number;
  differenceVsBest: number;
  tradeoffNote: string;
}

export interface OptimizationResult {
  requestId: string;
  merchantName: string;
  merchantCategory: string;
  amount: number;
  bestCard: RankedCard | null;
  allRankedCards: RankedCard[];
  alternatives: AlternativeCard[];
  globalWarnings: string[];
  confidenceScore: number;
  merchantConfidenceScore: number;
  isFallback: boolean;
  optimizationTrace: string[];
  generatedAt: string;
}

export interface BatchOptimizationResult {
  totalTransactions: number;
  totalAmount: number;
  totalEstimatedRewards: number;
  overallEffectiveRate: number;
  cardUsageSummary: Record<string, { count: number; totalRewards: number }>;
  warnings: string[];
}
