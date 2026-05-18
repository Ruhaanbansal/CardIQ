import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardMilestoneEntity } from '../../../database/entities/reward-milestone.entity';
import { TransactionContext } from '../interfaces/rewards.interface';

export interface MilestoneProgress {
  milestoneId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  unlocked: boolean;
  justUnlocked: boolean; // True if THIS transaction pushed it over the edge
}

@Injectable()
export class MilestoneEngineService {
  constructor(
    @InjectRepository(RewardMilestoneEntity)
    private readonly milestoneRepo: Repository<RewardMilestoneEntity>
  ) {}

  async calculateMilestoneImpact(context: TransactionContext): Promise<MilestoneProgress[]> {
    const milestones = await this.milestoneRepo.find({
      where: { cardId: context.cardId, isActive: true }
    });

    return milestones.map(m => {
      const prevSpend = context.yearlySpend - context.amount;
      const wasUnlocked = prevSpend >= m.targetAmount;
      const isNowUnlocked = context.yearlySpend >= m.targetAmount;

      return {
        milestoneId: m.id,
        name: m.name,
        targetAmount: Number(m.targetAmount),
        currentAmount: context.yearlySpend,
        unlocked: isNowUnlocked,
        justUnlocked: !wasUnlocked && isNowUnlocked,
      };
    });
  }
}
