import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OptimizerController } from './optimizer.controller';
import { OptimizerEngineService } from './services/optimizer-engine.service';
import { MerchantRoutingService } from './services/merchant-routing.service';
import { TransactionSimulationService } from './services/transaction-simulation.service';
import { TransactionRankingService, AlternativeRankingService } from './services/transaction-ranking.service';
import { OptimizerWarningService } from './services/optimizer-warning.service';
import { OptimizerExplainabilityService } from './services/optimizer-explainability.service';
import { BatchOptimizerService } from './services/batch-optimizer.service';

// Merchant Phase 3 dependencies
import { NormalizationService } from '../merchants/services/normalization.service';
import { NarrationParserService } from '../merchants/services/narration-parser.service';
import { MerchantEntity } from '../../database/entities/merchant.entity';

// Rewards Phase 4 dependencies
import { RewardsEngineService } from '../rewards/services/rewards-engine.service';
import { RewardRuleParserService } from '../rewards/services/reward-rule-parser.service';
import { ExclusionEngineService } from '../rewards/services/exclusion-engine.service';
import { CapTrackingService } from '../rewards/services/cap-tracking.service';
import { MilestoneEngineService } from '../rewards/services/milestone-engine.service';
import { EffectiveSavingsService } from '../rewards/services/effective-savings.service';
import { RewardRuleEntity } from '../../database/entities/reward-rule.entity';
import { RewardExclusionEntity } from '../../database/entities/reward-exclusion.entity';
import { RewardMilestoneEntity } from '../../database/entities/reward-milestone.entity';
import { CreditCardEntity } from '../../database/entities/credit-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditCardEntity,
      MerchantEntity,
      RewardRuleEntity,
      RewardExclusionEntity,
      RewardMilestoneEntity,
    ]),
  ],
  controllers: [OptimizerController],
  providers: [
    // Optimizer services
    OptimizerEngineService,
    MerchantRoutingService,
    TransactionSimulationService,
    TransactionRankingService,
    AlternativeRankingService,
    OptimizerWarningService,
    OptimizerExplainabilityService,
    BatchOptimizerService,
    // Merchant dependencies
    NormalizationService,
    NarrationParserService,
    // Rewards dependencies
    RewardsEngineService,
    RewardRuleParserService,
    ExclusionEngineService,
    CapTrackingService,
    MilestoneEngineService,
    EffectiveSavingsService,
  ],
  exports: [OptimizerEngineService, BatchOptimizerService],
})
export class OptimizerModule {}
