import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  IAIProvider,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIProviderName,
} from '../interfaces/ai.interface';

@Injectable()
export class OpenRouterProvider implements IAIProvider {
  readonly name: AIProviderName = 'openrouter';
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly modelName = 'mistralai/mistral-7b-instruct:free';

  async isAvailable(): Promise<boolean> {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    const res = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.modelName,
        messages: request.messages,
        max_tokens: request.maxTokens ?? 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://cardiq.in',
          'X-Title': 'CardIQ',
        },
        timeout: 30000,
      },
    );

    const content = res.data.choices[0]?.message?.content ?? '';
    return {
      content,
      provider: this.name,
      model: this.modelName,
      tokensUsed: res.data.usage?.total_tokens ?? this.countTokens(content),
      latencyMs: Date.now() - start,
      isFallback: true,
      isCached: false,
      fallbackReason: 'Using OpenRouter fallback.',
    };
  }

  async *streamChat(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const res = await axios.post(
      `${this.baseUrl}/chat/completions`,
      { model: this.modelName, messages: request.messages, stream: true },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://cardiq.in',
        },
        responseType: 'stream',
        timeout: 60000,
      },
    );

    let buffer = '';
    for await (const raw of res.data) {
      buffer += raw.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        try {
          const json = JSON.parse(line.slice(6));
          const delta = json.choices?.[0]?.delta?.content ?? '';
          const done = json.choices?.[0]?.finish_reason === 'stop';
          yield { delta, isDone: done, provider: this.name };
        } catch { /* ignore */ }
      }
    }
  }

  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
