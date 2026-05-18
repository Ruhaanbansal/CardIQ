import { Injectable, Logger } from '@nestjs/common';
import { ScrapeJob } from '../interfaces/scraper.interface';

export interface RetryDecision {
  shouldRetry: boolean;
  delayMs: number;
  reason: string;
}

@Injectable()
export class RetryEngineService {
  private readonly logger = new Logger(RetryEngineService.name);
  private readonly BASE_DELAY_MS = 2000;
  private readonly MAX_DELAY_MS = 60_000;

  evaluate(job: ScrapeJob, error: Error): RetryDecision {
    if (job.retryCount >= job.maxRetries) {
      return {
        shouldRetry: false,
        delayMs: 0,
        reason: `Max retries (${job.maxRetries}) exhausted for job ${job.id}.`,
      };
    }

    // Anti-bot / rate-limit detected — longer backoff
    const isRateLimit = /429|403|captcha|blocked|rate.limit/i.test(error.message);
    const multiplier = isRateLimit ? 5 : 1;

    // Exponential backoff: 2s, 4s, 8s, 16s... × multiplier
    const delayMs = Math.min(
      this.BASE_DELAY_MS * Math.pow(2, job.retryCount) * multiplier,
      this.MAX_DELAY_MS,
    );

    const reason = isRateLimit
      ? `Anti-bot/rate-limit detected. Backing off ${delayMs}ms.`
      : `Transient error. Retry #${job.retryCount + 1} in ${delayMs}ms.`;

    this.logger.warn(`[Retry] Job ${job.id}: ${reason}`);
    return { shouldRetry: true, delayMs, reason };
  }

  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
