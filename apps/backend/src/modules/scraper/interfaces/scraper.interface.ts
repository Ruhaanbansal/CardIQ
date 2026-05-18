// ============================================================
// CARDIQ SCRAPER MODULE — CORE INTERFACES
// ============================================================

export type ScraperBank =
  | 'HDFC' | 'SBI' | 'ICICI' | 'AXIS' | 'AMEX' | 'KOTAK'
  | 'RBL' | 'IDFC' | 'HSBC' | 'AU' | 'YES_BANK' | 'SCB';

export type ScraperSourceType =
  | 'reward_page' | 'benefits_page' | 'fee_page' | 'offer_page'
  | 'pdf' | 'faq' | 'tnc' | 'promotional';

export type ScrapeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'retrying';

export type VerificationStatus = 'unverified' | 'auto_verified' | 'verified' | 'flagged' | 'stale';

export type ChangeSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ScraperAdapterType = 'playwright' | 'cheerio' | 'pdf' | 'static';

// ── Scrape Job ───────────────────────────────────────────────
export interface ScrapeJob {
  id: string;
  bank: ScraperBank;
  cardId?: string;
  sourceType: ScraperSourceType;
  url: string;
  priority: number;        // 1 = highest
  retryCount: number;
  maxRetries: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: ScrapeStatus;
  lastError?: string;
}

// ── Raw Scrape Result ────────────────────────────────────────
export interface ScrapeResult {
  jobId: string;
  bank: ScraperBank;
  url: string;
  rawHtml?: string;
  rawText?: string;
  rawPdfBuffer?: Buffer;
  adapterUsed: ScraperAdapterType;
  fetchedAt: Date;
  httpStatus?: number;
  fetchLatencyMs: number;
  isCached: boolean;
}

// ── Parsed Benefit (normalized output) ──────────────────────
export interface ParsedBenefit {
  bank: ScraperBank;
  cardId?: string;
  cardName?: string;
  rewardRate?: number;        // e.g. 5 (%)
  rewardType?: string;        // cashback | points | miles
  monthlyCap?: number;        // INR
  annualFee?: number;         // INR
  loungeAccessCount?: number; // per year
  fuelSurchargeWaiver?: boolean;
  zeroLiabilityProtection?: boolean;
  welcomeBonus?: string;
  benefits: string[];         // Raw benefit strings
  exclusions: string[];       // Explicit exclusion strings
  rawSource: string;          // URL or 'static'
  parsedAt: Date;
  parserConfidence: number;   // 0–100
}

// ── Snapshot ─────────────────────────────────────────────────
export interface Snapshot {
  id: string;
  bank: ScraperBank;
  cardId?: string;
  sourceType: ScraperSourceType;
  url: string;
  rawContent: string;           // HTML or extracted text
  normalizedContent: ParsedBenefit;
  createdAt: Date;
  contentHash: string;          // SHA-256 of rawContent
  scrapeConfidence: number;
  parserConfidence: number;
  verificationStatus: VerificationStatus;
}

// ── Change Detection ─────────────────────────────────────────
export interface SnapshotDiff {
  id: string;
  bank: ScraperBank;
  cardId?: string;
  previousSnapshotId: string;
  currentSnapshotId: string;
  detectedAt: Date;
  changes: BenefitChange[];
  overallSeverity: ChangeSeverity;
  requiresReview: boolean;
}

export interface BenefitChange {
  type: 'benefit_change' | 'fee_change' | 'reward_rule_change' | 'cap_change' | 'exclusion_change' | 'added' | 'removed';
  field: string;
  oldValue: any;
  newValue: any;
  severity: ChangeSeverity;
}

// ── Freshness ────────────────────────────────────────────────
export interface FreshnessRecord {
  entityId: string;           // cardId or bankId
  entityType: 'card' | 'bank';
  lastScrapedAt: Date;
  lastVerifiedAt: Date;
  freshnessScore: number;     // 0–100, decays over time
  scrapeConfidence: number;
  verificationStatus: VerificationStatus;
  sourceUrl: string;
  nextScheduledScrape: Date;
}

// ── Verification ─────────────────────────────────────────────
export interface VerificationResult {
  snapshotId: string;
  scrapeConfidence: number;
  parserConfidence: number;
  overallConfidence: number;
  verificationStatus: VerificationStatus;
  anomalies: string[];        // detected anomalies
  flags: string[];            // issues requiring review
}
