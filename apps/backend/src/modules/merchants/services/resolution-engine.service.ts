import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantEntity } from '../../../database/entities/merchant.entity';
import { UnknownMerchantEntity } from '../../../database/entities/unknown-merchant.entity';
import { MerchantResolutionLogEntity } from '../../../database/entities/merchant-resolution-log.entity';
import { NormalizationService } from './normalization.service';
import { NarrationParserService } from './narration-parser.service';
import { FuzzyMatchingService } from './fuzzy-matching.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

export interface ResolutionResult {
  merchantId?: string;
  merchantName?: string;
  category?: string;
  confidence: number;
  method: string;
  isUnknown: boolean;
}

@Injectable()
export class ResolutionEngineService {
  private readonly logger = new Logger(ResolutionEngineService.name);

  constructor(
    @InjectRepository(MerchantEntity)
    private readonly merchantRepo: Repository<MerchantEntity>,
    @InjectRepository(UnknownMerchantEntity)
    private readonly unknownRepo: Repository<UnknownMerchantEntity>,
    @InjectRepository(MerchantResolutionLogEntity)
    private readonly resolutionLogRepo: Repository<MerchantResolutionLogEntity>,
    private readonly normalizer: NormalizationService,
    private readonly parser: NarrationParserService,
    private readonly fuzzyMatcher: FuzzyMatchingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async resolveNarration(rawNarration: string, mccHint?: string): Promise<ResolutionResult> {
    const cacheKey = `resolve_merchant:${rawNarration}`;
    const cached = await this.cacheManager.get<ResolutionResult>(cacheKey);
    if (cached) return cached;

    // 1. Parse & Normalize
    const parsed = this.parser.parse(rawNarration);
    const normalizedTarget = this.normalizer.normalize(parsed.merchantHint);

    let result: ResolutionResult = {
      confidence: 0,
      method: 'NONE',
      isUnknown: true,
    };

    // 2. Exact Slug or Name Match
    const exactMatch = await this.merchantRepo.findOne({
      where: [
        { slug: normalizedTarget.replace(/\s+/g, '-') },
        { normalizedName: normalizedTarget }
      ]
    });

    if (exactMatch) {
      result = this.buildResult(exactMatch, 100, 'EXACT');
      await this.finalizeResolution(rawNarration, normalizedTarget, result);
      return result;
    }

    // 3. Database Trigram Search (using similarity)
    // pg_trgm must be enabled. 
    // We search the normalizedName column for fuzzy matches.
    const trigramMatches = await this.merchantRepo
      .createQueryBuilder('merchant')
      .where('similarity(merchant.normalizedName, :search) > 0.6', { search: normalizedTarget })
      .orderBy(`similarity(merchant.normalizedName, '${normalizedTarget}')`, 'DESC')
      .take(1)
      .getOne();

    if (trigramMatches) {
      // Re-verify with our stricter in-memory Levenshtein
      const score = this.fuzzyMatcher.calculateSimilarity(normalizedTarget, trigramMatches.normalizedName);
      if (score >= 80) {
        result = this.buildResult(trigramMatches, score, 'TRIGRAM_FUZZY');
        await this.finalizeResolution(rawNarration, normalizedTarget, result);
        return result;
      }
    }

    // 4. Aliases matching (we would join alias table here in production, but since aliases are an array column in this entity)
    const allMerchantsWithAliases = await this.merchantRepo
      .createQueryBuilder('m')
      .where("array_length(m.aliases, 1) > 0")
      .getMany();

    for (const m of allMerchantsWithAliases) {
      const bestAliasMatch = this.fuzzyMatcher.findBestMatch(normalizedTarget, m.aliases, 85);
      if (bestAliasMatch) {
        result = this.buildResult(m, bestAliasMatch.score, 'ALIAS_FUZZY');
        await this.finalizeResolution(rawNarration, normalizedTarget, result);
        return result;
      }
    }

    // 5. Fallback - Store as Unknown
    await this.handleUnknownMerchant(rawNarration, normalizedTarget, mccHint);
    
    // Log resolution failure
    await this.resolutionLogRepo.save({
      rawNarration,
      normalizedNarration: normalizedTarget,
      resolutionMethod: 'UNKNOWN',
      confidenceScore: 0,
      isAiFallback: false,
    });

    return result;
  }

  private buildResult(merchant: MerchantEntity, confidence: number, method: string): ResolutionResult {
    return {
      merchantId: merchant.id,
      merchantName: merchant.name,
      category: merchant.category,
      confidence,
      method,
      isUnknown: false,
    };
  }

  private async finalizeResolution(raw: string, normalized: string, result: ResolutionResult) {
    // Save to Cache
    await this.cacheManager.set(`resolve_merchant:${raw}`, result, 86400000); // Cache for 24 hours

    // Log the resolution
    await this.resolutionLogRepo.save({
      rawNarration: raw,
      normalizedNarration: normalized,
      resolvedMerchantId: result.merchantId,
      resolutionMethod: result.method,
      confidenceScore: result.confidence,
      isAiFallback: result.method === 'AI',
    });
  }

  private async handleUnknownMerchant(raw: string, normalized: string, mccHint?: string) {
    const existing = await this.unknownRepo.findOne({ where: { rawNarration: raw } });
    if (existing) {
      existing.occurrenceCount += 1;
      await this.unknownRepo.save(existing);
    } else {
      await this.unknownRepo.save({
        rawNarration: raw,
        normalizedNarration: normalized,
        mccCode: mccHint,
        occurrenceCount: 1,
        status: 'PENDING',
      });
    }
  }
}
