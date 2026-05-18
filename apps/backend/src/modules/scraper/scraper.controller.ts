import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ScrapeSchedulerService } from './services/scrape-scheduler.service';
import { SnapshotService } from './services/snapshot.service';
import { FreshnessService } from './services/freshness.service';
import { ScraperBank, ScraperSourceType } from './interfaces/scraper.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitChangeEntity, ScraperJobEntity } from '../../database/entities/scraper.entities';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly scheduler: ScrapeSchedulerService,
    private readonly snapshots: SnapshotService,
    private readonly freshness: FreshnessService,
    @InjectRepository(ScraperJobEntity)
    private readonly jobRepo: Repository<ScraperJobEntity>,
    @InjectRepository(BenefitChangeEntity)
    private readonly changeRepo: Repository<BenefitChangeEntity>,
  ) {}

  /** POST /api/scraper/run — enqueue a scrape job */
  @HttpCode(HttpStatus.OK)
  @Post('run')
  async run(
    @Body() body: {
      bank: ScraperBank;
      url: string;
      sourceType: ScraperSourceType;
      priority?: number;
      cardId?: string;
    },
  ) {
    const job = await this.scheduler.enqueueJob(
      body.bank, body.url, body.sourceType, body.priority ?? 5, body.cardId,
    );
    return { jobId: job.id, status: job.status, message: 'Scrape job enqueued.' };
  }

  /** POST /api/scraper/run-all — trigger full bank refresh */
  @HttpCode(HttpStatus.OK)
  @Post('run-all')
  async runAll() {
    await this.scheduler.enqueueAllBanks();
    return { message: 'Full bank refresh enqueued for all 12 banks.' };
  }

  /** POST /api/scraper/retry */
  @HttpCode(HttpStatus.OK)
  @Post('retry')
  async retry(@Body() body: { jobId: string }) {
    const job = await this.jobRepo.findOne({ where: { id: body.jobId } });
    if (!job) return { error: 'Job not found' };
    const requeued = await this.scheduler.enqueueJob(
      job.bank as ScraperBank, job.url, job.sourceType as ScraperSourceType, 1,
    );
    return { jobId: requeued.id, status: 'retry_enqueued' };
  }

  /** GET /api/scraper/jobs */
  @Get('jobs')
  async getJobs(@Query('limit') limit = 20) {
    return this.scheduler.getJobs(+limit);
  }

  /** GET /api/scraper/snapshots */
  @Get('snapshots')
  async getSnapshots(
    @Query('bank') bank: ScraperBank,
    @Query('limit') limit = 10,
  ) {
    return this.snapshots.getHistory(bank, +limit);
  }

  /** GET /api/scraper/changes */
  @Get('changes')
  async getChanges(@Query('limit') limit = 20) {
    return this.changeRepo.find({
      order: { detectedAt: 'DESC' },
      take: +limit,
    });
  }

  /** GET /api/scraper/failures */
  @Get('failures')
  async getFailures(@Query('limit') limit = 20) {
    return this.jobRepo.find({
      where: { status: 'failed' },
      order: { scheduledAt: 'DESC' },
      take: +limit,
    });
  }

  /** GET /api/scraper/source-health */
  @Get('source-health')
  async sourceHealth() {
    const jobs = await this.jobRepo.find({ order: { scheduledAt: 'DESC' }, take: 200 });
    const byBank: Record<string, { total: number; failed: number; successRate: string }> = {};
    for (const job of jobs) {
      if (!byBank[job.bank]) byBank[job.bank] = { total: 0, failed: 0, successRate: '0%' };
      byBank[job.bank].total++;
      if (job.status === 'failed') byBank[job.bank].failed++;
    }
    for (const bank in byBank) {
      const s = byBank[bank];
      s.successRate = `${Math.round(((s.total - s.failed) / s.total) * 100)}%`;
    }
    return byBank;
  }
}
