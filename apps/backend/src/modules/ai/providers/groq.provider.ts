import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import {
  IAIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIProviderName,
} from '../interfaces/ai.interface';

@Injectable()
export class GroqProvider implements IAIProvider {
  readonly name: AIProviderName = 'groq';
  private readonly logger = new Logger(GroqProvider.name);
  private client: Groq;
  private readonly modelName = 'llama-3.3-70b-versatile';

  constructor() {
    this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async isAvailable(): Promise<boolean> {
    return !!process.env.GROQ_API_KEY;
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    const completion = await this.client.chat.completions.create({
      model: this.modelName,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.3,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const latencyMs = Date.now() - start;

    return {
      content,
      provider: this.name,
      model: this.modelName,
      tokensUsed: completion.usage?.total_tokens ?? this.countTokens(content),
      latencyMs,
      isFallback: false,
      isCached: false,
    };
  }

  async *streamChat(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages: request.messages,
      stream: true,
      max_tokens: request.maxTokens ?? 1024,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      const done = chunk.choices[0]?.finish_reason === 'stop';
      yield { delta, isDone: done, provider: this.name };
    }
  }

  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
