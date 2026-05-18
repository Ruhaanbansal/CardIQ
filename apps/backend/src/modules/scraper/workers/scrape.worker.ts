import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ScraperOrchestratorService } from '../services/scraper-orchestrator.service';
import { ScrapeJob } from '../interfaces/scraper.interface';

export const SCRAPE_QUEUE = 'scrape-queue';

@Processor(SCRAPE_QUEUE)
export class ScrapeWorker extends WorkerHost {
  private readonly logger = new Logger(ScrapeWorker.name);

  constructor(private readonly orchestrator: ScraperOrchestratorService) {
    super();
  }

  async process(job: Job<ScrapeJob>): Promise<void> {
    this.logger.log(`Processing BullMQ job ${job.id}: ${job.data.bank} — ${job.data.url}`);
    try {
      await this.orchestrator.run(job.data);
    } catch (err: any) {
      this.logger.error(`Job ${job.id} crashed: ${err.message}`);
      throw err; // BullMQ will handle retry via job options
    }
  }
}
