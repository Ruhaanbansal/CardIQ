import { Injectable, Logger } from '@nestjs/common';
import { AIProviderName, AIRequest, AIResponse } from '../interfaces/ai.interface';

export interface AIMetrics {
  requestType: string;
  provider: AIProviderName;
  latencyMs: number;
  tokensUsed: number;
  isFallback: boolean;
  isCached: boolean;
  timestamp: Date;
}

@Injectable()
export class AIObservabilityService {
  private readonly logger = new Logger('AIObservability');
  private readonly metrics: AIMetrics[] = [];

  record(request: AIRequest, response: AIResponse): void {
    const metric: AIMetrics = {
      requestType: request.type,
      provider: response.provider,
      latencyMs: response.latencyMs,
      tokensUsed: response.tokensUsed,
      isFallback: response.isFallback,
      isCached: response.isCached,
      timestamp: new Date(),
    };

    this.metrics.push(metric);
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) this.metrics.shift();

    this.logger.log(
      `[${request.type}] provider=${response.provider} ` +
      `latency=${response.latencyMs}ms tokens=${response.tokensUsed} ` +
      `fallback=${response.isFallback} cached=${response.isCached}`,
    );
  }

  getSummary() {
    const total = this.metrics.length;
    if (total === 0) return { total: 0 };

    const fallbackCount = this.metrics.filter(m => m.isFallback).length;
    const cacheHits = this.metrics.filter(m => m.isCached).length;
    const avgLatency = this.metrics.reduce((s, m) => s + m.latencyMs, 0) / total;
    const totalTokens = this.metrics.reduce((s, m) => s + m.tokensUsed, 0);

    const providerBreakdown: Record<string, number> = {};
    for (const m of this.metrics) {
      providerBreakdown[m.provider] = (providerBreakdown[m.provider] ?? 0) + 1;
    }

    return {
      total,
      fallbackRate: ((fallbackCount / total) * 100).toFixed(1) + '%',
      cacheHitRate: ((cacheHits / total) * 100).toFixed(1) + '%',
      avgLatencyMs: Math.round(avgLatency),
      totalTokensUsed: totalTokens,
      providerBreakdown,
    };
  }
}
