import { Injectable, Logger } from '@nestjs/common';
import { AIRequest, AIMessage } from '../interfaces/ai.interface';
import { ContextBuilderService } from './context-builder.service';
import { RAGService } from './rag.service';
import {
  SYSTEM_PROMPT,
  OPTIMIZER_EXPLANATION_PROMPT,
  RECOMMENDATION_SUMMARY_PROMPT,
  FALLBACK_PROMPT,
} from '../prompts/system.prompt';

@Injectable()
export class PromptBuilderService {
  private readonly logger = new Logger(PromptBuilderService.name);
  // Hard token limit for context injection (approx 3000 tokens ~ 12000 chars)
  private readonly MAX_CONTEXT_CHARS = 12000;

  constructor(
    private readonly contextBuilder: ContextBuilderService,
    private readonly ragService: RAGService,
  ) {}

  async buildOptimizerExplanation(ctx: any, userMessage: string): Promise<AIRequest> {
    const deterministicContext = this.contextBuilder.buildOptimizerContext(ctx);
    const ragCtx = await this.ragService.retrieve(userMessage);
    const ragFormatted = this.ragService.formatContext(ragCtx);

    const systemContent = OPTIMIZER_EXPLANATION_PROMPT(
      this.truncate(deterministicContext),
      this.truncate(ragFormatted, 3000),
    );

    return {
      type: 'optimizer-explanation',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userMessage },
      ],
      maxTokens: 512,
      temperature: 0.2,
    };
  }

  async buildRecommendationSummary(ctx: any, userMessage: string): Promise<AIRequest> {
    const deterministicContext = this.contextBuilder.buildRecommendationContext(ctx);
    const ragCtx = await this.ragService.retrieve(userMessage);
    const ragFormatted = this.ragService.formatContext(ragCtx);

    const systemContent = RECOMMENDATION_SUMMARY_PROMPT(
      this.truncate(deterministicContext),
      this.truncate(ragFormatted, 3000),
    );

    return {
      type: 'recommendation-summary',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userMessage },
      ],
      maxTokens: 512,
      temperature: 0.2,
    };
  }

  buildChat(history: AIMessage[], newMessage: string): AIRequest {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.truncateHistory(history, 10),
      { role: 'user', content: this.sanitize(newMessage) },
    ];

    return { type: 'chat', messages, maxTokens: 1024, temperature: 0.4, stream: true };
  }

  private truncate(text: string, limit = this.MAX_CONTEXT_CHARS): string {
    return text.length > limit ? text.substring(0, limit) + '...[truncated]' : text;
  }

  private truncateHistory(history: AIMessage[], maxTurns: number): AIMessage[] {
    // Keep only last N turns (2 messages per turn = 2N messages)
    return history.slice(-maxTurns * 2);
  }

  /** Basic prompt injection prevention */
  private sanitize(input: string): string {
    return input
      .replace(/ignore previous instructions/gi, '[filtered]')
      .replace(/you are now/gi, '[filtered]')
      .replace(/jailbreak/gi, '[filtered]')
      .substring(0, 2000); // Hard user input cap
  }
}
