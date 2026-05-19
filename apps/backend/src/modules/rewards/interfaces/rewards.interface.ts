export interface TransactionContext {
  id?: string;
  merchantName: string;
  normalizedMerchant: string;
  merchantCategory?: string;
  amount: number;
  currency: string;
  paymentMethod: 'CREDIT' | 'UPI' | 'POS' | 'ECOM' | 'WALLET' | 'EMI';
  mcc?: string;
  transactionDate: Date;
  
  userId: string;
  cardId: string;
  
  monthlySpend: number; // Spend on this card this month (for caps)
  categoryMonthlySpend: Record<string, number>; // Spend on specific categories
  merchantMonthlySpend: Record<string, number>; // Spend on specific merchants
  
  yearlySpend: number; // Spend on this card this year (for milestones)
}

export interface RuleCondition {
  merchant?: string[];
  category?: string[];
  mcc?: string[];
  paymentMethod?: string[];
  minAmount?: number;
  maxAmount?: number;
  excludedCategories?: string[];
}

export interface RewardAction {
  type: 'cashback' | 'points' | 'miles';
  rate: number;
  multiplier?: number;
  cap?: {
    monthly?: number;
    yearly?: number;
    perTransaction?: number;
  };
}

export interface RewardCalculationResult {
  cardId: string;
  transactionAmount: number;
  
  rewardType: 'cashback' | 'points' | 'miles';
  rewardValue: number; // The raw calculated amount (points or INR)
  effectiveValueInr: number; // points * pointValueInr
  effectiveRewardRate: number; // (effectiveValueInr / transactionAmount) * 100
  
  appliedRules: string[];
  excludedRules: string[];
  warnings: string[];
  
  capImpact?: {
    capType: string;
    originalReward: number;
    cappedReward: number;
    limitRemaining: number;
    capHit: boolean;
  };
  
  milestoneProgress?: {
    milestoneId: string;
    targetAmount: number;
    currentAmount: number;
    unlocked: boolean;
  }[];

  confidenceScore: number;
  isFallback: boolean;
}
