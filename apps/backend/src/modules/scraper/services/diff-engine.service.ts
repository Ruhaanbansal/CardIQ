import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BenefitChangeEntity, ScraperSnapshotEntity } from '../../../database/entities/scraper.entities';
import {
  SnapshotDiff,
  BenefitChange,
  ChangeSeverity,
  ParsedBenefit,
} from '../interfaces/scraper.interface';

const SEVERITY_MAP: Record<string, ChangeSeverity> = {
  rewardRate:         'critical',
  monthlyCap:         'high',
  annualFee:          'high',
  loungeAccessCount:  'medium',
  fuelSurchargeWaiver:'medium',
  benefits:           'low',
  exclusions:         'medium',
};

@Injectable()
export class DiffEngineService {
  private readonly logger = new Logger(DiffEngineService.name);

  constructor(
    @InjectRepository(BenefitChangeEntity)
    private readonly changeRepo: Repository<BenefitChangeEntity>,
  ) {}

  async detectChanges(
    previous: ScraperSnapshotEntity,
    current: ScraperSnapshotEntity,
  ): Promise<SnapshotDiff | null> {
    const prevBenefit = previous.normalizedContent as unknown as ParsedBenefit;
    const currBenefit = current.normalizedContent as unknown as ParsedBenefit;

    const changes: BenefitChange[] = [];
    const keys: (keyof ParsedBenefit)[] = [
      'rewardRate', 'monthlyCap', 'annualFee', 'loungeAccessCount', 'fuelSurchargeWaiver',
    ];

    for (const key of keys) {
      const oldVal = prevBenefit[key];
      const newVal = currBenefit[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        const severity = SEVERITY_MAP[key] ?? 'low';
        changes.push({
          type: 'benefit_change',
          field: key,
          oldValue: oldVal,
          newValue: newVal,
          severity,
        });
        this.logger.warn(`Change detected — ${key}: ${oldVal} → ${newVal} (${severity})`);
      }
    }

    if (changes.length === 0) return null;

    const severityOrder: ChangeSeverity[] = ['critical', 'high', 'medium', 'low'];
    const overallSeverity = severityOrder.find(s => changes.some(c => c.severity === s)) ?? 'low';
    const requiresReview = overallSeverity === 'critical' || overallSeverity === 'high';

    const record = this.changeRepo.create({
      bank: previous.bank,
      cardId: previous.cardId,
      previousSnapshotId: previous.id,
      currentSnapshotId: current.id,
      changes: changes as any,
      overallSeverity,
      requiresReview,
    });
    await this.changeRepo.save(record);

    return {
      id: record.id,
      bank: previous.bank as any,
      cardId: previous.cardId,
      previousSnapshotId: previous.id,
      currentSnapshotId: current.id,
      detectedAt: record.detectedAt,
      changes,
      overallSeverity,
      requiresReview,
    };
  }
}
