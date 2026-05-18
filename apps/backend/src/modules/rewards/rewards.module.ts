import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsController } from './rewards.controller';
import { RewardsEngineService } from './services/rewards-engine.service';
import { RewardRuleParserService } from './services/reward-rule-parser.service';
import { ExclusionEngineService } from './services/exclusion-engine.service';
import { CapTrackingService } from './services/cap-tracking.service';
import { MilestoneEngineService } from './services/milestone-engine.service';
import { EffectiveSavingsService } from './services/effective-savings.service';
import { AnnualSimulationService } from './services/annual-simulation.service';
import { FeeRecoveryEngineService } from './services/fee-recovery-engine.service';

import { RewardRuleEntity } from '../../database/entities/reward-rule.entity';
import { RewardExclusionEntity } from '../../database/entities/reward-exclusion.entity';
import { RewardMilestoneEntity } from '../../database/entities/reward-milestone.entity';
import { CreditCardEntity } from '../../database/entities/credit-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardRuleEntity,
      RewardExclusionEntity,
      RewardMilestoneEntity,
      CreditCardEntity
    ]),
  ],
  controllers: [RewardsController],
  providers: [
    RewardsEngineService,
    RewardRuleParserService,
    ExclusionEngineService,
    CapTrackingService,
    MilestoneEngineService,
    EffectiveSavingsService,
    AnnualSimulationService,
    FeeRecoveryEngineService,
  ],
  exports: [RewardsEngineService, AnnualSimulationService, FeeRecoveryEngineService],
})
export class RewardsModule {}
