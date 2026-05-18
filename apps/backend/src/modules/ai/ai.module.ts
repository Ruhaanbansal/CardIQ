import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AIController } from './ai.controller';
import { AIService } from './services/ai.service';
import { AIRouterService } from './services/ai-router.service';
import { ProviderHealthService } from './services/provider-health.service';
import { EmbeddingsService } from './services/embeddings.service';
import { VectorStoreService } from './services/vector-store.service';
import { RAGService } from './services/rag.service';
import { ContextBuilderService } from './services/context-builder.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { StreamingService } from './services/streaming.service';
import { AICacheService } from './services/ai-cache.service';
import { AIObservabilityService } from './services/ai-observability.service';

// Providers
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

import { IAIProvider, AIProviderName } from './interfaces/ai.interface';

@Module({
  imports: [CacheModule.register()],
  controllers: [AIController],
  providers: [
    // Concrete providers
    GeminiProvider,
    GroqProvider,
    OllamaProvider,
    OpenRouterProvider,

    // Build the provider Map for the router
    {
      provide: 'AI_PROVIDER_MAP',
      useFactory: (
        gemini: GeminiProvider,
        groq: GroqProvider,
        ollama: OllamaProvider,
        openrouter: OpenRouterProvider,
      ): Map<AIProviderName, IAIProvider> => {
        const map = new Map<AIProviderName, IAIProvider>();
        map.set('gemini', gemini);
        map.set('groq', groq);
        map.set('ollama', ollama);
        map.set('openrouter', openrouter);
        return map;
      },
      inject: [GeminiProvider, GroqProvider, OllamaProvider, OpenRouterProvider],
    },

    ProviderHealthService,

    {
      provide: AIRouterService,
      useFactory: (
        health: ProviderHealthService,
        map: Map<AIProviderName, IAIProvider>,
      ) => new AIRouterService(health, map),
      inject: [ProviderHealthService, 'AI_PROVIDER_MAP'],
    },

    EmbeddingsService,
    VectorStoreService,
    RAGService,
    ContextBuilderService,
    PromptBuilderService,
    StreamingService,
    AICacheService,
    AIObservabilityService,
    AIService,
  ],
  exports: [AIService, RAGService, EmbeddingsService, StreamingService],
})
export class AIModule {}
