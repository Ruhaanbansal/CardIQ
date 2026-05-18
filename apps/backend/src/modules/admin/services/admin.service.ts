import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScraperJobEntity, ScraperSnapshotEntity, BenefitChangeEntity } from '../../../database/entities/scraper.entities';
import { SystemHealthSummary } from '../interfaces/admin.interface';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(ScraperJobEntity)
    private readonly jobRepo: Repository<ScraperJobEntity>,
    @InjectRepository(ScraperSnapshotEntity)
    private readonly snapshotRepo: Repository<ScraperSnapshotEntity>,
    @InjectRepository(BenefitChangeEntity)
    private readonly changeRepo: Repository<BenefitChangeEntity>,
  ) {}

  async getSystemHealth(): Promise<SystemHealthSummary> {
    const [total, failed, pendingChanges] = await Promise.all([
      this.jobRepo.count(),
      this.jobRepo.count({ where: { status: 'failed' } }),
      this.changeRepo.count({ where: { requiresReview: true, isReviewed: false } }),
    ]);

    const successRate = total > 0 ? Math.round(((total - failed) / total) * 100) : 100;

    const overallStatus =
      successRate < 50 || pendingChanges > 20 ? 'critical' :
      successRate < 80 || pendingChanges > 5  ? 'degraded' :
      'healthy';

    return {
      overallStatus,
      scraperHealth: { successRate, failedJobs: failed },
      aiProviderHealth: { available: 4, total: 4 }, // 4 providers configured
      queueHealth: {
        pending: await this.jobRepo.count({ where: { status: 'pending' } }),
        failed,
      },
      cacheHealth: { hitRate: 0, isRedisUp: true }, // Extended in future phase
      pendingVerifications: pendingChanges,
      pendingMerchantReviews: 0,
      generatedAt: new Date(),
    };
  }

  async getQueueStats() {
    const [pending, running, completed, failed, retrying] = await Promise.all([
      this.jobRepo.count({ where: { status: 'pending' } }),
      this.jobRepo.count({ where: { status: 'running' } }),
      this.jobRepo.count({ where: { status: 'completed' } }),
      this.jobRepo.count({ where: { status: 'failed' } }),
      this.jobRepo.count({ where: { status: 'retrying' } }),
    ]);
    return { pending, running, completed, failed, retrying, total: pending + running + completed + failed + retrying };
  }

  async getRecentChanges(limit = 20) {
    return this.changeRepo.find({
      where: { requiresReview: true },
      order: { detectedAt: 'DESC' },
      take: limit,
    });
  }

  async markChangeReviewed(changeId: string): Promise<void> {
    await this.changeRepo.update(changeId, { isReviewed: true });
  }
}
