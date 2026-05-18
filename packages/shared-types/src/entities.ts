import { CardNetwork, CardTier, CardType, RewardType, MerchantCategory, UserRole } from './enums';

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IBank extends IBaseEntity {
  name: string;
  slug: string;
  shortName?: string;
  logoUrl?: string;
  websiteUrl?: string;
  customerSupportUrl?: string;
  customerCareNumber?: string;
  headquarters?: string;
  isActive: boolean;
}

export interface ICreditCard extends IBaseEntity {
  bankId: string;
  name: string;
  slug: string;
  variant?: string;
  network: CardNetwork;
  cardType: CardType;
  tier: CardTier;
  
  joiningFee: number;
  annualFee: number;
  renewalFee: number;
  feeWaiverSpend?: number;
  addOnFee?: number;
  forexMarkup: number;

  baseRewardRate: number;
  rewardType: RewardType;
  rewardCurrency: string;
  pointValueInr: number;

  loungeAccessDomestic?: number;
  loungeAccessInternational?: number;
  loungeNetwork?: string;
  golfBenefits?: number;
  concierge: boolean;
  fuelSurchargeWaiver: boolean;

  upiEnabled: boolean;
  upiRewardRate?: number;

  minSalary?: number;
  minCreditScore?: number;

  popularityScore: number;
  confidenceScore: number;
  
  isActive: boolean;
  isFeatured: boolean;
  isDiscontinued: boolean;
}

export interface IMerchant extends IBaseEntity {
  name: string;
  normalizedName: string;
  slug: string;
  category: MerchantCategory;
  subCategory?: string;
  aliases: string[];
  mccCodes: string[];
  popularityScore: number;
  confidenceScore: number;
  sourcePriority: number;
}
