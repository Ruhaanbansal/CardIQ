import { Injectable, Logger } from '@nestjs/common';
import {
  IAIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIProviderName,
  AIRoutingStrategy,
} from '../interfaces/ai.interface';
import { ProviderHealthService } from './provider-health.service';

@Injectable()
export class AIRouterService {
  private readonly logger = new Logger(AIRouterService.name);

  // Quality-first order: Gemini → Groq → Ollama → OpenRouter
  private readonly QUALITY_ORDER: AIProviderName[] = ['gemini', 'groq', 'ollama', 'openrouter'];
  // Speed-first order: Groq → Gemini → Ollama → OpenRouter
  private readonly SPEED_ORDER: AIProviderName[] = ['groq', 'gemini', 'ollama', 'openrouter'];

  // Deterministic fallback explanation when ALL providers are unavailable
  static readonly DETERMINISTIC_FALLBACK =
    'Live AI explanations are temporarily unavailable. Showing deterministic summary instead.';

  constructor(
    private readonly healthService: ProviderHealthService,
    private readonly providers: Map<AIProviderName, IAIProvider>,
  ) {}

  getOrderedProviders(strategy: AIRoutingStrategy = 'quality-first'): IAIProvider[] {
    const order = strategy === 'speed-first' ? this.SPEED_ORDER : this.QUALITY_ORDER;
    return order
      .map(name => this.providers.get(name))
      .filter((p): p is IAIProvider => !!p && this.healthService.isProviderHealthy(p.name));
  }

  async route(request: AIRequest): Promise<AIResponse> {
    const ordered = this.getOrderedProviders(request.routingStrategy);
    const errors: string[] = [];

    for (const provider of ordered) {
      try {
        this.logger.debug(`Routing to provider: ${provider.name}`);
        const result = await provider.chat(request);
        if (ordered.indexOf(provider) > 0) {
          result.isFallback = true;
          result.fallbackReason = `Using backup AI provider (${provider.name}) for this response.`;
        }
        return result;
      } catch (err: any) {
        this.logger.warn(`Provider ${provider.name} failed: ${err.message}`);
        errors.push(`${provider.name}: ${err.message}`);
        // Mark as unhealthy temporarily
        this.healthService['cache'].set(provider.name, {
          provider: provider.name,
          isHealthy: false,
          latencyMs: 0,
          lastCheckedAt: new Date(),
          errorMessage: err.message,
        });
      }
    }

    // All providers failed — return deterministic fallback
    return {
      content: AIRouterService.DETERMINISTIC_FALLBACK,
      provider: 'gemini',
      model: 'fallback',
      tokensUsed: 0,
      latencyMs: 0,
      isFallback: true,
      isCached: false,
      fallbackReason: `All providers unavailable. Errors: ${errors.join('; ')}`,
    };
  }

  async *routeStream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const ordered = this.getOrderedProviders(request.routingStrategy);

    for (const provider of ordered) {
      try {
        yield* provider.streamChat(request);
        return;
      } catch (err: any) {
        this.logger.warn(`Stream provider ${provider.name} failed: ${err.message}`);
      }
    }

    // Ultimate fallback — yield static message
    yield { delta: AIRouterService.DETERMINISTIC_FALLBACK, isDone: false, provider: 'gemini' };
    yield { delta: '', isDone: true, provider: 'gemini' };
  }
}
