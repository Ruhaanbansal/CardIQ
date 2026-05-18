import { Injectable } from '@nestjs/common';
import {
  VerificationResult,
  ParsedBenefit,
  VerificationStatus,
} from '../interfaces/scraper.interface';

@Injectable()
export class VerificationService {
  verify(parsed: ParsedBenefit, scrapeConfidence: number): VerificationResult {
    const anomalies: string[] = [];
    const flags: string[] = [];
    const snapshotId = 'pending'; // Will be set after snapshot save

    // ── Anomaly Detection ─────────────────────────────────────
    if (parsed.rewardRate !== undefined && parsed.rewardRate > 30) {
      anomalies.push(`Reward rate ${parsed.rewardRate}% is unusually high — possible parsing error.`);
    }

    if (parsed.annualFee !== undefined && parsed.annualFee > 100000) {
      anomalies.push(`Annual fee ₹${parsed.annualFee} is implausibly high.`);
    }

    if (parsed.monthlyCap !== undefined && parsed.monthlyCap < 100) {
      anomalies.push(`Monthly cap ₹${parsed.monthlyCap} is suspiciously low.`);
    }

    if (parsed.loungeAccessCount !== undefined && parsed.loungeAccessCount > 50) {
      anomalies.push(`Lounge access count ${parsed.loungeAccessCount} is unusually high.`);
    }

    // ── Required Field Flags ──────────────────────────────────
    if (!parsed.rewardRate && !parsed.benefits.length) {
      flags.push('No reward rate or benefits extracted — likely parsing failure.');
    }

    // ── Confidence Calculation ────────────────────────────────
    const overallConfidence = Math.round(
      (scrapeConfidence * 0.4 + parsed.parserConfidence * 0.6) - anomalies.length * 10,
    );

    let verificationStatus: VerificationStatus;
    if (anomalies.length > 0 || flags.length > 0) {
      verificationStatus = 'flagged';
    } else if (overallConfidence >= 80) {
      verificationStatus = 'auto_verified';
    } else {
      verificationStatus = 'unverified';
    }

    return {
      snapshotId,
      scrapeConfidence,
      parserConfidence: parsed.parserConfidence,
      overallConfidence: Math.max(0, overallConfidence),
      verificationStatus,
      anomalies,
      flags,
    };
  }
}
