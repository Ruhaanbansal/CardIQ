import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardEntity } from '../../database/entities/credit-card.entity';
import { RewardRuleEntity } from '../../database/entities/reward-rule.entity';
import { RewardExclusionEntity } from '../../database/entities/reward-exclusion.entity';
import { RewardMilestoneEntity } from '../../database/entities/reward-milestone.entity';

import { RecommendationController } from './recommendation.controller';
import { RecommendationEngineService } from './services/recommendation-engine.service';
import { ProfileAnalysisService } from './services/profile-analysis.service';
import { EligibilityEngineService } from './services/eligibility-engine.service';
import { ApprovalProbabilityService } from './services/approval-probability.service';
import { RankingEngineService } from './services/ranking-engine.service';
import { StackRecommendationService } from './services/stack-recommendation.service';
import { OverlapDetectionService } from './services/overlap-detection.service';
import { RecommendationExplainabilityService } from './services/recommendation-explainability.service';

// Import services from Rewards module (re-instantiate with required repos)
import { AnnualSimulationService } from '../rewards/services/annual-simulation.service';
import { RewardsEngineService } from '../rewards/services/rewards-engine.service';
import { RewardRuleParserService } from '../rewards/services/reward-rule-parser.service';
import { ExclusionEngineService } from '../rewards/services/exclusion-engine.service';
import { CapTrackingService } from '../rewards/services/cap-tracking.service';
import { MilestoneEngineService } from '../rewards/services/milestone-engine.service';
import { EffectiveSavingsService } from '../rewards/services/effective-savings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CreditCardEntity,
      RewardRuleEntity,
      RewardExclusionEntity,
      RewardMilestoneEntity,
    ]),
  ],
  controllers: [RecommendationController],
  providers: [
    RecommendationEngineService,
    ProfileAnalysisService,
    EligibilityEngineService,
    ApprovalProbabilityService,
    RankingEngineService,
    StackRecommendationService,
    OverlapDetectionService,
    RecommendationExplainabilityService,
    // Reward services (needed by AnnualSimulationService dependency chain)
    AnnualSimulationService,
    RewardsEngineService,
    RewardRuleParserService,
    ExclusionEngineService,
    CapTrackingService,
    MilestoneEngineService,
    EffectiveSavingsService,
  ],
  exports: [RecommendationEngineService],
})
export class RecommendationModule {}
