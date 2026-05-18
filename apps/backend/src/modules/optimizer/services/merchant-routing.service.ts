import { Injectable, Logger } from '@nestjs/common';
import { OptimizationRequest } from '../interfaces/optimizer.interface';
import { NormalizationService } from '../../merchants/services/normalization.service';
import { NarrationParserService } from '../../merchants/services/narration-parser.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantEntity } from '../../../database/entities/merchant.entity';

export interface MerchantRouteResult {
  normalizedMerchant: string;
  resolvedCategory: string;
  resolvedMcc?: string;
  merchantConfidence: number;
  merchantId?: string;
}

@Injectable()
export class MerchantRoutingService {
  private readonly logger = new Logger(MerchantRoutingService.name);

  constructor(
    private readonly normalizer: NormalizationService,
    private readonly parser: NarrationParserService,
    @InjectRepository(MerchantEntity)
    private readonly merchantRepo: Repository<MerchantEntity>,
  ) {}

  async route(request: OptimizationRequest): Promise<MerchantRouteResult> {
    // Use already-normalized data if provided
    if (request.normalizedMerchant && request.merchantCategory) {
      return {
        normalizedMerchant: request.normalizedMerchant,
        resolvedCategory: request.merchantCategory,
        resolvedMcc: request.mcc,
        merchantConfidence: 100,
      };
    }

    // Parse narration → normalize
    const parsed = this.parser.parse(request.merchantName);
    const normalized = this.normalizer.normalize(parsed.merchantHint);

    // Override category from flags
    if (request.isWalletLoad) return { normalizedMerchant: normalized, resolvedCategory: 'wallet_loads', merchantConfidence: 100 };
    if (request.isFuelPayment)  return { normalizedMerchant: normalized, resolvedCategory: 'fuel', merchantConfidence: 100 };
    if (request.isInsurancePayment) return { normalizedMerchant: normalized, resolvedCategory: 'insurance', merchantConfidence: 100 };
    if (request.isUtilityPayment) return { normalizedMerchant: normalized, resolvedCategory: 'utilities', merchantConfidence: 100 };

    // DB lookup
    const merchant = await this.merchantRepo
      .createQueryBuilder('m')
      .where('similarity(m.normalizedName, :q) > 0.5', { q: normalized })
      .orderBy(`similarity(m.normalizedName, '${normalized}')`, 'DESC')
      .take(1)
      .getOne();

    if (merchant) {
      return {
        normalizedMerchant: merchant.normalizedName,
        resolvedCategory: merchant.category,
        resolvedMcc: request.mcc ?? merchant.mccCodes?.[0],
        merchantConfidence: Math.round(merchant.confidenceScore),
        merchantId: merchant.id,
      };
    }

    // Fallback — use raw data with low confidence
    this.logger.warn(`Could not resolve merchant: "${request.merchantName}"`);
    return {
      normalizedMerchant: normalized,
      resolvedCategory: request.merchantCategory ?? 'UNKNOWN',
      resolvedMcc: request.mcc,
      merchantConfidence: 40,
    };
  }
}
