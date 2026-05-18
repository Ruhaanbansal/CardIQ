import { Injectable } from '@nestjs/common';
import { SpendingProfile } from '../interfaces/recommendation.interface';

export interface CategoryConcentration {
  category: string;
  monthlyAmount: number;
  percentageOfTotal: number;
  isDominant: boolean; // > 30% of total
}

export interface ProfileAnalysis {
  totalMonthlySpend: number;
  totalAnnualSpend: number;
  categories: CategoryConcentration[];
  dominantCategory: string;
  topThreeCategories: string[];
  isHighUpiUser: boolean;
  isTraveler: boolean;
  isOnlineHeavy: boolean;
  prefersCashback: boolean;
  prefersTravel: boolean;
}

@Injectable()
export class ProfileAnalysisService {
  analyze(profile: SpendingProfile): ProfileAnalysis {
    const categoryMap: Record<string, number> = {
      online_shopping: profile.monthlyOnlineShopping,
      dining: profile.monthlyDining,
      groceries: profile.monthlyGroceries,
      travel: profile.monthlyTravel,
      fuel: profile.monthlyFuel,
      utilities: profile.monthlyUtilities,
      subscriptions: profile.monthlySubscriptions,
      entertainment: profile.monthlyEntertainment,
      upi: profile.monthlyUpi,
      international: profile.monthlyInternational,
      insurance: profile.monthlyInsurance,
      education: profile.monthlyEducation,
      rent: profile.monthlyRent,
      other: profile.monthlyOther,
    };

    const totalMonthlySpend = Object.values(categoryMap).reduce((s, v) => s + (v || 0), 0);

    const categories: CategoryConcentration[] = Object.entries(categoryMap)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category,
        monthlyAmount: amount,
        percentageOfTotal: totalMonthlySpend > 0 ? (amount / totalMonthlySpend) * 100 : 0,
        isDominant: totalMonthlySpend > 0 && amount / totalMonthlySpend > 0.3,
      }))
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount);

    const topThreeCategories = categories.slice(0, 3).map(c => c.category);
    const dominantCategory = categories[0]?.category ?? 'other';

    return {
      totalMonthlySpend,
      totalAnnualSpend: totalMonthlySpend * 12,
      categories,
      dominantCategory,
      topThreeCategories,
      isHighUpiUser: (profile.monthlyUpi / (totalMonthlySpend || 1)) > 0.3,
      isTraveler: (profile.monthlyTravel / (totalMonthlySpend || 1)) > 0.15,
      isOnlineHeavy: (profile.monthlyOnlineShopping / (totalMonthlySpend || 1)) > 0.25,
      prefersCashback: profile.cashbackPreference === true || profile.preferredRewardType === 'cashback',
      prefersTravel: profile.travelPreference === true || profile.preferredRewardType === 'miles',
    };
  }
}
