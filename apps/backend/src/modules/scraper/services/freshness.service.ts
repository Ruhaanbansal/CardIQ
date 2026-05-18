import { Injectable } from '@nestjs/common';
import { FreshnessRecord, VerificationStatus } from '../interfaces/scraper.interface';

@Injectable()
export class FreshnessService {
  // Freshness decays to 0 over 72 hours
  private readonly DECAY_HOURS = 72;

  compute(lastScrapedAt: Date, verificationStatus: VerificationStatus): number {
    const ageHours = (Date.now() - lastScrapedAt.getTime()) / (1000 * 60 * 60);
    const rawScore = Math.max(0, 100 - (ageHours / this.DECAY_HOURS) * 100);

    // Penalty for unverified or flagged data
    const penalty: Record<VerificationStatus, number> = {
      verified: 0,
      auto_verified: 5,
      unverified: 15,
      flagged: 30,
      stale: 50,
    };

    return Math.max(0, Math.round(rawScore - (penalty[verificationStatus] ?? 0)));
  }

  freshnessMessage(score: number, lastVerifiedAt: Date): string {
    const hours = Math.round((Date.now() - lastVerifiedAt.getTime()) / (1000 * 60 * 60));
    if (score >= 80) return `Last verified: ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (score >= 50) return `Benefits currently under verification (${hours}h old).`;
    if (score >= 20) return 'Using previously verified benefit snapshot.';
    return 'Unable to fetch fresh benefit data currently.';
  }

  nextScrapeTime(lastScrapedAt: Date, freshnessScore: number): Date {
    // High freshness = scrape less frequently; stale = scrape sooner
    const intervalHours = freshnessScore >= 80 ? 24 : freshnessScore >= 50 ? 12 : 6;
    return new Date(lastScrapedAt.getTime() + intervalHours * 60 * 60 * 1000);
  }
}
