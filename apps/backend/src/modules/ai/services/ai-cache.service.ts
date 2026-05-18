import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { AIRequest, AIResponse } from '../interfaces/ai.interface';

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);
  private readonly TTL_MS = 3600_000; // 1 hour

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private buildKey(request: AIRequest): string {
    const fingerprint = JSON.stringify({
      type: request.type,
      messages: request.messages,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
    });
    return `ai:cache:${crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 20)}`;
  }

  async get(request: AIRequest): Promise<AIResponse | null> {
    if (request.stream) return null; // Never cache streams
    const key = this.buildKey(request);
    const hit = await this.cacheManager.get<AIResponse>(key);
    if (hit) {
      this.logger.debug(`AI cache HIT: ${key}`);
      return { ...hit, isCached: true };
    }
    return null;
  }

  async set(request: AIRequest, response: AIResponse): Promise<void> {
    if (request.stream) return;
    const key = this.buildKey(request);
    await this.cacheManager.set(key, response, this.TTL_MS);
  }

  async invalidatePattern(prefix: string): Promise<void> {
    this.logger.warn(`AI cache invalidation requested for prefix: ${prefix}`);
    // In production, use Redis SCAN + DEL. Here we log the intent.
  }
}
