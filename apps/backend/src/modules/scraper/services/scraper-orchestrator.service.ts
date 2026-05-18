import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { ScraperJobEntity } from '../../../database/entities/scraper.entities';
import {
  ScrapeJob, ScrapeResult, ScraperBank,
  ScraperSourceType, ParsedBenefit,
} from '../interfaces/scraper.interface';

import { PlaywrightAdapter } from '../adapters/playwright.adapter';
import { CheerioAdapter } from '../adapters/cheerio.adapter';
import { PDFAdapter } from '../adapters/pdf.adapter';
import { ParserEngineService } from './parser-engine.service';
import { SnapshotService } from './snapshot.service';
import { DiffEngineService } from './diff-engine.service';
import { VerificationService } from './verification.service';
import { RetryEngineService } from './retry-engine.service';

@Injectable()
export class ScraperOrchestratorService {
  private readonly logger = new Logger(ScraperOrchestratorService.name);

  constructor(
    @InjectRepository(ScraperJobEntity)
    private readonly jobRepo: Repository<ScraperJobEntity>,
    private readonly playwright: PlaywrightAdapter,
    private readonly cheerio: CheerioAdapter,
    private readonly pdf: PDFAdapter,
    private readonly parser: ParserEngineService,
    private readonly snapshots: SnapshotService,
    private readonly diffEngine: DiffEngineService,
    private readonly verifier: VerificationService,
    private readonly retryEngine: RetryEngineService,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * Main 14-step scrape pipeline for a single job.
   */
  async run(job: ScrapeJob): Promise<void> {
    const start = Date.now();
    this.logger.log(`[STEP 1] Starting job ${job.id} → ${job.url}`);

    // ── STEP 2: Update job status ───────────────────────────
    await this.jobRepo.update(job.id, { status: 'running', startedAt: new Date() });

    let result: ScrapeResult | undefined;
    let parsed: ParsedBenefit | undefined;

    // ── STEPS 3–5: Fetch with adapter chain + retry ─────────
    for (let attempt = 0; attempt <= job.maxRetries; attempt++) {
      try {
        result = await this.fetchWithFallback(job);
        break;
      } catch (err: any) {
        const decision = this.retryEngine.evaluate(job, err);
        if (!decision.shouldRetry) {
          await this.failJob(job.id, err.message);
          this.events.emit('SCRAPE_FAILED', { jobId: job.id, bank: job.bank, error: err.message });
          return;
        }
        job.retryCount = attempt + 1;
        await this.jobRepo.update(job.id, { retryCount: job.retryCount, status: 'retrying' });
        await this.retryEngine.wait(decision.delayMs);
      }
    }

    if (!result) return;

    // ── STEPS 6–7: Parsing ───────────────────────────────────
    this.logger.log(`[STEP 6] Parsing result for ${job.bank}`);
    parsed = job.sourceType === 'pdf'
      ? await this.parser.parseText(result.rawText ?? '', job.bank, job.url)
      : await this.parser.parseHTML(result);
    parsed.cardId = job.cardId;

    // ── STEP 8: Validation ──────────────────────────────────
    const verification = this.verifier.verify(parsed, 90);
    this.logger.log(`[STEP 8] Confidence: ${verification.overallConfidence}% — ${verification.verificationStatus}`);

    // ── STEPS 9–10: Snapshot + Change Detection ─────────────
    const previous = await this.snapshots.getLatest(job.bank, job.cardId);
    const { snapshot, isDuplicate } = await this.snapshots.save(
      job.bank, job.sourceType, job.url,
      result.rawHtml ?? result.rawText ?? '',
      parsed, job.cardId,
    );

    this.events.emit('SNAPSHOT_CREATED', { snapshotId: snapshot.id, bank: job.bank, isDuplicate });

    if (!isDuplicate && previous) {
      const diff = await this.diffEngine.detectChanges(previous, snapshot);
      if (diff) {
        this.events.emit('BENEFIT_CHANGED', {
          bank: job.bank, cardId: job.cardId, diff,
          severity: diff.overallSeverity,
        });
        this.logger.warn(`[STEP 10] ${diff.changes.length} change(s) detected for ${job.bank}`);
      }
    }

    // ── STEP 11–14: Verification + Finalize ─────────────────
    this.events.emit('DATA_VERIFIED', {
      snapshotId: snapshot.id,
      bank: job.bank,
      confidence: verification.overallConfidence,
      status: verification.verificationStatus,
    });

    await this.jobRepo.update(job.id, {
      status: 'completed',
      completedAt: new Date(),
    });

    this.logger.log(`[STEP 14] Job ${job.id} completed in ${Date.now() - start}ms`);
  }

  private async fetchWithFallback(job: ScrapeJob): Promise<ScrapeResult> {
    // PDF jobs go straight to the PDF adapter
    if (job.sourceType === 'pdf') {
      const r = await this.pdf.fetchAndParse(job);
      return { ...r, jobId: job.id, isCached: false };
    }

    // Primary: Playwright
    try {
      const r = await this.playwright.fetchPage(job);
      return { ...r, jobId: job.id, isCached: false };
    } catch (err: any) {
      this.logger.warn(`Playwright failed for ${job.url}: ${err.message}. Falling back to Cheerio.`);
    }

    // Fallback: Cheerio (static HTML)
    const r = await this.cheerio.fetchPage(job);
    return { ...r, jobId: job.id, isCached: false };
  }

  private async failJob(jobId: string, errorMsg: string) {
    await this.jobRepo.update(jobId, {
      status: 'failed',
      lastError: errorMsg,
      completedAt: new Date(),
    });
  }
}
