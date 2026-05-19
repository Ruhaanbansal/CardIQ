import { Injectable, Logger } from '@nestjs/common';
import { AIRequest, AIResponse, OptimizerExplanationContext, RecommendationSummaryContext } from '../interfaces/ai.interface';
import { AIRouterService } from './ai-router.service';
import { AICacheService } from './ai-cache.service';
import { AIObservabilityService } from './ai-observability.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ProviderHealthService } from './provider-health.service';
import { RAGService } from './rag.service';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingResult, RAGDocument } from '../interfaces/ai.interface';
import { AIRouterService as AIRouter } from './ai-router.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly router: AIRouterService,
    private readonly cache: AICacheService,
    private readonly observability: AIObservabilityService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly healthService: ProviderHealthService,
    private readonly ragService: RAGService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  /**
   * Main chat — cache-first, router-second, observability throughout.
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const cached = await this.cache.get(request);
    if (cached) {
      this.observability.record(request, cached);
      return cached;
    }

    const response = await this.router.route(request);
    await this.cache.set(request, response);
    this.observability.record(request, response);
    return response;
  }

  /**
   * Explain an optimizer result in plain English.
   */
  async explainOptimization(
    ctx: OptimizerExplanationContext,
    userMessage = 'Explain why this is the best card for my transaction.',
  ): Promise<AIResponse> {
    const request = await this.promptBuilder.buildOptimizerExplanation(ctx, userMessage);
    return this.chat(request);
  }

  /**
   * Summarize a recommendation result in plain English.
   */
  async summarizeRecommendation(
    ctx: RecommendationSummaryContext,
    userMessage = 'Why is this card recommended for me?',
  ): Promise<AIResponse> {
    const request = await this.promptBuilder.buildRecommendationSummary(ctx, userMessage);
    return this.chat(request);
  }

  /**
   * Embed a single text string.
   */
  async embed(text: string): Promise<EmbeddingResult> {
    return this.embeddingsService.embed(text);
  }

  /**
   * Semantic search against the knowledge base.
   */
  async search(query: string, topK = 5) {
    const ctx = await this.ragService.retrieve(query, topK);
    return {
      query,
      results: ctx.retrievedDocuments,
      scores: ctx.relevanceScores,
      method: ctx.retrievalMethod,
    };
  }

  /**
   * Index a document into the RAG knowledge base.
   */
  async indexDocument(doc: RAGDocument): Promise<void> {
    return this.ragService.indexDocument(doc);
  }

  getObservabilitySummary() {
    return this.observability.getSummary();
  }
}
