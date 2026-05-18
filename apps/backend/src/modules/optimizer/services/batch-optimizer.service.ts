import { Injectable } from '@nestjs/common';
import {
  OptimizationRequest,
  BatchOptimizationResult,
} from '../interfaces/optimizer.interface';
import { OptimizerEngineService } from './optimizer-engine.service';

@Injectable()
export class BatchOptimizerService {
  constructor(private readonly engine: OptimizerEngineService) {}

  async optimizeBatch(requests: OptimizationRequest[]): Promise<BatchOptimizationResult> {
    const items = await Promise.all(
      requests.map(async req => ({
        request: req,
        result: await this.engine.optimize(req),
      }))
    );

    const totalAmount = items.reduce((s, i) => s + i.request.amount, 0);
    const totalEstimatedRewards = items.reduce(
      (s, i) => s + (i.result.bestCard?.effectiveValueInr ?? 0), 0
    );

    // Card usage summary
    const cardUsageSummary: Record<string, { count: number; totalRewards: number }> = {};
    for (const item of items) {
      const best = item.result.bestCard;
      if (best) {
        if (!cardUsageSummary[best.cardName]) {
          cardUsageSummary[best.cardName] = { count: 0, totalRewards: 0 };
        }
        cardUsageSummary[best.cardName].count += 1;
        cardUsageSummary[best.cardName].totalRewards += best.effectiveValueInr;
      }
    }

    const warnings: string[] = [];
    const fallbacks = items.filter(i => i.result.isFallback);
    if (fallbacks.length > 0) {
      warnings.push(`${fallbacks.length} transaction(s) could not be confidently optimized.`);
    }

    return {
      totalTransactions: items.length,
      totalAmount,
      totalEstimatedRewards,
      overallEffectiveRate: totalAmount > 0 ? (totalEstimatedRewards / totalAmount) * 100 : 0,
      items,
      cardUsageSummary,
      warnings,
    };
  }
}
