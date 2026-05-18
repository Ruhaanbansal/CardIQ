import { Injectable, Logger } from '@nestjs/common';
import { ParsedBenefit, ScrapeResult, ScraperBank } from '../interfaces/scraper.interface';
import { CheerioAdapter } from '../adapters/cheerio.adapter';

// Common regex patterns for benefit extraction
const PATTERNS = {
  rewardRate: /(\d+(?:\.\d+)?)\s*%\s*(?:cashback|reward|points?|miles?)/i,
  monthlyCap: /(?:cap|limit|maximum)(?:\s+of)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
  annualFee: /annual\s+fee[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+)/i,
  loungeAccess: /(\d+)\s*(?:complimentary)?\s*lounge/i,
  fuelWaiver: /fuel\s+surcharge\s+waiver/i,
  exclusions: /(?:not\s+applicable|excluded?|no\s+(?:cashback|reward))[^.]+/gi,
};

@Injectable()
export class ParserEngineService {
  private readonly logger = new Logger(ParserEngineService.name);

  constructor(private readonly cheerio: CheerioAdapter) {}

  async parseHTML(result: ScrapeResult): Promise<ParsedBenefit> {
    const rawText = this.cheerio.extractText(result.rawHtml ?? '');
    const tableData = this.cheerio.extractTableData(result.rawHtml ?? '');

    return this.extractBenefits(
      rawText,
      tableData,
      result.bank,
      result.url,
    );
  }

  async parseText(text: string, bank: ScraperBank, sourceUrl: string): Promise<ParsedBenefit> {
    return this.extractBenefits(text, [], bank, sourceUrl);
  }

  private extractBenefits(
    text: string,
    tableData: string[][],
    bank: ScraperBank,
    sourceUrl: string,
  ): ParsedBenefit {
    let confidence = 50; // Start at 50%
    const benefits: string[] = [];
    const exclusions: string[] = [];

    // ── Reward Rate ──────────────────────────────────────────
    const rewardMatch = PATTERNS.rewardRate.exec(text);
    const rewardRate = rewardMatch ? parseFloat(rewardMatch[1]) : undefined;
    if (rewardRate) { confidence += 10; }

    // ── Monthly Cap ──────────────────────────────────────────
    const capMatch = PATTERNS.monthlyCap.exec(text);
    const monthlyCap = capMatch
      ? parseInt(capMatch[1].replace(/,/g, ''), 10)
      : undefined;

    // ── Annual Fee ───────────────────────────────────────────
    const feeMatch = PATTERNS.annualFee.exec(text);
    const annualFee = feeMatch
      ? parseInt(feeMatch[1].replace(/,/g, ''), 10)
      : undefined;
    if (annualFee !== undefined) confidence += 10;

    // ── Lounge Access ────────────────────────────────────────
    const loungeMatch = PATTERNS.loungeAccess.exec(text);
    const loungeAccessCount = loungeMatch ? parseInt(loungeMatch[1], 10) : undefined;
    if (loungeAccessCount) { benefits.push(`${loungeAccessCount} complimentary lounge visits per year`); }

    // ── Fuel Surcharge Waiver ────────────────────────────────
    const fuelWaiver = PATTERNS.fuelWaiver.test(text);
    if (fuelWaiver) { benefits.push('Fuel surcharge waiver'); confidence += 5; }

    // ── Exclusions ───────────────────────────────────────────
    let excMatch: RegExpExecArray | null;
    const excRegex = new RegExp(PATTERNS.exclusions.source, 'gi');
    while ((excMatch = excRegex.exec(text)) !== null) {
      exclusions.push(excMatch[0].trim());
    }

    // ── Table benefit extraction ─────────────────────────────
    for (const row of tableData) {
      if (row.length >= 2) {
        const cellText = row.join(' — ').substring(0, 200);
        if (/cashback|reward|point|mile|lounge|insurance|waiver/i.test(cellText)) {
          benefits.push(cellText);
          confidence += 2;
        }
      }
    }

    // Cap confidence at 95 (never claim full certainty from scraping)
    confidence = Math.min(95, confidence);

    return {
      bank,
      rewardRate,
      rewardType: text.toLowerCase().includes('cashback') ? 'cashback'
        : text.toLowerCase().includes('mile') ? 'miles'
        : text.toLowerCase().includes('point') ? 'points'
        : undefined,
      monthlyCap,
      annualFee,
      loungeAccessCount,
      fuelSurchargeWaiver: fuelWaiver,
      benefits,
      exclusions,
      rawSource: sourceUrl,
      parsedAt: new Date(),
      parserConfidence: confidence,
    };
  }
}
