import { Controller, Post, Get, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AIService } from './services/ai.service';
import { StreamingService } from './services/streaming.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { ProviderHealthService } from './services/provider-health.service';
import { AIMessage, OptimizerExplanationContext, RecommendationSummaryContext, RAGDocument } from './interfaces/ai.interface';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly streamingService: StreamingService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly healthService: ProviderHealthService,
  ) {}

  /** POST /api/ai/chat — Non-streaming chat */
  @HttpCode(HttpStatus.OK)
  @Post('chat')
  async chat(@Body() body: { messages: AIMessage[]; sessionId?: string }) {
    const request = this.promptBuilder.buildChat(body.messages.slice(0, -1), body.messages.at(-1)?.content ?? '');
    request.stream = false;
    return this.aiService.chat(request);
  }

  /** POST /api/ai/stream — SSE streaming chat */
  @Post('stream')
  async stream(
    @Body() body: { messages: AIMessage[]; sessionId?: string },
    @Res() res: Response,
  ) {
    const request = this.promptBuilder.buildChat(body.messages.slice(0, -1), body.messages.at(-1)?.content ?? '');
    request.stream = true;
    await this.streamingService.streamSSE(request, res);
  }

  /** POST /api/ai/optimizer-explanation */
  @HttpCode(HttpStatus.OK)
  @Post('optimizer-explanation')
  async optimizerExplanation(@Body() body: { context: OptimizerExplanationContext; userMessage?: string }) {
    return this.aiService.explainOptimization(body.context, body.userMessage);
  }

  /** POST /api/ai/recommend-summary */
  @HttpCode(HttpStatus.OK)
  @Post('recommend-summary')
  async recommendSummary(@Body() body: { context: RecommendationSummaryContext; userMessage?: string }) {
    return this.aiService.summarizeRecommendation(body.context, body.userMessage);
  }

  /** POST /api/ai/embed */
  @HttpCode(HttpStatus.OK)
  @Post('embed')
  async embed(@Body() body: { text: string }) {
    return this.aiService.embed(body.text);
  }

  /** POST /api/ai/search — semantic KB search */
  @HttpCode(HttpStatus.OK)
  @Post('search')
  async search(@Body() body: { query: string; topK?: number }) {
    return this.aiService.search(body.query, body.topK ?? 5);
  }

  /** POST /api/ai/index — index document into RAG knowledge base */
  @HttpCode(HttpStatus.OK)
  @Post('index')
  async indexDocument(@Body() doc: RAGDocument) {
    await this.aiService.indexDocument(doc);
    return { success: true, id: doc.id };
  }

  /** GET /api/ai/provider-health */
  @Get('provider-health')
  providerHealth() {
    // Return cached health states
    return {
      providers: ['gemini', 'groq', 'ollama', 'openrouter'].map(name => ({
        provider: name,
        isHealthy: this.healthService.isProviderHealthy(name as any),
      })),
    };
  }

  /** GET /api/ai/token-usage */
  @Get('token-usage')
  tokenUsage() {
    return this.aiService.getObservabilitySummary();
  }
}
