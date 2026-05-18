import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ProviderHealth, AIProviderName } from '../interfaces/ai.interface';

@Injectable()
export class ProviderHealthService {
  private readonly logger = new Logger(ProviderHealthService.name);
  private readonly cache = new Map<AIProviderName, ProviderHealth>();
  private readonly TTL_MS = 60_000; // 1 minute health cache

  async check(provider: IAIProvider): Promise<ProviderHealth> {
    const cached = this.cache.get(provider.name);
    if (cached && Date.now() - cached.lastCheckedAt.getTime() < this.TTL_MS) {
      return cached;
    }

    const start = Date.now();
    let isHealthy = false;
    let errorMessage: string | undefined;

    try {
      isHealthy = await Promise.race([
        provider.isAvailable(),
        new Promise<false>(res => setTimeout(() => res(false), 3000)),
      ]);
    } catch (e: any) {
      errorMessage = e?.message;
    }

    const health: ProviderHealth = {
      provider: provider.name,
      isHealthy,
      latencyMs: Date.now() - start,
      lastCheckedAt: new Date(),
      errorMessage,
    };

    this.cache.set(provider.name, health);
    return health;
  }

  async checkAll(providers: IAIProvider[]): Promise<ProviderHealth[]> {
    return Promise.all(providers.map(p => this.check(p)));
  }

  isProviderHealthy(name: AIProviderName): boolean {
    const health = this.cache.get(name);
    if (!health) return true; // Optimistic default if not yet checked
    return health.isHealthy;
  }
}
