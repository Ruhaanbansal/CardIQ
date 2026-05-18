import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ScraperController } from './scraper.controller';
import { ScrapeSchedulerService } from './services/scrape-scheduler.service';
import { ScraperOrchestratorService } from './services/scraper-orchestrator.service';
import { ParserEngineService } from './services/parser-engine.service';
import { SnapshotService } from './services/snapshot.service';
import { DiffEngineService } from './services/diff-engine.service';
import { FreshnessService } from './services/freshness.service';
import { RetryEngineService } from './services/retry-engine.service';
import { VerificationService } from './services/verification.service';

import { PlaywrightAdapter } from './adapters/playwright.adapter';
import { CheerioAdapter } from './adapters/cheerio.adapter';
import { PDFAdapter } from './adapters/pdf.adapter';

import { ScrapeWorker, SCRAPE_QUEUE } from './workers/scrape.worker';

import {
  ScraperSnapshotEntity,
  ScraperJobEntity,
  BenefitChangeEntity,
} from '../../database/entities/scraper.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScraperSnapshotEntity,
      ScraperJobEntity,
      BenefitChangeEntity,
    ]),
    BullModule.registerQueue({ name: SCRAPE_QUEUE }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ScraperController],
  providers: [
    // Services
    ScrapeSchedulerService,
    ScraperOrchestratorService,
    ParserEngineService,
    SnapshotService,
    DiffEngineService,
    FreshnessService,
    RetryEngineService,
    VerificationService,
    // Adapters
    PlaywrightAdapter,
    CheerioAdapter,
    PDFAdapter,
    // Worker
    ScrapeWorker,
  ],
  exports: [FreshnessService, SnapshotService, ScrapeSchedulerService],
})
export class ScraperModule {}
