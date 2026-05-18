import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { AdminAuditService } from './services/admin-audit.service';
import { FeatureFlagService } from './services/feature-flag.service';
import { ApprovalWorkflowService } from './services/approval-workflow.service';
import { ModerationService } from './services/moderation.service';

import { AdminAuditLogEntity, FeatureFlagEntity } from '../../database/entities/admin.entities';
import { ScraperJobEntity, ScraperSnapshotEntity, BenefitChangeEntity } from '../../database/entities/scraper.entities';
import { CreditCardEntity } from '../../database/entities/credit-card.entity';
import { RewardRuleEntity } from '../../database/entities/reward-rule.entity';
import { MerchantEntity } from '../../database/entities/merchant.entity';
import { UserEntity } from '../../database/entities/user.entity';

// Re-use scraper scheduler for retry controls
import { ScrapeSchedulerService } from '../scraper/services/scrape-scheduler.service';
import { BullModule } from '@nestjs/bullmq';
import { SCRAPE_QUEUE } from '../scraper/workers/scrape.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAuditLogEntity,
      FeatureFlagEntity,
      ScraperJobEntity,
      ScraperSnapshotEntity,
      BenefitChangeEntity,
      CreditCardEntity,
      RewardRuleEntity,
      MerchantEntity,
      UserEntity,
    ]),
    BullModule.registerQueue({ name: SCRAPE_QUEUE }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminAuditService,
    FeatureFlagService,
    ApprovalWorkflowService,
    ModerationService,
    ScrapeSchedulerService,
  ],
  exports: [FeatureFlagService, AdminAuditService],
})
export class AdminModule {}
