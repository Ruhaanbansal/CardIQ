import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RewardsEngineService } from './services/rewards-engine.service';
import { AnnualSimulationService, AnnualSimulationInput } from './services/annual-simulation.service';
import { FeeRecoveryEngineService } from './services/fee-recovery-engine.service';
import { TransactionContext } from './interfaces/rewards.interface';

export class CalculateRewardDto {
  transaction: TransactionContext;
}

@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly rewardsEngine: RewardsEngineService,
    private readonly annualSimulation: AnnualSimulationService,
    private readonly feeRecovery: FeeRecoveryEngineService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('calculate')
  async calculateReward(@Body() dto: CalculateRewardDto) {
    // In production, we'd add input validation here for the TransactionContext
    return this.rewardsEngine.calculateReward(dto.transaction);
  }

  @HttpCode(HttpStatus.OK)
  @Post('simulate')
  async simulateBatchRewards(@Body() dtos: CalculateRewardDto[]) {
    // Allows sending an array of simulated transactions to see combined output
    const results = [];
    for (const dto of dtos) {
      const res = await this.rewardsEngine.calculateReward(dto.transaction);
      results.push(res);
    }
    
    // Aggregate totals
    const totalEffectiveInr = results.reduce((sum, r) => sum + r.effectiveValueInr, 0);
    const totalSpend = dtos.reduce((sum, dto) => sum + dto.transaction.amount, 0);
    const overallEffectiveRate = totalSpend > 0 ? (totalEffectiveInr / totalSpend) * 100 : 0;

    return {
      totalTransactions: results.length,
      totalSpend,
      totalEffectiveInr,
      overallEffectiveRate,
      breakdown: results,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('annual-projection')
  async annualProjection(@Body() input: AnnualSimulationInput) {
    return this.annualSimulation.simulateAnnual(input);
  }

  @HttpCode(HttpStatus.OK)
  @Post('fee-recovery')
  async calculateFeeRecovery(
    @Body() body: { cardId: string; monthlySpend: number; projectedAnnualRewards: number },
  ) {
    return this.feeRecovery.calculateFeeRecovery(
      body.cardId,
      body.monthlySpend,
      body.projectedAnnualRewards,
    );
  }
}
