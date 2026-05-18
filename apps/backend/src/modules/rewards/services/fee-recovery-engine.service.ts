import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreditCardEntity } from '../../../database/entities/credit-card.entity';

export interface FeeRecoveryResult {
  cardId: string;
  annualFee: number;
  joiningFee: number;
  requiredMonthlySpend: number;
  actualMonthlySpend: number;
  monthsToBreakEven: number | null;
  yearlyBreakEvenSpend: number;
  isJustified: boolean;
  roiPercent: number;
  summaryMessage: string;
}

@Injectable()
export class FeeRecoveryEngineService {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly cardRepo: Repository<CreditCardEntity>,
  ) {}

  async calculateFeeRecovery(
    cardId: string,
    actualMonthlySpend: number,
    projectedAnnualRewards: number,
  ): Promise<FeeRecoveryResult> {
    const card = await this.cardRepo.findOne({ where: { id: cardId } });
    if (!card) throw new Error(`Card ${cardId} not found`);

    const annualFee = Number(card.annualFee || 0);
    const joiningFee = Number(card.joiningFee || 0);
    const totalFee = annualFee + joiningFee;

    // How much monthly spend is needed to generate enough reward to cover the fee?
    // Based on base reward rate. Assumes user earns base reward on all spend.
    const baseRateDecimal = Number(card.baseRewardRate || 1) / 100;
    const requiredMonthlySpend = baseRateDecimal > 0 ? totalFee / (baseRateDecimal * 12) : Infinity;

    // How many months at their actual spend to recover fees?
    const monthlyRewardAtActualSpend = actualMonthlySpend * baseRateDecimal;
    const monthsToBreakEven =
      monthlyRewardAtActualSpend > 0
        ? Math.ceil(totalFee / monthlyRewardAtActualSpend)
        : null;

    const isJustified = projectedAnnualRewards >= totalFee;
    const roiPercent = totalFee > 0 ? ((projectedAnnualRewards - totalFee) / totalFee) * 100 : 100;

    let summaryMessage: string;
    if (totalFee === 0) {
      summaryMessage = 'This is a no-fee card. Every rupee of rewards is pure gain.';
    } else if (!isJustified) {
      summaryMessage = `This card may not justify its annual fee of ₹${annualFee} for your spending profile. Estimated rewards: ₹${projectedAnnualRewards.toFixed(0)}.`;
    } else if (monthsToBreakEven !== null && monthsToBreakEven <= 3) {
      summaryMessage = `Excellent! Annual fee recovered in ~${monthsToBreakEven} month(s) at your spending level.`;
    } else {
      summaryMessage = `Annual fee recovered in ~${monthsToBreakEven} month(s). ROI: ${roiPercent.toFixed(1)}% over fees paid.`;
    }

    return {
      cardId,
      annualFee,
      joiningFee,
      requiredMonthlySpend,
      actualMonthlySpend,
      monthsToBreakEven,
      yearlyBreakEvenSpend: requiredMonthlySpend * 12,
      isJustified,
      roiPercent,
      summaryMessage,
    };
  }
}
