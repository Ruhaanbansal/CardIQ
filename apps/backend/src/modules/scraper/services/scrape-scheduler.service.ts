import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ScraperJobEntity } from '../../../database/entities/scraper.entities';
import { ScrapeJob, ScraperBank, ScraperSourceType } from '../interfaces/scraper.interface';
import { SCRAPE_QUEUE } from '../workers/scrape.worker';

@Injectable()
export class ScrapeSchedulerService {
  private readonly logger = new Logger(ScrapeSchedulerService.name);

  // Bank → source URLs map
  private readonly BANK_SOURCES: Record<ScraperBank, { type: ScraperSourceType; url: string }[]> = {
    HDFC: [
      { type: 'reward_page', url: 'https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/74d2e95a-da3e-4b5e-a6df-d7e1b2d8fc99/Personal/Pay/Cards/Credit-Card/new-credit-card-landing-page/cards.html' },
    ],
    SBI: [{ type: 'benefits_page', url: 'https://www.sbicard.com/en/personal/credit-cards.page' }],
    ICICI: [{ type: 'benefits_page', url: 'https://www.icicibank.com/personal-banking/cards/credit-card' }],
    AXIS: [{ type: 'benefits_page', url: 'https://www.axisbank.com/retail/cards/credit-card' }],
    AMEX: [{ type: 'benefits_page', url: 'https://www.americanexpress.com/en-in/credit-cards/' }],
    KOTAK: [{ type: 'benefits_page', url: 'https://www.kotak.com/en/personal-banking/cards/credit-cards.html' }],
    RBL: [{ type: 'benefits_page', url: 'https://www.rblbank.com/credit-cards' }],
    IDFC: [{ type: 'benefits_page', url: 'https://www.idfcfirstbank.com/credit-card' }],
    HSBC: [{ type: 'benefits_page', url: 'https://www.hsbc.co.in/credit-cards/' }],
    AU: [{ type: 'benefits_page', url: 'https://www.aubank.in/credit-cards' }],
    YES_BANK: [{ type: 'benefits_page', url: 'https://www.yesbank.in/personal-banking/yes-individual/digital-products-and-channels/cards/credit-card' }],
    SCB: [{ type: 'benefits_page', url: 'https://www.sc.com/in/credit-cards/' }],
  };

  constructor(
    @InjectQueue(SCRAPE_QUEUE) private readonly queue: Queue,
    @InjectRepository(ScraperJobEntity)
    private readonly jobRepo: Repository<ScraperJobEntity>,
  ) {}

  async enqueueJob(
    bank: ScraperBank,
    url: string,
    sourceType: ScraperSourceType,
    priority = 5,
    cardId?: string,
  ): Promise<ScraperJobEntity> {
    const jobEntity = this.jobRepo.create({ bank, cardId, url, sourceType, priority, status: 'pending', retryCount: 0, maxRetries: 3 });
    await this.jobRepo.save(jobEntity);

    const jobData: ScrapeJob = {
      id: jobEntity.id,
      bank,
      cardId,
      sourceType,
      url,
      priority,
      retryCount: 0,
      maxRetries: 3,
      scheduledAt: new Date(),
      status: 'pending',
    };

    await this.queue.add(`scrape:${bank}`, jobData, {
      priority,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Enqueued scrape job: ${bank} → ${url}`);
    return jobEntity;
  }

  async enqueueAllBanks(): Promise<void> {
    for (const [bank, sources] of Object.entries(this.BANK_SOURCES)) {
      for (const source of sources) {
        await this.enqueueJob(bank as ScraperBank, source.url, source.type, 5);
      }
    }
    this.logger.log(`Enqueued scrape jobs for ${Object.keys(this.BANK_SOURCES).length} banks.`);
  }

  async getJobs(limit = 20): Promise<ScraperJobEntity[]> {
    return this.jobRepo.find({ order: { scheduledAt: 'DESC' }, take: limit });
  }
}
