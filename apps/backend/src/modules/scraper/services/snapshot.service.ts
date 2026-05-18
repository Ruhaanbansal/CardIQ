import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ScraperSnapshotEntity } from '../../../database/entities/scraper.entities';
import { Snapshot, ParsedBenefit, ScraperBank } from '../interfaces/scraper.interface';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(
    @InjectRepository(ScraperSnapshotEntity)
    private readonly snapshotRepo: Repository<ScraperSnapshotEntity>,
  ) {}

  async save(
    bank: ScraperBank,
    sourceType: string,
    url: string,
    rawContent: string,
    parsed: ParsedBenefit,
    cardId?: string,
  ): Promise<{ snapshot: ScraperSnapshotEntity; isDuplicate: boolean }> {
    const contentHash = crypto.createHash('sha256').update(rawContent).digest('hex');

    // Duplicate check — same hash means content hasn't changed
    const existing = await this.snapshotRepo.findOne({ where: { contentHash } });
    if (existing) {
      return { snapshot: existing, isDuplicate: true };
    }

    const snapshot = this.snapshotRepo.create({
      bank,
      cardId,
      sourceType,
      url,
      rawContent,
      normalizedContent: parsed as any,
      contentHash,
      scrapeConfidence: 90,
      parserConfidence: parsed.parserConfidence,
      verificationStatus: 'unverified',
    });

    await this.snapshotRepo.save(snapshot);
    this.logger.log(`Snapshot saved: ${snapshot.id} for ${bank}`);
    return { snapshot, isDuplicate: false };
  }

  async getLatest(bank: ScraperBank, cardId?: string): Promise<ScraperSnapshotEntity | null> {
    return this.snapshotRepo.findOne({
      where: cardId ? { bank, cardId } : { bank },
      order: { createdAt: 'DESC' },
    });
  }

  async getHistory(bank: ScraperBank, limit = 10): Promise<ScraperSnapshotEntity[]> {
    return this.snapshotRepo.find({
      where: { bank },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
